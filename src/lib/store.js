// Lightweight localStorage-backed demo store for Clerx.
// No backend — this simulates the leader/employee flow end to end.

const KEY = 'clerx.demo.v1'

export const TOPICS = [
  { id: 'finance', label: 'Finance & Budgets', color: '#34d9a8' },
  { id: 'materials', label: 'Materials & Procurement', color: '#6d5efc' },
  { id: 'hr', label: 'HR & Policy', color: '#f59e0b' },
  { id: 'it', label: 'IT & Access', color: '#38bdf8' },
  { id: 'sales', label: 'Sales & Clients', color: '#fb7185' },
  { id: 'ops', label: 'Operations & Scheduling', color: '#a78bfa' },
]

export const topicById = (id) => TOPICS.find((t) => t.id === id)

// Mock "knowledge base" the AI answers from, each snippet tagged to a topic.
export const KNOWLEDGE = [
  { topic: 'materials', q: /material|spend|budget for supplies|buy|purchase/i,
    a: "Field staff can spend up to $500 per project on materials without sign-off. Anything above $500 needs a purchase order approved by your site lead. Preferred suppliers are BuildCo and Meridian — both are pre-billed to the company account." },
  { topic: 'finance', q: /expense|reimburse|invoice|payment terms|budget/i,
    a: "Expenses are reimbursed twice a month (15th and 30th). Submit receipts in the finance portal within 30 days. Client invoices use Net-30 payment terms by default." },
  { topic: 'hr', q: /vacation|pto|time off|holiday|sick|leave|benefits/i,
    a: "Full-time employees get 18 days PTO plus 10 company holidays. Request time off at least 2 weeks ahead. Sick days are separate and uncapped within reason." },
  { topic: 'it', q: /password|vpn|access|laptop|software|login|wifi/i,
    a: "Request software or access through the IT portal — most approvals are same-day. VPN is required off-site; use the Clerx-issued device for any client data." },
  { topic: 'sales', q: /discount|client|deal|pricing|contract|quote/i,
    a: "Reps can offer up to 10% discount independently. 10–20% needs manager approval; over 20% goes to the founder. All quotes are valid for 30 days." },
  { topic: 'ops', q: /schedule|shift|hours|overtime|roster|on-call/i,
    a: "Standard hours are 8am–4pm. Overtime must be pre-approved by your ops lead. Shift swaps are fine if both people confirm in the ops channel 24h ahead." },
]

const defaultState = () => ({
  company: null, // { name, domain, verified, industry, size, blurb }
  sources: [],   // connected/uploaded knowledge sources
  employees: [], // { id, name, code, topics: [] }
  orgCode: null,
})

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
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

// Mock AI answer that RESPECTS the employee's allowed topics.
export function answerFor(question, allowedTopics) {
  const hits = KNOWLEDGE.filter((k) => k.q.test(question))
  if (hits.length === 0) {
    return {
      ok: true,
      blocked: false,
      text: "I couldn't find that in your company's knowledge base yet. Try asking about materials, expenses, time off, scheduling, IT access, or client pricing.",
      topic: null,
    }
  }
  const allowedHit = hits.find((h) => allowedTopics.includes(h.topic))
  if (!allowedHit) {
    const blockedTopic = topicById(hits[0].topic)
    return {
      ok: true,
      blocked: true,
      text: `That answer lives under **${blockedTopic?.label}**, which your account isn't cleared for. I've flagged your leader — they can grant access if it's relevant to your role.`,
      topic: hits[0].topic,
    }
  }
  return { ok: true, blocked: false, text: allowedHit.a, topic: allowedHit.topic }
}
