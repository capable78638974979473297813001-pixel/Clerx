import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Stamp, Card, Field, Input, Icon } from '../components/ui'
import { Avatar, useToast } from '../components/kit'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'
import { TOPICS } from '../lib/store'

const STEPS = ['Verify', 'File', 'Clear', 'Keys']

export default function Onboarding() {
  const nav = useNavigate()
  const { user, company, loading: authLoading, refresh } = useAuth()
  const [step, setStep] = useState(0)
  const [employees, setEmployees] = useState([])
  const [sources, setSources] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { nav('/signup', { replace: true }); return }
    api.workspace().then((ws) => {
      setEmployees(ws.employees); setSources(ws.sources)
      if (ws.company?.verified) setStep((s) => Math.max(s, 1))
      setReady(true)
    }).catch(() => setReady(true))
  }, [authLoading, user, nav])

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  if (authLoading || !ready) {
    return <div className="grain grid min-h-screen place-items-center"><span className="relative z-10 h-5 w-5 animate-spin rounded-full border-2 border-ink border-t-transparent" /></div>
  }

  return (
    <div className="grain min-h-screen">
      <div className="relative z-10">
        <header className="border-b-[1.5px] border-ink bg-paper">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
            <Logo />
            <button onClick={() => nav('/app')} className="ink-link font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink">Skip to app</button>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-5 pb-24 pt-10">
          <Stepper step={step} />
          <div className="mt-8">
            {step === 0 && <CompanyStep company={company} refresh={refresh} next={next} />}
            {step === 1 && <KnowledgeStep sources={sources} setSources={setSources} next={next} back={back} />}
            {step === 2 && <TeamStep employees={employees} setEmployees={setEmployees} next={next} back={back} />}
            {step === 3 && <CodesStep employees={employees} nav={nav} back={back} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stepper({ step }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex items-center gap-2.5">
            <span className={`grid h-9 w-9 place-items-center rounded-lg border-[1.5px] border-ink font-mono text-sm font-bold transition ${
              i < step ? 'bg-ledger text-paper' : i === step ? 'bg-stamp text-paper shadow-hard' : 'bg-paper-2 text-ink-faint'
            }`}>
              {i < step ? <Icon.check size={16} /> : String(i + 1).padStart(2, '0')}
            </span>
            <span className={`hidden font-mono text-[11px] uppercase tracking-widest sm:block ${i <= step ? 'text-ink' : 'text-ink-faint'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <span className={`mx-3 h-[1.5px] flex-1 ${i < step ? 'bg-ledger' : 'bg-ink/20'}`} />}
        </div>
      ))}
    </div>
  )
}

function StepCard({ tab, title, sub, children }) {
  return (
    <Card tab={tab} className="p-7 shadow-hard-lg rise sm:p-9">
      <h2 className="font-display text-3xl font-semibold leading-tight">{title}</h2>
      {sub && <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{sub}</p>}
      <div className="mt-7">{children}</div>
    </Card>
  )
}

/* ---------- Step 1: Company verify ---------- */
function CompanyStep({ company, refresh, next }) {
  const [name, setName] = useState(company?.name || '')
  const [domain, setDomain] = useState(company?.domain || '')
  const [status, setStatus] = useState(company?.verified ? 'done' : 'idle')
  const [result, setResult] = useState(company?.verified ? company : null)
  const toast = useToast()

  const verify = async () => {
    if (!name.trim()) return
    setStatus('checking')
    await new Promise((r) => setTimeout(r, 1600))
    try {
      const c = await api.verifyCompany({ name: name.trim(), domain: domain.trim() })
      setResult(c); setStatus('done'); await refresh()
    } catch (e) { toast(e.message, { tone: 'stamp' }); setStatus('idle') }
  }

  return (
    <StepCard tab="File 01" title="Verify the company" sub="Clerx runs a quick web check to confirm you're a real, legitimate business before anything gets filed.">
      <div className="grid gap-4">
        <Field label="Company name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meridian Build Co." disabled={status === 'checking'} /></Field>
        <Field label="Website or domain" hint="Optional — helps us find you faster."><Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="meridianbuild.com" disabled={status === 'checking'} /></Field>
      </div>

      {status === 'checking' && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border-[1.5px] border-ink bg-paper-2 px-4 py-3.5 font-mono text-[13px] text-ink-soft">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          Checking web presence, domain records &amp; public listings…
        </div>
      )}

      {status === 'done' && result && (
        <div className="mt-6 rise rounded-lg border-[1.5px] border-ink bg-paper-2 p-5 shadow-hard-grn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display text-xl font-semibold"><Icon.check size={19} className="text-ledger" /> Verified — on the record</div>
            <Stamp tone="ledger" rotate={-7} animate><Icon.check size={13} /> Passed</Stamp>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{result.blurb}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Meta label="Domain" value={result.domain} />
            <Meta label="Industry" value={result.industry} />
            <Meta label="Size band" value={result.size} />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        {status !== 'done'
          ? <Button onClick={verify} disabled={!name.trim() || status === 'checking'}>{status === 'checking' ? 'Verifying…' : <>Run the check <Icon.search size={16} /></>}</Button>
          : <Button onClick={next}>Continue <Icon.arrow size={16} /></Button>}
      </div>
    </StepCard>
  )
}

function Meta({ label, value }) {
  return (
    <div className="rounded-lg border-[1.5px] border-ink bg-paper px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</div>
      <div className="mt-0.5 text-[14px] font-medium">{value}</div>
    </div>
  )
}

/* ---------- Step 2: Knowledge ---------- */
const SOURCES = [
  { id: 'drive', name: 'Google Drive', icon: Icon.drive, desc: 'Docs, sheets, slides' },
  { id: 'slack', name: 'Slack', icon: Icon.slack, desc: 'Channels & threads' },
  { id: 'notion', name: 'Notion', icon: Icon.notion, desc: 'Wikis & pages' },
  { id: 'upload', name: 'Upload files', icon: Icon.file, desc: 'PDF, DOCX, CSV' },
]

function KnowledgeStep({ sources, setSources, next, back }) {
  const [busy, setBusy] = useState(null)
  const toast = useToast()

  const connect = async (src) => {
    if (sources.find((s) => s.id === src.id) || busy) return
    setBusy(src.id)
    await new Promise((r) => setTimeout(r, 1100))
    try { const created = await api.connectSource(src.id); setSources((prev) => [...prev, created]) }
    catch (e) { toast(e.message, { tone: 'stamp' }) }
    finally { setBusy(null) }
  }
  const totalDocs = sources.reduce((a, s) => a + s.docs, 0)

  return (
    <StepCard tab="File 02" title="File the knowledge" sub="Connect the tools your team already runs on. Clerx reads it all and sorts it into topics. (Demo: connections are simulated.)">
      <div className="grid gap-3 sm:grid-cols-2">
        {SOURCES.map((src) => {
          const done = sources.find((s) => s.id === src.id)
          return (
            <button key={src.id} onClick={() => connect(src)} disabled={!!done || busy === src.id}
              className={`flex items-center gap-3 rounded-lg border-[1.5px] border-ink p-4 text-left transition ${done ? 'bg-paper-2 shadow-hard-grn' : 'bg-paper hover:-translate-y-0.5 hover:shadow-hard'}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2"><src.icon size={20} /></span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{src.name}</div>
                <div className="truncate font-mono text-[11px] uppercase tracking-wider text-ink-soft">{done ? `${done.docs} items filed` : src.desc}</div>
              </div>
              {busy === src.id ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                : done ? <Icon.check size={18} className="text-ledger" /> : <Icon.plus size={18} className="text-ink-faint" />}
            </button>
          )
        })}
      </div>

      {sources.length > 0 && (
        <div className="mt-6 rise rounded-lg border-[1.5px] border-ink bg-paper-2 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px]"><b>{totalDocs}</b> items filed across <b>{sources.length}</b> source{sources.length !== 1 ? 's' : ''}</span>
            <Stamp tone="blue" rotate={-4}>Auto-sorted</Stamp>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink bg-paper px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} /> {t.label}
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

/* ---------- Step 3: Team + clearances ---------- */
function TeamStep({ employees, setEmployees, next, back }) {
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const toast = useToast()

  const add = async () => {
    if (!name.trim() || adding) return
    setAdding(true)
    try { const emp = await api.addEmployee({ name: name.trim() }); setEmployees((prev) => [emp, ...prev]); setName(''); toast(`${emp.name.split(' ')[0]} added`) }
    catch (e) { toast(e.message, { tone: 'stamp' }) }
    finally { setAdding(false) }
  }
  const toggle = async (emp, tid) => {
    const topics = emp.topics.includes(tid) ? emp.topics.filter((t) => t !== tid) : [...emp.topics, tid]
    setEmployees((prev) => prev.map((e) => e.id === emp.id ? { ...e, topics } : e))
    try { await api.updateEmployee(emp.id, { topics }) } catch (e) { toast(e.message, { tone: 'stamp' }) }
  }
  const remove = async (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    try { await api.removeEmployee(id) } catch (e) { toast(e.message, { tone: 'stamp' }) }
  }

  return (
    <StepCard tab="File 03" title="Stamp the clearances" sub="Add each employee, then stamp the topics they're cleared to ask about. They only ever hear answers inside those topics.">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Employee name — e.g. Jake Rivera" />
        <Button onClick={add} disabled={!name.trim() || adding}><Icon.plus size={16} /> Add</Button>
      </div>

      <div className="mt-5 space-y-3">
        {employees.length === 0 && (
          <div className="rounded-lg border-[1.5px] border-dashed border-ink/40 py-10 text-center font-mono text-[12px] uppercase tracking-widest text-ink-faint">
            <Icon.people size={26} className="mx-auto mb-2 text-ink-faint" /> No one on file yet
          </div>
        )}
        {employees.map((emp) => <EmpRow key={emp.id} emp={emp} onToggle={toggle} onRemove={remove} />)}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={employees.length === 0}>Continue <Icon.arrow size={16} /></Button>
      </div>
    </StepCard>
  )
}

export function EmpRow({ emp, onToggle, onRemove }) {
  return (
    <div className="rise rounded-lg border-[1.5px] border-ink bg-paper-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={emp.name} size={38} />
          <div>
            <div className="font-medium">{emp.name}</div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft"><Icon.key size={12} /> {emp.code}</div>
          </div>
        </div>
        {onRemove && <button onClick={() => onRemove(emp.id)} className="rounded-md border-[1.5px] border-transparent p-1.5 text-ink-faint hover:border-ink hover:text-stamp"><Icon.x size={16} /></button>}
      </div>
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {TOPICS.map((t) => {
          const on = emp.topics.includes(t.id)
          return (
            <button key={t.id} onClick={() => onToggle(emp, t.id)}
              className={`inline-flex items-center gap-1.5 rounded-md border-[1.5px] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${on ? 'border-ink bg-ink text-paper' : 'border-ink/30 text-ink-soft hover:border-ink'}`}>
              {on ? <Icon.check size={12} /> : <Icon.plus size={12} />} {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Step 4: Keys ---------- */
function CodesStep({ employees, nav, back }) {
  const [copied, setCopied] = useState(null)
  const toast = useToast()
  const copy = (code) => { navigator.clipboard?.writeText(code); setCopied(code); toast('Code copied'); setTimeout(() => setCopied(null), 1500) }

  return (
    <StepCard tab="File 04" title="Hand out the keys" sub="Share each person's code. They enter it with their name to start asking Clerx — scoped to exactly what you stamped.">
      <div className="space-y-2.5">
        {employees.map((emp) => (
          <div key={emp.id} className="flex items-center justify-between rounded-lg border-[1.5px] border-ink bg-paper-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={emp.name} size={38} />
              <div>
                <div className="font-medium">{emp.name}</div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{emp.topics.length} topic{emp.topics.length !== 1 ? 's' : ''} cleared</div>
              </div>
            </div>
            <button onClick={() => copy(emp.code)} className="flex items-center gap-2 rounded-lg border-[1.5px] border-ink bg-paper px-3 py-2 font-mono text-sm font-bold tracking-widest hover:shadow-hard">
              {emp.code} {copied === emp.code ? <Icon.check size={15} className="text-ledger" /> : <Icon.copy size={15} className="text-ink-soft" />}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={back}>Back</Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => nav('/join')}>Try employee view</Button>
          <Button onClick={() => nav('/app')}>Go to the desk <Icon.arrow size={16} /></Button>
        </div>
      </div>
    </StepCard>
  )
}
