import { useOutletContext, useNavigate, Link } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { Button, Stamp, Card, Icon } from '../../components/ui'
import { Avatar, Bar } from '../../components/kit'
import { TOPICS, topicById, timeAgo } from '../../lib/store'

export default function Overview() {
  const { state } = useOutletContext()
  const nav = useNavigate()
  const { employees, sources, activity, company } = state

  const active = employees.filter((e) => e.status === 'active')
  const invited = employees.filter((e) => e.status === 'invited')
  const totalDocs = sources.reduce((a, s) => a + s.docs, 0)
  const totalQ = employees.reduce((a, e) => a + (e.questions || 0), 0)
  const blocked = (activity || []).filter((a) => a.blocked).length
  const answered = (activity || []).length - blocked

  // topic demand from activity
  const demand = TOPICS.map((t) => ({ ...t, n: (activity || []).filter((a) => a.topic === t.id).length }))
    .sort((a, b) => b.n - a.n)
  const maxN = Math.max(1, ...demand.map((d) => d.n))

  const stats = [
    { label: 'On staff', value: employees.length, sub: `${active.length} active · ${invited.length} invited`, icon: Icon.people },
    { label: 'Questions answered', value: totalQ, sub: 'all time', icon: Icon.ledger },
    { label: 'Items filed', value: totalDocs.toLocaleString(), sub: `${sources.length} sources`, icon: Icon.folder },
    { label: 'Restricted hits', value: blocked, sub: 'this week', icon: Icon.lock, alert: blocked > 0 },
  ]

  return (
    <div>
      <PageHead no="00" kicker="The clerk's desk"
        title={`Welcome back`}
        sub={`Here's what's moving through ${company.name}.`}
        action={<Button size="sm" onClick={() => nav('/app/staff')}><Icon.plus size={15} /> Add staff</Button>} />

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 shadow-hard">
            <div className="flex items-center justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-lg border-[1.5px] border-ink ${s.alert ? 'bg-stamp text-paper' : 'bg-paper-2'}`}><s.icon size={16} /></span>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold leading-none">{s.value}</div>
            <div className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">{s.label}</div>
            <div className="text-[11px] text-ink-faint">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* activity feed */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-[12px] uppercase tracking-widest text-ink-soft">Recent activity</h2>
            <Link to="/app/activity" className="ink-link font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink">View log →</Link>
          </div>
          <Card className="divide-y-[1.5px] divide-ink/12 shadow-hard">
            {(activity || []).slice(0, 7).map((a) => {
              const t = topicById(a.topic)
              return (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={a.empName} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px]"><b>{a.empName.split(' ')[0]}</b> asked “{a.question}”</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{timeAgo(a.ts)}</div>
                  </div>
                  {a.blocked
                    ? <Stamp tone="stamp" rotate={-3} className="!text-[0.58rem]"><Icon.lock size={10} /> Restricted</Stamp>
                    : <span className="hidden items-center gap-1.5 rounded-md border-[1.5px] border-ink bg-paper-2 px-2 py-1 font-mono text-[9px] uppercase tracking-wider sm:inline-flex" style={{ color: t?.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: t?.color }} />{t?.label.split(' ')[0]}</span>}
                </div>
              )
            })}
          </Card>
        </div>

        {/* topic demand + sources */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 font-mono text-[12px] uppercase tracking-widest text-ink-soft">Topic demand</h2>
            <Card className="space-y-3 p-4 shadow-hard">
              {demand.slice(0, 5).map((d) => (
                <div key={d.id}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.label.split(' ')[0]}</span>
                    <span className="font-mono text-ink-soft">{d.n}</span>
                  </div>
                  <Bar value={(d.n / maxN) * 100} color={d.color} />
                </div>
              ))}
            </Card>
          </div>

          <div>
            <h2 className="mb-3 font-mono text-[12px] uppercase tracking-widest text-ink-soft">Sources</h2>
            <Card className="divide-y-[1.5px] divide-ink/12 shadow-hard">
              {sources.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px] font-medium">{s.name}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ledger"><Icon.dot size={8} /> {timeAgo(s.lastSync)}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
