import { Router } from 'express'
import { one, run, companyOut } from '../db.js'
import { hashPassword, checkPassword, createSession, destroySession, requireAuth, uuid } from '../auth.js'
import { seedCompany } from '../seed.js'

const router = Router()
const clean = (s) => (typeof s === 'string' ? s.trim() : '')
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function userPayload(user) {
  const company = user.company_id ? companyOut(one('SELECT * FROM companies WHERE id=?', user.company_id)) : null
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, company }
}

// POST /api/auth/signup  { name, email, password, companyName }
router.post('/signup', async (req, res) => {
  const name = clean(req.body.name)
  const email = clean(req.body.email).toLowerCase()
  const password = req.body.password || ''
  const companyName = clean(req.body.companyName)

  if (!name || !email || !password || !companyName)
    return res.status(400).json({ error: 'All fields are required.' })
  if (!emailRe.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  if (one('SELECT id FROM users WHERE email=?', email))
    return res.status(409).json({ error: 'An account with that email already exists.' })

  const now = Date.now()
  const companyId = uuid()
  run('INSERT INTO companies(id, name, created_at) VALUES(?,?,?)', companyId, companyName, now)

  const userId = uuid()
  const hash = await hashPassword(password)
  run('INSERT INTO users(id, email, password_hash, name, role, company_id, created_at) VALUES(?,?,?,?,?,?,?)',
    userId, email, hash, name, 'leader', companyId, now)

  createSession(res, userId)
  const user = one('SELECT id, email, name, role, company_id FROM users WHERE id=?', userId)
  res.status(201).json(userPayload(user))
})

// POST /api/auth/login  { email, password }
router.post('/login', async (req, res) => {
  const email = clean(req.body.email).toLowerCase()
  const password = req.body.password || ''
  const row = one('SELECT * FROM users WHERE email=?', email)
  if (!row || !(await checkPassword(password, row.password_hash)))
    return res.status(401).json({ error: 'Wrong email or password.' })
  createSession(res, row.id)
  res.json(userPayload(row))
})

// POST /api/auth/demo → spin up a throwaway guest account with a seeded company
router.post('/demo', async (req, res) => {
  const now = Date.now()
  const companyId = uuid()
  run('INSERT INTO companies(id, name, created_at) VALUES(?,?,?)', companyId, 'Meridian Build Co.', now)
  seedCompany(companyId)

  const userId = uuid()
  const email = `guest_${userId.slice(0, 8)}@demo.clerx.app`
  const hash = await hashPassword(uuid())
  run('INSERT INTO users(id, email, password_hash, name, role, company_id, created_at) VALUES(?,?,?,?,?,?,?)',
    userId, email, hash, 'Demo Leader', 'leader', companyId, now)

  createSession(res, userId)
  const user = one('SELECT id, email, name, role, company_id FROM users WHERE id=?', userId)
  res.status(201).json(userPayload(user))
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  destroySession(req, res)
  res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(userPayload(req.user))
})

export default router
