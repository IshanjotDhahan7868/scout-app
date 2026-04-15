'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase, Listing, WishlistItem } from '@/lib/supabase'
import { Check, X, Bookmark, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'
import { cardStyle } from '@/components/ui'

export default function DealsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [filterItem, setFilterItem] = useState('all')
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null)
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
    setSwipeDir(status === 'saved' ? 'right' : 'left')
    setTimeout(async () => {
      await supabase.from('listings').update({ status }).eq('id', card.id)
      setListings(prev => prev.map(l => l.id === card.id ? { ...l, status } : l))
      setCurrent(c => c + 1)
      setSwipeDir(null)
    }, 280)
  }

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - startX.current
    if (diff > 70) act('saved')
    else if (diff < -70) act('dismissed')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C4A265', borderTopColor: 'transparent' }} />
    </div>
  )

  const saved = listings.filter(l => l.status === 'saved')

  return (
    <div className="min-h-screen px-5">
      <div className="flex items-center justify-between pt-12 pb-2">
        <h1 className="text-2xl font-bold" style={{ color: '#F0E8D8' }}>Deals</h1>
        <Link href="/wishlist" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium" style={{ background: 'rgba(196,162,101,0.12)', color: '#C4A265', border: '1px solid rgba(196,162,101,0.25)' }}>
          <Plus size={16} /> Wishlist
        </Link>
      </div>
      <p className="text-xs mb-5" style={{ color: '#8A7968' }}>Swipe right to save, left to skip</p>

      {/* Filter chips */}
      {wishlist.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => { setFilterItem('all'); setCurrent(0) }}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: filterItem === 'all' ? 'rgba(196,162,101,0.15)' : '#2E2318', color: filterItem === 'all' ? '#C4A265' : '#8A7968', border: `1px solid ${filterItem === 'all' ? 'rgba(196,162,101,0.3)' : '#3A2D20'}` }}>
            All ({listings.length})
          </button>
          {wishlist.map(w => (
            <button key={w.id} onClick={() => { setFilterItem(w.id); setCurrent(0) }}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{ background: filterItem === w.id ? 'rgba(196,162,101,0.15)' : '#2E2318', color: filterItem === w.id ? '#C4A265' : '#8A7968', border: `1px solid ${filterItem === w.id ? 'rgba(196,162,101,0.3)' : '#3A2D20'}` }}>
              {w.name}
            </button>
          ))}
        </div>
      )}

      {/* Swipe card */}
      {card ? (
        <div>
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="rounded-3xl overflow-hidden transition-all duration-300 select-none"
            style={{
              background: '#241C14',
              border: '1px solid #3A2D20',
              transform: swipeDir === 'right' ? 'translateX(110%) rotate(8deg)' : swipeDir === 'left' ? 'translateX(-110%) rotate(-8deg)' : 'none',
              opacity: swipeDir ? 0 : 1,
            }}
          >
            {card.photos[0] ? (
              <img src={card.photos[0]} alt={card.title} className="w-full object-cover" style={{ height: 220 }} />
            ) : (
              <div className="w-full flex items-center justify-center text-5xl" style={{ height: 140, background: '#2E2318' }}>📦</div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs uppercase tracking-widest font-medium" style={{ color: '#8A7968' }}>{card.source}</span>
                {card.ai_score != null && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: card.ai_score >= 8 ? 'rgba(43,90,62,0.5)' : card.ai_score >= 6 ? 'rgba(124,92,58,0.5)' : '#3A2D20',
                      color: card.ai_score >= 8 ? '#4ADE80' : card.ai_score >= 6 ? '#C4A265' : '#8A7968',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                    {card.ai_score}
                  </div>
                )}
              </div>

              <h2 className="text-lg font-semibold leading-snug mb-2" style={{ color: '#F0E8D8' }}>{card.title}</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold" style={{ color: '#C4A265' }}>${card.price ?? '?'}</span>
                {card.location && <span className="text-sm" style={{ color: '#8A7968' }}>{card.location}</span>}
                {card.distance_km && <span className="text-sm" style={{ color: '#8A7968' }}>{card.distance_km}km</span>}
              </div>

              {card.ai_verdict && (
                <div className="rounded-xl px-4 py-3 mb-3 text-sm italic" style={{ background: 'rgba(43,90,62,0.15)', border: '1px solid rgba(43,90,62,0.3)', color: '#B0A090' }}>
                  "{card.ai_verdict}"
                </div>
              )}

              {card.description && <p className="text-xs line-clamp-2" style={{ color: '#8A7968' }}>{card.description}</p>}
            </div>
          </div>

          <p className="text-center text-xs mt-2 mb-5" style={{ color: '#5A4530' }}>{current + 1} of {filtered.length}</p>

          <div className="flex justify-center gap-5">
            <button onClick={() => act('dismissed')} className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90" style={{ background: '#2E2318', border: '1px solid rgba(220,38,38,0.3)' }}>
              <X size={26} style={{ color: '#DC2626' }} />
            </button>
            <a href={card.url || '#'} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#2E2318', border: '1px solid #3A2D20' }}>
              <ExternalLink size={20} style={{ color: '#8A7968' }} />
            </a>
            <button onClick={() => act('saved')} className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90" style={{ background: 'rgba(43,90,62,0.3)', border: '1px solid rgba(74,222,128,0.3)' }}>
              <Check size={26} style={{ color: '#4ADE80' }} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌿</div>
          <p className="font-medium mb-1" style={{ color: '#F0E8D8' }}>All caught up</p>
          <p className="text-sm mb-6" style={{ color: '#8A7968' }}>No new deals right now</p>
          <Link href="/wishlist" className="inline-flex text-sm font-medium" style={{ color: '#C4A265' }}>Manage wishlist →</Link>
        </div>
      )}

      {/* Saved */}
      {saved.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark size={14} style={{ color: '#C4A265' }} />
            <span className="text-sm font-semibold" style={{ color: '#B0A090' }}>Saved ({saved.length})</span>
          </div>
          <div className="space-y-2">
            {saved.map(l => (
              <a key={l.id} href={l.url || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ ...cardStyle, border: '1px solid rgba(43,90,62,0.4)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#F0E8D8' }}>{l.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#8A7968' }}>{l.source} · ${l.price}</div>
                </div>
                <ExternalLink size={14} style={{ color: '#8A7968' }} className="ml-2 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
