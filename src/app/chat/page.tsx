'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase, Room, Structure, WorkOrder } from '@/lib/supabase'
import { getFocusStructure } from '@/lib/focus'
import { buildScoutSystemPrompt } from '@/lib/scout-context'
import { isOllamaOnline } from '@/lib/ollama'
import { Send, Wifi, WifiOff, Leaf } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey — I'm Scout. I know the property and I know what you're trying to do. Ask me anything: what to fix first, how to pass inspection, what to buy, how to stage a room. Let's get this farmhouse ready." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'

  useEffect(() => {
    isOllamaOnline().then(setOllamaOnline)
    Promise.all([
      supabase.from('structures').select('*').order('priority'),
      supabase.from('rooms').select('*'),
      supabase.from('work_orders').select('*').neq('status', 'done'),
    ]).then(([s, r, w]) => {
      const structs = (s.data || []) as Structure[]
      const focus = getFocusStructure(structs)
      const rooms = (r.data || []).filter((room: Room) => room.structure_id === focus?.id)
      const orders = (w.data || []).filter((o: WorkOrder) => o.structure_id === focus?.id)
      setSystemPrompt(buildScoutSystemPrompt({ structure: focus, rooms, orders }))
    })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3:4b',
          messages: [{ role: 'system', content: systemPrompt }, ...[...messages, userMsg]],
          stream: false,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Can't reach the AI right now. Make sure Ollama is running on your home machine with `ollama serve`, and you're on the same WiFi." }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#1C1410' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ borderBottom: '1px solid #3A2D20' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf size={18} style={{ color: '#C4A265' }} />
            <h1 className="text-lg font-bold" style={{ color: '#F0E8D8' }}>Ask Scout</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {ollamaOnline === true && (
              <><Wifi size={12} style={{ color: '#4ADE80' }} /><span style={{ color: '#4ADE80' }}>AI online</span></>
            )}
            {ollamaOnline === false && (
              <><WifiOff size={12} style={{ color: '#8A7968' }} /><span style={{ color: '#8A7968' }}>AI offline</span></>
            )}
          </div>
        </div>
        <p className="text-xs mt-1" style={{ color: '#8A7968' }}>Powered by Gemma · runs on your home machine</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-40">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={m.role === 'user'
                ? { background: 'linear-gradient(135deg, #2B5A3E, #3A7A54)', color: '#F0E8D8' }
                : { background: '#241C14', border: '1px solid #3A2D20', color: '#D8CCBC' }
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: '#241C14', border: '1px solid #3A2D20' }}>
              {[0, 150, 300].map(d => (
                <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#8A7968', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-5 pb-4" style={{ background: '#1C1410', borderTop: '1px solid #3A2D20' }}>
        <div className="flex gap-2 pt-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="What should we tackle first?"
            className="flex-1 text-sm rounded-xl px-4 py-3 outline-none"
            style={{ background: '#2E2318', border: '1px solid #3A2D20', color: '#F0E8D8' }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-xl px-4 py-3 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #2B5A3E, #3A7A54)', opacity: loading || !input.trim() ? 0.4 : 1 }}
          >
            <Send size={18} style={{ color: '#F0E8D8' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
