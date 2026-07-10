import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Field, Input, Icon } from '../components/ui'
import { load } from '../lib/store'

export default function EmployeeJoin() {
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const enter = () => {
    setError('')
    const state = load()
    const emp = (state.employees || []).find((e) => e.code.toUpperCase() === code.trim().toUpperCase())
    if (!emp) {
      setError('That code isn\'t recognized. Check with your team lead.')
      return
    }
    if (name.trim() && emp.name.toLowerCase() !== name.trim().toLowerCase()) {
      // soft check — still allow, but the demo uses the code's owner
    }
    sessionStorage.setItem('clerx.session', JSON.stringify({ empId: emp.id }))
    nav('/chat')
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <div className="card p-8 animate-fade-up glow">
          <div className="grad-brand mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white">
            <Icon.key size={26} />
          </div>
          <h1 className="mt-5 text-center text-2xl font-semibold text-white">Join your workspace</h1>
          <p className="mt-2 text-center text-slate-400">Enter the code your team lead gave you.</p>

          <div className="mt-7 grid gap-4">
            <Field label="Join code">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. K7P2QM"
                className="text-center font-mono text-lg tracking-[0.3em]"
                maxLength={8}
              />
            </Field>
            <Field label="Your name">
              <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enter()} placeholder="Jake Rivera" />
            </Field>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
              <Icon.x size={15} /> {error}
            </div>
          )}

          <Button className="mt-6 w-full" size="lg" onClick={enter} disabled={!code.trim()}>
            Start asking <Icon.arrow size={18} />
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Are you a team lead?{' '}
          <button onClick={() => nav('/setup')} className="text-brand-300 hover:text-brand-200">Set up your company →</button>
        </p>
      </div>
    </div>
  )
}
