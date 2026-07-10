import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Logo, Button, Card, Field, Input, Icon, StampMark } from '../components/ui'
import { api } from '../lib/api'

export default function EmployeeJoin() {
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const enter = async () => {
    setError(''); setBusy(true)
    try {
      const { employee, company, topics } = await api.join(code.trim())
      sessionStorage.setItem('clerx.session', JSON.stringify({ employee, company, topics }))
      nav('/chat')
    } catch (err) {
      setError(err.message); setBusy(false)
    }
  }

  return (
    <div className="grain grid min-h-screen place-items-center px-5">
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-50" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <Card tab="Employee entry" className="p-8 shadow-hard-lg rise">
          <div className="mx-auto w-fit"><StampMark dim={56} /></div>
          <h1 className="mt-4 text-center font-display text-3xl font-semibold">Sign the register</h1>
          <p className="mt-2 text-center text-[15px] text-ink-soft">Enter the code your team lead gave you.</p>

          <div className="mt-7 grid gap-4">
            <Field label="Join code">
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && enter()} placeholder="K7P2QM" maxLength={8}
                className="text-center font-mono text-lg font-bold tracking-[0.4em]" />
            </Field>
            <Field label="Your name">
              <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enter()} placeholder="Jake Rivera" />
            </Field>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border-[1.5px] border-stamp bg-stamp/8 px-3.5 py-2.5 text-[13px] text-stamp-deep">
              <Icon.x size={15} /> {error}
            </div>
          )}

          <Button className="mt-6 w-full" size="lg" onClick={enter} disabled={!code.trim() || busy}>
            {busy ? 'Checking…' : <>Start asking <Icon.arrow size={18} /></>}
          </Button>
        </Card>

        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          Team lead? <Link to="/login" className="ink-link text-stamp hover:text-stamp-deep">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
