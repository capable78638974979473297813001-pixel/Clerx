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
