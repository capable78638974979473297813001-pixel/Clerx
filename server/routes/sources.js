import { Router } from 'express'
import { one, all, run, sourceOut, sourceOutFull, uuid } from '../db.js'
import { requireAuth } from '../auth.js'
import { encrypt, decrypt } from '../crypto.js'
import { classifyTopic } from '../engine.js'
import * as notion from '../notion.js'
import * as slack from '../slack.js'

const router = Router()
router.use(requireAuth)
const cid = (req) => req.user.company_id

const KINDS = {
  drive: 'Google Drive', slack: 'Slack', notion: 'Notion', upload: 'Uploaded files',
}
// Real, token-based providers. Each module exposes ingest(token) → { workspace, docs }.
const PROVIDERS = {
  notion: { mod: notion, label: 'Notion' },
  slack: { mod: slack, label: 'Slack' },
}

// GET /api/sources
router.get('/', (req, res) => {
  res.json(all('SELECT * FROM sources WHERE company_id=? ORDER BY rowid', cid(req)).map(sourceOutFull))
})

// POST /api/sources  { kind, token? }
//   real providers (notion, slack) → validate token, pull + index content.
//   others → simulated connect + index.
router.post('/', async (req, res) => {
  const kind = req.body.kind
  if (!KINDS[kind]) return res.status(400).json({ error: 'Unknown source.' })
  if (one('SELECT id FROM sources WHERE company_id=? AND kind=?', cid(req), kind))
    return res.status(409).json({ error: 'Already connected.' })

  if (PROVIDERS[kind]) return connectProvider(req, res, kind)

  const id = uuid()
  const docs = 20 + Math.floor(Math.random() * 180)
  run('INSERT INTO sources(id, company_id, kind, name, docs, last_sync) VALUES(?,?,?,?,?,?)',
    id, cid(req), kind, KINDS[kind], docs, Date.now())
  res.status(201).json(sourceOut(one('SELECT * FROM sources WHERE id=?', id)))
})

async function connectProvider(req, res, kind) {
  const { mod, label } = PROVIDERS[kind]
  const token = (req.body.token || '').trim()
  if (!token) return res.status(400).json({ error: `Paste your ${label} token.` })

  let result
  try { result = await mod.ingest(token) }
  catch (e) { return res.status(e.status && e.status < 500 ? 400 : 502).json({ error: e.message }) }

  if (result.docs.length === 0)
    return res.status(400).json({ error: emptyMessage(kind) })

  const id = uuid()
  run('INSERT INTO sources(id, company_id, kind, name, docs, last_sync, config) VALUES(?,?,?,?,?,?,?)',
    id, cid(req), kind, `${label} · ${result.workspace.name}`, result.docs.length, Date.now(),
    JSON.stringify({ token: encrypt(token), workspace: result.workspace.name }))

  indexDocs(cid(req), kind, result.docs)
  res.status(201).json(sourceOutFull(one('SELECT * FROM sources WHERE id=?', id)))
}

function emptyMessage(kind) {
  if (kind === 'notion') return "The token works, but no pages are shared with it yet. In Notion, open a page → ••• → Connections → add your integration, then retry."
  if (kind === 'slack') return "The token works, but the bot can't read any channels yet. In Slack, run /invite @YourApp in the channels Clerx should read, then retry."
  return 'The token works, but nothing is shared with it yet.'
}

// POST /api/sources/:kind/resync
router.post('/:kind/resync', async (req, res) => {
  const kind = req.params.kind
  const s = one('SELECT * FROM sources WHERE company_id=? AND kind=?', cid(req), kind)
  if (!s) return res.status(404).json({ error: 'Not found' })

  if (PROVIDERS[kind]) {
    const cfg = JSON.parse(s.config || '{}')
    const token = decrypt(cfg.token)
    if (!token) return res.status(400).json({ error: `${PROVIDERS[kind].label} token missing — reconnect the source.` })
    let result
    try { result = await PROVIDERS[kind].mod.ingest(token) }
    catch (e) { return res.status(e.status && e.status < 500 ? 400 : 502).json({ error: e.message }) }
    run('DELETE FROM documents WHERE company_id=? AND source_kind=?', cid(req), kind)
    indexDocs(cid(req), kind, result.docs)
    run('UPDATE sources SET docs=?, last_sync=? WHERE id=?', result.docs.length, Date.now(), s.id)
    return res.json(sourceOutFull(one('SELECT * FROM sources WHERE id=?', s.id)))
  }

  run('UPDATE sources SET last_sync=? WHERE id=?', Date.now(), s.id)
  res.json(sourceOut(one('SELECT * FROM sources WHERE id=?', s.id)))
})

// Store fetched docs, classifying each into a topic by keyword.
function indexDocs(companyId, sourceKind, docs) {
  for (const d of docs) {
    const topic = classifyTopic(`${d.title}\n${d.content}`)
    run('INSERT INTO documents(id, company_id, source_kind, external_id, title, url, content, topic, updated_at) VALUES(?,?,?,?,?,?,?,?,?)',
      uuid(), companyId, sourceKind, d.externalId, d.title, d.url, d.content, topic, d.editedAt || Date.now())
  }
}

export default router
