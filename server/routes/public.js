import { Router } from 'express'
import { one, all, run, uuid, empOut, companyOut } from '../db.js'
import { TOPICS, answerFor, answerFromDocs, contextForLLM } from '../engine.js'
import { answerWithLLM } from '../llm.js'

const router = Router()

// GET /api/topics
router.get('/topics', (_req, res) => res.json(TOPICS))

// POST /api/join  { code } → employee identity + company + allowed topics
router.post('/join', (req, res) => {
  const code = (req.body.code || '').trim().toUpperCase()
  if (!code) return res.status(400).json({ error: 'Enter your join code.' })
  const row = one('SELECT * FROM employees WHERE code=?', code)
  if (!row) return res.status(404).json({ error: "That code isn't on file. Check with your team lead." })
  if (row.status === 'invited') run('UPDATE employees SET status=? WHERE id=?', 'active', row.id)
  const company = companyOut(one('SELECT * FROM companies WHERE id=?', row.company_id))
  res.json({ employee: empOut(one('SELECT * FROM employees WHERE id=?', row.id)), company, topics: TOPICS })
})

// POST /api/ask  { code, question } → scoped answer, logged to activity
router.post('/ask', async (req, res) => {
  const code = (req.body.code || '').trim().toUpperCase()
  const question = (req.body.question || '').trim()
  if (!code || !question) return res.status(400).json({ error: 'Missing code or question.' })
  const emp = one('SELECT * FROM employees WHERE code=?', code)
  if (!emp) return res.status(404).json({ error: 'Unknown employee code.' })

  const allowed = JSON.parse(emp.topics || '[]')
  const company = companyOut(one('SELECT * FROM companies WHERE id=?', emp.company_id))
  // Prefer the company's REAL indexed documents (e.g. Notion). The answer engine
  // is a fallback chain, each step degrading gracefully to the next:
  //   1. LLM synthesis over the employee's ALLOWED docs — semantic + in the
  //      company's voice. Returns null with no key, on a miss, or on API error.
  //   2. Keyword search over all docs — surfaces a hit, or a "not cleared for
  //      that topic" notice when the best match sits outside their permissions.
  //   3. The built-in starter knowledge base.
  // contextForLLM is topic-gated, so the model never sees content the employee
  // isn't cleared for — permissions stay server-enforced and fail-closed.
  const docs = all('SELECT title, url, content, topic, source_kind FROM documents WHERE company_id=?', emp.company_id)
  const result =
    (await answerWithLLM(question, contextForLLM(question, allowed, docs), company)) ||
    answerFromDocs(question, allowed, docs) ||
    answerFor(question, allowed)

  run('UPDATE employees SET questions = questions + 1, last_active=? WHERE id=?', Date.now(), emp.id)
  if (result.topic) {
    run('INSERT INTO activity(id, company_id, emp_id, emp_name, question, topic, blocked, ts) VALUES(?,?,?,?,?,?,?,?)',
      uuid(), emp.company_id, emp.id, emp.name, question, result.topic, result.blocked ? 1 : 0, Date.now())
  }
  res.json(result)
})

export default router
