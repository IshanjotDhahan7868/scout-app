'use client'
import { useEffect, useState } from 'react'
import { supabase, WishlistItem } from '@/lib/supabase'
import { LoaderCircle, Plus, Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

const CATEGORIES = ['furniture', 'appliance', 'lighting', 'bedding', 'decor', 'tools', 'cleaning', 'outdoor', 'other']

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'furniture', max_price: '', radius_km: '50', notes: '' })
  const [runningSearch, setRunningSearch] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('wishlist_items').select('*').order('created_at').then(({ data }) => {
      setItems(data || [])
      setLoading(false)
    })
  }, [])

  const add = async () => {
    if (!form.name.trim()) return
    const { data } = await supabase.from('wishlist_items').insert({
      name: form.name,
      category: form.category,
      max_price: form.max_price ? Number(form.max_price) : null,
      radius_km: Number(form.radius_km),
      notes: form.notes || null,
      active: true,
    }).select().single()
    if (data) setItems(prev => [...prev, data])
    setForm({ name: '', category: 'furniture', max_price: '', radius_km: '50', notes: '' })
    setShowForm(false)
  }

  const toggle = async (item: WishlistItem) => {
    await supabase.from('wishlist_items').update({ active: !item.active }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))
  }

  const remove = async (id: string) => {
    await supabase.from('wishlist_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const runSearch = async () => {
    setRunningSearch(true)
    setSearchMessage(null)

    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const body = await res.json() as { ok: boolean; error?: string; output?: string }

      if (!res.ok || !body.ok) {
        setSearchMessage(body.error || 'Search failed.')
        return
      }

      setSearchMessage(body.output?.trim() || 'Search finished. Check Deals for new results.')
    } catch {
      setSearchMessage('Search failed. Make sure the Next app server can run the scraper.')
    } finally {
      setRunningSearch(false)
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pt-6 pb-4">
        <div>
          <h1 className="text-xl font-bold">Wishlist</h1>
          <p className="text-xs text-slate-500 mt-0.5">Scrapers hunt for these items across all sources</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSearch}
            disabled={runningSearch}
            className="flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 disabled:opacity-60"
          >
            {runningSearch ? <LoaderCircle size={14} className="animate-spin" /> : <Search size={14} />}
            <span>{runningSearch ? 'Searching...' : 'Run search now'}</span>
          </button>
          <button onClick={() => setShowForm(!showForm)} className="bg-emerald-500 text-black rounded-full p-1.5">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {searchMessage && (
        <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto font-mono">
          {searchMessage}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-sm">Add item to hunt for</h3>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Bed frame, Dining table, Chandelier"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm placeholder:text-slate-600 outline-none focus:border-slate-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none capitalize">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              value={form.max_price}
              onChange={e => setForm(p => ({ ...p, max_price: e.target.value }))}
              placeholder="Max price ($)"
              type="number"
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm placeholder:text-slate-600 outline-none focus:border-slate-500"
            />
          </div>
          <input
            value={form.radius_km}
            onChange={e => setForm(p => ({ ...p, radius_km: e.target.value }))}
            placeholder="Radius (km, default 50)"
            type="number"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm placeholder:text-slate-600 outline-none focus:border-slate-500"
          />
          <input
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Notes (style, size, color...)"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm placeholder:text-slate-600 outline-none focus:border-slate-500"
          />
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 bg-emerald-500 text-black font-medium py-2 rounded-xl text-sm">Add</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className={`bg-slate-900 border rounded-xl px-4 py-3 ${item.active ? 'border-slate-800' : 'border-slate-800/50 opacity-50'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  <span className="capitalize">{item.category}</span>
                  {item.max_price && <span> · max ${item.max_price}</span>}
                  <span> · {item.radius_km}km radius</span>
                </div>
                {item.notes && <div className="text-xs text-slate-400 mt-1 italic">{item.notes}</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(item)} className="text-slate-500">
                  {item.active ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => remove(item.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-12">Add items you're looking for — scrapers will hunt them down automatically</p>
        )}
      </div>
    </div>
  )
}
