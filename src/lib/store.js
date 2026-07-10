// localStorage-backed demo store for Clerx. No backend — simulates the
// full leader/employee product end to end, with an audit trail.

const KEY = 'clerx.demo.v1'

export const TOPICS = [
  { id: 'finance',   label: 'Finance & Budgets',       color: '#2E6A52' },
  { id: 'materials', label: 'Materials & Procurement',  color: '#D23B22' },
  { id: 'hr',        label: 'HR & Policy',              color: '#C4872E' },
  { id: 'it',        label: 'IT & Access',              color: '#274B73' },
  { id: 'sales',     label: 'Sales & Clients',          color: '#9C3D8C' },
  { id: 'ops',       label: 'Operations & Scheduling',  color: '#3E7C8C' },
]
export const topicById = (id) => TOPICS.find((t) => t.id === id)

// Mock knowledge base — each snippet tagged to a topic.
export const KNOWLEDGE = [
  { topic: 'materials', q: /material|spend|budget for supplies|buy|purchase|supplier|tools?/i,
    a: "Field staff can spend up to **$500 per project** on materials without sign-off. Anything above $500 needs a purchase order approved by your site lead. Preferred suppliers are BuildCo and Meridian — both are pre-billed to the company account." },
  { topic: 'finance', q: /expense|reimburse|invoice|payment terms|budget|receipt|mileage/i,
    a: "Expenses are reimbursed **twice a month** (15th and 30th). Submit receipts in the finance portal within 30 days. Client invoices use **Net-30** payment terms by default. Mileage is reimbursed at $0.67/mile." },
  { topic: 'hr', q: /vacation|pto|time off|holiday|sick|leave|benefits|parental|maternity/i,
    a: "Full-time employees get **18 days PTO** plus 10 company holidays. Request time off at least 2 weeks ahead. Sick days are separate and uncapped within reason. Parental leave is 12 weeks paid." },
  { topic: 'it', q: /password|vpn|access|laptop|software|login|wifi|2fa|device|email setup/i,
    a: "Request software or access through the IT portal — most approvals are **same-day**. VPN is required off-site, and 2FA is mandatory. Use the Clerx-issued device for any client data." },
  { topic: 'sales', q: /discount|client|deal|pricing|contract|quote|proposal|commission/i,
    a: "Reps can offer up to **10% discount** independently. 10–20% needs manager approval; over 20% goes to the founder. All quotes are valid for 30 days. Commission is paid on collected revenue, not booked." },
  { topic: 'ops', q: /schedule|shift|hours|overtime|roster|on-call|site|safety|ppe/i,
    a: "Standard hours are **8am–4pm**. Overtime must be pre-approved by your ops lead. Shift swaps are fine if both people confirm in the ops channel 24h ahead. PPE is mandatory on every active site." },
]

/* ---------------- state ---------------- */
const defaultState = () => ({
  company: null,   // { name, domain, verified, verifiedAt, industry, size, blurb, plan }
  sources: [],     // { id, name, docs, lastSync }
  employees: [],   // { id, name, role, team, email, code, topics[], status, joinedAt, lastActive, questions }
  activity: [],    // { id, ts, empId, empName, question, topic, blocked }
  seeded: false,
})

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaultState(), ...JSON.parse(raw) }
  } catch {}
  return defaultState()
}
export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('clerx-store'))
  return state
}
export function reset() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('clerx-store'))
}

