import { Router } from 'express'
import { one, all, run, companyOut, empOut, sourceOutFull, activityOut, uuid } from '../db.js'
import { requireAuth } from '../auth.js'
import { TOPICS } from '../engine.js'
import { seedCompany } from '../seed.js'
import { configuredMap } from '../oauth.js'

const router = Router()
router.use(requireAuth)
const cid = (req) => req.user.company_id
const clean = (s) => (typeof s === 'string' ? s.trim() : '')

// GET /api/company  → company + all workspace data in one shot
router.get('/', (req, res) => {
  const company = companyOut(one('SELECT * FROM companies WHERE id=?', cid(req)))
  const employees = all('SELECT * FROM employees WHERE company_id=? ORDER BY joined_at DESC', cid(req)).map(empOut)
  const sources = all('SELECT * FROM sources WHERE company_id=? ORDER BY rowid', cid(req)).map(sourceOutFull)
  const activity = all('SELECT * FROM activity WHERE company_id=? ORDER BY ts DESC LIMIT 200', cid(req)).map(activityOut)
  res.json({ company, employees, sources, activity, topics: TOPICS, oauth: configuredMap() })
})

// PATCH /api/company  { name, domain, plan }
router.patch('/', (req, res) => {
  const c = one('SELECT * FROM companies WHERE id=?', cid(req))
  const name = clean(req.body.name) || c.name
  const domain = req.body.domain !== undefined ? clean(req.body.domain) : c.domain
  const plan = clean(req.body.plan) || c.plan
  run('UPDATE companies SET name=?, domain=?, plan=? WHERE id=?', name, domain, plan, cid(req))
  res.json(companyOut(one('SELECT * FROM companies WHERE id=?', cid(req))))
})

// POST /api/company/verify  { name, domain } → simulated legitimacy check
router.post('/verify', (req, res) => {
  const c = one('SELECT * FROM companies WHERE id=?', cid(req))
  const name = clean(req.body.name) || c.name
  const domain = clean(req.body.domain) || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
  const industry = guessIndustry(name)
  const blurb = `${name} reads as an established business — live web presence, active listings, and a registered domain. No red flags on file.`
  run('UPDATE companies SET name=?, domain=?, verified=1, verified_at=?, industry=?, size=?, blurb=? WHERE id=?',
    name, domain, Date.now(), industry, '5–200 on staff', blurb, cid(req))
  res.json(companyOut(one('SELECT * FROM companies WHERE id=?', cid(req))))
})

// POST /api/company/seed → load the sample company (Meridian Build Co.)
router.post('/seed', (req, res) => {
  seedCompany(cid(req))
  const company = companyOut(one('SELECT * FROM companies WHERE id=?', cid(req)))
  const employees = all('SELECT * FROM employees WHERE company_id=? ORDER BY joined_at DESC', cid(req)).map(empOut)
  const sources = all('SELECT * FROM sources WHERE company_id=? ORDER BY rowid', cid(req)).map(sourceOutFull)
  const activity = all('SELECT * FROM activity WHERE company_id=? ORDER BY ts DESC LIMIT 200', cid(req)).map(activityOut)
  res.json({ company, employees, sources, activity, topics: TOPICS, oauth: configuredMap() })
})

// POST /api/company/reset → wipe workspace data (keeps the account + company shell)
router.post('/reset', (req, res) => {
  run('DELETE FROM employees WHERE company_id=?', cid(req))
  run('DELETE FROM sources WHERE company_id=?', cid(req))
  run('DELETE FROM documents WHERE company_id=?', cid(req))
  run('DELETE FROM activity WHERE company_id=?', cid(req))
  run('UPDATE companies SET verified=0, verified_at=NULL, industry=NULL, blurb=NULL WHERE id=?', cid(req))
  res.json({ ok: true })
})

function guessIndustry(name) {
  const n = name.toLowerCase()
  if (/build|construct|contract|reno/.test(n)) return 'Construction'
  if (/tech|labs|ai|data|soft/.test(n)) return 'Technology'
  if (/health|care|clinic|med/.test(n)) return 'Healthcare'
  if (/law|legal|partners/.test(n)) return 'Professional services'
  return 'General business'
}

export default router
