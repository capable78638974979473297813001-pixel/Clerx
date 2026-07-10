import './env.js' // load .env before anything reads process.env
import express from 'express'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'

import './db.js' // initialize schema
import { sessionMiddleware } from './auth.js'
import authRoutes from './routes/auth.js'
import companyRoutes from './routes/company.js'
import employeeRoutes from './routes/employees.js'
import sourceRoutes from './routes/sources.js'
import publicRoutes from './routes/public.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Dedicated var so a harness-provided PORT (used by Vite) can't collide with the API.
const PORT = process.env.API_PORT || 3001
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(sessionMiddleware)

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))
app.use('/api/auth', authRoutes)
app.use('/api', publicRoutes)          // /api/topics, /api/join, /api/ask
app.use('/api/company', companyRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/sources', sourceRoutes)

// In production, serve the built frontend from dist/
const dist = join(__dirname, '..', 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(join(dist, 'index.html'))
  })
}

app.use((err, _req, res, _next) => {
  console.error('[clerx]', err)
  res.status(500).json({ error: 'Something went wrong.' })
})

app.listen(PORT, () => console.log(`[clerx] API listening on http://localhost:${PORT}`))
