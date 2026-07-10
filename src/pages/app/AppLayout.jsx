import { useEffect, useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import AppShell from '../../components/AppShell'
import { Button, Card, Icon, StampMark } from '../../components/ui'
import { useToast } from '../../components/kit'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'

export default function AppLayout() {
  const nav = useNavigate()
  const loc = useLocation()
  const toast = useToast()
  const { user, loading: authLoading, logout, refresh } = useAuth()
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const reload = useCallback(async () => {
    try { setState(await api.workspace()) }
    catch { setState(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { nav('/login', { replace: true }); return }
    reload()
  }, [authLoading, user, reload, nav])

  if (authLoading || loading) return <FullScreenLoader />
  if (!state) return <FullScreenLoader />

  const isSetUp = state.company?.verified || state.employees.length > 0

  if (!isSetUp) {
    return (
      <div className="grain grid min-h-screen place-items-center px-5">
        <div className="pointer-events-none absolute inset-0 dotgrid opacity-50" />
        <Card className="relative z-10 w-full max-w-md p-8 text-center shadow-hard-lg">
          <div className="mx-auto w-fit"><StampMark dim={52} /></div>
          <h2 className="mt-4 font-display text-2xl font-semibold">Let's set up {state.company?.name}</h2>
          <p className="mt-2 text-[15px] text-ink-soft">Load a fully-populated sample company to explore, or set yours up from scratch.</p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button disabled={seeding} onClick={async () => { setSeeding(true); try { setState(await api.seed()); toast('Sample company loaded') } catch (e) { toast(e.message, { tone: 'stamp' }); setSeeding(false) } }}>
              {seeding ? 'Loading…' : <>Load sample company <Icon.arrow size={16} /></>}
            </Button>
            <Button variant="outline" onClick={() => nav('/setup')}>Set up from scratch</Button>
          </div>
          <button onClick={async () => { await logout(); nav('/') }} className="mt-5 font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink">Sign out</button>
        </Card>
      </div>
    )
  }

  return (
    <AppShell company={state.company} user={user} onSignOut={async () => { await logout(); nav('/') }}>
      <div key={loc.pathname} className="rise">
        <Outlet context={{ state, reload }} />
      </div>
    </AppShell>
  )
}

function FullScreenLoader() {
  return (
    <div className="grain grid min-h-screen place-items-center">
      <div className="relative z-10 flex flex-col items-center gap-3">
        <StampMark dim={48} />
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    </div>
  )
}
