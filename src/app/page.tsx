'use client'
import { useEffect, useState } from 'react'
import { supabase, Structure, WorkOrder, Listing } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, Leaf, ShoppingBag } from 'lucide-react'

const STATUS_DOT: Record<string, string> = {
  untouched: '#DC2626',
  in_progress: '#D97706',
  ready: '#2563EB',
  revenue: '#16A34A',
}

const STATUS_LABEL: Record<string, string> = {
  untouched: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
  revenue: 'Live',
}

export default function Home() {
  const [structures, setStructures] = useState<Structure[]>([])
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('structures').select('*').order('priority'),
      supabase.from('work_orders').select('*').neq('status', 'done'),
      supabase.from('listings').select('*').eq('status', 'new').order('ai_score', { ascending: false }).limit(3),
    ]).then(([s, w, l]) => {
      setStructures(s.data || [])
      setOrders(w.data || [])
      setListings(l.data || [])
      setLoading(false)
    })
  }, [])

  const urgent = orders.filter(o => o.priority === 'urgent' || o.priority === 'high')
  const farmhouse = structures.find(s => s.priority === 1) || structures[0]

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C4A265', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative px-5 pt-14 pb-8" style={{ background: 'linear-gradient(160deg, #2B5A3E 0%, #1C1410 55%)' }}>
        {/* Decorative leaves */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Leaf size={128} style={{ color: '#4A6741' }} />
        </div>
        <div className="absolute top-8 right-8 w-16 h-16 opacity-15 rotate-45">
          <Leaf size={64} style={{ color: '#C4A265' }} />
        </div>

        <div className="relative z-10">
          <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: '#C4A265' }}>
            Camp Ma-Kee-Wa · Palgrave, ON
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#F0E8D8' }}>Scout</h1>
          <p className="text-sm mt-1" style={{ color: '#8A7968' }}>Your property command center</p>
        </div>

        {/* Focus structure card */}
        {farmhouse && (
          <Link href={`/property/${farmhouse.id}`} className="relative z-10 mt-6 flex items-center justify-between rounded-2xl px-5 py-4 block" style={{ background: 'rgba(196,162,101,0.1)', border: '1px solid rgba(196,162,101,0.25)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: STATUS_DOT[farmhouse.status] }} />
                <span className="text-xs font-medium" style={{ color: '#C4A265' }}>{STATUS_LABEL[farmhouse.status]}</span>
              </div>
              <div className="font-semibold text-base" style={{ color: '#F0E8D8' }}>{farmhouse.name}</div>
              <div className="text-xs mt-0.5" style={{ color: '#8A7968' }}>Current focus · {orders.filter(o => o.structure_id === farmhouse.id).length} open tasks</div>
            </div>
            <ArrowRight size={18} style={{ color: '#C4A265' }} />
          </Link>
        )}
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Structures', value: structures.length, color: '#2B5A3E' },
            { label: 'Open tasks', value: orders.length, color: '#7C5C3A' },
            { label: 'New deals', value: listings.length, color: '#4A6741' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: '#241C14', border: '1px solid #3A2D20' }}>
              <div className="text-2xl font-bold" style={{ color: '#C4A265' }}>{value}</div>
              <div className="text-[11px] mt-1" style={{ color: '#8A7968' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Urgent tasks */}
        {urgent.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} style={{ color: '#DC2626' }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#DC2626' }}>Needs attention</span>
            </div>
            <div className="space-y-2">
              {urgent.slice(0, 3).map(o => (
                <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                  <span className="text-sm font-medium" style={{ color: '#F0E8D8' }}>{o.title}</span>
                  <span className="text-[10px] uppercase font-bold" style={{ color: '#DC2626' }}>{o.priority}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Property overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: '#B0A090' }}>Property</span>
            <Link href="/property/ops" className="text-xs font-medium" style={{ color: '#C4A265' }}>View all →</Link>
          </div>
          <div className="space-y-2">
            {structures.slice(0, 4).map(s => (
              <Link key={s.id} href={`/property/${s.id}`} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: '#241C14', border: '1px solid #3A2D20' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_DOT[s.status] }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#F0E8D8' }}>{s.name}</div>
                    <div className="text-xs capitalize" style={{ color: '#8A7968' }}>{s.type}</div>
                  </div>
                </div>
                <span className="text-xs capitalize px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(196,162,101,0.1)', color: '#C4A265', border: '1px solid rgba(196,162,101,0.2)' }}>
                  {STATUS_LABEL[s.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top deals */}
        {listings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={14} style={{ color: '#C4A265' }} />
                <span className="text-sm font-semibold" style={{ color: '#B0A090' }}>Hot deals</span>
              </div>
              <Link href="/deals" className="text-xs font-medium" style={{ color: '#C4A265' }}>Swipe →</Link>
            </div>
            <div className="space-y-2">
              {listings.map(l => (
                <Link key={l.id} href="/deals" className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: '#241C14', border: '1px solid #3A2D20' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: '#F0E8D8' }}>{l.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#8A7968' }}>{l.location}{l.price ? ` · $${l.price}` : ''}</div>
                  </div>
                  {l.ai_score && (
                    <div className="ml-3 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: l.ai_score >= 8 ? 'rgba(43,90,62,0.4)' : l.ai_score >= 6 ? 'rgba(124,92,58,0.4)' : 'rgba(58,45,32,0.6)',
                        color: l.ai_score >= 8 ? '#4ADE80' : l.ai_score >= 6 ? '#C4A265' : '#8A7968',
                        border: `1px solid ${l.ai_score >= 8 ? 'rgba(74,222,128,0.3)' : l.ai_score >= 6 ? 'rgba(196,162,101,0.3)' : 'rgba(138,121,104,0.2)'}`,
                      }}>
                      {l.ai_score}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
