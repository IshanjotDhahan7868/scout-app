'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function NewRoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await supabase.from('rooms').insert({ structure_id: id, name: form.name, notes: form.notes || null })
    router.back()
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 pt-6 pb-6">
        <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">Add Room</h1>
      </div>
      <div className="space-y-3">
        <input
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Room name (e.g. Master bedroom, Kitchen)"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none"
        />
        <textarea
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          placeholder="Notes (optional)"
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none resize-none"
        />
        <button onClick={save} disabled={saving || !form.name.trim()} className="w-full bg-emerald-500 disabled:opacity-50 text-black font-semibold py-3 rounded-xl text-sm">
          {saving ? 'Saving...' : 'Add room'}
        </button>
      </div>
    </div>
  )
}
