// Encrypt provider tokens at rest. AES-256-GCM with a key derived from
// CLERX_SECRET (set a strong value in production; dev falls back to a constant).
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto'

const secret = process.env.CLERX_SECRET || 'clerx-dev-secret-change-me'
const key = createHash('sha256').update(secret).digest() // 32 bytes

export function encrypt(text) {
  if (text == null) return null
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decrypt(blob) {
  if (!blob) return null
  try {
    const buf = Buffer.from(blob, 'base64')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const enc = buf.subarray(28)
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}
