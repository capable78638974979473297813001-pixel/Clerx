import { Link, useNavigate } from 'react-router-dom'
import { Logo, Button, Badge, Icon } from '../components/ui'

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="glass flex w-full items-center justify-between rounded-2xl border border-white/8 px-4 py-2.5">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button as={Link} to="/join" variant="ghost" size="sm">Employee login</Button>
            <Button as={Link} to="/setup" size="sm">Start free <Icon.arrow size={16} /></Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-mint-500/15 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mx-auto bg-white/5 text-brand-200 border border-white/10">
            <Icon.spark size={14} /> AI that knows your company — not the whole internet
          </Badge>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl animate-fade-up">
            The AI clerk your <span className="grad-text">whole team</span> can ask anything.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 animate-fade-up" style={{ animationDelay: '80ms' }}>
            Clerx reads everything your company runs on — Drive, Slack, Notion, your docs —
            and answers every employee's questions instantly. You decide exactly who can see what.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up" style={{ animationDelay: '160ms' }}>
            <Button as={Link} to="/setup" size="lg">Set up your company <Icon.arrow size={18} /></Button>
            <Button as={Link} to="/join" variant="outline" size="lg">I have a join code</Button>
          </div>
          <p className="mt-4 text-xs text-slate-500">Free to set up · No card required · Built for teams of 5–200</p>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl animate-fade-up" style={{ animationDelay: '240ms' }}>
      <div className="card glass overflow-hidden glow">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-mint-400/70" />
          <span className="ml-3 text-xs text-slate-500">clerx · Jake from Field Team</span>
        </div>
        <div className="grid gap-4 p-6 sm:p-8">
          <div className="flex justify-end">
            <div className="max-w-sm rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm text-white">
              How much can I spend on materials without approval?
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grad-brand mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white">
              <Icon.spark size={16} />
            </span>
            <div className="max-w-lg rounded-2xl rounded-tl-md border border-white/10 bg-ink-800/70 px-4 py-3 text-sm text-slate-200">
              You can spend up to <span className="font-semibold text-mint-400">$500 per project</span> without sign-off.
              Above that needs a PO from your site lead. Preferred suppliers are BuildCo and Meridian.
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                <Icon.shield size={13} className="text-mint-400" /> Answered from <b className="text-slate-400">Materials & Procurement</b> · cleared for your role
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const logos = ['Google Drive', 'Slack', 'Notion', 'Dropbox', 'Confluence', 'SharePoint']
function TrustBar() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-center text-xs uppercase tracking-widest text-slate-500">Reads from the tools you already use</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-70">
        {logos.map((l) => (
          <span key={l} className="text-sm font-medium text-slate-400">{l}</span>
        ))}
      </div>
    </div>
  )
}

const steps = [
  { icon: Icon.search, title: 'Verify your company', body: 'Enter your company name. Clerx runs a quick web check to confirm you\'re real and pulls in public context about what you do.' },
  { icon: Icon.file, title: 'Connect your knowledge', body: 'Link Drive, Slack, Notion, or upload files. Clerx reads it all and sorts it into clear topics like Finance, HR, and Materials.' },
  { icon: Icon.tag, title: 'Set who sees what', body: 'Add employees by name and tag each one to the topics they\'re allowed to ask about. Coarse, simple, and totally in your control.' },
  { icon: Icon.key, title: 'Hand out codes', body: 'Each employee gets a join code. They enter their name and start asking — and only ever get answers you\'ve cleared them for.' },
]

