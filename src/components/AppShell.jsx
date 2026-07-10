import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo, Button, Stamp, Icon } from './ui'
import { Menu, MenuItem, MenuLabel, MenuSep, Avatar } from './kit'
import { reset } from '../lib/store'

const NAV = [
  { to: '/app', label: 'Overview', icon: Icon.ledger, end: true },
  { to: '/app/staff', label: 'Staff', icon: Icon.people },
  { to: '/app/knowledge', label: 'Knowledge', icon: Icon.folder },
  { to: '/app/topics', label: 'Topics', icon: Icon.cabinet },
  { to: '/app/activity', label: 'Activity', icon: Icon.stamp },
  { to: '/app/settings', label: 'Settings', icon: Icon.key },
]

export default function AppShell({ company, children }) {
  const nav = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarInner = (
    <>
      <div className="px-4 py-4"><Logo /></div>

      <div className="px-3">
        <div className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-ink bg-paper-2 px-3 py-2.5">
          <Icon.building size={16} className="shrink-0 text-ink-soft" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold leading-tight">{company?.name || 'Your company'}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{company?.plan || '—'} plan</div>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 px-3">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center gap-2.5 rounded-lg border-[1.5px] px-3 py-2 text-[14px] font-medium transition ${
              isActive ? 'border-ink bg-ink text-paper' : 'border-transparent text-ink-soft hover:border-ink/20 hover:text-ink'
            }`}>
            <n.icon size={17} /> {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t-[1.5px] border-ink p-3">
        <a href="/join" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft hover:text-ink">
          <Icon.arrowUR size={16} /> Employee view
        </a>
      </div>
    </>
  )

  return (
    <div className="grain min-h-screen">
      <div className="relative z-10 flex min-h-screen">
        {/* desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r-[1.5px] border-ink bg-paper lg:flex">
          {SidebarInner}
        </aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-60 flex-col border-r-[1.5px] border-ink bg-paper">{SidebarInner}</aside>
          </div>
        )}

        {/* main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b-[1.5px] border-ink bg-paper/90 px-4 py-2.5 backdrop-blur-sm">
            <button className="rounded-md border-[1.5px] border-ink p-1.5 lg:hidden" onClick={() => setMobileOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>

            <div className="hidden items-center gap-2 rounded-lg border-[1.5px] border-ink bg-paper-2/60 px-3 py-2 text-ink-soft sm:flex sm:w-72">
              <Icon.search size={15} />
              <input placeholder="Search records…" className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-faint" />
              <kbd className="rounded border border-ink/25 px-1.5 font-mono text-[10px] text-ink-faint">⌘K</kbd>
            </div>

            <div className="flex items-center gap-2">
              <Stamp tone="ledger" rotate={-3} className="!hidden !text-[0.6rem] sm:!inline-flex"><Icon.check size={11} /> Verified</Stamp>
              <button className="relative rounded-md border-[1.5px] border-ink p-2 hover:bg-ink/5">
                <Icon.stamp size={16} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-ink bg-stamp" />
              </button>
              <Menu trigger={<span className="block rounded-lg hover:opacity-80"><Avatar name="You Leader" size={34} /></span>}>
                <MenuLabel>Signed in as</MenuLabel>
                <div className="px-2.5 pb-1.5 text-[13px] font-semibold">You (Team Lead)</div>
                <MenuSep />
                <MenuItem icon={Icon.building} onClick={() => nav('/app/settings')}>Company settings</MenuItem>
                <MenuItem icon={Icon.arrowUR} onClick={() => nav('/join')}>Employee view</MenuItem>
                <MenuSep />
                <MenuItem icon={Icon.logout} tone="stamp" onClick={() => { reset(); nav('/') }}>Reset demo</MenuItem>
              </Menu>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

/* Page header used across app pages */
export function PageHead({ no, kicker, title, sub, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="eyebrow flex items-center gap-2">
          {no && <><span className="text-stamp">No. {no}</span><span className="h-px w-5 bg-ink/30" /></>}
          {kicker}
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-1.5 text-[15px] text-ink-soft">{sub}</p>}
      </div>
      {action}
    </div>
  )
}
