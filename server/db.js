// SQLite persistence via Node's built-in node:sqlite (no native build).
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

export const uuid = randomUUID

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', '.data')
mkdirSync(DATA_DIR, { recursive: true })

export const db = new DatabaseSync(join(DATA_DIR, 'clerx.db'))

db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')

db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  domain      TEXT,
  verified    INTEGER DEFAULT 0,
  verified_at INTEGER,
  industry    TEXT,
  size        TEXT,
  blurb       TEXT,
  plan        TEXT DEFAULT 'Ledger',
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT DEFAULT 'leader',
  company_id    TEXT REFERENCES companies(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id          TEXT PRIMARY KEY,
  company_id  TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT,
  team        TEXT,
  email       TEXT,
  code        TEXT NOT NULL,
  topics      TEXT DEFAULT '[]',
  status      TEXT DEFAULT 'invited',
  joined_at   INTEGER,
  last_active INTEGER,
  questions   INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_emp_company ON employees(company_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_emp_code ON employees(code);

CREATE TABLE IF NOT EXISTS sources (
  id         TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,
  name       TEXT NOT NULL,
  docs       INTEGER DEFAULT 0,
  last_sync  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_src_company ON sources(company_id);

CREATE TABLE IF NOT EXISTS activity (
  id         TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  emp_id     TEXT,
  emp_name   TEXT,
  question   TEXT,
  topic      TEXT,
  blocked    INTEGER DEFAULT 0,
  ts         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_act_company ON activity(company_id, ts);
`)

// convenience wrappers
export const one = (sql, ...args) => db.prepare(sql).get(...args)
export const all = (sql, ...args) => db.prepare(sql).all(...args)
export const run = (sql, ...args) => db.prepare(sql).run(...args)

// map an employee DB row → API shape
export const empOut = (r) => r && ({
  id: r.id, name: r.name, role: r.role, team: r.team, email: r.email,
  code: r.code, topics: JSON.parse(r.topics || '[]'), status: r.status,
  joinedAt: r.joined_at, lastActive: r.last_active, questions: r.questions,
})
export const companyOut = (r) => r && ({
  id: r.id, name: r.name, domain: r.domain, verified: !!r.verified,
  verifiedAt: r.verified_at, industry: r.industry, size: r.size,
  blurb: r.blurb, plan: r.plan,
})
export const sourceOut = (r) => r && ({ id: r.kind, name: r.name, docs: r.docs, lastSync: r.last_sync })
export const activityOut = (r) => r && ({
  id: r.id, empId: r.emp_id, empName: r.emp_name, question: r.question,
  topic: r.topic, blocked: !!r.blocked, ts: r.ts,
})
