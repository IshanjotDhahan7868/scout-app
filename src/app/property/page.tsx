'use client'
import { useEffect, useState } from 'react'
import { supabase, Structure } from '@/lib/supabase'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const STATUS_EMOJI: Record<string, string> = {
  untouched: '🔴',
  in_progress: '🟡',
  ready: '🔵',
  revenue: '🟢',
}

const TYPE_ICON: Record<string, string> = {
  house: '🏠', cabin: '🏕️', portable: '📦', shed: '🏚️',
  campsite: '⛺', pool: '🏊', forest: '🌲', other: '📍',
}

export default function PropertyPage() {
  const [structures, setStructures] = useState<Structure[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('structures').select('*').order('priority').then(({ data }) => {
      setStructures(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? structures : structures.filter(s => s.status === filter)

  const statusColor: Record<string, string> = {
    untouched: 'border-red-500/30 bg-red-500/5',
    in_progress: 'border-amber-500/30 bg-amber-500/5',
    ready: 'border-blue-500/30 bg-blue-500/5',
    revenue: 'border-emerald-500/30 bg-emerald-500/5',
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-xl font-bold">Property</h1>
        <Link href="/property/new" className="bg-emerald-500 text-black rounded-full p-1.5">
          <Plus size={18} />
        </Link>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-4 text-xs">
        {(['all', 'untouched', 'in_progress', 'ready', 'revenue'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full border transition-colors capitalize ${filter === s ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500'}`}
          >
            {s === 'all' ? `All (${structures.length})` : `${STATUS_EMOJI[s]} ${s.replace('_', ' ')} (${structures.filter(x => x.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(s => (
          <Link key={s.id} href={`/property/${s.id}`} className={`block border rounded-2xl p-4 ${statusColor[s.status]}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TYPE_ICON[s.type]}</span>
                  <span className="font-semibold">{s.name}</span>
                </div>
                {s.notes && <p className="text-xs text-slate-400 mt-1 ml-7">{s.notes}</p>}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 capitalize">{s.type}</div>
                <div className="text-xs mt-1">P{s.priority}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
