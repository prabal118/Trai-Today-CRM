# Trai Media Ops — Backend (starting scaffold)

This is the real, database-backed backend for Trai Media & Entertainment's ops system, replacing
the browser-storage prototype. It's a **starting scaffold that actually works**, not a plan
document — it's been run and tested end to end (see "What's verified working" below).

## Why this exists

The browser-artifact version could never fully solve a few things:
- Passwords were stored as plain text (no way to hash securely client-side)
- Two people saving at the same moment could race and overwrite each other
- No real backups, no audit trail, no guarantee against data loss
- A shared request-rate limit that caused real incidents as the team grew

This backend fixes all of that at the root, using real infrastructure instead of working around
browser limitations.

## Zero dependencies to install

This runs on nothing but Node.js 22.5+ built-ins — `node:sqlite` for the database, `node:crypto`
for password hashing and signed session tokens, `node:http` for the server. No `npm install`
step, no dependency versions to manage, no supply-chain surface to worry about while this is
small. `npm install` still works fine later if you want to add something (Express, a Postgres
driver, etc.) — nothing here prevents that.

## Running it

```bash
cp .env.example .env      # then edit SESSION_SECRET to something random
npm start                  # or: npm run dev  (auto-restarts on file changes)
```

The API listens on `http://localhost:4000` (or whatever `PORT` you set). A SQLite file gets
created at `data/trai-crm.db` on first run — that file is gitignored, it's your local data.

First thing to do: `POST /api/auth/bootstrap` with `{ name, username, password, recoveryPhrase }`
to create the first admin account — same flow as the old app's bootstrap screen, just enforced
for real at the database level (it hard-rejects a second attempt once any user exists).

## What's actually implemented and tested right now

- `POST /api/auth/bootstrap` — first admin creation, one-time only
- `POST /api/auth/login` — real password verification (scrypt-hashed, not plain text), returns a
  signed session token; blocks login for employees whose status isn't Active
- `GET/POST /api/employees` — list, and admin-only creation that writes the employee **and**
  their login **in one database transaction**
- `GET/POST /api/users` — admin-only staff account management (Admin/Manager/Accountant logins)
- `GET/POST/PATCH/DELETE /api/projects` + `POST /api/projects/:id/assignments` — full project
  lifecycle, with the same per-field role split as the original app
- `GET/POST/PATCH /api/attendance` — employees submit their own attendance (server-verified
  against their actual project assignment — see below), Admin/Manager approve or reject; an
  employee can only ever see or act on their own records, enforced server-side, not just hidden
  in the UI

### A real bug this caught, worth knowing about

Building Attendance surfaced a genuine bug in the Auth routes: the session token signed at login
only carried `sub` and `role`, never `employeeCode` — the login *response* had it, but that's
irrelevant once only the *token* travels with later requests. Every employee-scoped route
(starting with Attendance) had no way to know which employee was making the request after the
first login. It's fixed now (the token includes `employeeCode`), and while fixing it I also added
something that should have been there from the start: **a top-level error boundary around every
request**, so one route hitting an unexpected value returns a clean error to that one request
instead of crashing the entire server for every other signed-in user. Both were caught by actually
running real HTTP requests against real role combinations, not by reading the code and assuming
it was right — which is exactly the value of testing this way as each resource gets built.

The Attendance tests specifically verified real server-side enforcement of things the old browser
version could only hide in the UI: an employee logging attendance against a project they're
**not** assigned to gets a 403 (checked against the real `project_assignments` table, not trusted
from the client); an employee cannot submit attendance under someone else's employee code even by
directly crafting the request body (the server always uses the authenticated session's own code,
never anything the client sends); an employee querying `?employeeCode=someone-else` gets their own
records back anyway, filter silently ignored, not an error that would confirm the account exists.

## What's scaffolded but not wired up yet

The full database schema (`src/schema.sql`) already covers every record type from the old
system — vouchers, rates, payroll, ledger, expenses, vendors, equipment, bills, parties,
quotations, invoices, and an `audit_log` table that every important write should insert into (see
`writeAudit()` in `src/db.js`, already used by every route above).

**The pattern is proven three times now** — `employees.js`, `projects.js`, and `attendance.js` are
the templates. Every remaining resource follows the same shape: a route file, `requireAuth()`
with the right roles, `transaction()` for anything touching more than one table, and — as
Attendance showed — treat "does this request's own session actually have permission over this
specific record" as a real server-side check, never something the client can be trusted to enforce
on itself.

Suggested build order, mirroring the original backend plan:
1. Vouchers + approvals + payments (same ownership-scoping pattern as attendance)
2. Rates + payroll payments
3. Ledger (manual entries + every auto-posted payment from steps above)
4. Everything else (vendors, equipment, billing) — lower traffic, same pattern

## Migrating to Postgres for real production

SQLite is genuinely fine for development and even a small live team, but it's a single-writer
database — it doesn't handle real concurrent production traffic from many people at once as well
as Postgres does. When you're ready to actually deploy this for the whole company full-time:

1. Stand up a Postgres database (Railway, Render, Neon, and Supabase all have simple free/cheap
   tiers to start).
2. `schema.sql` translates almost directly — the main changes are `TEXT` → appropriate types
   (`TIMESTAMPTZ` for dates, `NUMERIC(12,2)` for money instead of `REAL`), and swapping
   `node:sqlite` for a Postgres client (`pg` is the standard choice).
3. Everything else — the route structure, the transaction pattern, the auth logic — stays the
   same. This is a database swap, not a rewrite.

## Getting this into your GitHub repo

I can't push to GitHub directly from here. From your own machine:

```bash
git clone https://github.com/prabal118/Trai-Today-CRM.git
cd Trai-Today-CRM
# copy all these files in (package.json, .gitignore, .env.example, README.md, src/)
git add .
git commit -m "Backend scaffold: real auth, real database, atomic employee creation"
git push origin main
```
