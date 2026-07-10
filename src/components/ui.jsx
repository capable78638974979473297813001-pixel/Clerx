import { Link } from 'react-router-dom'
import { Icon } from '../lib/icons'

export function Logo({ size = 'md', to = '/' }) {
  const dim = size === 'lg' ? 40 : size === 'sm' ? 26 : 32
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'
  const inner = (
    <span className="flex items-center gap-2.5 select-none">
      <span
        className="grad-brand grid place-items-center rounded-xl glow"
        style={{ width: dim, height: dim }}
      >
        <svg viewBox="0 0 24 24" width={dim * 0.6} height={dim * 0.6} fill="none">
          <path d="M17 8.5a5 5 0 1 0 0 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="18" cy="12" r="1.5" fill="#fff" />
        </svg>
      </span>
      <span className={`font-semibold tracking-tight text-white ${text}`}>Clerx</span>
    </span>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export function Button({ as = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) {
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-7 text-base',
  }
  const variants = {
    primary: 'grad-brand text-white hover:brightness-110 glow',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
    outline: 'border border-white/12 text-white hover:bg-white/5',
    subtle: 'bg-white/8 text-white hover:bg-white/12',
    mint: 'bg-mint-500 text-ink-950 font-semibold hover:brightness-105',
  }
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`
  const Comp = as
  return <Comp className={cls} {...props}>{children}</Comp>
}

export function Badge({ children, color, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={color ? { background: `${color}1a`, color, border: `1px solid ${color}33` } : undefined}
    >
      {children}
    </span>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>}
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 text-[15px] text-white placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ${props.className || ''}`}
    />
  )
}

export { Icon }
