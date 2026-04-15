'use client'
import { useEffect, useState } from 'react'
import { supabase, WorkOrder } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, CheckCircle2 } from 'lucide-react'

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }
const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'text-red-400 border-red-500/30 bg-red-500/5',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
  medium: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  low: 'text-slate-400 border-slate-700 bg-slate-900',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'open' | 'done'>('open')

  useEffect(() => {
    supabase.from('work_orders').select('*').then(({ data }) => {
      const sorted = (data as WorkOrder[] || []).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
      setOrders(sorted)
      setLoading(false)
    })
  }, [])

  const open = orders.filter(o => o.status !== 'done')
  const done = orders.filter(o => o.status === 'done')

  const markDone = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    await supabase.from('work_orders').update({ status: 'done' }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'done' } : o))
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>

  const list = tab === 'open' ? open : done

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-xl font-bold">Tasks</h1>
        <Link href="/orders/new" className="bg-emerald-500 text-black rounded-full p-1.5">
          <Plus size={18} />
        </Link>
      </div>

      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-4">
        <button onClick={() => setTab('open')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'open' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
          Open ({open.length})
        </button>
        <button onClick={() => setTab('done')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'done' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
          Done ({done.length})
        </button>
      </div>

      <div className="space-y-2">
        {list.map(o => (
          <Link key={o.id} href={`/orders/${o.id}`} className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${PRIORITY_COLOR[o.priority]}`}>
            <button
              onClick={(e) => markDone(o.id, e)}
              className="mt-0.5 shrink-0"
            >
              <CheckCircle2 size={18} className={o.status === 'done' ? 'text-emerald-400' : 'text-slate-600'} />
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${o.status === 'done' ? 'line-through text-slate-500' : ''}`}>{o.title}</div>
              <div className="flex gap-2 mt-0.5 text-xs text-slate-500">
                <span className="uppercase font-medium">{o.priority}</span>
                {o.category && <span>· {o.category}</span>}
                {o.estimated_cost && <span>· ~${o.estimated_cost}</span>}
              </div>
            </div>
          </Link>
        ))}
        {list.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-12">
            {tab === 'open' ? 'No open tasks — nice!' : 'Nothing done yet'}
          </p>
        )}
      </div>
    </div>
  )
}
