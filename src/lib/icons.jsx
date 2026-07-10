// Minimal inline icon set (stroke-based, inherits currentColor)
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const S = ({ children, size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    {children}
  </svg>
)

export const Icon = {
  shield: (p) => <S {...p}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></S>,
  search: (p) => <S {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></S>,
  spark: (p) => <S {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" /></S>,
  lock: (p) => <S {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></S>,
  users: (p) => <S {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M16 5a3 3 0 0 1 0 6M21 20c0-2.5-1.8-4.3-4-4.8" /></S>,
  tag: (p) => <S {...p}><path d="M3 12l9-9 9 9-9 9-9-9z" opacity="0" /><path d="M12 3H6a3 3 0 0 0-3 3v6l9 9 9-9-9-9z" /><circle cx="8.5" cy="8.5" r="1.2" /></S>,
  chat: (p) => <S {...p}><path d="M4 5h16v11H9l-4 4V5z" /><path d="M8 10h8M8 13h5" /></S>,
  key: (p) => <S {...p}><circle cx="8" cy="8" r="4" /><path d="M11 11l8 8M16 16l2-2M18 18l2-2" /></S>,
  check: (p) => <S {...p}><path d="M4 12l5 5L20 6" /></S>,
  arrow: (p) => <S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>,
  plus: (p) => <S {...p}><path d="M12 5v14M5 12h14" /></S>,
  x: (p) => <S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>,
  drive: (p) => <S {...p}><path d="M8 3h8l6 10H14L8 3z" /><path d="M8 3L2 13l4 8h8l-4-8" /></S>,
  slack: (p) => <S {...p}><rect x="4" y="10" width="6" height="3" rx="1.5" /><rect x="11" y="4" width="3" height="6" rx="1.5" /><rect x="14" y="11" width="6" height="3" rx="1.5" /><rect x="10" y="14" width="3" height="6" rx="1.5" /></S>,
  notion: (p) => <S {...p}><rect x="5" y="4" width="14" height="16" rx="1.5" /><path d="M9 8l6 8M9 8v8M15 8v8" /></S>,
  file: (p) => <S {...p}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 13h5M10 16h5" /></S>,
  building: (p) => <S {...p}><rect x="5" y="4" width="14" height="17" rx="1.5" /><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h6" /></S>,
  dot: (p) => <S {...p}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></S>,
  logout: (p) => <S {...p}><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 12H3M6 8l-3 4 3 4" /></S>,
  send: (p) => <S {...p}><path d="M4 12l16-8-6 16-3-6-7-2z" /></S>,
  copy: (p) => <S {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></S>,
}
