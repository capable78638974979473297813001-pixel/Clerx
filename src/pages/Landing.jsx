import { Link, useNavigate } from 'react-router-dom'
import { Logo, Button, Stamp, Card, Eyebrow, Icon } from '../components/ui'
import { StampMark } from '../components/ui'
import { seedDemo } from '../lib/store'

function useLiveDemo() {
  const nav = useNavigate()
  return () => { seedDemo(); nav('/app') }
}

/* ============================ NAV ============================ */
function Nav() {
  const demo = useLiveDemo()
  return (
    <header className="sticky top-0 z-50 border-b-[1.5px] border-ink bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-8 font-mono text-[12px] uppercase tracking-widest text-ink-soft md:flex">
          <a href="#how" className="ink-link hover:text-ink">How it works</a>
          <a href="#why" className="ink-link hover:text-ink">Why Clerx</a>
          <a href="#rates" className="ink-link hover:text-ink">Rates</a>
          <button onClick={demo} className="ink-link hover:text-ink">Live demo</button>
        </nav>
        <div className="flex items-center gap-2">
          <Button as={Link} to="/join" variant="ghost" size="sm">Employee entry</Button>
          <Button as={Link} to="/setup" size="sm">Open a file <Icon.arrow size={15} /></Button>
        </div>
      </div>
    </header>
  )
}

/* ============================ HERO ============================ */
function Hero() {
  const demo = useLiveDemo()
  return (
    <section className="relative overflow-hidden border-b-[1.5px] border-ink">
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-60" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* left: copy */}
        <div className="relative rise">
          <Eyebrow no="01">Clerx · est. MMXXVI · the company clerk</Eyebrow>
          <h1 className="mt-5 font-display text-[3.4rem] font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            Every answer<br />in your company.<br />
            <span className="italic text-stamp">One</span> <span className="marker">clerk</span> to ask.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Clerx reads your Drive, Slack, Notion and files, then answers every employee's
            question on the spot — and never says a word they're not cleared to hear.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} to="/setup" size="lg">Open your company file <Icon.arrow size={18} /></Button>
            <Button onClick={demo} variant="outline" size="lg">Explore a live demo</Button>
          </div>
          <div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            <Icon.check size={14} className="text-ledger" /> Free to file · No card · Teams of 5–200
          </div>
        </div>

        {/* right: the clerk's desk */}
        <HeroDesk />
      </div>
    </section>
  )
}

function HeroDesk() {
  return (
    <div className="relative rise" style={{ animationDelay: '120ms' }}>
      {/* back index card */}
      <div className="absolute -right-2 top-6 h-full w-full rotate-3 rounded-xl border-[1.5px] border-ink bg-paper-3" />
      {/* main file card */}
      <Card className="relative -rotate-1 p-0 shadow-hard-lg">
        <div className="flex items-center justify-between border-b-[1.5px] border-ink bg-paper-2 px-4 py-2.5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Record · Field Team</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-ink bg-stamp" />
            <span className="h-2.5 w-2.5 rounded-full border border-ink bg-ochre" />
            <span className="h-2.5 w-2.5 rounded-full border border-ink bg-ledger" />
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex justify-end">
            <div className="max-w-[16rem] rounded-lg rounded-br-sm border-[1.5px] border-ink bg-ink px-3.5 py-2.5 text-[13px] text-paper">
              How much can I spend on materials without approval?
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0"><StampMark dim={30} /></span>
            <div className="rounded-lg rounded-tl-sm border-[1.5px] border-ink bg-paper-2 px-3.5 py-3 text-[13px] leading-relaxed">
              Up to <b className="text-stamp">$500 per project</b> without sign-off. Above that needs a PO from your site lead. Suppliers: BuildCo &amp; Meridian.
              <div className="mt-2.5 flex items-center gap-1.5 border-t border-ink/15 pt-2 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                <Icon.folder size={12} /> Materials &amp; Procurement
              </div>
            </div>
          </div>
        </div>
        {/* the stamp */}
        <Stamp tone="ledger" rotate={-11} className="absolute -bottom-4 right-6 bg-paper !text-[0.78rem] shadow-hard-grn">
          <Icon.check size={13} /> Cleared
        </Stamp>
      </Card>
      {/* paperclip */}
      <Icon.clip size={44} className="absolute -left-3 -top-4 -rotate-12 text-ink-soft" />
    </div>
  )
}

