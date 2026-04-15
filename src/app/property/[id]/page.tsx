'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Structure, Room, WorkOrder } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Plus, Camera, Save, ShieldCheck, FileText } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  todo: 'text-slate-400',
  in_progress: 'text-amber-400',
  done: 'text-emerald-400',
  blocked: 'text-red-400',
}

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-slate-500',
}

export default function StructurePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [structure, setStructure] = useState<Structure | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [tab, setTab] = useState<'rooms' | 'tasks'>('rooms')
  const [notesDraft, setNotesDraft] = useState('')
  const [priorityDraft, setPriorityDraft] = useState('3')
  const [savingDetails, setSavingDetails] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('structures').select('*').eq('id', id).single(),
      supabase.from('rooms').select('*').eq('structure_id', id),
      supabase.from('work_orders').select('*').eq('structure_id', id).order('priority'),
    ]).then(([s, r, w]) => {
      setStructure(s.data)
      setNotesDraft(s.data?.notes || '')
      setPriorityDraft(String(s.data?.priority || 3))
      setRooms(r.data || [])
      setOrders(w.data || [])
      setLoading(false)
    })
  }, [id])

  const updateStatus = async (status: Structure['status']) => {
    await supabase.from('structures').update({ status }).eq('id', id)
    setStructure(prev => prev ? { ...prev, status } : prev)
  }

  const saveDetails = async () => {
    setSavingDetails(true)
    await supabase.from('structures').update({
      notes: notesDraft.trim() || null,
      priority: Number(priorityDraft),
    }).eq('id', id)
    setStructure(prev => prev ? {
      ...prev,
      notes: notesDraft.trim() || null,
      priority: Number(priorityDraft),
    } : prev)
    setSavingDetails(false)
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>
  if (!structure) return <div className="p-6 text-slate-500">Not found</div>

  const openOrders = orders.filter(o => o.status !== 'done')
  const doneOrders = orders.filter(o => o.status === 'done')

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 pt-6 pb-4">
        <button onClick={() => router.back()} className="text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex-1">{structure.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/property/ops" className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <ShieldCheck size={17} className="text-emerald-400 mb-2" />
          <div className="text-sm font-semibold">Open ops</div>
          <p className="text-xs text-slate-500 mt-1">Jump to hazards, utilities, compliance, zones, and evidence.</p>
        </Link>
        <Link href="/property/intelligence" className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <FileText size={17} className="text-emerald-400 mb-2" />
          <div className="text-sm font-semibold">Property intel</div>
          <p className="text-xs text-slate-500 mt-1">Review the site assumptions, rules, and next evidence to collect.</p>
        </Link>
      </div>

      {/* Status selector */}
      <div className="flex gap-2 mb-4">
        {(['untouched', 'in_progress', 'ready', 'revenue'] as const).map(s => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${structure.status === s ? 'bg-slate-700 border-slate-500 text-white' : 'border-slate-800 text-slate-500'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Structure details</h2>
            <p className="text-xs text-slate-500 mt-1">Edit the top-level priority and planning notes for this building.</p>
          </div>
          <span className="text-xs text-slate-500">P{structure.priority}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-500">
            Priority
            <select value={priorityDraft} onChange={e => setPriorityDraft(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
              {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>Priority {value}</option>)}
            </select>
          </label>
          <div className="text-xs text-slate-500 flex items-end">
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3">
              Type: <span className="capitalize text-slate-300">{structure.type}</span>
            </div>
          </div>
        </div>
        <textarea
          value={notesDraft}
          onChange={e => setNotesDraft(e.target.value)}
          rows={4}
          placeholder="What matters for this structure right now?"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none resize-none"
        />
        <button onClick={saveDetails} disabled={savingDetails} className="w-full bg-emerald-500 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2">
          <Save size={16} />
          {savingDetails ? 'Saving...' : 'Save structure details'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-4">
        <button onClick={() => setTab('rooms')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'rooms' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
          Rooms ({rooms.length})
        </button>
        <button onClick={() => setTab('tasks')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'tasks' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
          Tasks ({openOrders.length})
        </button>
      </div>

      {tab === 'rooms' && (
        <div className="space-y-3">
          <Link href={`/property/${id}/room/new`} className="flex items-center gap-2 text-emerald-400 text-sm py-2">
            <Plus size={16} /> Add room
          </Link>
          {rooms.map(r => (
            <Link key={r.id} href={`/property/${id}/room/${r.id}`} className="block bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.name}</span>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Camera size={13} />
                  {r.photos.length} photos
                </div>
              </div>
              {r.ai_description && (
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{r.ai_description}</p>
              )}
            </Link>
          ))}
          {rooms.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No rooms yet — add one to get started</p>}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-3">
          <Link href={`/orders/new?structure=${id}`} className="flex items-center gap-2 text-emerald-400 text-sm py-2">
            <Plus size={16} /> Add task
          </Link>
          {openOrders.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">{o.title}</span>
                <div className="flex gap-2 shrink-0">
                  <span className={`text-xs font-medium uppercase ${PRIORITY_COLOR[o.priority]}`}>{o.priority}</span>
                  <span className={`text-xs uppercase ${STATUS_COLOR[o.status]}`}>{o.status.replace('_', ' ')}</span>
                </div>
              </div>
              {o.category && <span className="text-xs text-slate-500 capitalize mt-1 inline-block">{o.category}</span>}
            </Link>
          ))}
          {doneOrders.length > 0 && (
            <div className="text-xs text-slate-600 text-center pt-2">
              + {doneOrders.length} completed task{doneOrders.length !== 1 ? 's' : ''}
            </div>
          )}
          {orders.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No tasks yet</p>}
        </div>
      )}
    </div>
  )
}
