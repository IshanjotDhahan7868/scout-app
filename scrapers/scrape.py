#!/usr/bin/env python3
"""
Scout deal scraper — runs on a schedule via GitHub Actions.
Sources: Kijiji, Craigslist RSS, RedFlagDeals RSS, Flipp
Dumps results to Supabase.
"""
import os, re, json, time, hashlib, feedparser, requests
from datetime import datetime
from urllib.parse import quote_plus

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
LOCATION_LAT = 43.9377  # Palgrave, ON
LOCATION_LNG = -79.8428
REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}


def upsert_listing(source: str, external_id: str, data: dict):
    """Insert or ignore (on conflict) a listing."""
    try:
        res = requests.post(
            f"{REST_URL}/listings",
            params={"on_conflict": "source,external_id"},
            headers={
                **HEADERS,
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
            json={"source": source, "external_id": external_id, **data},
            timeout=30,
        )
        res.raise_for_status()
    except Exception as e:
        print(f"  upsert error: {e}")


def get_wishlist():
    res = requests.get(
        f"{REST_URL}/wishlist_items",
        params={"select": "*", "active": "eq.true"},
        headers=HEADERS,
        timeout=30,
    )
    res.raise_for_status()
    return res.json() or []


# ─── Kijiji ──────────────────────────────────────────────────────────────────
def scrape_kijiji(query: str, max_price: int | None = None, radius: int = 100):
    """Scrape Kijiji via their internal search API (no login needed)."""
    from playwright.sync_api import sync_playwright

    results = []
    url = f"https://www.kijiji.ca/b-for-sale/{quote_plus(query)}/k0?ll={LOCATION_LAT},{LOCATION_LNG}&radius={radius}"
    if max_price:
        url += f"&price=0__{max_price}"

    print(f"  Kijiji: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(2000)

        items = page.query_selector_all('[data-listing-id]')
        for item in items[:20]:
            try:
                listing_id = item.get_attribute('data-listing-id')
                title_el = item.query_selector('[class*="title"]')
                price_el = item.query_selector('[class*="price"]')
                location_el = item.query_selector('[class*="location"]')
                img_el = item.query_selector('img')
                link_el = item.query_selector('a')

                title = title_el.inner_text().strip() if title_el else ""
                price_text = price_el.inner_text().strip() if price_el else ""
                price_num = None
                m = re.search(r'[\d,]+', price_text.replace(',', ''))
                if m:
                    price_num = float(m.group().replace(',', ''))

                location = location_el.inner_text().strip() if location_el else ""
                img = img_el.get_attribute('src') if img_el else None
                href = link_el.get_attribute('href') if link_el else None

                if title and listing_id:
                    results.append({
                        "external_id": listing_id,
                        "title": title,
                        "price": price_num,
                        "location": location,
                        "url": f"https://www.kijiji.ca{href}" if href and href.startswith('/') else href,
                        "photos": [img] if img else [],
                        "source": "kijiji",
                    })
            except Exception as e:
                print(f"    item error: {e}")

        browser.close()
    return results


# ─── Craigslist RSS ───────────────────────────────────────────────────────────
def scrape_craigslist(query: str, max_price: int | None = None):
    """Craigslist Toronto RSS — no scraping, just feed parsing."""
    url = f"https://toronto.craigslist.org/search/sss?query={quote_plus(query)}&format=rss"
    if max_price:
        url += f"&max_price={max_price}"

    print(f"  Craigslist RSS: {url}")
    feed = feedparser.parse(url)
    results = []
    for entry in feed.entries[:15]:
        ext_id = hashlib.md5(entry.get('link', '').encode()).hexdigest()[:16]
        price_num = None
        m = re.search(r'\$[\d,]+', entry.get('title', ''))
        if m:
            price_num = float(m.group()[1:].replace(',', ''))

        results.append({
            "external_id": ext_id,
            "title": entry.get('title', '').strip(),
            "description": entry.get('summary', ''),
            "url": entry.get('link'),
            "price": price_num,
            "location": "Toronto area",
            "photos": [],
            "source": "craigslist",
        })
    return results


# ─── RedFlagDeals RSS ─────────────────────────────────────────────────────────
def scrape_redflagdeals():
    """RedFlagDeals hot deals RSS — catches store sales and clearance events."""
    url = "https://forums.redflagdeals.com/hot-deals-f9/?rss"
    print(f"  RedFlagDeals RSS: {url}")
    feed = feedparser.parse(url)
    keywords = ['furniture', 'bed', 'chair', 'table', 'lamp', 'rug', 'sofa', 'couch',
                'home depot', 'ikea', 'wayfair', 'walmart', 'rona', 'clearance', 'mattress']
    results = []
    for entry in feed.entries[:50]:
        title = entry.get('title', '').lower()
        if any(kw in title for kw in keywords):
            ext_id = hashlib.md5(entry.get('link', '').encode()).hexdigest()[:16]
            results.append({
                "external_id": ext_id,
                "title": entry.get('title', '').strip(),
                "description": entry.get('summary', ''),
                "url": entry.get('link'),
                "price": None,
                "location": "Canada",
                "photos": [],
                "source": "redflagdeals",
            })
    return results


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("🔍 Scout scraper starting...")
    wishlist = get_wishlist()
    print(f"  Wishlist: {[w['name'] for w in wishlist]}")

    total = 0

    # Scrape per wishlist item
    for item in wishlist:
        query = item['name']
        max_price = item.get('max_price')
        print(f"\n→ Hunting: {query} (max ${max_price})")

        # Kijiji
        try:
            listings = scrape_kijiji(query, max_price, item.get('radius_km', 100))
            for l in listings:
                upsert_listing(l.pop('source'), l.pop('external_id'), {**l, "wishlist_item_id": item['id']})
                total += 1
            print(f"  Kijiji: {len(listings)} results")
        except Exception as e:
            print(f"  Kijiji error: {e}")

        # Craigslist
        try:
            listings = scrape_craigslist(query, max_price)
            for l in listings:
                upsert_listing(l.pop('source'), l.pop('external_id'), {**l, "wishlist_item_id": item['id']})
                total += 1
            print(f"  Craigslist: {len(listings)} results")
        except Exception as e:
            print(f"  Craigslist error: {e}")

        time.sleep(2)  # polite delay

    # RedFlagDeals (once, not per item)
    try:
        listings = scrape_redflagdeals()
        for l in listings:
            upsert_listing(l.pop('source'), l.pop('external_id'), l)
            total += 1
        print(f"\n  RedFlagDeals: {len(listings)} relevant deals")
    except Exception as e:
        print(f"  RedFlagDeals error: {e}")

    print(f"\n✅ Done. {total} listings upserted.")


if __name__ == "__main__":
    main()