/* ==================== TRUST MARQUEE ==================== */
function Marquee() {
  const items = ['Google Drive', '✦', 'Slack', '✦', 'Notion', '✦', 'Dropbox', '✦', 'Confluence', '✦', 'SharePoint', '✦', 'Uploaded files', '✦']
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden border-b-[1.5px] border-ink bg-ink py-3 text-paper">
      <div className="marquee flex w-max gap-8 whitespace-nowrap font-mono text-sm uppercase tracking-widest">
        {row.map((it, i) => (
          <span key={i} className={it === '✦' ? 'text-stamp' : ''}>{it}</span>
        ))}
      </div>
    </div>
  )
}

/* ==================== HOW IT WORKS ==================== */
const steps = [
  { n: '01', icon: Icon.search, title: 'Verify the company', body: 'Enter your company name. Clerx runs a quick web check to confirm you\'re a real, legitimate business — and files what it learns.' },
  { n: '02', icon: Icon.folder, title: 'File the knowledge', body: 'Connect Drive, Slack, Notion or drop in documents. Clerx reads it all and sorts it into clean topics automatically.' },
  { n: '03', icon: Icon.stamp, title: 'Stamp the access', body: 'Add each employee and stamp the topics they\'re cleared to ask about. Coarse, simple, entirely your call.' },
  { n: '04', icon: Icon.key, title: 'Hand out the keys', body: 'Everyone gets a join code. They enter their name and start asking — and only ever hear what you cleared.' },
]

