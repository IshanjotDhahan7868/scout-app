'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ConfidenceLevel, GroundsZone, Structure, supabase, WorkOrder } from '@/lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'

const CATEGORIES = ['cleaning', 'repair', 'paint', 'electrical', 'plumbing', 'inspection', 'landscaping', 'other']
const PRIORITIES: WorkOrder['priority'][] = ['urgent', 'high', 'medium', 'low']
const STATUSES: WorkOrder['status'][] = ['todo', 'in_progress', 'blocked', 'done']
const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  'verified_on_site',
  'verified_by_owner',
  'verified_from_listing',
  'public_reference_inference',
  'unknown',
]

type WorkOrderForm = {
  title: string
  description: string
  priority: WorkOrder['priority']
  status: WorkOrder['status']
  category: string
  estimated_cost: string
  actual_cost: string
  assigned_to: string
  due_date: string
  structure_id: string
  zone_id: string
  benefit_tag: WorkOrder['benefit_tag']
  confidence_level: ConfidenceLevel
}

function toForm(order: WorkOrder): WorkOrderForm {
  return {
    title: order.title,
    description: order.description || '',
    priority: order.priority,
    status: order.status,
    category: order.category || 'other',
    estimated_cost: order.estimated_cost?.toString() || '',
    actual_cost: order.actual_cost?.toString() || '',
    assigned_to: order.assigned_to || '',
    due_date: order.due_date || '',
    structure_id: order.structure_id || '',
    zone_id: order.zone_id || '',
    benefit_tag: order.benefit_tag,
    confidence_level: order.confidence_level,
  }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<WorkOrder | null>(null)
  const [structures, setStructures] = useState<Pick<Structure, 'id' | 'name'>[]>([])
  const [zones, setZones] = useState<GroundsZone[]>([])
  const [form, setForm] = useState<WorkOrderForm | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('work_orders').select('*').eq('id', id).single(),
      supabase.from('structures').select('id, name').order('priority'),
    ]).then(([workOrder, structureRows]) => {
      setOrder(workOrder.data)
      setForm(workOrder.data ? toForm(workOrder.data) : null)
      setStructures(structureRows.data || [])
    })
  }, [id])

  useEffect(() => {
    if (!form?.structure_id) {
      setZones([])
      return
    }
    supabase.from('grounds_zones').select('*').eq('structure_id', form.structure_id).order('created_at').then(({ data }) => setZones((data || []) as GroundsZone[]))
  }, [form?.structure_id])

  const save = async () => {
    if (!form || !form.title.trim()) return
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      category: form.category || null,
      estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
      actual_cost: form.actual_cost ? Number(form.actual_cost) : null,
      assigned_to: form.assigned_to.trim() || null,
      due_date: form.due_date || null,
      structure_id: form.structure_id || null,
      zone_id: form.zone_id || null,
      benefit_tag: form.benefit_tag,
      confidence_level: form.confidence_level,
    }
    await supabase.from('work_orders').update(payload).eq('id', id)
    setOrder(prev => prev ? { ...prev, ...payload } as WorkOrder : prev)
    setSaving(false)
  }

  if (!form || !order) return <div className="p-6 text-slate-500">Loading...</div>

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 pt-6 pb-6">
        <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft size={20} /></button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">Task Details</h1>
          <p className="text-xs text-slate-500 mt-1">Edit scope, owner, cost, status, and schedule.</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={form.title}
          onChange={e => setForm(prev => prev ? { ...prev, title: e.target.value } : prev)}
          placeholder="Task title"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none"
        />
        <textarea
          value={form.description}
          onChange={e => setForm(prev => prev ? { ...prev, description: e.target.value } : prev)}
          rows={4}
          placeholder="Details"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none resize-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.priority} onChange={e => setForm(prev => prev ? { ...prev, priority: e.target.value as WorkOrder['priority'] } : prev)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none capitalize">
            {PRIORITIES.map(priority => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <select value={form.status} onChange={e => setForm(prev => prev ? { ...prev, status: e.target.value as WorkOrder['status'] } : prev)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none capitalize">
            {STATUSES.map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.category} onChange={e => setForm(prev => prev ? { ...prev, category: e.target.value } : prev)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none capitalize">
            {CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
          <select value={form.structure_id} onChange={e => setForm(prev => prev ? { ...prev, structure_id: e.target.value, zone_id: '' } : prev)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            <option value="">No structure</option>
            {structures.map(structure => <option key={structure.id} value={structure.id}>{structure.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.zone_id} onChange={e => setForm(prev => prev ? { ...prev, zone_id: e.target.value } : prev)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            <option value="">No zone</option>
            {zones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
          </select>
          <select value={form.benefit_tag} onChange={e => setForm(prev => prev ? { ...prev, benefit_tag: e.target.value as WorkOrder['benefit_tag'] } : prev)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            <option value="both">Helpful for both</option>
            <option value="guest_helpful">Guest helpful</option>
            <option value="sale_helpful">Sale helpful</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.estimated_cost}
            onChange={e => setForm(prev => prev ? { ...prev, estimated_cost: e.target.value } : prev)}
            placeholder="Estimated cost"
            type="number"
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none"
          />
          <input
            value={form.actual_cost}
            onChange={e => setForm(prev => prev ? { ...prev, actual_cost: e.target.value } : prev)}
            placeholder="Actual cost"
            type="number"
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.assigned_to}
            onChange={e => setForm(prev => prev ? { ...prev, assigned_to: e.target.value } : prev)}
            placeholder="Assigned to"
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none"
          />
          <input
            value={form.due_date}
            onChange={e => setForm(prev => prev ? { ...prev, due_date: e.target.value } : prev)}
            type="date"
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
          />
        </div>
        <select value={form.confidence_level} onChange={e => setForm(prev => prev ? { ...prev, confidence_level: e.target.value as ConfidenceLevel } : prev)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
          {CONFIDENCE_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
        </select>
        <button onClick={save} disabled={saving || !form.title.trim()} className="w-full bg-emerald-500 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save task changes'}
        </button>
      </div>
    </div>
  )
}
