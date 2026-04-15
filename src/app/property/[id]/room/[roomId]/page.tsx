'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Room } from '@/lib/supabase'
import { ArrowLeft, Camera, Sparkles, Loader2 } from 'lucide-react'

export default function RoomPage() {
  const { id, roomId } = useParams<{ id: string; roomId: string }>()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('rooms').select('*').eq('id', roomId).single().then(({ data }) => setRoom(data))
  }, [roomId])

  const analyzePhoto = async (file: File) => {
    setAnalyzing(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1]

      // Upload to Supabase storage
      const path = `rooms/${roomId}/${Date.now()}.jpg`
      await supabase.storage.from('photos').upload(path, file, { contentType: 'image/jpeg' })
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)

      // Analyze via Ollama
      const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'
      let description = null
      try {
        const res = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gemma3:4b',
            prompt: 'You are helping renovate a room for an Airbnb property. Describe: the room\'s current condition, dominant colors, approximate size, what needs cleaning or repairing, and what furniture style would match. Be practical and brief (3-4 sentences).',
            images: [base64],
            stream: false,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          description = data.response
        }
      } catch { /* Ollama offline */ }

      // Update room
      const newPhotos = [...(room?.photos || []), urlData.publicUrl]
      await supabase.from('rooms').update({
        photos: newPhotos,
        ...(description ? { ai_description: description } : {}),
      }).eq('id', roomId)

      setRoom(prev => prev ? {
        ...prev,
        photos: newPhotos,
        ai_description: description || prev.ai_description,
      } : prev)
      setAnalyzing(false)
    }
    reader.readAsDataURL(file)
  }

  if (!room) return <div className="p-6 text-slate-500">Loading...</div>

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 pt-6 pb-4">
        <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">{room.name}</h1>
      </div>

      {/* Add photo */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => e.target.files?.[0] && analyzePhoto(e.target.files[0])}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={analyzing}
        className="w-full border-2 border-dashed border-slate-700 rounded-2xl py-6 flex flex-col items-center gap-2 text-slate-500 mb-4 active:border-slate-500 transition-colors"
      >
        {analyzing ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
        <span className="text-sm">{analyzing ? 'Analyzing with AI...' : 'Take or upload photo'}</span>
      </button>

      {/* AI description */}
      {room.ai_description && (
        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">AI Room Analysis</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{room.ai_description}</p>
        </div>
      )}

      {/* Photos grid */}
      {room.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {room.photos.map((p, i) => (
            <img key={i} src={p} alt="" className="w-full h-40 object-cover rounded-xl" />
          ))}
        </div>
      )}

      {room.notes && (
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3">
          <p className="text-sm text-slate-400">{room.notes}</p>
        </div>
      )}
    </div>
  )
}