function How() {
  return (
    <section id="how" className="border-b-[1.5px] border-ink">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead no="02" kicker="The procedure" title="Filed and open by this afternoon" sub="No IT project. No consultants. A team lead sets the whole thing up between meetings." />
        <div className="mt-12 grid gap-0 border-[1.5px] border-ink bg-paper shadow-hard sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className={`group p-6 ${i < steps.length - 1 ? 'border-b-[1.5px] border-ink lg:border-b-0 lg:border-r-[1.5px]' : ''} ${i % 2 === 0 ? 'sm:border-r-[1.5px] sm:border-ink lg:border-r-[1.5px]' : ''} ${i < 2 ? 'sm:border-b-[1.5px] sm:border-ink lg:border-b-0' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2 text-ink transition group-hover:bg-stamp group-hover:text-paper">
                  <s.icon size={20} />
                </span>
                <span className="font-display text-4xl font-semibold text-ink/12">{s.n}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ==================== WHY / FEATURES ==================== */
function Why() {
  return (
    <section id="why" className="border-b-[1.5px] border-ink ledger-lines">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead no="03" kicker="Why it's different" title="A company brain with a bouncer" sub="The Q&A is the easy part. The product is control — every answer stays inside the lines you draw." />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* big feature */}
          <Card tab="Clearance" className="p-7 shadow-hard lg:col-span-2">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <h3 className="font-display text-3xl font-semibold leading-tight">Permission by topic,<br />not by trust.</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
                  The intern asking about pricing hears nothing about payroll. Every reply is scoped to
                  the exact topics you stamped for that person — enforced on every single answer.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-3">
                <Stamp tone="ledger" rotate={-6} className="!text-sm !px-4 !py-2.5"><Icon.check size={15} /> Approved</Stamp>
                <Stamp tone="stamp" rotate={5} className="!text-sm !px-4 !py-2.5"><Icon.lock size={15} /> Restricted</Stamp>
              </div>
            </div>
          </Card>

          <FeatureCard icon={Icon.search} title="Legitimacy check" body="Clerx vets each company against its web presence and records before any data is filed. Trusted from day one." />
          <FeatureCard icon={Icon.ledger} title="Answers, not folders" body="Employees ask in plain words and get a direct, sourced answer — no digging, no pinging a manager." />
          <FeatureCard icon={Icon.folder} title="Auto-filed knowledge" body="Upload the mess. Clerx sorts it into clean topics, so stamping permissions takes minutes." />
          <FeatureCard icon={Icon.people} title="Sized for 5–200" body="Too big to just ask around, too lean for enterprise tools. Clerx fits the gap they fall through." />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Ic, title, body }) {
  return (
    <div className="rounded-xl border-[1.5px] border-ink bg-paper p-6 shadow-hard transition hover:-translate-y-1">
      <span className="grid h-11 w-11 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2">
        <Ic size={20} />
      </span>
      <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  )
}

/* ==================== RATES ==================== */
const tiers = [
  { name: 'Ledger', price: '99', seats: 'up to 15 on staff', feats: ['Every integration', 'Topic clearances', 'Web legitimacy check', 'Email support'] },
  { name: 'Registry', price: '299', seats: 'up to 50 on staff', feats: ['Everything in Ledger', 'Usage records', 'Priority support', 'Custom topics'], featured: true },
  { name: 'Bureau', price: '699', seats: 'up to 150 on staff', feats: ['Everything in Registry', 'SSO & audit trail', 'Success manager', 'SLA'] },
]

function Rates() {
  return (
    <section id="rates" className="border-b-[1.5px] border-ink">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead no="04" kicker="The rates" title="One flat fee. No per-seat meter." sub="The leader pays one predictable bill. Employees never meet a paywall. Over 200 on staff — write to us." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-xl border-[1.5px] border-ink p-7 ${t.featured ? 'bg-ink text-paper shadow-hard-lg' : 'bg-paper shadow-hard'}`}>
              {t.featured && (
                <Stamp tone="stamp" rotate={-8} className="absolute -right-3 -top-3 bg-paper !text-[0.7rem]">Most filed</Stamp>
              )}
              <div className="font-mono text-[12px] uppercase tracking-widest opacity-70">{t.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-2xl font-semibold">$</span>
                <span className="font-display text-6xl font-semibold leading-none">{t.price}</span>
                <span className={`text-sm ${t.featured ? 'text-paper/60' : 'text-ink-soft'}`}>/mo</span>
              </div>
              <div className={`mt-1 text-sm ${t.featured ? 'text-paper/60' : 'text-ink-soft'}`}>{t.seats}</div>
              <ul className="mt-6 space-y-2.5">
                {t.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px]">
                    <Icon.check size={16} className={t.featured ? 'text-stamp' : 'text-ledger'} /> {f}
                  </li>
                ))}
              </ul>
              <Button as={Link} to="/setup" variant={t.featured ? 'primary' : 'outline'} className="mt-7 w-full">Open a file</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ==================== CTA ==================== */
function CTA() {
  return (
    <section className="border-b-[1.5px] border-ink bg-stamp text-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <div className="pointer-events-none absolute" />
        <Eyebrow className="justify-center !text-paper/70">Ready when you are</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.02] sm:text-6xl">
          Give your team an answer for everything.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[16px] text-paper/80">
          Open your company file in a few minutes. Free to start, no card required.
        </p>
        <div className="mt-9 flex justify-center">
          <Button as={Link} to="/setup" variant="outline" size="lg">Open your company file <Icon.arrow size={18} /></Button>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <Logo size="sm" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">© MMXXVI Clerx · the company clerk</p>
        <div className="flex gap-5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          <a href="#" className="ink-link hover:text-ink">Privacy</a>
          <a href="#" className="ink-link hover:text-ink">Security</a>
          <a href="#" className="ink-link hover:text-ink">Contact</a>
        </div>
      </div>
    </footer>
  )
}

function SectionHead({ no, kicker, title, sub }) {
  return (
    <div className="max-w-2xl">
      <Eyebrow no={no}>{kicker}</Eyebrow>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">{sub}</p>}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="grain min-h-screen">
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <How />
          <Why />
          <Rates />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}
