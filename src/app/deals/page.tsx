'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase, Listing, WishlistItem } from '@/lib/supabase'
import { Check, X, Bookmark, ExternalLink, RefreshCw, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DealsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [filterItem, setFilterItem] = useState<string>('all')
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState<'left' | 'right' | null>(null)
  const startX = useRef(0)

  useEffect(() => {
    Promise.all([
      supabase.from('listings').select('*').eq('status', 'new').order('ai_score', { ascending: false }),
      supabase.from('wishlist_items').select('*').eq('active', true),
    ]).then(([l, w]) => {
      setListings(l.data || [])
      setWishlist(w.data || [])
      setLoading(false)
    })
  }, [])

  const filtered = filterItem === 'all' ? listings : listings.filter(l => l.wishlist_item_id === filterItem)
  const card = filtered[current]

  const act = async (status: 'saved' | 'dismissed') => {
    if (!card) return
    setSwiping(status === 'saved' ? 'right' : 'left')
    setTimeout(() => {
      supabase.from('listings').update({ status }).eq('id', card.id)
      setListings(prev => prev.map(l => l.id === card.id ? { ...l, status } : l))
      setCurrent(c => c + 1)
      setSwiping(null)
    }, 300)
  }

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - startX.current
    if (diff > 80) act('saved')
    else if (diff < -80) act('dismissed')
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-xl font-bold">Deals</h1>
        <Link href="/wishlist" className="bg-emerald-500 text-black rounded-full p-1.5">
          <Plus size={18} />
        </Link>
      </div>

      {/* Filter by wishlist item */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button onClick={() => { setFilterItem('all'); setCurrent(0) }} className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${filterItem === 'all' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500'}`}>
          All ({listings.length})
        </button>
        {wishlist.map(w => (
          <button key={w.id} onClick={() => { setFilterItem(w.id); setCurrent(0) }} className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${filterItem === w.id ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500'}`}>
            {w.name}
          </button>
        ))}
      </div>

      {/* Swipe card */}
      {card ? (
        <div className="relative">
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-transform duration-300 ${swiping === 'right' ? 'translate-x-full opacity-0' : swiping === 'left' ? '-translate-x-full opacity-0' : ''}`}
          >
            {/* Photo */}
            {card.photos[0] && (
              <img src={card.photos[0]} alt={card.title} className="w-full h-56 object-cover" />
            )}
            {!card.photos[0] && (
              <div className="w-full h-32 bg-slate-800 flex items-center justify-center text-slate-600 text-4xl">📦</div>
            )}

            <div className="p-4">
              {/* Source badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{card.source}</span>
                {card.ai_score && (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${card.ai_score >= 8 ? 'bg-emerald-500/20 text-emerald-400' : card.ai_score >= 6 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                    {card.ai_score}
                  </div>
                )}
              </div>

              <h2 className="font-semibold text-lg leading-snug mb-1">{card.title}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
                <span className="text-emerald-400 font-bold text-xl">${card.price ?? '?'}</span>
                {card.location && <span>· {card.location}</span>}
                {card.distance_km && <span>· {card.distance_km}km away</span>}
              </div>

              {card.ai_verdict && (
                <div className="bg-slate-800 rounded-xl p-3 mb-3 text-sm text-slate-300 italic">
                  "{card.ai_verdict}"
                </div>
              )}

              {card.description && (
                <p className="text-xs text-slate-500 line-clamp-3">{card.description}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="text-center text-xs text-slate-600 mt-2">
            {current + 1} of {filtered.length}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-6 mt-4">
            <button onClick={() => act('dismissed')} className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400 active:scale-95 transition-transform">
              <X size={24} />
            </button>
            <a href={card.url || '#'} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 active:scale-95 transition-transform">
              <ExternalLink size={20} />
            </a>
            <button onClick={() => act('saved')} className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 active:scale-95 transition-transform">
              <Check size={24} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">Swipe or tap ✓ to save · ✗ to skip</p>
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="text-5xl">🎉</div>
          <p className="text-slate-400">All caught up! No new deals.</p>
          <div className="flex flex-col gap-2 items-center">
            <Link href="/wishlist" className="text-sm text-emerald-400">Manage wishlist →</Link>
            <button onClick={() => setCurrent(0)} className="flex items-center gap-1 text-xs text-slate-500">
              <RefreshCw size={12} /> Review dismissed
            </button>
          </div>
        </div>
      )}

      {/* Saved deals */}
      {listings.filter(l => l.status === 'saved').length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark size={14} className="text-emerald-400" />
            <span className="text-sm font-semibold text-slate-300">Saved deals ({listings.filter(l => l.status === 'saved').length})</span>
          </div>
          <div className="space-y-2">
            {listings.filter(l => l.status === 'saved').map(l => (
              <a key={l.id} href={l.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-slate-900 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{l.title}</div>
                  <div className="text-xs text-slate-500">{l.source} · ${l.price}</div>
                </div>
                <ExternalLink size={14} className="text-slate-500 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
