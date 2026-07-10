import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { Button, Stamp, Card, Field, Input, Icon } from '../../components/ui'
import { Avatar, Drawer, Modal, Menu, MenuItem, EmptyState, useToast } from '../../components/kit'
import { TOPICS, topicById, timeAgo } from '../../lib/store'
import { api } from '../../lib/api'

const TEAMS = ['All', 'Field', 'Sales', 'Admin']

export default function Staff() {
  const { state, reload } = useOutletContext()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [team, setTeam] = useState('All')
  const [openId, setOpenId] = useState(null)
  const [adding, setAdding] = useState(false)

  const employees = state.employees
  const filtered = useMemo(() => employees.filter((e) =>
    (team === 'All' || e.team === team) &&
    (e.name.toLowerCase().includes(q.toLowerCase()) || (e.role || '').toLowerCase().includes(q.toLowerCase()))
  ), [employees, q, team])

  const current = employees.find((e) => e.id === openId)

  const toggleTopic = async (emp, tid) => {
    const topics = emp.topics.includes(tid) ? emp.topics.filter((t) => t !== tid) : [...emp.topics, tid]
    try { await api.updateEmployee(emp.id, { topics }); await reload() } catch (e) { toast(e.message, { tone: 'stamp' }) }
  }
  const remove = async (id) => {
    try { await api.removeEmployee(id); setOpenId(null); await reload(); toast('Removed from staff', { tone: 'stamp', icon: <Icon.x size={15} /> }) }
    catch (e) { toast(e.message, { tone: 'stamp' }) }
  }
  const addEmployee = async (data) => {
    try { await api.addEmployee(data); setAdding(false); await reload(); toast('Invite created') }
    catch (e) { toast(e.message, { tone: 'stamp' }) }
  }

  return (
    <div>
      <PageHead no="01" kicker="The register" title="Staff" sub={`${employees.length} on file · ${employees.filter((e) => e.status === 'invited').length} pending invite`}
        action={<Button size="sm" onClick={() => setAdding(true)}><Icon.plus size={15} /> Add staff</Button>} />

      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border-[1.5px] border-ink bg-paper-2/60 px-3 sm:max-w-xs">
          <Icon.search size={15} className="text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or role…" className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-faint" />
        </div>
        <div className="flex rounded-lg border-[1.5px] border-ink bg-paper p-0.5">
          {TEAMS.map((t) => (
            <button key={t} onClick={() => setTeam(t)} className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${team === t ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Icon.people} title="No matches" body="Try a different search or filter." />
      ) : (
        <Card className="overflow-hidden shadow-hard">
          <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto] gap-3 border-b-[1.5px] border-ink bg-paper-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft sm:grid">
            <span>Name</span><span>Role</span><span>Clearances</span><span>Last active</span><span></span>
          </div>
          <div className="divide-y-[1.5px] divide-ink/12">
            {filtered.map((e) => (
              <button key={e.id} onClick={() => setOpenId(e.id)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-ink/[0.03] sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto]">
                <span className="flex items-center gap-3 min-w-0">
                  <Avatar name={e.name} size={38} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold">{e.name}</span>
                    <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-ink-faint">{e.team} · {e.code}</span>
                  </span>
                </span>
                <span className="hidden text-[13px] text-ink-soft sm:block">{e.role}</span>
                <span className="hidden sm:block">
                  {e.status === 'invited'
                    ? <Stamp tone="ochre" rotate={-2} className="!text-[0.56rem]">Invited</Stamp>
                    : <span className="font-mono text-[13px]">{e.topics.length}<span className="text-ink-faint">/{TOPICS.length}</span></span>}
                </span>
                <span className="hidden font-mono text-[11px] text-ink-soft sm:block">{timeAgo(e.lastActive)}</span>
                <Icon.arrow size={16} className="justify-self-end text-ink-faint" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* detail drawer */}
      <Drawer open={!!current} onClose={() => setOpenId(null)}>
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between border-b-[1.5px] border-ink p-5">
              <div className="flex items-center gap-3">
                <Avatar name={current.name} size={48} />
                <div>
                  <div className="font-display text-xl font-semibold leading-tight">{current.name}</div>
                  <div className="text-[13px] text-ink-soft">{current.role} · {current.team}</div>
                </div>
              </div>
              <button onClick={() => setOpenId(null)} className="rounded-md border-[1.5px] border-transparent p-1 text-ink-soft hover:border-ink hover:text-ink"><Icon.x size={18} /></button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-3 gap-2">
                <Mini label="Questions" value={current.questions} />
                <Mini label="Joined" value={timeAgo(current.joinedAt)} />
                <Mini label="Active" value={timeAgo(current.lastActive)} />
              </div>

              <div>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Join code</div>
                <button onClick={() => { navigator.clipboard?.writeText(current.code); toast('Code copied') }}
                  className="flex w-full items-center justify-between rounded-lg border-[1.5px] border-ink bg-paper-2 px-3.5 py-2.5 font-mono text-lg font-bold tracking-widest hover:bg-paper">
                  {current.code} <Icon.copy size={16} className="text-ink-soft" />
                </button>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Topic clearances</span>
                  <span className="font-mono text-[11px] text-ink-faint">{current.topics.length}/{TOPICS.length}</span>
                </div>
                <div className="space-y-1.5">
                  {TOPICS.map((t) => {
                    const on = current.topics.includes(t.id)
                    return (
                      <button key={t.id} onClick={() => toggleTopic(current, t.id)}
                        className={`flex w-full items-center justify-between rounded-lg border-[1.5px] px-3 py-2.5 text-left transition ${on ? 'border-ink bg-paper-2' : 'border-ink/25 hover:border-ink'}`}>
                        <span className="flex items-center gap-2.5 text-[13px] font-medium">
                          <span className="h-2.5 w-2.5 rounded-full border border-ink" style={{ background: on ? t.color : 'transparent' }} /> {t.label}
                        </span>
                        {on ? <Stamp tone="ledger" rotate={-3} className="!text-[0.55rem]"><Icon.check size={10} /> Cleared</Stamp>
                            : <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Locked</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t-[1.5px] border-ink p-4">
              <Button variant="ghost" size="sm" onClick={() => remove(current.id)} className="!text-stamp"><Icon.x size={15} /> Remove</Button>
              <Button size="sm" onClick={() => setOpenId(null)}>Done</Button>
            </div>
          </div>
        )}
      </Drawer>

      <AddStaffModal open={adding} onClose={() => setAdding(false)} onAdd={addEmployee} />
    </div>
  )
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg border-[1.5px] border-ink bg-paper-2 px-2.5 py-2 text-center">
      <div className="font-display text-lg font-semibold leading-none">{value}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-soft">{label}</div>
    </div>
  )
}

function AddStaffModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [team, setTeam] = useState('Field')
  const submit = () => { if (!name.trim()) return; onAdd({ name: name.trim(), role: role.trim() || 'Staff', team, email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@company.com' }); setName(''); setRole('') }
  return (
    <Modal open={open} onClose={onClose} title="Add to staff"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={submit} disabled={!name.trim()}>Create invite</Button></>}>
      <div className="grid gap-3">
        <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Lee" autoFocus /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role"><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Estimator" /></Field>
          <Field label="Team">
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="h-12 w-full rounded-lg border-[1.5px] border-ink bg-paper-2/60 px-3 text-[15px] outline-none focus:bg-paper">
              {['Field', 'Sales', 'Admin'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <p className="text-[12px] text-ink-soft">A join code is generated automatically. Stamp their clearances after they're added.</p>
      </div>
    </Modal>
  )
}
