import { useState } from 'react'
import { Modal, useToast } from './kit'
import { Button, Field, Input, Icon } from './ui'
import { api } from '../lib/api'

// Presets for each real, token-based source.
const PROVIDERS = {
  notion: {
    title: 'Connect Notion',
    noun: 'page',
    placeholder: 'ntn_… (or older secret_…)',
    connect: (t) => api.connectNotion(t),
    steps: [
      <>Go to <b>notion.so/my-integrations</b> → <b>New integration</b> → copy the <b>Internal Integration Secret</b>.</>,
      <>Open each page you want Clerx to read → <b>•••</b> menu → <b>Connections</b> → add your integration.</>,
      <>Paste the token below. Clerx reads those pages and files them into topics.</>,
    ],
  },
  slack: {
    title: 'Connect Slack',
    noun: 'channel',
    placeholder: 'xoxb-…',
    connect: (t) => api.connectSlack(t),
    steps: [
      <>Go to <b>api.slack.com/apps</b> → <b>Create New App</b> → <b>From scratch</b>, pick your workspace.</>,
      <><b>OAuth &amp; Permissions</b> → add Bot Token Scopes <b>channels:read</b> and <b>channels:history</b> → <b>Install to Workspace</b>.</>,
      <>Copy the <b>Bot User OAuth Token</b> (<b>xoxb-…</b>). In Slack, run <b>/invite @YourApp</b> in the channels Clerx should read.</>,
      <>Paste the token below.</>,
    ],
  },
}

// Generic modal for connecting a real source via a pasted token.
export function ProviderConnectModal({ provider, open, onClose, onConnected }) {
  const cfg = PROVIDERS[provider]
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const toast = useToast()
  if (!cfg) return null

  const connect = async () => {
    if (!token.trim()) return
    setErr(''); setBusy(true)
    try {
      const src = await cfg.connect(token.trim())
      toast(`${src.name} connected — ${src.docs} ${cfg.noun}${src.docs !== 1 ? 's' : ''} filed`)
      onConnected?.(src)
      setToken(''); onClose()
    } catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={cfg.title} width="max-w-lg"
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={connect} disabled={!token.trim() || busy}>
          {busy ? 'Reading…' : <>Connect &amp; index <Icon.arrow size={16} /></>}
        </Button>
      </>}>
      <ol className="mb-5 space-y-2.5">
        {cfg.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-ink-soft">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-[1.5px] border-ink bg-paper-2 font-mono text-[11px] font-bold">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <Field label="Access token">
        <Input value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && connect()}
          placeholder={cfg.placeholder} className="font-mono text-[13px]" disabled={busy} autoFocus />
      </Field>

      {busy && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border-[1.5px] border-ink bg-paper-2 px-3.5 py-2.5 font-mono text-[12px] text-ink-soft">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          Validating token, pulling {cfg.noun}s &amp; sorting into topics…
        </div>
      )}
      {err && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border-[1.5px] border-stamp bg-stamp/8 px-3.5 py-2.5 text-[13px] text-stamp-deep">
          <Icon.x size={15} className="mt-0.5 shrink-0" /> <span>{err}</span>
        </div>
      )}
      <p className="mt-4 border-t-[1.5px] border-ink/12 pt-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        Your token is encrypted before it's stored and never leaves the server.
      </p>
    </Modal>
  )
}
