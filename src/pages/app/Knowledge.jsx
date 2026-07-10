import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { Button, Stamp, Card, Icon } from '../../components/ui'
import { useToast, Bar } from '../../components/kit'
import { ProviderConnectModal } from '../../components/ProviderConnect'
import { UploadModal } from '../../components/UploadModal'
import { TOPICS, timeAgo } from '../../lib/store'
import { api } from '../../lib/api'

const SOURCE_META = {
  drive: { icon: Icon.drive, files: ['Employee Handbook 2026.gdoc', 'Q3 Budget.gsheet', 'Site Safety Plan.gdoc', 'Supplier Contracts.gsheet'] },
  slack: { icon: Icon.slack, files: ['#field-ops archive', '#finance-questions', '#general announcements'] },
  notion: { icon: Icon.notion, files: ['Company Wiki', 'Onboarding Guide', 'Pricing Playbook'] },
  upload: { icon: Icon.file, files: ['insurance-policy.pdf', 'PPE-checklist.pdf', 'client-MSA-template.docx'] },
}
const ALL = [
  { id: 'drive', name: 'Google Drive', desc: 'Docs, sheets, slides' },
  { id: 'slack', name: 'Slack', desc: 'Channels & threads' },
  { id: 'notion', name: 'Notion', desc: 'Wikis & pages' },
  { id: 'upload', name: 'Uploaded files', desc: 'PDF, DOCX, CSV' },
]

export default function Knowledge() {
  const { state, reload } = useOutletContext()
  const toast = useToast()
  const [busy, setBusy] = useState(null)
  const [connectKind, setConnectKind] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const sources = state.sources
  const totalDocs = sources.reduce((a, s) => a + s.docs, 0)

  // Show the result of an OAuth round-trip (redirect back with ?connected / ?source_error).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const done = p.get('connected'); const err = p.get('source_error')
    if (!done && !err) return
    if (done) { toast(`${ALL.find((a) => a.id === done)?.name || done} connected`); reload() }
    else toast(err, { tone: 'stamp' })
    window.history.replaceState({}, '', '/app/knowledge')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connect = async (src) => {
    if (sources.find((s) => s.id === src.id) || busy) return
    if (src.id === 'notion' || src.id === 'slack') {
      if (state.oauth?.[src.id]) { window.location.href = `/api/sources/oauth/${src.id}/start?return=${encodeURIComponent('/app/knowledge')}`; return } // one-click
      setConnectKind(src.id); return // fall back to paste-a-token modal
    }
    if (src.id === 'upload') { setUploadOpen(true); return } // real file upload
    setBusy(src.id)
    // brief delay so the "indexing" feels real
    await new Promise((r) => setTimeout(r, 1100))
    try { await api.connectSource(src.id); await reload(); toast(`${src.name} connected`) }
    catch (e) { toast(e.message, { tone: 'stamp' }) }
    finally { setBusy(null) }
  }
  const resync = async (id) => {
    try { await api.resyncSource(id); await reload(); toast('Re-synced') }
    catch (e) { toast(e.message, { tone: 'stamp' }) }
  }

  return (
    <div>
      <PageHead no="02" kicker="The archive" title="Knowledge" sub={`${totalDocs.toLocaleString()} items filed across ${sources.length} sources`} />

      {/* connected sources */}
      <div className="grid gap-3 sm:grid-cols-2">
        {sources.map((s) => {
          const meta = SOURCE_META[s.id] || {}
          const Ic = meta.icon || Icon.folder
          return (
            <Card key={s.id} className="p-4 shadow-hard">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2"><Ic size={20} /></span>
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">{s.docs} items · synced {timeAgo(s.lastSync)}</div>
                </div>
                <Stamp tone="ledger" rotate={-3} className="!text-[0.56rem]"><Icon.dot size={9} /> {s.real ? 'Real' : 'Live'}</Stamp>
              </div>
              <div className="mt-3 space-y-1 border-t-[1.5px] border-ink/12 pt-3">
                {((s.files && s.files.length ? s.files : meta.files) || []).slice(0, 3).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-ink-soft"><Icon.file size={13} className="text-ink-faint" /> <span className="truncate">{f}</span></div>
                ))}
              </div>
              {s.id === 'upload'
                ? <button onClick={() => setUploadOpen(true)} className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft hover:text-ink"><Icon.plus size={13} /> Add more files</button>
                : <button onClick={() => resync(s.id)} className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft hover:text-ink"><Icon.arrowUR size={13} /> Re-sync now</button>}
            </Card>
          )
        })}
      </div>

      {/* available to connect */}
      {ALL.some((a) => !sources.find((s) => s.id === a.id)) && (
        <>
          <h2 className="mb-3 mt-8 font-mono text-[12px] uppercase tracking-widest text-ink-soft">Connect another source</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ALL.filter((a) => !sources.find((s) => s.id === a.id)).map((src) => {
              const Ic = SOURCE_META[src.id].icon
              return (
                <button key={src.id} onClick={() => connect(src)} disabled={busy === src.id}
                  className="flex items-center gap-3 rounded-xl border-[1.5px] border-dashed border-ink/40 bg-paper p-4 text-left transition hover:border-solid hover:shadow-hard">
                  <span className="grid h-11 w-11 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2"><Ic size={20} /></span>
                  <div className="flex-1">
                    <div className="font-semibold">{src.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">{src.desc}</div>
                  </div>
                  {busy === src.id ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" /> : <Icon.plus size={18} className="text-ink-faint" />}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* how it's filed */}
      <h2 className="mb-3 mt-8 font-mono text-[12px] uppercase tracking-widest text-ink-soft">How it's filed</h2>
      <Card className="p-5 shadow-hard">
        <p className="mb-4 text-[13px] text-ink-soft">Every item is auto-sorted into a topic. Clearances are granted per topic, so this is what gates each answer.</p>
        <div className="space-y-3">
          {TOPICS.map((t, i) => {
            const share = [26, 22, 16, 14, 12, 10][i]
            return (
              <div key={t.id}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 font-medium"><span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} /> {t.label}</span>
                  <span className="font-mono text-ink-soft">{Math.round(totalDocs * share / 100)} items</span>
                </div>
                <Bar value={share * 3} color={t.color} />
              </div>
            )
          })}
        </div>
      </Card>

      <ProviderConnectModal provider={connectKind} open={!!connectKind} onClose={() => setConnectKind(null)} onConnected={() => reload()} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={() => reload()} />
    </div>
  )
}
