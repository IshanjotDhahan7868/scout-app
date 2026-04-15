'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Structure } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import { inputStyle, selectStyle, btnPrimary } from '@/components/ui'

const CATEGORIES = [
  { value: 'cleaning', label: '🧹 Cleaning' },
  { value: 'repair', label: '🔧 Repair' },
  { value: 'paint', label: '🎨 Paint' },
  { value: 'electrical', label: '⚡ Electrical' },
  { value: 'plumbing', label: '🚰 Plumbing' },
  { value: 'inspection', label: '📋 Inspection' },
  { value: 'landscaping', label: '🌿 Landscaping' },
  { value: 'other', label: '📦 Other' },
]

const PRIORITIES = [
  { value: 'urgent', label: '🔴 Urgent — do this immediately' },
  { value: 'high', label: '🟠 High — this week' },
  { value: 'medium', label: '🟡 Medium — this month' },
  { value: 'low', label: '⚪ Low — someday' },
]

function NewTaskForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [structures, setStructures] = useState<Pick<Structure, 'id' | 'name'>[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    estimated_cost: '',
    assigned_to: '',
    structure_id: params.get('structure') || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('structures').select('id, name').order('priority').then(({ data }) => setStructures(data || []))
  }, [])

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await supabase.from('work_orders').insert({
      title: form.title.trim(),
      description: form.description || null,
      priority: form.priority,
      category: form.category,
      estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
      assigned_to: form.assigned_to || null,
      structure_id: form.structure_id || null,
    })
    router.back()
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <div className="min-h-screen px-5">
      <div className="flex items-center gap-3 pt-12 pb-6">
        <button onClick={() => router.back()} style={{ color: '#8A7968' }}><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold" style={{ color: '#F0E8D8' }}>New task</h1>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A7968' }}>What needs to be done?</label>
          <input
            value={form.title}
            onChange={f('title')}
            placeholder="e.g. Clean out the main bedroom"
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Category + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A7968' }}>Type</label>
            <select value={form.category} onChange={f('category')} style={selectStyle}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A7968' }}>Priority</label>
            <select value={form.priority} onChange={f('priority')} style={selectStyle}>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        {/* Which building */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A7968' }}>Which building? (optional)</label>
          <select value={form.structure_id} onChange={f('structure_id')} style={selectStyle}>
            <option value="">No specific building</option>
            {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A7968' }}>Notes (optional)</label>
          <textarea
            value={form.description}
            onChange={f('description')}
            placeholder="Any extra details..."
            rows={3}
            style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
          />
        </div>

        {/* Cost + Assigned */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A7968' }}>Est. cost ($)</label>
            <input value={form.estimated_cost} onChange={f('estimated_cost')} type="number" placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A7968' }}>Assigned to</label>
            <input value={form.assigned_to} onChange={f('assigned_to')} placeholder="Name" style={inputStyle} />
          </div>
        </div>

        <button onClick={save} disabled={saving || !form.title.trim()} style={{ ...btnPrimary, opacity: saving || !form.title.trim() ? 0.5 : 1 }}>
          {saving ? 'Saving...' : 'Add task'}
        </button>
      </div>
    </div>
  )
}

export default function NewTaskPage() {
  return <Suspense><NewTaskForm /></Suspense>
}
