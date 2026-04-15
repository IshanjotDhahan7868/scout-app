'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Structure } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function NewOrderForm() {
  const router = useRouter()
  const params = useSearchParams()
  const structureId = params.get('structure')
  const [structures, setStructures] = useState<Pick<Structure, 'id' | 'name'>[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    estimated_cost: '',
    assigned_to: '',
    structure_id: structureId || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('structures').select('id, name').order('priority').then(({ data }) => setStructures(data || []))
  }, [])

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await supabase.from('work_orders').insert({
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      category: form.category,
      estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
      assigned_to: form.assigned_to || null,
      structure_id: form.structure_id || null,
    })
    router.back()
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 pt-6 pb-6">
        <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">New Task</h1>
      </div>

      <div className="space-y-3">
        <input
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Task title"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none focus:border-slate-600"
        />
        <textarea
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Details (optional)"
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none focus:border-slate-600 resize-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">⚪ Low</option>
          </select>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none capitalize">
            {['cleaning', 'repair', 'paint', 'electrical', 'plumbing', 'inspection', 'landscaping', 'other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <select value={form.structure_id} onChange={e => setForm(p => ({ ...p, structure_id: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
          <option value="">No structure</option>
          {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          value={form.estimated_cost}
          onChange={e => setForm(p => ({ ...p, estimated_cost: e.target.value }))}
          placeholder="Estimated cost ($)"
          type="number"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none focus:border-slate-600"
        />
        <input
          value={form.assigned_to}
          onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
          placeholder="Assigned to (name)"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none focus:border-slate-600"
        />
        <button onClick={save} disabled={saving || !form.title.trim()} className="w-full bg-emerald-500 disabled:opacity-50 text-black font-semibold py-3 rounded-xl text-sm">
          {saving ? 'Saving...' : 'Save task'}
        </button>
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  return <Suspense><NewOrderForm /></Suspense>
}
