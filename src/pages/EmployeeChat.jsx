import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Badge, Icon } from '../components/ui'
import { load, answerFor, TOPICS, topicById } from '../lib/store'

const SUGGESTIONS = [
  'How much can I spend on materials without approval?',
  'How many vacation days do I get?',
  'What discount can I offer a client?',
  'How do I expense a receipt?',
  'What are the standard working hours?',
]

export default function EmployeeChat() {
  const nav = useNavigate()
  const [state] = useState(() => load())
  const [emp, setEmp] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const sess = JSON.parse(sessionStorage.getItem('clerx.session') || 'null')
    const found = sess && (state.employees || []).find((e) => e.id === sess.empId)
    if (!found) { nav('/join'); return }
    setEmp(found)
    setMessages([{
      role: 'ai',
      text: `Hi ${found.name.split(' ')[0]} 👋 I'm Clerx, ${state.company?.name || 'your company'}'s assistant. Ask me anything about the areas you're cleared for.`,
    }])
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  if (!emp) return null

  const allowed = emp.topics
  const send = (text) => {
    const q = (text ?? input).trim()
    if (!q) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const res = answerFor(q, allowed)
      setTyping(false)
      setMessages((m) => [...m, { role: 'ai', text: res.text, blocked: res.blocked, topic: res.topic }])
    }, 900 + Math.random() * 700)
  }

  return (
    <div className="flex h-screen flex-col">
      {/* header */}
      <header className="border-b border-white/8 glass">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{emp.name}</div>
              <div className="text-xs text-slate-500">{allowed.length} topic{allowed.length !== 1 ? 's' : ''} cleared</div>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600/25 text-sm font-semibold text-brand-200">
              {emp.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </span>
            <button onClick={() => { sessionStorage.removeItem('clerx.session'); nav('/join') }} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white">
              <Icon.logout size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* clearance strip */}
      <div className="border-b border-white/5 bg-ink-950/40">
        <div className="mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
          <span className="shrink-0 text-xs text-slate-500">Cleared for:</span>
          {allowed.length === 0 && <span className="text-xs text-slate-500">No topics yet — ask your lead.</span>}
          {allowed.map((id) => {
            const t = topicById(id)
            return (
              <span key={id} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: `${t.color}44`, color: t.color, background: `${t.color}12` }}>
                <Icon.dot size={9} /> {t.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
          {messages.map((m, i) => <Message key={i} m={m} empName={emp.name} />)}
          {typing && (
            <div className="flex items-start gap-3">
              <span className="grad-brand mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"><Icon.spark size={16} /></span>
              <div className="rounded-2xl rounded-tl-md border border-white/10 bg-ink-800/70 px-4 py-3.5">
                <span className="flex gap-1">
                  <Dot /> <Dot d={150} /> <Dot d={300} />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* suggestions + input */}
      <div className="border-t border-white/8 glass">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-brand-500/40 hover:text-white">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={1}
              placeholder="Ask Clerx anything…"
              className="max-h-32 flex-1 resize-none rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
            />
            <Button onClick={() => send()} disabled={!input.trim()} className="h-12 w-12 !px-0">
              <Icon.send size={18} />
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-600">Clerx only answers from topics your lead cleared you for.</p>
        </div>
      </div>
    </div>
  )
}

function Message({ m, empName }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-lg rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm text-white">{m.text}</div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white ${m.blocked ? 'bg-amber-500/80' : 'grad-brand'}`}>
        {m.blocked ? <Icon.lock size={15} /> : <Icon.spark size={16} />}
      </span>
      <div className={`max-w-lg rounded-2xl rounded-tl-md border px-4 py-3 text-sm ${m.blocked ? 'border-amber-500/30 bg-amber-500/8 text-amber-100' : 'border-white/10 bg-ink-800/70 text-slate-200'}`}>
        <Rich text={m.text} />
        {m.topic && !m.blocked && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <Icon.shield size={13} className="text-mint-400" /> From <b className="text-slate-400">{topicById(m.topic)?.label}</b> · cleared for you
          </div>
        )}
        {m.blocked && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-300/70">
            <Icon.lock size={12} /> Access restricted by your team lead
          </div>
        )}
      </div>
    </div>
  )
}

// tiny **bold** renderer
function Rich({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return <span>{parts.map((p, i) => p.startsWith('**') ? <b key={i} className="font-semibold text-white">{p.slice(2, -2)}</b> : p)}</span>
}

function Dot({ d = 0 }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />
}
