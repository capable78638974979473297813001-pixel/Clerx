import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Badge, Field, Input, Icon } from '../components/ui'
import { load, save, TOPICS, topicById, genCode } from '../lib/store'

const STEPS = ['Company', 'Knowledge', 'Team', 'Codes']

export default function Onboarding() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [state, setState] = useState(() => load())

  const patch = (p) => setState((s) => { const n = { ...s, ...p }; save(n); return n })

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]" />
      </div>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <button onClick={() => nav('/')} className="text-sm text-slate-400 hover:text-white">Exit setup</button>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <Stepper step={step} />

        <div className="mt-8">
          {step === 0 && <CompanyStep state={state} patch={patch} next={next} />}
          {step === 1 && <KnowledgeStep state={state} patch={patch} next={next} back={back} />}
          {step === 2 && <TeamStep state={state} patch={patch} next={next} back={back} />}
          {step === 3 && <CodesStep state={state} patch={patch} nav={nav} back={back} />}
        </div>
      </div>
    </div>
  )
}

function Stepper({ step }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition ${
              i < step ? 'bg-mint-500 text-ink-950' : i === step ? 'grad-brand text-white' : 'bg-white/5 text-slate-500'
            }`}>
              {i < step ? <Icon.check size={16} /> : i + 1}
            </span>
            <span className={`hidden text-sm font-medium sm:block ${i <= step ? 'text-white' : 'text-slate-500'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? 'bg-mint-500/60' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  )
}

function StepCard({ title, sub, children }) {
  return (
    <div className="card p-7 animate-fade-up sm:p-9">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      {sub && <p className="mt-2 text-slate-400">{sub}</p>}
      <div className="mt-7">{children}</div>
    </div>
  )
}

