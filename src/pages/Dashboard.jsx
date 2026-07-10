import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Badge, Icon } from '../components/ui'
import { load, save, reset, TOPICS, topicById } from '../lib/store'

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
      <div className="grid min-h-screen place-items-center px-6">
        <div className="card max-w-md p-8 text-center">
          <h2 className="text-xl font-semibold text-white">No company set up yet</h2>
          <p className="mt-2 text-slate-400">Run the setup flow to create your Clerx workspace.</p>
          <Button className="mt-6" onClick={() => nav('/setup')}>Start setup <Icon.arrow size={16} /></Button>
        </div>
      </div>
    )
  }

  const employees = state.employees || []
  const sources = state.sources || []
  const totalDocs = sources.reduce((a, s) => a + s.docs, 0)
  const stats = [
    { label: 'Employees', value: employees.length, icon: Icon.users, color: '#6d5efc' },
    { label: 'Knowledge sources', value: sources.length, icon: Icon.file, color: '#34d9a8' },
    { label: 'Items indexed', value: totalDocs, icon: Icon.spark, color: '#38bdf8' },
    { label: 'Topics', value: TOPICS.length, icon: Icon.tag, color: '#f59e0b' },
  ]

  const toggleTopic = (empId, topicId) => {
    const list = employees.map((e) => e.id === empId
      ? { ...e, topics: e.topics.includes(topicId) ? e.topics.filter((t) => t !== topicId) : [...e.topics, topicId] }
      : e)
    setState(save({ ...state, employees: list }))
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/8 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden h-5 w-px bg-white/10 sm:block" />
            <span className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
              <Icon.building size={16} className="text-slate-500" /> {state.company.name}
              <Badge color="#34d9a8" className="ml-1"><Icon.shield size={11} /> Verified</Badge>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => nav('/join')}>Employee view</Button>
            <Button variant="subtle" size="sm" onClick={() => { reset(); nav('/') }}><Icon.logout size={15} /> Reset demo</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Workspace</h1>
            <p className="mt-1 text-slate-400">Manage who can ask what. Changes apply instantly.</p>
          </div>
          <Button size="sm" onClick={() => nav('/setup')}><Icon.plus size={15} /> Add more</Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${s.color}1a`, color: s.color, border: `1px solid ${s.color}33` }}>
                <s.icon size={18} />
              </span>
              <div className="mt-3 text-3xl font-semibold text-white">{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Team & permissions</h2>
            <div className="space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600/25 text-sm font-semibold text-brand-200">
                        {emp.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                      </span>
                      <div>
                        <div className="font-medium text-white">{emp.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Icon.key size={12} /> <span className="font-mono tracking-wider">{emp.code}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-white/5 text-slate-300">{emp.topics.length} / {TOPICS.length} topics</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
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
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Knowledge sources</h2>
            <div className="card divide-y divide-white/8">
              {sources.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.docs} items indexed</div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-mint-400"><Icon.dot size={9} /> Synced</span>
                </div>
              ))}
              {sources.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-500">No sources connected.</div>}
            </div>

            <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">Topics</h2>
            <div className="card space-y-1 p-3">
              {TOPICS.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                  <span className="text-slate-200">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
