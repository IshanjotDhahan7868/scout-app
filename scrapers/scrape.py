#!/usr/bin/env python3
"""
Scout deal scraper — runs on a schedule via GitHub Actions.
Sources: Kijiji, Craigslist (Toronto/Hamilton/Barrie), eBay Canada,
         Used.ca, Facebook Marketplace (public), Walmart clearance,
         IKEA As-Is, RedFlagDeals RSS
"""
import os, re, json, time, hashlib, feedparser, requests
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
BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
REQ_HEADERS = {"User-Agent": BROWSER_UA, "Accept-Language": "en-CA,en;q=0.9"}


def upsert_listing(source: str, external_id: str, data: dict):
    try:
        res = requests.post(
            f"{REST_URL}/listings",
            params={"on_conflict": "source,external_id"},
            headers={**HEADERS, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal"},
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


def parse_price(text: str):
    m = re.search(r'[\d,]+\.?\d*', text.replace(',', ''))
    return float(m.group().replace(',', '')) if m else None


# ─── Kijiji (Playwright) ──────────────────────────────────────────────────────
def scrape_kijiji(query: str, max_price=None, radius: int = 100):
    from playwright.sync_api import sync_playwright
    results = []
    slug = re.sub(r'[^a-z0-9]+', '-', query.lower()).strip('-')
    url = f"https://www.kijiji.ca/b-buy-sell/ontario/q-{slug}/k0c10l9004"
    if max_price:
        url += f"?price=0__{max_price}"
    print(f"  Kijiji: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent=BROWSER_UA)
        # Wait for network idle so React fully renders listings
        page.goto(url, wait_until="networkidle", timeout=45000)
        print(f"  Kijiji page title: {page.title()}")

        # Dump a snippet of HTML to diagnose selector if still 0
        html_snippet = page.content()[:3000]

        # Try every selector we know about
        selectors = [
            '[data-listing-id]',
            'li[class*="regularAdCard"]',
            'article[class*="listing"]',
            '[class*="listing-card"]',
            '[data-testid="listing-card"]',
            'li[class*="AdCard"]',
            'div[class*="search-item"]',
        ]
        items = []
        for sel in selectors:
            found = page.query_selector_all(sel)
            if found:
                print(f"  Kijiji matched selector: {sel} ({len(found)} items)")
                items = found
                break
        if not items:
            print(f"  Kijiji: no selector matched. HTML snippet:")
            print(html_snippet[:1000])
        print(f"  Kijiji items found: {len(items)}")
        for item in items[:20]:
            try:
                lid = item.get_attribute('data-listing-id') or item.get_attribute('data-ad-id') or hashlib.md5(item.inner_text()[:80].encode()).hexdigest()[:16]
                title_el = item.query_selector('h3,[class*="title"],[class*="Title"]')
                price_el = item.query_selector('[class*="price"],[class*="Price"]')
                loc_el = item.query_selector('[class*="location"],[class*="Location"]')
                img_el = item.query_selector('img')
                link_el = item.query_selector('a[href]')
                t = title_el.inner_text().strip() if title_el else ""
                if not t:
                    continue
                href = link_el.get_attribute('href') if link_el else None
                results.append({
                    "external_id": lid, "title": t,
                    "price": parse_price(price_el.inner_text()) if price_el else None,
                    "location": loc_el.inner_text().strip() if loc_el else "Ontario",
                    "url": f"https://www.kijiji.ca{href}" if href and href.startswith('/') else href,
                    "photos": [img_el.get_attribute('src')] if img_el else [],
                    "source": "kijiji",
                })
            except Exception as e:
                print(f"    item error: {e}")
        browser.close()
    return results


# ─── Craigslist RSS (multiple cities) ────────────────────────────────────────
def scrape_craigslist(query: str, max_price=None):
    cities = [
        ("toronto", "Toronto"),
        ("barrie", "Barrie"),     # closest to Palgrave
        ("hamilton", "Hamilton"),
    ]
    results = []
    for subdomain, city_name in cities:
        url = f"https://{subdomain}.craigslist.org/search/sss?query={quote_plus(query)}&format=rss&sort=date"
        if max_price:
            url += f"&max_price={max_price}"
        print(f"  Craigslist {city_name}: {url}")
        try:
            feed = feedparser.parse(url)
            print(f"    {city_name}: {len(feed.entries)} RSS entries")
            for entry in feed.entries[:10]:
                ext_id = hashlib.md5((entry.get('link') or '').encode()).hexdigest()[:16]
                title_text = str(entry.get('title') or '')
                link_text = entry.get('link')
                price_m = re.search(r'\$[\d,]+', title_text)
                results.append({
                    "external_id": ext_id,
                    "title": title_text.strip(),
                    "description": str(entry.get('summary') or ''),
                    "url": link_text,
                    "price": float(price_m.group()[1:].replace(',', '')) if price_m else None,
                    "location": city_name,
                    "photos": [],
                    "source": "craigslist",
                })
        except Exception as e:
            print(f"    Craigslist {city_name} error: {e}")
    return results


# ─── eBay Canada RSS ──────────────────────────────────────────────────────────
def scrape_ebay(query: str, max_price=None):
    # eBay RSS feed — works without JS
    url = f"https://www.ebay.ca/sch/i.html?_nkw={quote_plus(query)}&_sop=10&_rss=1"
    if max_price:
        url += f"&_udhi={max_price}"
    print(f"  eBay Canada RSS: {url}")
    try:
        feed = feedparser.parse(url)
        print(f"  eBay: {len(feed.entries)} RSS entries")
        results = []
        for entry in feed.entries[:15]:
            title_text = str(entry.get('title') or '')
            link_text = str(entry.get('link') or '')
            ext_id = hashlib.md5((link_text or title_text).encode()).hexdigest()[:16]
            # Price usually in title like "CAD $45.00" or in a tag
            price_m = re.search(r'CAD\s*\$?([\d,]+\.?\d*)', title_text) or re.search(r'\$([\d,]+\.?\d*)', title_text)
            results.append({
                "external_id": ext_id,
                "title": title_text.strip(),
                "url": link_text,
                "price": float(price_m.group(1).replace(',', '')) if price_m else None,
                "location": "eBay Canada",
                "photos": [],
                "source": "ebay",
            })
        return results
    except Exception as e:
        print(f"  eBay error: {e}")
        return []


# ─── Used.ca (Canadian classifieds) ──────────────────────────────────────────
def scrape_usedca(query: str, max_price=None):
    url = f"https://www.used.ca/all/q-{quote_plus(query)}"
    if max_price:
        url += f"/price-0-{max_price}"
    print(f"  Used.ca: {url}")
    try:
        res = requests.get(url, headers=REQ_HEADERS, timeout=20)
        from html.parser import HTMLParser

        class ListingParser(HTMLParser):
            def __init__(self):
                super().__init__()
                self.results = []
                self._in_listing = False
                self._current = {}

            def handle_starttag(self, tag, attrs):
                attrs_dict = dict(attrs)
                if tag == 'a' and 'listing' in attrs_dict.get('class', ''):
                    self._in_listing = True
                    self._current = {'url': 'https://www.used.ca' + attrs_dict.get('href', '')}
                if self._in_listing and tag == 'img':
                    self._current['photo'] = attrs_dict.get('src')

            def handle_endtag(self, tag):
                if tag == 'a' and self._in_listing and self._current.get('title'):
                    self.results.append(self._current)
                    self._in_listing = False
                    self._current = {}

            def handle_data(self, data):
                if self._in_listing and data.strip():
                    if not self._current.get('title'):
                        self._current['title'] = data.strip()
                    elif '$' in data:
                        self._current['price'] = parse_price(data)

        parser = ListingParser()
        parser.feed(res.text)
        results = []
        for r in parser.results[:15]:
            ext_id = hashlib.md5(r.get('url', r.get('title', '')).encode()).hexdigest()[:16]
            results.append({
                "external_id": ext_id,
                "title": r.get('title', ''),
                "price": r.get('price'),
                "url": r.get('url'),
                "location": "Canada",
                "photos": [r['photo']] if r.get('photo') else [],
                "source": "used.ca",
            })
        print(f"  Used.ca: {len(results)} results")
        return results
    except Exception as e:
        print(f"  Used.ca error: {e}")
        return []


# ─── Walmart Canada clearance ─────────────────────────────────────────────────
def scrape_walmart(query: str, max_price=None):
    url = f"https://www.walmart.ca/search?q={quote_plus(query)}&facets=offer_type%3AClearance"
    print(f"  Walmart clearance: {url}")
    try:
        res = requests.get(url, headers=REQ_HEADERS, timeout=20)
        # Walmart embeds JSON in a script tag
        m = re.search(r'"items"\s*:\s*(\[.*?\])', res.text, re.DOTALL)
        if not m:
            print(f"  Walmart: no JSON items found")
            return []
        items = json.loads(m.group(1))
        results = []
        for item in items[:15]:
            try:
                name = item.get('name') or item.get('title', '')
                price = item.get('salePrice') or item.get('price')
                pid = str(item.get('itemId') or item.get('id') or hashlib.md5(name.encode()).hexdigest()[:12])
                img = item.get('image') or item.get('imageUrl')
                results.append({
                    "external_id": pid,
                    "title": name,
                    "price": float(price) if price else None,
                    "url": f"https://www.walmart.ca/en/ip/{pid}",
                    "location": "Walmart Canada",
                    "photos": [img] if img else [],
                    "source": "walmart",
                })
            except Exception:
                pass
        print(f"  Walmart: {len(results)} results")
        return results
    except Exception as e:
        print(f"  Walmart error: {e}")
        return []


# ─── IKEA Canada As-Is / clearance ───────────────────────────────────────────
def scrape_ikea(query: str):
    """IKEA Canada product search — catches sales and last-chance items."""
    url = f"https://www.ikea.com/ca/en/search/products/?q={quote_plus(query)}&filters=onlineSellable%3Atrue"
    print(f"  IKEA Canada: {url}")
    try:
        res = requests.get(url, headers=REQ_HEADERS, timeout=20)
        m = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});', res.text, re.DOTALL)
        if not m:
            # Try finding product JSON directly
            products = re.findall(r'"itemNo"\s*:\s*"(\d+)".*?"name"\s*:\s*"([^"]+)".*?"price"\s*:\s*\{[^}]*"current"\s*:\s*([\d.]+)', res.text)
            results = []
            for pid, name, price in products[:10]:
                results.append({
                    "external_id": pid,
                    "title": f"IKEA {name}",
                    "price": float(price),
                    "url": f"https://www.ikea.com/ca/en/p/{pid}/",
                    "location": "IKEA Canada",
                    "photos": [],
                    "source": "ikea",
                })
            print(f"  IKEA: {len(results)} results")
            return results
        print(f"  IKEA: 0 results (JS-rendered, no static data)")
        return []
    except Exception as e:
        print(f"  IKEA error: {e}")
        return []


# ─── RedFlagDeals RSS ─────────────────────────────────────────────────────────
def scrape_redflagdeals(extra_keywords: list[str] | None = None):
    url = "https://forums.redflagdeals.com/hot-deals-f9/?rss"
    print(f"  RedFlagDeals RSS: {url}")
    base_keywords = ['furniture', 'bed', 'chair', 'table', 'lamp', 'rug', 'sofa', 'couch',
                     'home depot', 'ikea', 'wayfair', 'walmart', 'rona', 'clearance', 'mattress',
                     'towel', 'bedding', 'curtain', 'blind', 'dresser', 'appliance', 'kettle',
                     'coffee maker', 'vacuum', 'broom', 'home', 'living', 'bedroom', 'kitchen']
    keywords = base_keywords + (extra_keywords or [])
    try:
        feed = feedparser.parse(url)
        results = []
        for entry in feed.entries[:100]:
            title = str(entry.get('title') or '').lower()
            if any(kw in title for kw in keywords):
                link_text = entry.get('link')
                ext_id = hashlib.md5((link_text or title).encode()).hexdigest()[:16]
                results.append({
                    "external_id": ext_id,
                    "title": str(entry.get('title') or '').strip(),
                    "description": str(entry.get('summary') or ''),
                    "url": link_text,
                    "price": None,
                    "location": "Canada",
                    "photos": [],
                    "source": "redflagdeals",
                })
        return results
    except Exception as e:
        print(f"  RedFlagDeals error: {e}")
        return []


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("🔍 Scout scraper starting...")
    wishlist = get_wishlist()
    print(f"  Wishlist: {[w['name'] for w in wishlist]} ({len(wishlist)} items)")

    if not wishlist:
        print("  ⚠️  No active wishlist items — toggle items ON in the Wishlist tab first")
        print("\n✅ Done. 0 listings upserted.")
        return

    total = 0
    wishlist_names = [w['name'].lower() for w in wishlist]

    for item in wishlist:
        query = item['name']
        max_price = item.get('max_price')
        radius = item.get('radius_km', 100)
        print(f"\n→ Hunting: {query} (max ${max_price}, {radius}km)")

        scrapers = [
            ("Kijiji",      lambda: scrape_kijiji(query, max_price, radius)),
            ("Craigslist",  lambda: scrape_craigslist(query, max_price)),
            ("eBay",        lambda: scrape_ebay(query, max_price)),
            ("Used.ca",     lambda: scrape_usedca(query, max_price)),
            ("Walmart",     lambda: scrape_walmart(query, max_price)),
            ("IKEA",        lambda: scrape_ikea(query)),
        ]

        for name, fn in scrapers:
            try:
                listings = fn()
                for l in listings:
                    upsert_listing(l.pop('source'), l.pop('external_id'), {**l, "wishlist_item_id": item['id']})
                    total += 1
                if listings:
                    print(f"  ✓ {name}: {len(listings)} results")
            except Exception as e:
                print(f"  ✗ {name} error: {e}")

        time.sleep(1)

    # RedFlagDeals once — pass wishlist names as extra keywords
    try:
        listings = scrape_redflagdeals(extra_keywords=wishlist_names)
        for l in listings:
            upsert_listing(l.pop('source'), l.pop('external_id'), l)
            total += 1
        print(f"\n  RedFlagDeals: {len(listings)} relevant deals")
    except Exception as e:
        print(f"  RedFlagDeals error: {e}")

    print(f"\n✅ Done. {total} listings upserted.")


if __name__ == "__main__":
    main()
