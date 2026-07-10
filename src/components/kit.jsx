import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Icon } from '../lib/icons'

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, opts = {}) => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, msg, tone: opts.tone || 'ink', icon: opts.icon }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration || 2600)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => {
          const tone = { ink: 'bg-ink text-paper', ledger: 'bg-ledger text-paper', stamp: 'bg-stamp text-paper' }[t.tone]
          return (
            <div key={t.id} className={`toast-in pointer-events-auto flex items-center gap-2.5 rounded-lg border-[1.5px] border-ink px-4 py-2.5 text-[13px] font-medium shadow-hard ${tone}`}>
              {t.icon || <Icon.check size={15} />} {t.msg}
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------------- Avatar ---------------- */
const AV_TINTS = ['#D23B22', '#2E6A52', '#C4872E', '#274B73', '#9C3D8C', '#3E7C8C']
export function Avatar({ name, size = 36, className = '' }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('')
  const tint = AV_TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AV_TINTS.length]
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg border-[1.5px] border-ink font-mono font-bold ${className}`}
      style={{ width: size, height: size, background: `${tint}22`, color: tint, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  )
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, footer, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative z-10 w-full ${width} pop-in rounded-xl border-[1.5px] border-ink bg-paper shadow-hard-lg`}>
        <div className="flex items-center justify-between border-b-[1.5px] border-ink px-5 py-3.5">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-md border-[1.5px] border-transparent p-1 text-ink-soft hover:border-ink hover:text-ink"><Icon.x size={17} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t-[1.5px] border-ink px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  )
}

/* ---------------- Drawer (right slide-in) ---------------- */
export function Drawer({ open, onClose, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  return (
    <div className={`fixed inset-0 z-[90] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full ${width} border-l-[1.5px] border-ink bg-paper shadow-hard-lg transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {open && children}
      </div>
    </div>
  )
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className = '' }) {
  return <span className={`block animate-pulse rounded-md bg-ink/10 ${className}`} />
}

/* ---------------- Empty state ---------------- */
export function EmptyState({ icon: Ic = Icon.folder, title, body, action }) {
  return (
    <div className="grid place-items-center rounded-xl border-[1.5px] border-dashed border-ink/35 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2"><Ic size={22} /></span>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      {body && <p className="mt-1.5 max-w-xs text-[14px] text-ink-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ---------------- Dropdown menu ---------------- */
export function Menu({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}>{trigger}</button>
      {open && (
        <div className={`pop-in absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full z-50 mt-2 min-w-[190px] rounded-lg border-[1.5px] border-ink bg-paper p-1.5 shadow-hard`} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  )
}
export function MenuItem({ icon: Ic, children, tone = 'ink', ...props }) {
  return (
    <button className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ink/5 ${tone === 'stamp' ? 'text-stamp' : 'text-ink'}`} {...props}>
      {Ic && <Ic size={15} />} {children}
    </button>
  )
}
export function MenuLabel({ children }) {
  return <div className="px-2.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{children}</div>
}
export function MenuSep() { return <div className="my-1 h-px bg-ink/12" /> }

/* ---------------- Progress bar ---------------- */
export function Bar({ value, color = 'var(--color-ink)', track = 'rgba(30,27,20,0.12)' }) {
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full" style={{ background: track }}>
      <span className="block h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </span>
  )
}
