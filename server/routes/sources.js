import { Router } from 'express'
import { one, all, run, sourceOut, uuid } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)
const cid = (req) => req.user.company_id

const KINDS = {
  drive: 'Google Drive', slack: 'Slack', notion: 'Notion', upload: 'Uploaded files',
}

// GET /api/sources
router.get('/', (req, res) => {
  res.json(all('SELECT * FROM sources WHERE company_id=? ORDER BY rowid', cid(req)).map(sourceOut))
})

// POST /api/sources  { kind } → simulated connect + index
router.post('/', (req, res) => {
  const kind = req.body.kind
  if (!KINDS[kind]) return res.status(400).json({ error: 'Unknown source.' })
  if (one('SELECT id FROM sources WHERE company_id=? AND kind=?', cid(req), kind))
    return res.status(409).json({ error: 'Already connected.' })
  const id = uuid()
  const docs = 20 + Math.floor(Math.random() * 180)
  run('INSERT INTO sources(id, company_id, kind, name, docs, last_sync) VALUES(?,?,?,?,?,?)',
    id, cid(req), kind, KINDS[kind], docs, Date.now())
  res.status(201).json(sourceOut(one('SELECT * FROM sources WHERE id=?', id)))
})

// POST /api/sources/:kind/resync
router.post('/:kind/resync', (req, res) => {
  const s = one('SELECT * FROM sources WHERE company_id=? AND kind=?', cid(req), req.params.kind)
  if (!s) return res.status(404).json({ error: 'Not found' })
  run('UPDATE sources SET last_sync=? WHERE id=?', Date.now(), s.id)
  res.json(sourceOut(one('SELECT * FROM sources WHERE id=?', s.id)))
})

export default router
