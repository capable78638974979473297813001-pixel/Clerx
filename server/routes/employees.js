import { Router } from 'express'
import { one, all, run, empOut, uuid } from '../db.js'
import { requireAuth } from '../auth.js'
import { TOPICS } from '../engine.js'

const router = Router()
router.use(requireAuth)
const cid = (req) => req.user.company_id
const clean = (s) => (typeof s === 'string' ? s.trim() : '')
const validTopics = (arr) => Array.isArray(arr) ? arr.filter((t) => TOPICS.some((x) => x.id === t)) : []

function genCode(len = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code
  do { code = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('') }
  while (one('SELECT id FROM employees WHERE code=?', code))
  return code
}

// GET /api/employees
router.get('/', (req, res) => {
  res.json(all('SELECT * FROM employees WHERE company_id=? ORDER BY joined_at DESC', cid(req)).map(empOut))
})

// POST /api/employees  { name, role, team, email }
router.post('/', (req, res) => {
  const name = clean(req.body.name)
  if (!name) return res.status(400).json({ error: 'Name is required.' })
  const id = uuid()
  run(`INSERT INTO employees(id, company_id, name, role, team, email, code, topics, status, joined_at, last_active, questions)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
    id, cid(req), name, clean(req.body.role) || 'Staff', clean(req.body.team) || 'Field',
    clean(req.body.email) || `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@company.com`,
    genCode(), '[]', 'invited', Date.now(), null, 0)
  res.status(201).json(empOut(one('SELECT * FROM employees WHERE id=?', id)))
})

// PATCH /api/employees/:id  { topics?, role?, team?, name? }
router.patch('/:id', (req, res) => {
  const e = one('SELECT * FROM employees WHERE id=? AND company_id=?', req.params.id, cid(req))
  if (!e) return res.status(404).json({ error: 'Not found' })
  const topics = req.body.topics !== undefined ? JSON.stringify(validTopics(req.body.topics)) : e.topics
  const name = clean(req.body.name) || e.name
  const role = req.body.role !== undefined ? clean(req.body.role) : e.role
  const team = req.body.team !== undefined ? clean(req.body.team) : e.team
  run('UPDATE employees SET topics=?, name=?, role=?, team=? WHERE id=?', topics, name, role, team, e.id)
  res.json(empOut(one('SELECT * FROM employees WHERE id=?', e.id)))
})

// DELETE /api/employees/:id
router.delete('/:id', (req, res) => {
  const e = one('SELECT id FROM employees WHERE id=? AND company_id=?', req.params.id, cid(req))
  if (!e) return res.status(404).json({ error: 'Not found' })
  run('DELETE FROM employees WHERE id=?', e.id)
  res.json({ ok: true })
})

export default router
