import { useRef, useState } from 'react'
import { Modal, useToast } from './kit'
import { Button, Icon } from './ui'
import { api } from '../lib/api'

const ACCEPT = '.txt,.md,.markdown,.csv,.tsv,.json,.log,.rtf,.yml,.yaml'
const MAX_BYTES = 400_000 // per file, read as text

const readText = (file) => new Promise((resolve) => {
  const r = new FileReader()
  r.onload = () => resolve(String(r.result || ''))
  r.onerror = () => resolve('')
  r.readAsText(file.slice(0, MAX_BYTES))
})

// Real text-file upload: files are read in the browser and their text is
// indexed server-side (same pipeline as Notion/Slack). Binary formats (PDF,
// DOCX) need a parser and aren't supported yet.
export function UploadModal({ open, onClose, onUploaded }) {
  const [items, setItems] = useState([]) // { name, content, size }
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)
  const toast = useToast()

  const addFiles = async (fileList) => {
    setErr('')
    const files = [...fileList].slice(0, 20)
    const read = await Promise.all(files.map(async (f) => ({ name: f.name, size: f.size, content: await readText(f) })))
    setItems((prev) => {
      const names = new Set(prev.map((p) => p.name))
      return [...prev, ...read.filter((r) => r.content.trim() && !names.has(r.name))]
    })
  }

  const upload = async () => {
    if (!items.length) return
    setErr(''); setBusy(true)
    try {
      const src = await api.uploadFiles(items.map(({ name, content }) => ({ name, content })))
      toast(`${src.added} file${src.added !== 1 ? 's' : ''} filed`)
      onUploaded?.(src)
      setItems([]); onClose()
    } catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  const close = () => { if (!busy) { setItems([]); setErr(''); onClose() } }

  return (
    <Modal open={open} onClose={close} title="Upload files" width="max-w-lg"
      footer={<>
        <Button variant="ghost" onClick={close} disabled={busy}>Cancel</Button>
        <Button onClick={upload} disabled={!items.length || busy}>
          {busy ? 'Filing…' : <>File {items.length || ''} &amp; index <Icon.arrow size={16} /></>}
        </Button>
      </>}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`grid cursor-pointer place-items-center rounded-xl border-[1.5px] border-dashed px-6 py-8 text-center transition ${drag ? 'border-ink bg-paper-2' : 'border-ink/40 hover:border-ink hover:bg-paper-2'}`}>
        <span className="grid h-11 w-11 place-items-center rounded-lg border-[1.5px] border-ink bg-paper-2"><Icon.file size={20} /></span>
        <div className="mt-3 text-[14px] font-medium">Drop files here, or <span className="text-stamp">browse</span></div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">Text formats · TXT, MD, CSV, JSON, LOG</div>
        <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {items.map((f, i) => (
            <div key={f.name} className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-ink bg-paper-2 px-3 py-2">
              <Icon.file size={15} className="shrink-0 text-ink-soft" />
              <span className="flex-1 truncate text-[13px]">{f.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{Math.max(1, Math.round(f.size / 1024))} KB</span>
              <button onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} className="text-ink-faint hover:text-stamp"><Icon.x size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {err && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border-[1.5px] border-stamp bg-stamp/8 px-3.5 py-2.5 text-[13px] text-stamp-deep">
          <Icon.x size={15} className="mt-0.5 shrink-0" /> <span>{err}</span>
        </div>
      )}
      <p className="mt-4 border-t-[1.5px] border-ink/12 pt-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        Files are read in your browser and indexed on the server. PDF &amp; DOCX aren't supported yet.
      </p>
    </Modal>
  )
}
