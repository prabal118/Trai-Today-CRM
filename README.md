# Trai Media Ops — Frontend

Vite + React project, ready to build and deploy to Vercel. Confirmed the file structure and
imports actually resolve correctly (bundled it with a real bundler before handing this over, not
just assumed the file move worked).

## Local development

```bash
npm install
npm run dev
```

## Deploying to Vercel

Push this to GitHub, then in Vercel: **New Project → Import this repo**. Vercel auto-detects Vite
(the included `vercel.json` makes it explicit either way) — no configuration needed beyond that.

## Read this before you deploy — the app will not work yet without changes

This code was written to run *inside Claude's artifact environment*, not as a standalone website.
Two things it depends on don't exist outside that environment:

### 1. `window.storage` (all data — logins, employees, vouchers, everything)

Every save and load in the app goes through `window.storage.get/set/delete` — that's an API
Claude.ai injects into the artifact iframe. It is **not a real browser API**. On Vercel, or any
normal website, `window.storage` is `undefined`. The app will render the login screen, then fail
the instant anyone tries to sign in or load data.

**The fix**: point the app at the real backend instead (the `/backend` project from the same
delivery — Auth, Employees, Projects, and Attendance are built and tested there). Concretely,
`useStore()` in `src/App.jsx` needs its `window.storage.get/set/delete` calls replaced with
`fetch()` calls to the backend's API (`/api/employees`, `/api/auth/login`, etc.), and the backend
needs the rest of its resources built out first (it's currently missing Vouchers, Payroll, Ledger,
Billing, Vendor, and Equipment — see backend/README.md). This is a real rewrite of the data layer,
not a config change — I can do it, but wanted you to see the actual scope before starting, since
it depends on the backend being further along first.

### 2. Direct calls to `api.anthropic.com` (the AI Insights / Ask AI features)

Two places in `src/App.jsx` (search `api.anthropic.com`) call Claude's API directly with no API
key — that works inside the artifact because Claude.ai handles auth transparently there. On a
normal deployed site there's no key, and even adding one directly in frontend code would expose
it publicly to anyone who opens the browser's network tab — a real security problem, not just a
"won't work" one.

**The fix**: add a small serverless function (Vercel makes this easy — an `/api/ask-ai.js` file)
that holds the real Anthropic API key as a server-side environment variable and proxies the
request. The frontend calls your own `/api/ask-ai` instead of Anthropic directly.

## What I'd suggest as the actual order of operations

1. Finish the backend (Vouchers, Payroll, Ledger, Billing, Vendor, Equipment — same proven pattern
   as what's already built).
2. Rewire this frontend's data layer to call that backend instead of `window.storage`.
3. Add the AI proxy function for the two Anthropic calls.
4. *Then* deploy to Vercel — at that point it'll be a real, working, hosted app, not one that
   looks right until someone tries to actually use it.

Deploying as-is will build successfully and Vercel will show you a live URL — the login page will
even render — but it won't function past that point. I wanted that stated plainly rather than
discovered after the fact.
