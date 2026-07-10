import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { Button, Stamp, Card, Field, Input, Icon } from '../../components/ui'
import { useToast, Modal, Bar } from '../../components/kit'
import { load, save, reset, dateLabel } from '../../lib/store'

const PLANS = [
  { name: 'Ledger', price: 99, seats: 15 },
  { name: 'Registry', price: 299, seats: 50 },
  { name: 'Bureau', price: 699, seats: 150 },
]

export default function Settings() {
  const { state } = useOutletContext()
  const nav = useNavigate()
  const toast = useToast()
  const c = state.company
  const [name, setName] = useState(c.name)
  const [domain, setDomain] = useState(c.domain || '')
  const [confirmReset, setConfirmReset] = useState(false)

  const plan = PLANS.find((p) => p.name === c.plan) || PLANS[1]
  const seatsUsed = state.employees.length

  const saveProfile = () => { const s = load(); s.company.name = name.trim() || s.company.name; s.company.domain = domain.trim(); save(s); toast('Company profile saved') }
  const switchPlan = (p) => { const s = load(); s.company.plan = p.name; save(s); toast(`Switched to ${p.name}`) }

  return (
    <div>
      <PageHead no="05" kicker="The office" title="Settings" sub="Company profile, plan, and account." />

      {/* profile */}
      <Card tab="Company" className="mb-6 p-6 shadow-hard">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Domain"><Input value={domain} onChange={(e) => setDomain(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border-[1.5px] border-ink bg-paper-2 px-4 py-3">
          <Stamp tone="ledger" rotate={-4}><Icon.check size={13} /> Verified</Stamp>
          <span className="text-[13px] text-ink-soft">Legitimacy confirmed on {dateLabel(c.verifiedAt || Date.now())} · {c.industry}</span>
        </div>
        <div className="mt-4 flex justify-end"><Button size="sm" onClick={saveProfile}>Save changes</Button></div>
      </Card>

      {/* plan / billing */}
      <Card tab="Plan & billing" className="mb-6 p-6 shadow-hard">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-2xl font-semibold">{plan.name} · ${plan.price}<span className="text-[15px] text-ink-soft">/mo</span></div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Renews {dateLabel(Date.now() + 18 * 864e5)}</div>
          </div>
          <Stamp tone="blue" rotate={-3}>Current plan</Stamp>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="font-medium">Seats used</span>
            <span className="font-mono text-ink-soft">{seatsUsed} / {plan.seats}</span>
          </div>
          <Bar value={(seatsUsed / plan.seats) * 100} color={seatsUsed / plan.seats > 0.8 ? 'var(--color-stamp)' : 'var(--color-ledger)'} />
        </div>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
          {PLANS.map((p) => {
            const cur = p.name === c.plan
            return (
              <div key={p.name} className={`rounded-lg border-[1.5px] p-4 ${cur ? 'border-ink bg-ink text-paper' : 'border-ink bg-paper'}`}>
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">{p.name}</div>
                <div className="mt-1 font-display text-2xl font-semibold">${p.price}<span className="text-[13px] opacity-60">/mo</span></div>
                <div className={`text-[12px] ${cur ? 'text-paper/60' : 'text-ink-soft'}`}>up to {p.seats} seats</div>
                <Button size="sm" variant={cur ? 'outline' : 'ink'} className="mt-3 w-full !h-8" disabled={cur} onClick={() => switchPlan(p)}>
                  {cur ? 'Current' : 'Switch'}
                </Button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* danger zone */}
      <Card className="border-stamp/50 p-6 shadow-hard-red">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-stamp-deep">Danger zone</h3>
            <p className="text-[13px] text-ink-soft">Wipe this workspace and all demo data. This can't be undone.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setConfirmReset(true)}><Icon.x size={15} /> Reset workspace</Button>
        </div>
      </Card>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset workspace?"
        footer={<><Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => { reset(); nav('/') }}>Yes, wipe everything</Button></>}>
        <p className="text-[14px] text-ink-soft">All employees, sources, clearances, and the activity log will be permanently deleted. You'll return to the homepage.</p>
      </Modal>
    </div>
  )
}
