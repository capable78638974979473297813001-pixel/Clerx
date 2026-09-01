// Optional LLM answer layer. When an Anthropic key is present, Clerx reads the
// employee's ALLOWED documents (topic-gated by the caller — this module never
// sees content the employee isn't cleared for) and writes the answer in the
// company's voice, citing the source. With no key it returns null and the
// caller falls back to the deterministic keyword engine — the app always works.
import Anthropic from '@anthropic-ai/sdk'

const KEY = process.env.ANTHROPIC_API_KEY || process.env.CLERX_ANTHROPIC_API_KEY || ''
const MODEL = process.env.CLERX_LLM_MODEL || 'claude-opus-4-8'
const client = KEY ? new Anthropic({ apiKey: KEY }) : null

export const hasLLM = () => !!client

const WHERE = { notion: 'from Notion', slack: 'from Slack', upload: 'from an uploaded file' }
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s }

// The model returns which source it used and whether the docs answered at all,
// so the caller can cite the source and fall through cleanly on a miss.
const SCHEMA = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    answer: { type: 'string' },
    source_index: { type: 'integer' },
  },
  required: ['found', 'answer', 'source_index'],
  additionalProperties: false,
}

// Answer `question` from `docs` (already permission-filtered by the caller).
// Returns a result shaped like the keyword engine's, or null on no key / no
// docs / a miss / any API error — so callers can `answerWithLLM(...) || fallback`.
export async function answerWithLLM(question, docs, company) {
  if (!client || !docs?.length) return null

  const companyName = company?.name || 'the company'
  const sources = docs
    .map((d, i) => `[${i}] ${d.title || 'Untitled'} (${WHERE[d.source_kind] || 'from your records'})\n${clip(d.content, 4000)}`)
    .join('\n\n---\n\n')

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        `You are Clerx, ${companyName}'s internal knowledge assistant, answering an employee's question. ` +
        'Answer ONLY from the company documents provided in the user message — never use outside knowledge, and never invent facts. ' +
        'If the documents do not contain the answer, set found to false. ' +
        `Write in the voice of ${companyName}'s leadership: direct, warm, and practical, as if the founder were replying in person. ` +
        'Keep it to a few sentences. Set source_index to the [number] of the single document your answer draws from.',
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: `Documents:\n\n${sources}\n\nEmployee question: ${question}` }],
    })

    const text = res.content.find((b) => b.type === 'text')?.text || ''
    const out = JSON.parse(text)
    if (!out.found || typeof out.answer !== 'string' || !out.answer.trim()) return null

    const src = docs[out.source_index] || null
    return {
      blocked: false,
      topic: src?.topic || null,
      source: src ? { title: src.title, url: src.url, kind: src.source_kind } : undefined,
      text: out.answer.trim(),
      llm: true,
    }
  } catch (e) {
    console.error('[clerx] LLM answer failed, falling back to keyword engine:', e.message)
    return null
  }
}
