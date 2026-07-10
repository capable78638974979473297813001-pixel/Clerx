import { Router } from 'express'
import { one, all, run, sourceOut, sourceOutFull, uuid } from '../db.js'
import { requireAuth } from '../auth.js'
import { encrypt, decrypt } from '../crypto.js'
import { classifyTopic } from '../engine.js'
import * as notion from '../notion.js'
import * as slack from '../slack.js'
import * as oauth from '../oauth.js'

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
  const { label } = PROVIDERS[kind]
  const token = (req.body.token || '').trim()
  if (!token) return res.status(400).json({ error: `Paste your ${label} token.` })
  try {
    const src = await ingestAndStore(cid(req), kind, token)
    res.status(201).json(src)
  } catch (e) {
    res.status(e.status && e.status < 500 ? 400 : 502).json({ error: e.message })
  }
}

// Validate the token, pull + index content, and upsert the source (idempotent
// so an OAuth reconnect replaces cleanly). Throws (with .status) on failure.
async function ingestAndStore(companyId, kind, token) {
  const { mod, label } = PROVIDERS[kind]
  const result = await mod.ingest(token)
  if (result.docs.length === 0) { const e = new Error(emptyMessage(kind)); e.status = 400; throw e }

  const existing = one('SELECT id FROM sources WHERE company_id=? AND kind=?', companyId, kind)
  const id = existing?.id || uuid()
  const name = `${label} · ${result.workspace.name}`
  const config = JSON.stringify({ token: encrypt(token), workspace: result.workspace.name })
  if (existing) {
    run('UPDATE sources SET name=?, docs=?, last_sync=?, config=? WHERE id=?',
      name, result.docs.length, Date.now(), config, id)
    run('DELETE FROM documents WHERE company_id=? AND source_kind=?', companyId, kind)
  } else {
    run('INSERT INTO sources(id, company_id, kind, name, docs, last_sync, config) VALUES(?,?,?,?,?,?,?)',
      id, companyId, kind, name, result.docs.length, Date.now(), config)
  }
  indexDocs(companyId, kind, result.docs)
  return sourceOutFull(one('SELECT * FROM sources WHERE id=?', id))
}

/* ---------------- One-click OAuth ---------------- */

// GET /api/sources/oauth/config → which providers support one-click connect.
router.get('/oauth/config', (_req, res) => res.json(oauth.configuredMap()))

// GET /api/sources/oauth/:provider/start?return=/path → redirect to the provider.
router.get('/oauth/:provider/start', (req, res) => {
  const provider = req.params.provider
  if (!oauth.isConfigured(provider)) return res.status(404).json({ error: 'This provider is not available for one-click connect.' })
  const state = uuid()
  const returnTo = typeof req.query.return === 'string' && req.query.return.startsWith('/') ? req.query.return : '/app/knowledge'
  res.cookie('clerx_oauth', JSON.stringify({ provider, state, returnTo }), {
    httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000, path: '/',
  })
  res.redirect(oauth.authorizeUrl(provider, { state }))
})

// GET /api/sources/oauth/:provider/callback?code=&state= → exchange + index.
router.get('/oauth/:provider/callback', async (req, res) => {
  const provider = req.params.provider
  let saved = {}
  try { saved = JSON.parse(req.cookies?.clerx_oauth || '{}') } catch { /* ignore */ }
  res.clearCookie('clerx_oauth', { path: '/' })

  const bounce = (params) => res.redirect(`${saved.returnTo || '/app/knowledge'}?${new URLSearchParams(params)}`)

  if (req.query.error) return bounce({ source_error: 'Authorization was cancelled.' })
  if (!req.query.code || saved.provider !== provider || saved.state !== req.query.state)
    return bounce({ source_error: 'That connection request expired. Try again.' })

  try {
    const { token, workspaceName } = await oauth.exchangeCode(provider, req.query.code)
    void workspaceName // ingest re-derives the workspace name
    await ingestAndStore(cid(req), provider, token)
    bounce({ connected: provider })
  } catch (e) {
    bounce({ source_error: e.message || 'Connection failed.' })
  }
})

function emptyMessage(kind) {
  if (kind === 'notion') return "The token works, but no pages are shared with it yet. In Notion, open a page → ••• → Connections → add your integration, then retry."
  if (kind === 'slack') return "The token works, but the bot can't read any channels yet. In Slack, run /invite @YourApp in the channels Clerx should read, then retry."
  return 'The token works, but nothing is shared with it yet.'
}

// POST /api/sources/upload/files  { files: [{ name, content }] }
// Real text upload: the browser reads the files and sends their text; we index
// it like any other document. Appends to the existing upload source if present.
router.post('/upload/files', (req, res) => {
  const files = Array.isArray(req.body.files) ? req.body.files.slice(0, 20) : []
  if (!files.length) return res.status(400).json({ error: 'No files provided.' })

  let src = one('SELECT * FROM sources WHERE company_id=? AND kind=?', cid(req), 'upload')
  if (!src) {
    const id = uuid()
    run('INSERT INTO sources(id, company_id, kind, name, docs, last_sync) VALUES(?,?,?,?,?,?)',
      id, cid(req), 'upload', 'Uploaded files', 0, Date.now())
    src = one('SELECT * FROM sources WHERE id=?', id)
  }

  let added = 0
  for (const f of files) {
    const name = String(f.name || 'file').slice(0, 200)
    const content = String(f.content || '').slice(0, 20000)
    if (!content.trim()) continue
    const topic = classifyTopic(`${name}\n${content}`)
    run('INSERT INTO documents(id, company_id, source_kind, external_id, title, url, content, topic, updated_at) VALUES(?,?,?,?,?,?,?,?,?)',
      uuid(), cid(req), 'upload', uuid(), name, null, content, topic, Date.now())
    added++
  }
  if (!added) return res.status(400).json({ error: 'Those files had no readable text.' })

  const total = one('SELECT COUNT(*) AS n FROM documents WHERE company_id=? AND source_kind=?', cid(req), 'upload').n
  run('UPDATE sources SET docs=?, last_sync=? WHERE id=?', total, Date.now(), src.id)
  res.status(201).json({ ...sourceOutFull(one('SELECT * FROM sources WHERE id=?', src.id)), added })
})

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