// ---------- Step 1: Company verify ----------
function CompanyStep({ state, patch, next }) {
  const [name, setName] = useState(state.company?.name || '')
  const [domain, setDomain] = useState(state.company?.domain || '')
  const [status, setStatus] = useState(state.company?.verified ? 'done' : 'idle') // idle | checking | done
  const [result, setResult] = useState(state.company || null)

  const verify = () => {
    if (!name.trim()) return
    setStatus('checking')
    setTimeout(() => {
      const res = {
        name: name.trim(),
        domain: domain.trim() || `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        verified: true,
        industry: guessIndustry(name),
        size: '5–200 employees',
        blurb: `${name.trim()} appears to be an established business with a live web presence, active listings, and a registered domain. No red flags found.`,
      }
      setResult(res)
      patch({ company: res })
      setStatus('done')
    }, 2200)
  }

  return (
    <StepCard title="Let's verify your company" sub="Clerx runs a quick web check to confirm you're a real, legitimate business before anything else.">
      <div className="grid gap-4">
        <Field label="Company name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meridian Build Co." disabled={status === 'checking'} />
        </Field>
        <Field label="Website or domain" hint="Optional — helps us find you faster.">
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="meridianbuild.com" disabled={status === 'checking'} />
        </Field>
      </div>

      {status === 'checking' && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3.5 text-sm text-slate-300">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          Checking web presence, domain records, and public listings…
        </div>
      )}

      {status === 'done' && result && (
        <div className="mt-6 animate-fade-up rounded-xl border border-mint-500/30 bg-mint-500/8 p-5">
          <div className="flex items-center gap-2">
            <Icon.shield size={18} className="text-mint-400" />
            <span className="font-semibold text-white">Verified — looks legit</span>
            <Badge color="#34d9a8" className="ml-auto"><Icon.check size={12} /> Passed</Badge>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.blurb}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Meta label="Domain" value={result.domain} />
            <Meta label="Likely industry" value={result.industry} />
            <Meta label="Size band" value={result.size} />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-3">
        {status !== 'done' && (
          <Button onClick={verify} disabled={!name.trim() || status === 'checking'}>
            {status === 'checking' ? 'Verifying…' : <>Run verification <Icon.search size={16} /></>}
          </Button>
        )}
        {status === 'done' && (
          <Button onClick={next}>Continue <Icon.arrow size={16} /></Button>
        )}
      </div>
    </StepCard>
  )
}

function Meta({ label, value }) {
  return (
    <div className="rounded-lg border border-white/8 bg-ink-950/50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 font-medium text-white">{value}</div>
    </div>
  )
}

function guessIndustry(name) {
  const n = name.toLowerCase()
  if (/build|construct|contract|reno/.test(n)) return 'Construction'
  if (/tech|labs|ai|data|soft/.test(n)) return 'Technology'
  if (/health|care|clinic|med/.test(n)) return 'Healthcare'
  if (/law|legal|partners/.test(n)) return 'Professional services'
  return 'General business'
}

// ---------- Step 2: Knowledge sources ----------
const SOURCES = [
  { id: 'drive', name: 'Google Drive', icon: Icon.drive, desc: 'Docs, sheets, slides', color: '#34d9a8' },
  { id: 'slack', name: 'Slack', icon: Icon.slack, desc: 'Channels & threads', color: '#e01e5a' },
  { id: 'notion', name: 'Notion', icon: Icon.notion, desc: 'Wikis & pages', color: '#e2e2e2' },
  { id: 'upload', name: 'Upload files', icon: Icon.file, desc: 'PDF, DOCX, CSV', color: '#6d5efc' },
]

function KnowledgeStep({ state, patch, next, back }) {
  const [sources, setSources] = useState(state.sources || [])
  const [busy, setBusy] = useState(null)

  const connect = (src) => {
    if (sources.find((s) => s.id === src.id)) return
    setBusy(src.id)
    setTimeout(() => {
      const docs = 20 + Math.floor(Math.random() * 180)
      const added = [...sources, { id: src.id, name: src.name, docs, topics: sampleTopics() }]
      setSources(added)
      patch({ sources: added })
      setBusy(null)
    }, 1400)
  }

  const totalDocs = sources.reduce((a, s) => a + s.docs, 0)

  return (
    <StepCard title="Connect your company knowledge" sub="Link the tools your team already uses. Clerx reads everything and sorts it into topics automatically. (Demo: connections are simulated.)">
      <div className="grid gap-3 sm:grid-cols-2">
        {SOURCES.map((src) => {
          const done = sources.find((s) => s.id === src.id)
          return (
            <button
              key={src.id}
              onClick={() => connect(src)}
              disabled={!!done || busy === src.id}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                done ? 'border-mint-500/40 bg-mint-500/8' : 'border-white/10 bg-ink-950/40 hover:border-brand-500/40 hover:bg-white/5'
              }`}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: `${src.color}1a`, color: src.color, border: `1px solid ${src.color}33` }}>
                <src.icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-white">{src.name}</div>
                <div className="truncate text-xs text-slate-400">{done ? `${done.docs} items indexed` : src.desc}</div>
              </div>
              {busy === src.id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
              ) : done ? (
                <Icon.check size={18} className="text-mint-400" />
              ) : (
                <Icon.plus size={18} className="text-slate-500" />
              )}
            </button>
          )
        })}
      </div>

      {sources.length > 0 && (
        <div className="mt-6 animate-fade-up rounded-xl border border-white/10 bg-ink-950/50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300"><b className="text-white">{totalDocs}</b> items indexed across <b className="text-white">{sources.length}</b> sources</span>
            <Badge color="#6d5efc">Auto-sorted into topics</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs" style={{ borderColor: `${t.color}33`, color: t.color, background: `${t.color}12` }}>
                <Icon.dot size={10} /> {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={sources.length === 0}>Continue <Icon.arrow size={16} /></Button>
      </div>
    </StepCard>
  )
}

function sampleTopics() {
  return TOPICS.filter(() => Math.random() > 0.4).map((t) => t.id)
}

// ---------- Step 3: Team + permissions ----------
function TeamStep({ state, patch, next, back }) {
  const [employees, setEmployees] = useState(state.employees || [])
  const [name, setName] = useState('')

  const add = () => {
    if (!name.trim()) return
    const emp = { id: crypto.randomUUID(), name: name.trim(), code: genCode(), topics: [] }
    const list = [...employees, emp]
    setEmployees(list)
    patch({ employees: list })
    setName('')
  }

  const toggleTopic = (empId, topicId) => {
    const list = employees.map((e) => e.id === empId
      ? { ...e, topics: e.topics.includes(topicId) ? e.topics.filter((t) => t !== topicId) : [...e.topics, topicId] }
      : e)
    setEmployees(list)
    patch({ employees: list })
  }

  const remove = (empId) => {
    const list = employees.filter((e) => e.id !== empId)
    setEmployees(list)
    patch({ employees: list })
  }

  return (
    <StepCard title="Add your team & set access" sub="Add each employee, then tag the topics they're allowed to ask about. They'll only ever get answers inside those topics.">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Employee name — e.g. Jake Rivera" />
        <Button onClick={add} disabled={!name.trim()}><Icon.plus size={16} /> Add</Button>
      </div>

      <div className="mt-5 space-y-3">
        {employees.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/12 py-10 text-center text-sm text-slate-500">
            <Icon.users size={26} className="mx-auto mb-2 text-slate-600" />
            No one added yet. Add your first employee above.
          </div>
        )}
        {employees.map((emp) => (
          <div key={emp.id} className="rounded-xl border border-white/10 bg-ink-950/40 p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600/25 text-sm font-semibold text-brand-200">
                  {emp.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <div className="font-medium text-white">{emp.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon.key size={12} /> Code <span className="font-mono tracking-wider text-slate-400">{emp.code}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => remove(emp.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-400">
                <Icon.x size={16} />
              </button>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {TOPICS.map((t) => {
                const on = emp.topics.includes(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTopic(emp.id, t.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${on ? '' : 'border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300'}`}
                    style={on ? { borderColor: `${t.color}55`, color: t.color, background: `${t.color}18` } : undefined}
                  >
                    {on ? <Icon.check size={12} /> : <Icon.plus size={12} />} {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={employees.length === 0}>Continue <Icon.arrow size={16} /></Button>
      </div>
    </StepCard>
  )
}

// ---------- Step 4: Codes / done ----------
function CodesStep({ state, patch, nav, back }) {
  const [copied, setCopied] = useState(null)
  const employees = state.employees || []

  const copy = (code) => {
    navigator.clipboard?.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <StepCard title="You're all set 🎉" sub="Share each person's code. They'll enter it with their name to start asking Clerx — scoped to exactly what you cleared.">
      <div className="space-y-2.5">
        {employees.map((emp) => (
          <div key={emp.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600/25 text-sm font-semibold text-brand-200">
                {emp.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <div>
                <div className="font-medium text-white">{emp.name}</div>
                <div className="text-xs text-slate-500">{emp.topics.length} topic{emp.topics.length !== 1 ? 's' : ''} cleared</div>
              </div>
            </div>
            <button onClick={() => copy(emp.code)} className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 font-mono text-sm tracking-widest text-white hover:bg-white/10">
              {emp.code}
              {copied === emp.code ? <Icon.check size={15} className="text-mint-400" /> : <Icon.copy size={15} className="text-slate-400" />}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={back}>Back</Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => nav('/join')}>Try the employee view</Button>
          <Button onClick={() => nav('/dashboard')}>Go to dashboard <Icon.arrow size={16} /></Button>
        </div>
      </div>
    </StepCard>
  )
}
