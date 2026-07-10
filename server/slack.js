// Real Slack API client. Uses a Bot User OAuth Token (xoxb-…): the admin
// creates a Slack app, adds channels:read + channels:history scopes, installs
// it to their workspace, invites the bot to channels, and pastes the token.
// Each channel becomes one indexed document (recent messages joined).

const BASE = 'https://slack.com/api/'

async function call(token, method, params = {}, httpMethod = 'GET') {
  let res
  try {
    if (httpMethod === 'GET') {
      const qs = new URLSearchParams(params).toString()
      res = await fetch(BASE + method + (qs ? `?${qs}` : ''), {
        headers: { Authorization: `Bearer ${token}` },
      })
    } else {
      res = await fetch(BASE + method, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
      })
    }
  } catch {
    const err = new Error("Couldn't reach Slack. Check the server's internet connection.")
    err.status = 502
    throw err
  }
  // Slack returns HTTP 200 even for API errors; the real status is in `ok`.
  const data = await res.json().catch(() => ({}))
  if (!data.ok) {
    const err = new Error(friendly(data.error, data.needed))
    err.status = data.error === 'ratelimited' ? 429 : 400
    throw err
  }
  return data
}

function friendly(error, needed) {
  switch (error) {
    case 'invalid_auth':
    case 'not_authed':
    case 'token_revoked':
    case 'token_expired':
      return 'That Slack token is invalid or was revoked. Reinstall the app and copy the Bot User OAuth Token again.'
    case 'account_inactive':
      return "This token's Slack app has been disabled. Re-enable or reinstall it."
    case 'missing_scope':
      return `Your Slack app is missing a permission${needed ? ` (needs: ${needed})` : ' (needs channels:read and channels:history)'}. Add the scope, reinstall the app, and copy the new token.`
    case 'ratelimited':
      return 'Slack is rate-limiting the sync. Wait a moment and re-sync.'
    default:
      return error ? `Slack API error: ${error}.` : 'Slack API error.'
  }
}

export async function validateToken(token) {
  const auth = await call(token, 'auth.test', {}, 'POST')
  return { id: auth.team_id, name: auth.team || 'Slack workspace', url: auth.url }
}

// Public channels, most recent first. Only members' channels are readable, but
// we list all and skip the ones we can't read during history fetch.
export async function listChannels(token, max = 20) {
  const channels = []
  let cursor
  while (channels.length < max) {
    const params = { types: 'public_channel', exclude_archived: 'true', limit: '200' }
    if (cursor) params.cursor = cursor
    const data = await call(token, 'conversations.list', params)
    for (const c of data.channels || []) {
      channels.push({ id: c.id, name: c.name, isMember: !!c.is_member })
      if (channels.length >= max) break
    }
    cursor = data.response_metadata?.next_cursor
    if (!cursor) break
  }
  // Prefer channels the bot is already in (those are readable).
  channels.sort((a, b) => Number(b.isMember) - Number(a.isMember))
  return channels
}

export async function fetchChannelText(token, channelId, { limit = 100, maxChars = 4000 } = {}) {
  let data
  try {
    data = await call(token, 'conversations.history', { channel: channelId, limit: String(limit) })
  } catch {
    return '' // not_in_channel or similar → skip this channel
  }
  const lines = []
  for (const m of (data.messages || [])) {
    if (m.type !== 'message' || m.subtype || !m.text) continue
    lines.push(m.text.replace(/<@[A-Z0-9]+>/g, '@someone').replace(/\s+/g, ' ').trim())
  }
  return lines.reverse().join('\n').slice(0, maxChars) // oldest→newest reads better
}

export async function ingest(token, { maxChannels = 15 } = {}) {
  const workspace = await validateToken(token)
  const channels = await listChannels(token, maxChannels)
  const docs = []
  const teamUrl = (workspace.url || '').replace(/\/$/, '')
  for (const c of channels) {
    const content = await fetchChannelText(token, c.id)
    if (!content) continue // unreadable / empty channel
    docs.push({
      externalId: c.id,
      title: `#${c.name}`,
      url: teamUrl ? `${teamUrl}/archives/${c.id}` : null,
      content,
      editedAt: Date.now(),
    })
  }
  return { workspace, docs }
}
