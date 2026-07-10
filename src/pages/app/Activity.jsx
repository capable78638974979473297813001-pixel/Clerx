import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { Card, Stamp, Icon } from '../../components/ui'
import { Avatar, EmptyState } from '../../components/kit'
import { topicById, timeAgo, dateLabel } from '../../lib/store'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'answered', label: 'Answered' },
  { id: 'blocked', label: 'Restricted' },
]

export default function Activity() {
  const { state } = useOutletContext()
  const [filter, setFilter] = useState('all')
  const activity = state.activity || []

  const rows = useMemo(() => activity.filter((a) =>
    filter === 'all' ? true : filter === 'blocked' ? a.blocked : !a.blocked
  ), [activity, filter])

  // group by day
  const groups = useMemo(() => {
    const m = new Map()
    for (const a of rows) {
      const key = new Date(a.ts).toDateString()
      if (!m.has(key)) m.set(key, [])
      m.get(key).push(a)
    }
    return [...m.entries()]
  }, [rows])

  const blocked = activity.filter((a) => a.blocked).length

  return (
    <div>
      <PageHead no="04" kicker="The ledger" title="Activity log"
        sub={`${activity.length} questions on record · ${blocked} restricted`} />

      <div className="mb-4 flex rounded-lg border-[1.5px] border-ink bg-paper p-0.5">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`flex-1 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition sm:flex-none ${filter === f.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Icon.stamp} title="Nothing on record" body="Questions employees ask will appear here — answered or restricted." />
      ) : (
        <div className="space-y-6">
          {groups.map(([day, items]) => (
            <div key={day}>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{dayLabel(day)}</span>
                <span className="h-px flex-1 bg-ink/12" />
              </div>
              <Card className="divide-y-[1.5px] divide-ink/12 shadow-hard">
                {items.map((a) => {
                  const t = topicById(a.topic)
                  return (
                    <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                      <Avatar name={a.empName} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] leading-snug">
                          <b>{a.empName}</b> <span className="text-ink-soft">asked</span> “{a.question}”
                        </div>
                        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                          <span>{timeAgo(a.ts)}</span>
                          {t && <span className="flex items-center gap-1" style={{ color: t.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />{t.label}</span>}
                        </div>
                      </div>
                      {a.blocked
                        ? <Stamp tone="stamp" rotate={-4} className="!text-[0.56rem]"><Icon.lock size={10} /> Restricted</Stamp>
                        : <Stamp tone="ledger" rotate={-2} className="!text-[0.56rem]"><Icon.check size={10} /> Answered</Stamp>}
                    </div>
                  )
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function dayLabel(day) {
  const d = new Date(day), today = new Date().toDateString(), yest = new Date(Date.now() - 864e5).toDateString()
  if (day === today) return 'Today'
  if (day === yest) return 'Yesterday'
  return dateLabel(d.getTime())
}
