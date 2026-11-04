'use client'
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageCircle, Send, Sparkles, Leaf, Zap, Sun, Droplets, Wind, Recycle, TreePine, Info } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import type { Language } from '@/types'

interface Msg { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; isFallback?: boolean }

const SUGGESTIONS = [
  { icon: Zap, text: 'How do I reduce my electricity bill?' },
  { icon: Sun, text: 'Is rooftop solar worth it in Gujarat?' },
  { icon: Leaf, text: 'What is a carbon footprint?' },
  { icon: Droplets, text: 'Tips for saving water at home' },
  { icon: Wind, text: 'Sustainable transport options' },
  { icon: Recycle, text: 'How do I start home composting?' },
  { icon: TreePine, text: 'Tell me about Mission LiFE' }
]

const LANG_LABELS: Record<Language, string> = { en: 'English', gu: 'ગુજરાતી', hi: 'हिन्दी' }

export function AiChatView() {
  const { lang, setLang } = useAuth()
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! I am EcoMitra, your AI assistant for GREEN GUJARAT. I can help with electricity savings, solar energy, carbon footprints, water conservation, waste reduction, sustainable transport, and Mission LiFE. How can I help you today?',
      timestamp: new Date().toISOString(),
      isFallback: true
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<string>('demo')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)
    const userMsg: Msg = { id: Date.now() + '-u', role: 'user', content: msg, timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    try {
      const r = await api.post<{ reply: string; isFallback: boolean; provider: string; disclaimer: string }>('/ai-chat', {
        message: msg,
        language: lang,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      })
      setProvider(r.provider)
      setMessages(m => [...m, {
        id: Date.now() + '-a',
        role: 'assistant',
        content: r.reply,
        timestamp: new Date().toISOString(),
        isFallback: r.isFallback
      }])
    } catch (e) {
      setMessages(m => [...m, {
        id: Date.now() + '-e',
        role: 'assistant',
        content: 'Sorry, I could not process your request. ' + (e instanceof ApiError ? e.message : 'Please try again.'),
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><MessageCircle className="h-7 w-7 text-primary" /> EcoMitra AI Assistant</h1>
          <p className="text-muted-foreground">Your multilingual guide to green living in Gujarat.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" /> {provider === 'demo' ? 'Demo mode' : provider}
          </Badge>
          <div className="flex gap-1">
            {(['en', 'gu', 'hi'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs border ${lang === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          EcoMitra provides general guidance. Savings and carbon estimates are approximate. For verified government schemes, subsidies, tariffs, or vendor approvals, consult official GEDA/GERC sources. Currently running in <strong>rule-based demo mode</strong> — a real LLM provider can be configured via <code>LLM_API_KEY</code> env var.
        </AlertDescription>
      </Alert>

      <Card className="flex-1 flex flex-col min-h-[400px]">
        <CardContent className="flex-1 overflow-y-auto scroll-thin p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-accent rounded-bl-sm'
              }`}>
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                    <Leaf className="h-3 w-3" /> EcoMitra
                    {m.isFallback && <span className="opacity-60">· rule-based</span>}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-accent p-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </CardContent>
      </Card>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(s => (
          <button
            key={s.text}
            onClick={() => send(s.text)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-card border hover:bg-accent transition-colors disabled:opacity-50"
          >
            <s.icon className="h-3 w-3 text-primary" /> <span className="truncate max-w-[200px]">{s.text}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask EcoMitra anything about sustainability..."
          rows={2}
          className="resize-none"
          disabled={loading}
        />
        <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" className="h-auto">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
