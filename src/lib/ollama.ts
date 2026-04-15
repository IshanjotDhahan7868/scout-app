const OLLAMA_BASE = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'

export async function scoreListing(listing: {
  title: string
  description: string | null
  price: number | null
  location: string | null
  photos: string[]
}, wishlistItem: {
  name: string
  max_price: number | null
  notes: string | null
}): Promise<{ score: number; verdict: string } | null> {
  try {
    const prompt = `You are helping evaluate a second-hand deal for a BnB property renovation in Ontario, Canada.

Wishlist item needed: "${wishlistItem.name}"
Max budget: ${wishlistItem.max_price ? `$${wishlistItem.max_price}` : 'flexible'}
Notes: ${wishlistItem.notes || 'none'}

Listing found:
Title: ${listing.title}
Price: ${listing.price ? `$${listing.price}` : 'unknown'}
Location: ${listing.location || 'unknown'}
Description: ${listing.description || 'no description'}

Rate this deal 1-10 and give a one-sentence verdict. Be direct and practical.

Respond in JSON: {"score": 7, "verdict": "Good price, solid condition based on description, worth a look."}`

    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt,
        stream: false,
        format: 'json',
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const parsed = JSON.parse(data.response)
    return { score: parsed.score, verdict: parsed.verdict }
  } catch {
    return null
  }
}

export async function analyzeRoom(imageBase64: string): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: `You are helping renovate a room for an Airbnb property. Describe: the room's current condition, dominant colors, approximate size, what needs cleaning/repairing, and what furniture style would match. Be practical and brief.`,
        images: [imageBase64],
        stream: false,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.response
  } catch {
    return null
  }
}

export async function isOllamaOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}
