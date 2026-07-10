import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Stamp, Button, Icon, StampMark } from '../components/ui'
import { load, answerFor, topicById, logActivity } from '../lib/store'

const SUGGESTIONS = [
  'How much can I spend on materials?',
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
    setMessages([{ role: 'ai', text: `Hello ${found.name.split(' ')[0]} — I'm the clerk for ${state.company?.name || 'your company'}. Ask me anything about the topics you're cleared for.` }])
  }, [])

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, typing])

  if (!emp) return null
  const allowed = emp.topics

  const send = (text) => {
    const q = (text ?? input).trim()
    if (!q) return
    setMessages((m) => [...m, { role: 'user', text: q }]); setInput(''); setTyping(true)
    setTimeout(() => {
      const res = answerFor(q, allowed); setTyping(false)
      setMessages((m) => [...m, { role: 'ai', text: res.text, blocked: res.blocked, topic: res.topic }])
      if (res.topic) logActivity({ empId: emp.id, empName: emp.name, question: q, topic: res.topic, blocked: res.blocked })
    }, 900 + Math.random() * 700)
  }

  return (
    <div className="grain flex h-screen flex-col">
      <div className="relative z-10 flex h-full flex-col">
        {/* header */}
        <header className="border-b-[1.5px] border-ink bg-paper">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
            <Logo size="sm" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium leading-tight">{emp.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{allowed.length} cleared</div>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2 font-mono text-[13px] font-bold">
                {emp.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <button onClick={() => { sessionStorage.removeItem('clerx.session'); nav('/join') }} className="rounded-md border-[1.5px] border-transparent p-1.5 text-ink-soft hover:border-ink hover:text-ink"><Icon.logout size={18} /></button>
            </div>
          </div>
        </header>

        {/* clearance strip */}
        <div className="border-b-[1.5px] border-ink bg-paper-2">
          <div className="mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Cleared:</span>
            {allowed.length === 0 && <span className="font-mono text-[11px] text-ink-faint">Nothing yet — ask your lead</span>}
            {allowed.map((id) => {
              const t = topicById(id)
              return (
                <span key={id} className="shrink-0 inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} /> {t.label}
                </span>
              )
            })}
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto ledger-lines">
          <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
            {messages.map((m, i) => <Message key={i} m={m} />)}
            {typing && (
              <div className="flex items-start gap-2.5">
                <span className="shrink-0"><StampMark dim={32} /></span>
                <div className="rounded-lg rounded-tl-sm border-[1.5px] border-ink bg-paper px-4 py-3.5 shadow-hard">
                  <span className="flex gap-1"><Dot /><Dot d={150} /><Dot d={300} /></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* input */}
        <div className="border-t-[1.5px] border-ink bg-paper">
          <div className="mx-auto max-w-3xl px-4 py-3">
            {messages.length <= 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-md border-[1.5px] border-ink bg-paper-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:bg-ink hover:text-paper">{s}</button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                rows={1} placeholder="Ask the clerk anything…"
                className="max-h-32 flex-1 resize-none rounded-lg border-[1.5px] border-ink bg-paper-2/60 px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:bg-paper focus:shadow-hard" />
              <Button onClick={() => send()} disabled={!input.trim()} className="h-12 w-12 !px-0"><Icon.send size={18} /></Button>
            </div>
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">Clerx only answers from topics your lead cleared you for</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Message({ m }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end rise">
        <div className="max-w-lg rounded-lg rounded-br-sm border-[1.5px] border-ink bg-ink px-4 py-2.5 text-[14px] text-paper">{m.text}</div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5 rise">
      <span className="mt-0.5 shrink-0">
        {m.blocked
          ? <span className="grid h-8 w-8 place-items-center rounded-lg border-[1.5px] border-ink bg-stamp text-paper"><Icon.lock size={15} /></span>
          : <StampMark dim={32} />}
      </span>
      <div className={`max-w-lg rounded-lg rounded-tl-sm border-[1.5px] border-ink px-4 py-3 text-[14px] leading-relaxed shadow-hard ${m.blocked ? 'bg-stamp/8' : 'bg-paper'}`}>
        <Rich text={m.text} />
        {m.topic && !m.blocked && (
          <div className="mt-2.5 flex items-center gap-1.5 border-t border-ink/15 pt-2 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            <Icon.folder size={12} /> {topicById(m.topic)?.label} · cleared
          </div>
        )}
        {m.blocked && (
          <div className="mt-2.5">
            <Stamp tone="stamp" rotate={-4} animate className="!text-[0.62rem]"><Icon.lock size={11} /> Restricted</Stamp>
          </div>
        )}
      </div>
    </div>
  )
}

function Rich({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return <span>{parts.map((p, i) => p.startsWith('**') ? <b key={i} className="text-ink">{p.slice(2, -2)}</b> : p)}</span>
}

function Dot({ d = 0 }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-ink" style={{ animationDelay: `${d}ms` }} />
}
