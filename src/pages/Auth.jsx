import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo, Button, Card, Field, Input, Icon, StampMark } from '../components/ui'
import { useToast } from '../components/kit'
import { useAuth } from '../lib/auth'

export default function Auth({ mode = 'login' }) {
  const nav = useNavigate()
  const toast = useToast()
  const { login, signup, demo } = useAuth()
  const isSignup = mode === 'signup'

  const [form, setForm] = useState({ name: '', companyName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e?.preventDefault()
    setError(''); setBusy(true)
    try {
      if (isSignup) {
        await signup(form)
        toast('Account created')
        nav('/setup')
      } else {
        await login(form.email, form.password)
        toast('Welcome back')
        nav('/app')
      }
    } catch (err) {
      setError(err.message)
    } finally { setBusy(false) }
  }

  const tryDemo = async () => {
    setError(''); setBusy(true)
    try { await demo(); nav('/app') }
    catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <div className="grain grid min-h-screen place-items-center px-5">
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-50" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <Card tab={isSignup ? 'New file' : 'Sign in'} className="p-8 shadow-hard-lg rise">
          <div className="mx-auto w-fit"><StampMark dim={52} /></div>
          <h1 className="mt-4 text-center font-display text-3xl font-semibold">
            {isSignup ? 'Open your company file' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-center text-[15px] text-ink-soft">
            {isSignup ? 'Create your leader account to get started.' : 'Sign in to your workspace.'}
          </p>

          <form onSubmit={submit} className="mt-7 grid gap-4">
            {isSignup && (
              <>
                <Field label="Your name"><Input value={form.name} onChange={set('name')} placeholder="Jordan Lee" autoFocus /></Field>
                <Field label="Company name"><Input value={form.companyName} onChange={set('companyName')} placeholder="Meridian Build Co." /></Field>
              </>
            )}
            <Field label="Work email"><Input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" autoFocus={!isSignup} /></Field>
            <Field label="Password" hint={isSignup ? 'At least 8 characters.' : undefined}>
              <Input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border-[1.5px] border-stamp bg-stamp/8 px-3.5 py-2.5 text-[13px] text-stamp-deep">
                <Icon.x size={15} /> {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? 'Working…' : isSignup ? 'Create account' : 'Sign in'} <Icon.arrow size={18} />
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-ink/15" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">or</span>
            <span className="h-px flex-1 bg-ink/15" />
          </div>
          <Button variant="outline" className="w-full" onClick={tryDemo} disabled={busy}>
            Explore a live demo
          </Button>
        </Card>

        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          {isSignup ? (
            <>Already have a file? <Link to="/login" className="ink-link text-stamp hover:text-stamp-deep">Sign in →</Link></>
          ) : (
            <>No account yet? <Link to="/signup" className="ink-link text-stamp hover:text-stamp-deep">Open a file →</Link></>
          )}
        </p>
        <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          <Link to="/join" className="ink-link hover:text-ink">Employee? Enter your code →</Link>
        </p>
      </div>
    </div>
  )
}
