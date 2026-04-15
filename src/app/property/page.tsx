'use client'
import { useEffect, useState } from 'react'
import { supabase, Structure } from '@/lib/supabase'
import { getFocusStructure, isFocusStructure } from '@/lib/focus'
import Link from 'next/link'
import { Plus, Target, FileText, ShieldCheck, Home, ChevronRight } from 'lucide-react'

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
  const [scope, setScope] = useState<'focus' | 'all'>('focus')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('structures').select('*').order('priority').then(({ data }) => {
      setStructures(data || [])
      setLoading(false)
    })
  }, [])

  const focusStructure = getFocusStructure(structures)
  const scopedStructures = scope === 'focus' && focusStructure ? [focusStructure] : structures
  const filtered = filter === 'all' ? scopedStructures : scopedStructures.filter(s => s.status === filter)

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

      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-4">
        <button onClick={() => setScope('focus')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${scope === 'focus' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
          Focus house
        </button>
        <button onClick={() => setScope('all')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${scope === 'all' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
          Whole property
        </button>
      </div>

      {focusStructure && scope === 'focus' && (
        <div className="flex items-start gap-3 bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 mb-4">
          <Target size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white">{focusStructure.name}</div>
            <p className="text-xs text-slate-400 mt-1">
              This view is intentionally narrowed to the launch house so you can ignore the rest of the property for now.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/property/ops" className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <ShieldCheck size={18} className="text-emerald-400 mb-3" />
          <div className="text-sm font-semibold text-white">Farmhouse Ops</div>
          <p className="text-xs text-slate-400 mt-1">
            The host-style control center for hazards, utilities, compliance, evidence, and zone activation.
          </p>
        </Link>
        {focusStructure && (
          <Link href={`/property/${focusStructure.id}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <Home size={18} className="text-emerald-400 mb-3" />
            <div className="text-sm font-semibold text-white">House Plan</div>
            <p className="text-xs text-slate-400 mt-1">
              Rooms, structure notes, and house-specific task drill-down for {focusStructure.name}.
            </p>
          </Link>
        )}
      </div>

      <Link href="/property/intelligence" className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white">Property intelligence pack</div>
            <p className="text-xs text-slate-400 mt-1">
              Canonical identity, operating rules, likely assets, compliance signals, and next data to capture.
            </p>
          </div>
        </div>
        <span className="text-xs text-emerald-400">Open →</span>
      </Link>

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
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TYPE_ICON[s.type]}</span>
                  <span className="font-semibold">{s.name}</span>
                  {isFocusStructure(s) && <span className="text-[10px] uppercase tracking-wide text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">Focus</span>}
                </div>
                {s.notes && <p className="text-xs text-slate-400 mt-1 ml-7">{s.notes}</p>}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 capitalize">{s.type}</div>
                <div className="text-xs mt-1">P{s.priority}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-500">
              <span>Open structure workspace</span>
              <ChevronRight size={15} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
