import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Stamp, Card, Icon } from '../components/ui'
import { EmpRow } from './Onboarding'
import { load, save, reset, TOPICS } from '../lib/store'

export default function Dashboard() {
  const nav = useNavigate()
  const [state, setState] = useState(() => load())

  useEffect(() => {
    const on = () => setState(load())
    window.addEventListener('clerx-store', on)
    return () => window.removeEventListener('clerx-store', on)
  }, [])

  if (!state.company) {
    return (
      <div className="grain grid min-h-screen place-items-center px-6">
        <Card className="relative z-10 max-w-md p-8 text-center shadow-hard-lg">
          <h2 className="font-display text-2xl font-semibold">No file opened yet</h2>
          <p className="mt-2 text-ink-soft">Run the setup to open your Clerx company file.</p>
          <Button className="mt-6" onClick={() => nav('/setup')}>Open a file <Icon.arrow size={16} /></Button>
        </Card>
      </div>
    )
  }

  const employees = state.employees || []
  const sources = state.sources || []
  const totalDocs = sources.reduce((a, s) => a + s.docs, 0)
  const stats = [
    { label: 'On staff', value: employees.length, icon: Icon.people },
    { label: 'Sources filed', value: sources.length, icon: Icon.folder },
    { label: 'Items filed', value: totalDocs, icon: Icon.ledger },
    { label: 'Topics', value: TOPICS.length, icon: Icon.cabinet },
  ]

  const toggle = (id, tid) => {
    const list = employees.map((e) => e.id === id ? { ...e, topics: e.topics.includes(tid) ? e.topics.filter((t) => t !== tid) : [...e.topics, tid] } : e)
    setState(save({ ...state, employees: list }))
  }

  return (
    <div className="grain min-h-screen">
      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b-[1.5px] border-ink bg-paper/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <div className="flex items-center gap-4">
              <Logo />
              <span className="hidden h-6 w-px bg-ink/20 sm:block" />
              <span className="hidden items-center gap-2 font-mono text-[12px] uppercase tracking-widest text-ink-soft sm:flex">
                <Icon.building size={15} /> {state.company.name}
                <Stamp tone="ledger" rotate={-4} className="!text-[0.6rem] !px-2 !py-1"><Icon.check size={11} /> Verified</Stamp>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => nav('/join')}>Employee view</Button>
              <Button variant="outline" size="sm" onClick={() => { reset(); nav('/') }}><Icon.logout size={15} /> Reset</Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="eyebrow flex items-center gap-2"><span className="text-stamp">No. 00</span><span className="h-px w-6 bg-ink/30" /> The clerk's desk</div>
              <h1 className="mt-2 font-display text-4xl font-semibold">Records &amp; clearances</h1>
            </div>
            <Button size="sm" onClick={() => nav('/setup')}><Icon.plus size={15} /> Add more</Button>
          </div>

          <div className="mt-6 grid grid-cols-2 divide-ink border-[1.5px] border-ink bg-paper shadow-hard lg:grid-cols-4 lg:divide-x-[1.5px]">
            {stats.map((s, i) => (
              <div key={s.label} className={`p-5 ${i < 2 ? 'border-b-[1.5px] border-ink lg:border-b-0' : ''} ${i % 2 === 0 ? 'border-r-[1.5px] border-ink lg:border-r-0' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2"><s.icon size={17} /></span>
                </div>
                <div className="mt-3 font-display text-4xl font-semibold">{s.value}</div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-3 font-mono text-[12px] uppercase tracking-widest text-ink-soft">Staff &amp; clearances</h2>
              <div className="space-y-3">
                {employees.map((emp) => <EmpRow key={emp.id} emp={emp} onToggle={toggle} />)}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-mono text-[12px] uppercase tracking-widest text-ink-soft">Sources on file</h2>
              <Card className="divide-y-[1.5px] divide-ink shadow-hard">
                {sources.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{s.docs} items filed</div>
                    </div>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ledger"><Icon.dot size={9} /> Synced</span>
                  </div>
                ))}
                {sources.length === 0 && <div className="px-5 py-8 text-center font-mono text-[12px] uppercase tracking-widest text-ink-faint">No sources</div>}
              </Card>

              <h2 className="mb-3 mt-6 font-mono text-[12px] uppercase tracking-widest text-ink-soft">Topic index</h2>
              <Card className="space-y-1 p-3 shadow-hard">
                {TOPICS.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px]">
                    <span className="h-2.5 w-2.5 rounded-full border border-ink" style={{ background: t.color }} /> {t.label}
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
