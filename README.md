# Clerx

**Your company's AI clerk.** Clerx reads everything a company runs on — Google Drive, Slack, Notion, uploaded docs — and answers every employee's questions instantly, while the leader controls exactly who can see what.

Built for teams of **5–200 employees**: too big to "just ask your manager," too lean for enterprise knowledge tools.

## The flow

1. **Verify** — Leader enters their company name; Clerx runs a web check to confirm it's a real, legitimate business and pulls in public context.
2. **Connect** — Link Drive / Slack / Notion or upload files. Clerx auto-sorts everything into topics (Finance, HR, Materials, IT, Sales, Ops).
3. **Permission** — Add employees by name and tag each one to the topics they're allowed to ask about.
4. **Distribute** — Each employee gets a join code. They enter it with their name and start asking — scoped to exactly what they're cleared for.

## This repo (UI-first prototype)

This is the **frontend prototype**. Everything backend-ish is mocked in the browser:

- Company verification is simulated (no real web search yet).
- Integrations are simulated (no real OAuth yet).
- The AI answers from a small mock knowledge base in `src/lib/store.js`, and **respects per-employee topic permissions** — ask about something you're not cleared for and Clerx blocks it.
- State persists in `localStorage`, so you can walk the full leader → employee flow.

Real backend (LLM + web search + live integrations) comes next.

## Tech

- Vite + React + React Router
- Tailwind CSS v4

## Run locally

```bash
npm install
npm run dev
```

Then open the printed URL.

### Try it

- `/` — landing page
- `/setup` — leader onboarding (verify → connect → team → codes)
- `/dashboard` — leader admin (adjust permissions live)
- `/join` — employee code entry (use a code generated in setup)
- `/chat` — scoped employee assistant

## Routes / structure

```
src/
  pages/       Landing, Onboarding, Dashboard, EmployeeJoin, EmployeeChat
  components/   ui.jsx (Logo, Button, Field, Input, Badge)
  lib/          store.js (demo state + mock permissioned AI), icons.jsx
```
