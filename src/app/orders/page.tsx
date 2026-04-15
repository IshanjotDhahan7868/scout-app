'use client'
import { useEffect, useState } from 'react'
import { supabase, Structure, WorkOrder } from '@/lib/supabase'
import { getFocusStructure } from '@/lib/focus'
import Link from 'next/link'
import { Plus, CheckCircle2 } from 'lucide-react'
import { cardStyle, PRIORITY_COLOR, STATUS_LABEL } from '@/components/ui'

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

const CAT_ICON: Record<string, string> = {
  cleaning: '🧹', repair: '🔧', paint: '🎨', electrical: '⚡',
  plumbing: '🚰', inspection: '📋', landscaping: '🌿', other: '📦',
}

export default function TasksPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [structures, setStructures] = useState<Structure[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'open' | 'done'>('open')
  const [scope, setScope] = useState<'focus' | 'all'>('focus')

  useEffect(() => {
    Promise.all([
      supabase.from('work_orders').select('*'),
      supabase.from('structures').select('*').order('priority'),
    ]).then(([w, s]) => {
      const sorted = (w.data as WorkOrder[] || []).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
      setOrders(sorted)
      setStructures(s.data || [])
      setLoading(false)
    })
  }, [])

  const focusStructure = getFocusStructure(structures)
  const structureNames = Object.fromEntries(structures.map(s => [s.id, s.name]))
  const scoped = scope === 'focus' ? orders.filter(o => o.structure_id === focusStructure?.id) : orders
  const open = scoped.filter(o => o.status !== 'done')
  const done = scoped.filter(o => o.status === 'done')
  const list = tab === 'open' ? open : done

  const markDone = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    await supabase.from('work_orders').update({ status: 'done' }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'done' as const } : o))
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C4A265', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="min-h-screen px-5">
      <div className="flex items-center justify-between pt-12 pb-2">
        <h1 className="text-2xl font-bold" style={{ color: '#F0E8D8' }}>Tasks</h1>
        <Link href="/orders/new" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium" style={{ background: 'rgba(196,162,101,0.12)', color: '#C4A265', border: '1px solid rgba(196,162,101,0.25)' }}>
          <Plus size={16} /> New
        </Link>
      </div>
      <p className="text-xs mb-5" style={{ color: '#8A7968' }}>Everything that needs to get done on the property</p>

      {/* Scope toggle */}
      <div className="flex gap-2 mb-4">
        {[{ v: 'focus', l: `🏠 Farmhouse (${orders.filter(o => o.structure_id === focusStructure?.id && o.status !== 'done').length})` }, { v: 'all', l: `🏕️ All property (${orders.filter(o => o.status !== 'done').length})` }].map(({ v, l }) => (
          <button key={v} onClick={() => setScope(v as 'focus' | 'all')}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={{ background: scope === v ? 'rgba(196,162,101,0.15)' : '#2E2318', color: scope === v ? '#C4A265' : '#8A7968', border: `1px solid ${scope === v ? 'rgba(196,162,101,0.3)' : '#3A2D20'}` }}>
            {l}
          </button>
        ))}
      </div>

      {/* Tab row */}
      <div className="flex gap-2 mb-5">
        {[{ v: 'open', l: `Open (${open.length})` }, { v: 'done', l: `Done (${done.length})` }].map(({ v, l }) => (
          <button key={v} onClick={() => setTab(v as 'open' | 'done')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: tab === v ? '#3A2D20' : 'transparent', color: tab === v ? '#F0E8D8' : '#8A7968', border: `1px solid ${tab === v ? '#5A4530' : '#3A2D20'}` }}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map(o => (
          <Link key={o.id} href={`/orders/${o.id}`} className="flex items-start gap-3 rounded-2xl px-4 py-3.5 block" style={cardStyle}>
            <button onClick={(e) => markDone(o.id, e)} className="mt-0.5 shrink-0">
              <CheckCircle2 size={20} style={{ color: o.status === 'done' ? '#4ADE80' : '#3A2D20' }} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium leading-snug" style={{ color: o.status === 'done' ? '#8A7968' : '#F0E8D8', textDecoration: o.status === 'done' ? 'line-through' : 'none' }}>
                  {o.category && <span className="mr-1.5">{CAT_ICON[o.category] || '📦'}</span>}
                  {o.title}
                </span>
                <span className="text-[10px] font-bold uppercase shrink-0" style={{ color: PRIORITY_COLOR[o.priority] }}>{o.priority}</span>
              </div>
              <div className="flex gap-2 mt-1 text-xs" style={{ color: '#8A7968' }}>
                {o.structure_id && structureNames[o.structure_id] && <span>{structureNames[o.structure_id]}</span>}
                {o.estimated_cost && <span>· ~${o.estimated_cost}</span>}
              </div>
            </div>
          </Link>
        ))}
        {list.length === 0 && (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-sm" style={{ color: '#8A7968' }}>{tab === 'open' ? 'No open tasks — nice work!' : 'Nothing completed yet'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
