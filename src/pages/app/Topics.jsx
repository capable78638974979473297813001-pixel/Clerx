import { useOutletContext } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { Card, Icon } from '../../components/ui'
import { Avatar } from '../../components/kit'
import { TOPICS } from '../../lib/store'

export default function Topics() {
  const { state } = useOutletContext()
  const employees = state.employees

  return (
    <div>
      <PageHead no="03" kicker="The index" title="Topics" sub="Every answer is filed under one topic. Clearance is granted per topic." />

      <div className="grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => {
          const cleared = employees.filter((e) => e.topics.includes(t.id))
          const pct = Math.round((cleared.length / Math.max(1, employees.length)) * 100)
          return (
            <Card key={t.id} className="p-5 shadow-hard">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border-[1.5px] border-ink" style={{ background: `${t.color}1f` }}>
                    <span className="h-3.5 w-3.5 rounded-full border border-ink" style={{ background: t.color }} />
                  </span>
                  <div>
                    <div className="font-display text-lg font-semibold leading-tight">{t.label}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">{cleared.length} of {employees.length} cleared · {pct}%</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {cleared.slice(0, 8).map((e) => <Avatar key={e.id} name={e.name} size={30} />)}
                {cleared.length === 0 && <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">No one cleared yet</span>}
                {cleared.length > 8 && <span className="grid h-[30px] w-[30px] place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2 font-mono text-[11px]">+{cleared.length - 8}</span>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