function How() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead eyebrow="How it works" title="Live in an afternoon, not a quarter" sub="No IT project. No consultants. A team lead can set the whole thing up between meetings." />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="card group relative overflow-hidden p-6 transition hover:border-brand-500/40">
              <span className="absolute right-4 top-4 text-5xl font-bold text-white/5">{i + 1}</span>
              <span className="grad-brand mb-5 grid h-11 w-11 place-items-center rounded-xl text-white">
                <s.icon size={20} />
              </span>
              <h3 className="text-base font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const features = [
  { icon: Icon.lock, title: 'Permission by topic', body: 'The intern asking about pricing gets nothing about payroll. Every answer is scoped to the exact topics you cleared that person for.', color: '#6d5efc' },
  { icon: Icon.shield, title: 'Legitimacy check built in', body: 'Clerx verifies each company against public records and web presence before any data goes in — so it\'s trusted from day one.', color: '#34d9a8' },
  { icon: Icon.chat, title: 'Answers, not search results', body: 'Employees ask in plain English and get a direct, sourced answer — no digging through folders or pinging a manager.', color: '#38bdf8' },
  { icon: Icon.users, title: 'Built for 5–200 people', body: 'Too big to just ask around, too lean for enterprise knowledge tools. Clerx fits the gap those companies fall into.', color: '#f59e0b' },
  { icon: Icon.tag, title: 'Auto-organized knowledge', body: 'Upload the mess. Clerx sorts everything into clean topics automatically, so setting permissions takes minutes.', color: '#fb7185' },
  { icon: Icon.spark, title: 'Gets smarter as you grow', body: 'Every new doc, policy, and thread makes answers sharper. Your company\'s memory, always current.', color: '#a78bfa' },
]

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead eyebrow="Why Clerx" title="A company brain with a bouncer" sub="The Q&A is table stakes. The real product is control — every answer stays inside the lines you draw." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:border-white/15">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${f.color}1a`, color: f.color, border: `1px solid ${f.color}33` }}>
                <f.icon size={20} />
              </span>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const tiers = [
  { name: 'Starter', price: '$99', unit: '/mo', seats: 'Up to 15 employees', feats: ['All integrations', 'Topic permissions', 'Web legitimacy check', 'Email support'], cta: 'Start free' },
  { name: 'Growth', price: '$299', unit: '/mo', seats: 'Up to 50 employees', feats: ['Everything in Starter', 'Usage analytics', 'Priority support', 'Custom topics'], cta: 'Start free', featured: true },
  { name: 'Business', price: '$699', unit: '/mo', seats: 'Up to 150 employees', feats: ['Everything in Growth', 'SSO & audit log', 'Dedicated success manager', 'SLA'], cta: 'Start free' },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead eyebrow="Pricing" title="Flat pricing. No per-seat surprises." sub="The leader pays one predictable bill. Employees never see a paywall. Companies over 200 — talk to us." />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`card relative p-7 ${t.featured ? 'border-brand-500/50 glow' : ''}`}>
              {t.featured && (
                <Badge className="absolute -top-3 left-7 grad-brand text-white">Most popular</Badge>
              )}
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-white">{t.price}</span>
                <span className="text-slate-500">{t.unit}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{t.seats}</p>
              <ul className="mt-6 space-y-3">
                {t.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Icon.check size={16} className="text-mint-400" /> {f}
                  </li>
                ))}
              </ul>
              <Button as={Link} to="/setup" variant={t.featured ? 'primary' : 'outline'} className="mt-7 w-full">{t.cta}</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="card grad-brand relative overflow-hidden px-8 py-16 text-center glow">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <h2 className="relative text-3xl font-semibold text-white sm:text-4xl">Give your team an answer for everything.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">Set up Clerx for your company in a few minutes. Free to start, no card required.</p>
          <div className="relative mt-8 flex justify-center">
            <Button as={Link} to="/setup" variant="mint" size="lg">Set up your company <Icon.arrow size={18} /></Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <Logo size="sm" />
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Clerx. Your company's AI clerk.</p>
        <div className="flex gap-5 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-300">Privacy</a>
          <a href="#" className="hover:text-slate-300">Security</a>
          <a href="#" className="hover:text-slate-300">Contact</a>
        </div>
      </div>
    </footer>
  )
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-slate-400">{sub}</p>}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <How />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
