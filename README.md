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
- **Real:** the answer engine is a graceful fallback chain — with an Anthropic key it reads each employee's *cleared* documents and writes the answer semantically, in the company's voice, citing the source; with no key it degrades to the built-in keyword engine, so the app always works and the free tier stays free. The LLM only ever sees topic-permitted docs, so permissions stay server-enforced and fail-closed. Set `CLERX_ANTHROPIC_API_KEY` (or `ANTHROPIC_API_KEY`) to enable it; `CLERX_LLM_MODEL` overrides the model.
- **Mocked (for now):** company verification (simulated web check) and the Google Drive integration (simulated connect + indexing).
- **Next:** Google Drive via the same document pipeline; PDF/DOCX parsing for uploads; a real search API for verification.

Real sources share one pipeline: a provider module (`server/notion.js`, `server/slack.js`) exposes `ingest(token) → { workspace, docs }`; the route encrypts the token, stores the docs, and classifies each into a topic. Adding a provider is one module + one entry in the `PROVIDERS` map.

### Connecting a source — two modes

**One-click OAuth (easiest for your users).** When you set OAuth credentials (see below), the Knowledge page shows a **Connect** button that redirects to Slack/Notion, the user clicks *Allow*, and they're done — no app to create, no token to copy, no channels to invite (Slack auto-joins public channels). This is the recommended setup for a real deployment.

**Paste-a-token fallback (zero setup).** Without OAuth credentials, each source opens a short modal to paste a token — fully functional, just more steps for the user:
- **Notion** — notion.so/my-integrations → New integration → copy the secret (`ntn_…`); share pages with it; paste it.
- **Slack** — api.slack.com/apps → Create New App → Bot Token Scopes `channels:read` + `channels:history` + `channels:join` → Install → copy the Bot User OAuth Token (`xoxb-…`); paste it (Clerx auto-joins public channels).
- **File upload** — always available: drop in text files (TXT, MD, CSV, JSON, LOG), read in the browser and indexed server-side. (PDF/DOCX need a parser and aren't supported yet.)

### Enabling one-click OAuth

Copy `.env.example` → `.env` and fill in the credentials for a single Clerx app you register once per provider (see the file for exact scopes and redirect URLs), then restart. The redirect URL is `<CLERX_BASE_URL>/api/sources/oauth/<provider>/callback`. Clerx detects the credentials and switches those sources to one-click automatically; anything you leave blank stays on the paste-token fallback.

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
