import { one, run, uuid } from './db.js'

const HOURS = 3600e3, DAYS = 24 * HOURS

function genCode(len = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code
  do { code = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('') }
  while (one('SELECT id FROM employees WHERE code=?', code))
  return code
}

// Populate a company with a believable staff, sources, and audit trail.
export function seedCompany(companyId) {
  const now = Date.now()

  // clear any existing workspace data first
  run('DELETE FROM employees WHERE company_id=?', companyId)
  run('DELETE FROM sources WHERE company_id=?', companyId)
  run('DELETE FROM activity WHERE company_id=?', companyId)

  run(`UPDATE companies SET name=?, domain=?, verified=1, verified_at=?, industry=?, size=?, blurb=?, plan=? WHERE id=?`,
    'Meridian Build Co.', 'meridianbuild.com', now - 32 * DAYS, 'Construction', '11 on staff',
    'Meridian Build Co. reads as an established business — live web presence, active listings, and a registered domain. No red flags on file.',
    'Registry', companyId)

  const defs = [
    ['Jake Rivera', 'Site Foreman', 'Field', ['materials', 'ops'], 'active', 30, 2, 47],
    ['Priya Nair', 'Office Manager', 'Admin', ['finance', 'hr', 'it', 'ops'], 'active', 30, 1, 63],
    ['Marcus Bell', 'Sales Lead', 'Sales', ['sales', 'finance'], 'active', 30, 6, 38],
    ['Dana Whitfield', 'Estimator', 'Sales', ['sales', 'materials'], 'active', 30, 20, 21],
    ['Leo Fontaine', 'Apprentice', 'Field', ['ops'], 'active', 8, 4, 12],
    ['Sofia Marchetti', 'HR Coordinator', 'Admin', ['hr', 'finance'], 'active', 30, 30, 29],
    ['Trent Okafor', 'Project Manager', 'Field', ['materials', 'ops', 'finance'], 'active', 30, 3, 55],
    ['Amelia Cross', 'Bookkeeper', 'Admin', ['finance'], 'active', 30, 48, 41],
    ['Diego Santos', 'Field Tech', 'Field', ['ops'], 'active', 30, 9, 8],
    ['Nina Kaur', 'IT Contractor', 'Admin', ['it'], 'invited', 3, null, 0],
    ['Owen Pierce', 'Junior Rep', 'Sales', ['sales'], 'invited', 2, null, 0],
  ]

  const employees = defs.map(([name, role, team, topics, status, joinedDays, activeHrs, questions]) => {
    const id = uuid()
    run(`INSERT INTO employees(id, company_id, name, role, team, email, code, topics, status, joined_at, last_active, questions)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      id, companyId, name, role, team, name.toLowerCase().replace(/[^a-z]+/g, '.') + '@meridianbuild.com',
      genCode(), JSON.stringify(topics), status, now - joinedDays * DAYS,
      activeHrs == null ? null : now - activeHrs * HOURS, questions)
    return { id, name, topics }
  })

  const sources = [
    ['drive', 'Google Drive', 214, 1 * HOURS],
    ['slack', 'Slack', 98, 3 * HOURS],
    ['notion', 'Notion', 61, 26 * HOURS],
    ['upload', 'Uploaded files', 17, 5 * DAYS],
  ]
  for (const [kind, name, docs, ago] of sources)
    run('INSERT INTO sources(id, company_id, kind, name, docs, last_sync) VALUES(?,?,?,?,?,?)',
      uuid(), companyId, kind, name, docs, now - ago)

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
    ['What are our payment terms?', 'finance', false],
    ['Who approves a 25% discount?', 'sales', false],
    ['Can I see the client contract values?', 'sales', true],
    ['Is PPE required on every site?', 'ops', false],
  ]
  for (let i = 0; i < 28; i++) {
    const emp = employees[Math.floor(Math.random() * 9)]
    const [question, topic, wantBlock] = qbank[Math.floor(Math.random() * qbank.length)]
    const blocked = wantBlock && !emp.topics.includes(topic)
    run('INSERT INTO activity(id, company_id, emp_id, emp_name, question, topic, blocked, ts) VALUES(?,?,?,?,?,?,?,?)',
      uuid(), companyId, emp.id, emp.name, question, topic, blocked ? 1 : 0, now - Math.floor(Math.random() * 7 * DAYS))
  }
}
