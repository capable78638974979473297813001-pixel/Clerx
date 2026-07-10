import bcrypt from 'bcryptjs'
import { randomUUID, randomBytes } from 'node:crypto'
import { one, run } from './db.js'

const SESSION_DAYS = 30
const COOKIE = 'clerx_sid'

export const hashPassword = (pw) => bcrypt.hash(pw, 11)
export const checkPassword = (pw, hash) => bcrypt.compare(pw, hash)

export function createSession(res, userId) {
  const token = randomBytes(32).toString('hex')
  const now = Date.now()
  const expires = now + SESSION_DAYS * 864e5
  run('INSERT INTO sessions(token, user_id, created_at, expires_at) VALUES(?,?,?,?)', token, userId, now, expires)
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true behind HTTPS in production
    maxAge: SESSION_DAYS * 864e5,
    path: '/',
  })
  return token
}

export function destroySession(req, res) {
  const token = req.cookies?.[COOKIE]
  if (token) run('DELETE FROM sessions WHERE token=?', token)
  res.clearCookie(COOKIE, { path: '/' })
}

// Populates req.user (or null) from the session cookie.
export function sessionMiddleware(req, _res, next) {
  req.user = null
  const token = req.cookies?.[COOKIE]
  if (token) {
    const sess = one('SELECT * FROM sessions WHERE token=?', token)
    if (sess && sess.expires_at > Date.now()) {
      req.user = one('SELECT id, email, name, role, company_id FROM users WHERE id=?', sess.user_id)
    } else if (sess) {
      run('DELETE FROM sessions WHERE token=?', token)
    }
  }
  next()
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not signed in' })
  next()
}

export const uuid = randomUUID
