// Pure UI helpers. All persistence now lives in the backend API (src/lib/api.js).
// Topic colors/labels are mirrored here for rendering; the server is the source
// of truth for what topics exist and which answers they gate.

export const TOPICS = [
  { id: 'finance',   label: 'Finance & Budgets',       color: '#2E6A52' },
  { id: 'materials', label: 'Materials & Procurement',  color: '#D23B22' },
  { id: 'hr',        label: 'HR & Policy',              color: '#C4872E' },
  { id: 'it',        label: 'IT & Access',              color: '#274B73' },
  { id: 'sales',     label: 'Sales & Clients',          color: '#9C3D8C' },
  { id: 'ops',       label: 'Operations & Scheduling',  color: '#3E7C8C' },
]
export const topicById = (id) => TOPICS.find((t) => t.id === id)

export function timeAgo(ts) {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
export function dateLabel(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
