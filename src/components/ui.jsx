import { Link } from 'react-router-dom'
import { Icon } from '../lib/icons'

/* ---- Logo: a rubber-stamp monogram + Fraunces wordmark ---- */
export function Logo({ size = 'md', to = '/', dark = false }) {
  const dim = size === 'lg' ? 46 : size === 'sm' ? 30 : 36
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl'
  const ink = dark ? 'text-paper' : 'text-ink'
  const inner = (
    <span className={`flex items-center gap-2.5 select-none ${ink}`}>
      <span className="shrink-0" style={{ width: dim, height: dim }}>
        <StampMark dim={dim} />
      </span>
      <span className={`font-display font-semibold tracking-tight ${text}`}>
        Clerx<span className="text-stamp">.</span>
      </span>
    </span>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export function StampMark({ dim = 36 }) {
  return (
    <svg viewBox="0 0 48 48" width={dim} height={dim} aria-hidden>
      <g transform="rotate(-6 24 24)">
        <rect x="4" y="4" width="40" height="40" rx="9" fill="none" stroke="var(--color-stamp)" strokeWidth="2.5" />
        <rect x="8.5" y="8.5" width="31" height="31" rx="6" fill="none" stroke="var(--color-stamp)" strokeWidth="1" opacity="0.5" />
        <text x="24" y="31" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="22" fill="var(--color-stamp)">C</text>
      </g>
    </svg>
  )
}

/* ---- Button: solid fill, hard offset shadow, presses on click ---- */
export function Button({ as = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) {
  const sizes = {
    sm: 'h-9 px-3.5 text-[13px]',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-6 text-[15px]',
  }
  const variants = {
    primary: 'bg-stamp text-paper border-ink shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
    ink: 'bg-ink text-paper border-ink shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
    ledger: 'bg-ledger text-paper border-ink shadow-hard hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none',
    outline: 'bg-paper text-ink border-ink shadow-hard hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none',
    ghost: 'bg-transparent text-ink border-transparent hover:bg-ink/5',
  }
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`
  const Comp = as
  return <Comp className={cls} {...props}>{children}</Comp>
}

/* ---- Stamp badge (APPROVED / RESTRICTED / labels) ---- */
export function Stamp({ tone = 'ink', rotate = -3, className = '', children, animate = false, style }) {
  const tones = {
    stamp: 'text-stamp',
    ledger: 'text-ledger',
    ochre: 'text-ochre',
    ink: 'text-ink',
    blue: 'text-ink-blue',
  }
  return (
    <span
      className={`stamp stamp-ink ${tones[tone]} ${animate ? 'stamp-in' : ''} ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, '--rot': `${rotate}deg`, ...style }}
    >
      {children}
    </span>
  )
}

/* ---- Filing card (paper + ink border + hard shadow) ---- */
export function Card({ className = '', children, tab, ...props }) {
  return (
    <div className={`relative rounded-xl border-[1.5px] border-ink bg-paper ${className}`} {...props}>
      {tab && (
        <span className="absolute -top-3 left-5 rounded-t-md border-[1.5px] border-b-0 border-ink bg-paper-2 px-3 py-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          {tab}
        </span>
      )}
      {children}
    </div>
  )
}

/* ---- Eyebrow with a filing number ---- */
export function Eyebrow({ no, children, className = '' }) {
  return (
    <div className={`eyebrow flex items-center gap-2.5 ${className}`}>
      {no && <span className="text-stamp">No. {no}</span>}
      {no && <span className="h-px w-6 bg-ink/30" />}
      <span>{children}</span>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-ink-soft">{label}</span>}
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-lg border-[1.5px] border-ink bg-paper-2/60 px-4 text-[15px] text-ink placeholder:text-ink-faint outline-none transition focus:bg-paper focus:shadow-hard ${props.className || ''}`}
    />
  )
}

export { Icon }
