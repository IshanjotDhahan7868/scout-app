'use client'
import { useEffect, useState } from 'react'
import { supabase, Structure, WorkOrder, Listing } from '@/lib/supabase'
import Link from 'next/link'
import { Building2, ClipboardList, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react'

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

  const statusColor: Record<string, string> = {
    untouched: 'bg-red-500/20 text-red-400 border-red-500/30',
    in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ready: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    revenue: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  const urgent = orders.filter(o => o.priority === 'urgent' || o.priority === 'high')

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>

  return (
    <div className="p-4 space-y-6">
      <div className="pt-6">
        <p className="text-slate-500 text-sm">Camp Ma-Kee-Wa · Palgrave, ON</p>
        <h1 className="text-2xl font-bold text-white mt-1">Scout</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <Building2 size={18} className="mx-auto text-emerald-400 mb-1" />
          <div className="text-xl font-bold">{structures.length}</div>
          <div className="text-xs text-slate-500">Structures</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <ClipboardList size={18} className="mx-auto text-amber-400 mb-1" />
          <div className="text-xl font-bold">{orders.length}</div>
          <div className="text-xs text-slate-500">Open tasks</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <ShoppingBag size={18} className="mx-auto text-blue-400 mb-1" />
          <div className="text-xl font-bold">{listings.length}</div>
          <div className="text-xs text-slate-500">New deals</div>
        </div>
      </div>

      {urgent.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={15} className="text-red-400" />
            <span className="text-sm font-semibold text-red-400">Urgent / High priority</span>
          </div>
          <div className="space-y-2">
            {urgent.slice(0, 3).map(o => (
              <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-sm font-medium">{o.title}</span>
                <span className="text-xs text-red-400 uppercase">{o.priority}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-300">Property</span>
          <Link href="/property" className="text-xs text-emerald-400">View all →</Link>
        </div>
        <div className="space-y-2">
          {structures.slice(0, 4).map(s => (
            <Link key={s.id} href={`/property/${s.id}`} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-slate-500 capitalize">{s.type}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor[s.status]}`}>
                {s.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {listings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" />
              <span className="text-sm font-semibold text-slate-300">Top deals right now</span>
            </div>
            <Link href="/deals" className="text-xs text-emerald-400">All deals →</Link>
          </div>
          <div className="space-y-2">
            {listings.map(l => (
              <Link key={l.id} href="/deals" className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{l.title}</div>
                  <div className="text-xs text-slate-500">{l.location} · ${l.price}</div>
                </div>
                {l.ai_score && (
                  <div className={`ml-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${l.ai_score >= 8 ? 'bg-emerald-500/20 text-emerald-400' : l.ai_score >= 6 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                    {l.ai_score}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
