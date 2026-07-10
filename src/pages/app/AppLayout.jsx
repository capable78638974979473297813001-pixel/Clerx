import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AppShell from '../../components/AppShell'
import { Logo, Button, Card, Icon, StampMark } from '../../components/ui'
import { load, seedDemo } from '../../lib/store'

export default function AppLayout() {
  const nav = useNavigate()
  const [state, setState] = useState(() => load())

  useEffect(() => {
    const on = () => setState(load())
    window.addEventListener('clerx-store', on)
    return () => window.removeEventListener('clerx-store', on)
  }, [])

  if (!state.company) {
    return (
      <div className="grain grid min-h-screen place-items-center px-5">
        <div className="pointer-events-none absolute inset-0 dotgrid opacity-50" />
        <Card className="relative z-10 w-full max-w-md p-8 text-center shadow-hard-lg">
          <div className="mx-auto w-fit"><StampMark dim={52} /></div>
          <h2 className="mt-4 font-display text-2xl font-semibold">No company file open</h2>
          <p className="mt-2 text-[15px] text-ink-soft">Load a fully-populated sample company to explore the product, or set yours up from scratch.</p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button onClick={() => { seedDemo(); }}>Load sample company <Icon.arrow size={16} /></Button>
            <Button variant="outline" onClick={() => nav('/setup')}>Set up from scratch</Button>
          </div>
          <button onClick={() => nav('/')} className="mt-5 font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink">← Back home</button>
        </Card>
      </div>
    )
  }

  return (
    <AppShell company={state.company}>
      <Outlet context={{ state }} />
    </AppShell>
  )
}
