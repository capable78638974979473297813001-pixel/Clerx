// One-click OAuth for real sources. Gated on per-provider client credentials
// (env). When they're absent the UI falls back to the paste-a-token flow, so
// nothing breaks — adding the env vars simply upgrades the experience.
//
// Register ONE Clerx app per provider and set:
//   CLERX_SLACK_CLIENT_ID / CLERX_SLACK_CLIENT_SECRET
//   CLERX_NOTION_CLIENT_ID / CLERX_NOTION_CLIENT_SECRET
//   CLERX_BASE_URL  (default http://localhost:5175) — must match the app's
//                    registered redirect URL, path /api/sources/oauth/<p>/callback

const BASE_URL = () => (process.env.CLERX_BASE_URL || 'http://localhost:5175').replace(/\/$/, '')
export const redirectUri = (provider) => `${BASE_URL()}/api/sources/oauth/${provider}/callback`

const CFG = {
  slack: {
    id: () => process.env.CLERX_SLACK_CLIENT_ID,
    secret: () => process.env.CLERX_SLACK_CLIENT_SECRET,
    // channels:join lets the bot add itself to public channels (no /invite).
    scope: 'channels:read,channels:history,channels:join',
    authorize({ state }) {
      const q = new URLSearchParams({
        client_id: this.id(), scope: this.scope, redirect_uri: redirectUri('slack'), state,
      })
      return `https://slack.com/oauth/v2/authorize?${q}`
    },
    async exchange(code) {
      const res = await fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.id(), client_secret: this.secret(), code, redirect_uri: redirectUri('slack'),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!data.ok) throw new Error(data.error || 'Slack authorization failed.')
      return { token: data.access_token, workspaceName: data.team?.name || 'Slack workspace' }
    },
  },

  notion: {
    id: () => process.env.CLERX_NOTION_CLIENT_ID,
    secret: () => process.env.CLERX_NOTION_CLIENT_SECRET,
    authorize({ state }) {
      const q = new URLSearchParams({
        client_id: this.id(), response_type: 'code', owner: 'user',
        redirect_uri: redirectUri('notion'), state,
      })
      return `https://api.notion.com/v1/oauth/authorize?${q}`
    },
    async exchange(code) {
      const basic = Buffer.from(`${this.id()}:${this.secret()}`).toString('base64')
      const res = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
        body: JSON.stringify({ grant_type: 'authorization_code', code, redirect_uri: redirectUri('notion') }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.access_token) throw new Error(data.error_description || data.error || 'Notion authorization failed.')
      return { token: data.access_token, workspaceName: data.workspace_name || 'Notion workspace' }
    },
  },
}

export const providers = () => Object.keys(CFG)
export const isConfigured = (provider) => !!(CFG[provider]?.id() && CFG[provider]?.secret())
export const configuredMap = () => Object.fromEntries(providers().map((p) => [p, isConfigured(p)]))

export function authorizeUrl(provider, { state }) {
  if (!isConfigured(provider)) throw new Error(`${provider} OAuth is not configured.`)
  return CFG[provider].authorize({ state })
}
export function exchangeCode(provider, code) {
  return CFG[provider].exchange(code)
}