export function genCode(len = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function logActivity(entry) {
  const s = load()
  s.activity = [{ id: crypto.randomUUID(), ts: Date.now(), ...entry }, ...(s.activity || [])].slice(0, 200)
  const emp = s.employees.find((e) => e.id === entry.empId)
  if (emp) { emp.questions = (emp.questions || 0) + 1; emp.lastActive = Date.now() }
  save(s)
}

// Mock AI answer that RESPECTS the employee's allowed topics.
export function answerFor(question, allowedTopics) {
  const hits = KNOWLEDGE.filter((k) => k.q.test(question))
  if (hits.length === 0) {
    return { ok: true, blocked: false, topic: null,
      text: "I couldn't find that in your company's records yet. Try asking about materials, expenses, time off, scheduling, IT access, or client pricing." }
  }
  const allowedHit = hits.find((h) => allowedTopics.includes(h.topic))
  if (!allowedHit) {
    const blocked = topicById(hits[0].topic)
    return { ok: true, blocked: true, topic: hits[0].topic,
      text: `That answer lives under **${blocked?.label}**, which your file isn't cleared for. I've noted the request — your team lead can grant access if it fits your role.` }
  }
  return { ok: true, blocked: false, text: allowedHit.a, topic: allowedHit.topic }
}

/* ---------------- seed: a believable company ---------------- */
const HOURS = 3600e3, DAYS = 24 * HOURS

export function seedDemo() {
  const now = Date.now()
  const mk = (name, role, team, topics, opts = {}) => ({
    id: crypto.randomUUID(), name, role, team,
    email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@meridianbuild.com',
    code: genCode(), topics, status: opts.status || 'active',
    joinedAt: now - (opts.joinedDays ?? 30) * DAYS,
    lastActive: opts.status === 'invited' ? null : now - (opts.activeHrs ?? 5) * HOURS,
    questions: opts.questions ?? Math.floor(Math.random() * 40 + 3),
  })

  const employees = [
    mk('Jake Rivera', 'Site Foreman', 'Field', ['materials', 'ops'], { activeHrs: 2, questions: 47 }),
    mk('Priya Nair', 'Office Manager', 'Admin', ['finance', 'hr', 'it', 'ops'], { activeHrs: 1, questions: 63 }),
    mk('Marcus Bell', 'Sales Lead', 'Sales', ['sales', 'finance'], { activeHrs: 6, questions: 38 }),
    mk('Dana Whitfield', 'Estimator', 'Sales', ['sales', 'materials'], { activeHrs: 20, questions: 21 }),
    mk('Leo Fontaine', 'Apprentice', 'Field', ['ops'], { joinedDays: 8, activeHrs: 4, questions: 12 }),
    mk('Sofia Marchetti', 'HR Coordinator', 'Admin', ['hr', 'finance'], { activeHrs: 30, questions: 29 }),
    mk('Trent Okafor', 'Project Manager', 'Field', ['materials', 'ops', 'finance'], { activeHrs: 3, questions: 55 }),
    mk('Amelia Cross', 'Bookkeeper', 'Admin', ['finance'], { activeHrs: 48, questions: 41 }),
    mk('Diego Santos', 'Field Tech', 'Field', ['ops'], { activeHrs: 9, questions: 8 }),
    mk('Nina Kaur', 'IT Contractor', 'Admin', ['it'], { joinedDays: 3, status: 'invited', questions: 0 }),
    mk('Owen Pierce', 'Junior Rep', 'Sales', ['sales'], { joinedDays: 2, status: 'invited', questions: 0 }),
  ]

  const sources = [
    { id: 'drive',  name: 'Google Drive', docs: 214, lastSync: now - 1 * HOURS },
    { id: 'slack',  name: 'Slack',        docs: 98,  lastSync: now - 3 * HOURS },
    { id: 'notion', name: 'Notion',       docs: 61,  lastSync: now - 26 * HOURS },
    { id: 'upload', name: 'Uploaded files', docs: 17, lastSync: now - 5 * DAYS },
  ]

  // synthesize a plausible activity trail
  const qbank = [
    ['How much can I spend on materials?', 'materials', false],
    ['What are the standard site hours?', 'ops', false],
    ['How many vacation days do I get?', 'hr', false],
    ['What discount can I offer this client?', 'sales', false],
    ['How do I expense mileage?', 'finance', false],
    ['Can I get access to the payroll sheet?', 'finance', true],
    ['What suppliers are pre-approved?', 'materials', false],
    ['How do I set up the VPN?', 'it', false],
    ['What is the overtime policy?', 'ops', false],
    ['What is parental leave?', 'hr', false],
    ['What are our payment terms?', 'finance', false],
    ['Who approves a 25% discount?', 'sales', false],
    ['Can I see the client contract values?', 'sales', true],
    ['Is PPE required on every site?', 'ops', false],
  ]
  const activity = []
  for (let i = 0; i < 28; i++) {
    const emp = employees[Math.floor(Math.random() * 9)]
    const [question, topic, wantBlock] = qbank[Math.floor(Math.random() * qbank.length)]
    const blocked = wantBlock && !emp.topics.includes(topic)
    activity.push({
      id: crypto.randomUUID(),
      ts: now - Math.floor(Math.random() * 7 * DAYS),
      empId: emp.id, empName: emp.name, question, topic, blocked,
    })
  }
  activity.sort((a, b) => b.ts - a.ts)

  const state = {
    company: {
      name: 'Meridian Build Co.', domain: 'meridianbuild.com', verified: true,
      verifiedAt: now - 32 * DAYS, industry: 'Construction', size: '11 on staff',
      blurb: 'Meridian Build Co. reads as an established business — live web presence, active listings, and a registered domain. No red flags on file.',
      plan: 'Registry',
    },
    sources, employees, activity, seeded: true,
  }
  return save(state)
}

/* time helpers */
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
