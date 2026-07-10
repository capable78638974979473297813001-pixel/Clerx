// Clerical icon set — records-office motifs, not robot/AI sparkles.
// Stroke-based, inherits currentColor.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const S = ({ children, size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    {children}
  </svg>
)

export const Icon = {
  // rubber stamp
  stamp: (p) => <S {...p}><path d="M9 3h6l-1 6 3 2v3H7v-3l3-2-1-6z" /><path d="M5 20h14" /><path d="M6 17h12" /></S>,
  // manila folder
  folder: (p) => <S {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /><path d="M3 10h18" /></S>,
  // index card / record
  card: (p) => <S {...p}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 9h18" /><path d="M6 13h7M6 16h5" /><circle cx="17" cy="14.5" r="1.4" /></S>,
  // ledger / lined book
  ledger: (p) => <S {...p}><path d="M5 4h13a1 1 0 0 1 1 1v15H6a1 1 0 0 1-1-1V4z" /><path d="M5 4a1 1 0 0 0-1 1v13" /><path d="M9 8h7M9 11h7M9 14h5" /></S>,
  // key
  key: (p) => <S {...p}><circle cx="8" cy="8" r="4" /><path d="M11 11l8 8M16 16l2-2M18 18l2-2" /></S>,
  // magnifier
  search: (p) => <S {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></S>,
  // people
  people: (p) => <S {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M16 5a3 3 0 0 1 0 6M21 20c0-2.5-1.8-4.3-4-4.8" /></S>,
  // lock
  lock: (p) => <S {...p}><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></S>,
  // filing cabinet
  cabinet: (p) => <S {...p}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M5 9h14M5 15h14" /><path d="M10 6h4M10 12h4M10 18h4" /></S>,
  // paperclip
  clip: (p) => <S {...p}><path d="M20 11l-8.5 8.5a4.5 4.5 0 0 1-6.4-6.4L13 5a3 3 0 0 1 4.2 4.2l-8.3 8.3a1.5 1.5 0 0 1-2.1-2.1L14 5.5" /></S>,
  // check
  check: (p) => <S {...p}><path d="M4 12l5 5L20 6" /></S>,
  // arrow
  arrow: (p) => <S {...p}><path d="M4 12h15M13 6l6 6-6 6" /></S>,
  arrowUR: (p) => <S {...p}><path d="M7 17L17 7M8 7h9v9" /></S>,
  plus: (p) => <S {...p}><path d="M12 5v14M5 12h14" /></S>,
  x: (p) => <S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>,
  // brand tools
  drive: (p) => <S {...p}><path d="M8 3h8l6 10H14L8 3z" /><path d="M8 3L2 13l4 8h8l-4-8" /></S>,
  slack: (p) => <S {...p}><rect x="4" y="10" width="6" height="3" rx="1.5" /><rect x="11" y="4" width="3" height="6" rx="1.5" /><rect x="14" y="11" width="6" height="3" rx="1.5" /><rect x="10" y="14" width="3" height="6" rx="1.5" /></S>,
  notion: (p) => <S {...p}><rect x="5" y="4" width="14" height="16" rx="1.5" /><path d="M9 8l6 8M9 8v8M15 8v8" /></S>,
  file: (p) => <S {...p}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 13h5M10 16h5" /></S>,
  building: (p) => <S {...p}><rect x="5" y="4" width="14" height="17" rx="1.5" /><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h6" /></S>,
  send: (p) => <S {...p}><path d="M4 12l16-8-6 16-3-6-7-2z" /></S>,
  copy: (p) => <S {...p}><rect x="9" y="9" width="11" height="11" rx="1.5" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></S>,
  logout: (p) => <S {...p}><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 12H3M6 8l-3 4 3 4" /></S>,
  dot: (p) => <S {...p}><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" /></S>,
  quill: (p) => <S {...p}><path d="M4 20c6-1 9-4 12-9 1.5-2.5 2-5 2-7-2 0-4.5.5-7 2-5 3-8 6-9 12z" /><path d="M4 20l5-5" /></S>,
}
