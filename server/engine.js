// Server-side knowledge engine + topic config. Mirrors the frontend's
// mock brain, but this is where a real LLM + retrieval will live later.

export const TOPICS = [
  { id: 'finance',   label: 'Finance & Budgets',       color: '#2E6A52' },
  { id: 'materials', label: 'Materials & Procurement',  color: '#D23B22' },
  { id: 'hr',        label: 'HR & Policy',              color: '#C4872E' },
  { id: 'it',        label: 'IT & Access',              color: '#274B73' },
  { id: 'sales',     label: 'Sales & Clients',          color: '#9C3D8C' },
  { id: 'ops',       label: 'Operations & Scheduling',  color: '#3E7C8C' },
]
export const topicById = (id) => TOPICS.find((t) => t.id === id)

const KNOWLEDGE = [
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

// Classify a document into a topic by keyword. Returns null if nothing matches
// (unclassified docs are never surfaced in answers — fail closed on permissions).
export function classifyTopic(text) {
  const hit = KNOWLEDGE.find((k) => k.q.test(text || ''))
  return hit ? hit.topic : null
}

const STOP = new Set(['the', 'a', 'an', 'how', 'much', 'many', 'can', 'could', 'i', 'do', 'does',
  'my', 'me', 'is', 'are', 'was', 'what', 'when', 'where', 'who', 'to', 'of', 'for', 'and', 'get',
  'on', 'in', 'with', 'about', 'you', 'we', 'our', 'any', 'have', 'has'])
const terms = (q) => [...new Set((String(q).toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter((w) => !STOP.has(w)))]

function excerpt(content, qt, len = 340) {
  const text = String(content || '').replace(/\s+/g, ' ').trim()
  if (!text) return 'This page is filed but has no readable text yet.'
  const low = text.toLowerCase()
  let idx = -1
  for (const t of qt) { const i = low.indexOf(t); if (i >= 0 && (idx < 0 || i < idx)) idx = i }
  const start = Math.max(0, idx < 0 ? 0 : idx - 60)
  let s = text.slice(start, start + len)
  if (start > 0) s = '…' + s
  if (start + len < text.length) s += '…'
  return s
}

// Keyword-overlap score of a single document against the query terms.
function scoreDoc(qt, d) {
  const title = String(d.title || '').toLowerCase()
  const hay = title + ' ' + String(d.content || '').toLowerCase()
  let score = 0
  for (const t of qt) {
    if (title.includes(t)) score += 3
    score += hay.split(t).length - 1
  }
  return score
}

// Pick the allowed documents to hand the LLM as answer context. Returns ONLY
// docs the employee is cleared for (topic-gated at the source — the LLM can
// never see content outside their permissions). Small corpora go in whole; a
// large corpus is trimmed to a char budget, keyword-ranked so the most
// relevant docs survive the cut.
export function contextForLLM(question, allowedTopics, docs, budget = 60000) {
  const allowed = (docs || []).filter((d) => d.topic && allowedTopics.includes(d.topic))
  if (!allowed.length) return []
  const total = allowed.reduce((n, d) => n + String(d.content || '').length, 0)
  if (total <= budget) return allowed
  const qt = terms(question)
  const ranked = allowed.map((d) => ({ d, s: scoreDoc(qt, d) })).sort((a, b) => b.s - a.s)
  const out = []
  let used = 0
  for (const { d } of ranked) {
    const len = String(d.content || '').length
    if (out.length && used + len > budget) break
    out.push(d)
    used += len
  }
  return out
}

// Search the company's REAL documents (topic-gated). Returns an answer, a
// blocked notice, or null when nothing relevant is on file (caller falls back).
export function answerFromDocs(question, allowedTopics, docs) {
  const qt = terms(question)
  if (!qt.length || !docs?.length) return null
  let best = null, bestScore = 0
  for (const d of docs) {
    if (!d.topic) continue // unclassified → not surfaced (fail closed)
    const score = scoreDoc(qt, d)
    if (score > bestScore) { bestScore = score; best = d }
  }
  if (!best || bestScore < 2) return null
  if (!allowedTopics.includes(best.topic)) {
    const label = topicById(best.topic)?.label || best.topic
    return {
      blocked: true, topic: best.topic,
      text: `That answer lives under **${label}**, which your file isn't cleared for. I've noted the request — your team lead can grant access if it fits your role.`,
    }
  }
  const where = { notion: 'in your Notion', slack: 'in Slack', upload: 'in your uploaded files' }[best.source_kind] || 'in your records'
  return {
    blocked: false, topic: best.topic,
    source: { title: best.title, url: best.url, kind: best.source_kind },
    text: `From **${best.title}** ${where}:\n\n${excerpt(best.content, qt)}`,
  }
}

// Answer, RESPECTING the employee's allowed topics.
export function answerFor(question, allowedTopics) {
  const hits = KNOWLEDGE.filter((k) => k.q.test(question))
  if (hits.length === 0) {
    return { blocked: false, topic: null,
      text: "I couldn't find that in your company's records yet. Try asking about materials, expenses, time off, scheduling, IT access, or client pricing." }
  }
  const allowedHit = hits.find((h) => allowedTopics.includes(h.topic))
  if (!allowedHit) {
    const blocked = topicById(hits[0].topic)
    return { blocked: true, topic: hits[0].topic,
      text: `That answer lives under **${blocked?.label}**, which your file isn't cleared for. I've noted the request — your team lead can grant access if it fits your role.` }
  }
  return { blocked: false, text: allowedHit.a, topic: allowedHit.topic }
}
