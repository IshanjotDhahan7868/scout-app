'use client'
import { useState, useRef, useEffect } from 'react'
import { isOllamaOnline } from '@/lib/ollama'
import { Send, Wifi, WifiOff } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `You are Scout, an AI assistant helping two friends renovate and manage Camp Ma-Kee-Wa — a 100-acre former Girl Guides campground near Palgrave, Ontario that they're turning into a BnB.

The property has: Makeewa Farmhouse (main priority), cabins, portables, tool sheds, a pool, forest trails, and campsites.

You help with: renovation advice, what to prioritize, how to pass inspections, cleaning tips, BnB setup, local suppliers, cost estimates, and general property management. Be practical, direct, and encouraging. You know they're on a tight budget and doing most work themselves.`

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm Scout. Ask me anything about the property — renovation tips, what to tackle first, inspection requirements, where to find cheap supplies, anything. What's on your mind?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'

  useEffect(() => {
    isOllamaOnline().then(setOllamaOnline)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.role === 'user' ? m.content : m.content,
      }))

      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3:4b',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
          ],
          stream: false,
        }),
      })

      if (!res.ok) throw new Error('Ollama offline')
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I can't reach the AI right now — make sure Ollama is running on your home machine (`ollama serve`) and you're on the same WiFi network."
      }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 border-b border-slate-800 bg-slate-950">
        <h1 className="text-lg font-bold">Chat</h1>
        <div className="flex items-center gap-1.5 text-xs">
          {ollamaOnline === true && <><Wifi size={12} className="text-emerald-400" /><span className="text-emerald-400">Gemma online</span></>}
          {ollamaOnline === false && <><WifiOff size={12} className="text-slate-500" /><span className="text-slate-500">AI offline</span></>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-36">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-emerald-500 text-black' : 'bg-slate-900 border border-slate-800 text-slate-100'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-4 pb-4 bg-slate-950 border-t border-slate-800">
        <div className="flex gap-2 pt-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask anything about the property..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 outline-none focus:border-slate-600"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="bg-emerald-500 disabled:opacity-40 text-black rounded-xl px-4 py-3">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
