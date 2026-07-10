// Real Notion API client. Uses an internal-integration token (per company):
// the leader creates an integration at notion.so/my-integrations, shares pages
// with it, and pastes the token. We validate it, list shared pages, and pull
// their text. No OAuth review needed for internal integrations.

const BASE = 'https://api.notion.com/v1'
const VERSION = '2022-06-28'

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Notion-Version': VERSION,
    'Content-Type': 'application/json',
  }
}

async function call(token, path, opts = {}) {
  let res
  try {
    res = await fetch(BASE + path, { ...opts, headers: headers(token) })
  } catch {
    const err = new Error("Couldn't reach Notion. Check the server's internet connection.")
    err.status = 502
    throw err
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(friendly(res.status, data?.message))
    err.status = res.status
    throw err
  }
  return data
}

function friendly(status, message) {
  if (status === 401) return 'That Notion token is invalid or was revoked. Copy it again from your integration settings.'
  if (status === 403) return "The token is valid but hasn't been given access to any pages. Share a page with your integration, then retry."
  if (status === 429) return 'Notion is rate-limiting the sync. Wait a moment and re-sync.'
  return message || `Notion API error (${status}).`
}

// Confirm the token works and return the workspace/bot name.
export async function validateToken(token) {
  const me = await call(token, '/users/me')
  const name = me?.bot?.workspace_name || me?.name || 'Notion workspace'
  return { id: me?.id, name }
}

function titleOf(page) {
  const props = page.properties || {}
  for (const key of Object.keys(props)) {
    const p = props[key]
    if (p?.type === 'title' && Array.isArray(p.title)) {
      const t = p.title.map((x) => x.plain_text).join('').trim()
      if (t) return t
    }
  }
  if (page.child_page?.title) return page.child_page.title
  return 'Untitled'
}

// List pages shared with the integration (most-recently-edited first).
export async function listPages(token, max = 25) {
  const pages = []
  let cursor
  while (pages.length < max) {
    const body = {
      page_size: 50,
      filter: { value: 'page', property: 'object' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
    }
    if (cursor) body.start_cursor = cursor
    const data = await call(token, '/search', { method: 'POST', body: JSON.stringify(body) })
    for (const r of data.results || []) {
      pages.push({
        id: r.id,
        title: titleOf(r),
        url: r.url,
        editedAt: Date.parse(r.last_edited_time || '') || null,
      })
      if (pages.length >= max) break
    }
    if (!data.has_more) break
    cursor = data.next_cursor
  }
  return pages
}

// Pull readable text from a page's blocks (one level of nesting, char-capped).
export async function fetchPageText(token, pageId, { maxChars = 4000, depth = 1 } = {}) {
  let text = ''
  let cursor
  try {
    do {
      const q = cursor ? `?start_cursor=${cursor}&page_size=100` : '?page_size=100'
      const data = await call(token, `/blocks/${pageId}/children${q}`)
      for (const b of data.results || []) {
        const block = b[b.type]
        if (block?.rich_text?.length) {
          text += block.rich_text.map((r) => r.plain_text).join('') + '\n'
        }
        if (b.has_children && depth > 0 && text.length < maxChars) {
          text += await fetchPageText(token, b.id, { maxChars, depth: depth - 1 })
        }
        if (text.length >= maxChars) return text.slice(0, maxChars)
      }
      cursor = data.has_more ? data.next_cursor : null
    } while (cursor)
  } catch {
    // A single unreadable page shouldn't fail the whole sync.
  }
  return text.slice(0, maxChars)
}

// Validate + list + fetch text for up to `max` pages.
export async function ingest(token, { max = 25 } = {}) {
  const workspace = await validateToken(token)
  const pages = await listPages(token, max)
  const docs = []
  for (const p of pages) {
    const content = await fetchPageText(token, p.id)
    docs.push({ externalId: p.id, title: p.title, url: p.url, content, editedAt: p.editedAt })
  }
  return { workspace, docs }
}
