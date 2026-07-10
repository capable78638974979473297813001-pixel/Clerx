# Clerx

**Your company's AI clerk.** Clerx reads everything a company runs on — Google Drive, Slack, Notion, uploaded docs — and answers every employee's questions instantly, while the leader controls exactly who can see what.

Built for teams of **5–200 employees**: too big to "just ask your manager," too lean for enterprise knowledge tools.

## The flow

1. **Verify** — Leader enters their company name; Clerx runs a web check to confirm it's a real, legitimate business and pulls in public context.
2. **Connect** — Link Drive / Slack / Notion or upload files. Clerx auto-sorts everything into topics (Finance, HR, Materials, IT, Sales, Ops).
3. **Permission** — Add employees by name and stamp each one with the topics they're allowed to ask about.
4. **Distribute** — Each employee gets a join code. They enter it with their name and start asking — scoped to exactly what they're cleared for.

## Architecture

Full-stack, self-contained — no external services required to run.

**Frontend** — Vite + React + React Router, Tailwind CSS v4. A "records office" visual identity (warm paper, ink, rubber-stamp vermillion, Fraunces serif).

**Backend** — Node/Express API with **SQLite** (via Node's built-in `node:sqlite`, no native build) and cookie sessions.
- Real accounts: signup / login / logout with **bcrypt**-hashed passwords and httpOnly session cookies.
- All workspace data (company, employees, sources, activity) persists in SQLite, scoped per account.
- The **permission engine lives on the server**: employees ask via a code-gated endpoint and answers are gated by their cleared topics — the client can't bypass it.
- Every employee question is written to an **activity/audit log**.

### API surface

```
POST /api/auth/signup | login | logout | demo      GET /api/auth/me
GET  /api/company      PATCH /api/company           POST /api/company/verify | seed | reset
GET/POST/PATCH/DELETE  /api/employees[/:id]
GET/POST /api/sources   POST /api/sources/:kind/resync
GET  /api/topics        POST /api/join   POST /api/ask     (public, code-gated)
```

## What's real vs. mocked

- **Real:** accounts, sessions, password hashing, a SQLite database, per-company data isolation, server-enforced topic permissions, and three real knowledge sources — **Notion**, **Slack**, and **file upload**. Each pulls actual content (Notion pages / Slack channel history / uploaded text files), indexes it, classifies each item into a topic, and answers employee questions from that real content (topic-gated, with the source cited). Provider tokens are AES-256-GCM encrypted at rest and never returned to the client.
- **Mocked (for now):** company verification (simulated web check), the Google Drive integration (simulated connect + indexing), and the answer engine's retrieval, which is keyword-based rather than semantic/LLM.
- **Next:** an LLM for better answers over the indexed content; Google Drive via the same document pipeline; PDF/DOCX parsing for uploads; a real search API for verification.

Real sources share one pipeline: a provider module (`server/notion.js`, `server/slack.js`) exposes `ingest(token) → { workspace, docs }`; the route encrypts the token, stores the docs, and classifies each into a topic. Adding a provider is one module + one entry in the `PROVIDERS` map.

### Connect a real source

**Notion** — notion.so/my-integrations → New integration → copy the secret (`ntn_…`); share pages with it (page ••• → Connections); paste in Clerx → Knowledge → Notion.

**Slack** — api.slack.com/apps → Create New App → add Bot Token Scopes `channels:read` + `channels:history` → Install to Workspace → copy the Bot User OAuth Token (`xoxb-…`); `/invite @YourApp` into channels; paste in Clerx → Knowledge → Slack.

**File upload** — Clerx → Knowledge → Uploaded files → drop in text files (TXT, MD, CSV, JSON, LOG). They're read in the browser and indexed on the server. (PDF/DOCX need a parser and aren't supported yet.)

Employees are then answered from that real content — but only for topics their lead cleared them for.

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` starts both the Vite dev server (`:5175`) and the API (`:3001`) via `concurrently`; Vite proxies `/api` → the backend. Open the printed URL.

- **Try it instantly:** click **Explore a live demo** on the landing page — it creates a guest account with a fully populated sample company (Meridian Build Co.).
- Or **Open a file** to sign up and set your own company up from scratch.
- Employees: **Employee entry** → enter a join code.

### Production build

```bash
npm run build   # builds the frontend to dist/
npm start       # Express serves dist/ + the API on one port (API_PORT, default 3001)
```

## Structure

```
server/
  server.js        Express app + route mounting; serves dist/ in production
  db.js            SQLite schema + row→API mappers
  auth.js          password hashing, sessions, requireAuth
  engine.js        topics + mock knowledge/answer engine (LLM goes here later)
  seed.js          sample company generator
  routes/          auth, company, employees, sources, public (join/ask/topics)
src/
  lib/             api.js (fetch client), auth.jsx (AuthProvider), store.js (UI helpers)
  pages/           Landing, Auth, Onboarding, EmployeeJoin, EmployeeChat, NotFound
  pages/app/       AppLayout + Overview, Staff, Knowledge, Topics, Activity, Settings
  components/      ui.jsx, kit.jsx (toasts/modal/drawer/…), AppShell.jsx
```

Data lives in `.data/clerx.db` (gitignored). Delete it to start fresh.
