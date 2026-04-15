'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Structure } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

const TYPES: Structure['type'][] = ['house', 'cabin', 'portable', 'shed', 'campsite', 'pool', 'forest', 'other']
const STATUSES: Structure['status'][] = ['untouched', 'in_progress', 'ready', 'revenue']

export default function NewPropertyPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    type: 'house' as Structure['type'],
    status: 'untouched' as Structure['status'],
    priority: '3',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await supabase.from('structures').insert({
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      priority: Number(form.priority),
      notes: form.notes.trim() || null,
    })
    router.push('/property')
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 pt-6 pb-6">
        <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">Add Structure</h1>
      </div>

      <div className="space-y-3">
        <input
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Structure name"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as Structure['type'] }))} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none capitalize">
            {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as Structure['status'] }))} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none capitalize">
            {STATUSES.map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
          </select>
        </div>
        <select value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
          {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>Priority {value}</option>)}
        </select>
        <textarea
          value={form.notes}
          onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
          rows={4}
          placeholder="Why does this structure matter and what should happen here?"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none resize-none"
        />
        <button onClick={save} disabled={saving || !form.name.trim()} className="w-full bg-emerald-500 disabled:opacity-50 text-black font-semibold py-3 rounded-xl text-sm">
          {saving ? 'Saving...' : 'Save structure'}
        </button>
      </div>
    </div>
  )
}
