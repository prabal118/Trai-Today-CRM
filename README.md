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
- `GET /api/employees` — list, requires a valid token
- `POST /api/employees` — admin only, creates the employee **and** their login **in one database
  transaction**. This is the concrete fix for the race condition that took several rounds to
  patch around in the browser version: here, if anything fails partway through, the whole thing
  rolls back — there's no way to end up with an employee record and no login, or vice versa.

All of this was tested with real HTTP requests during development, not just eyeballed: bootstrap
then re-bootstrap (correctly rejected), login with right/wrong passwords, unauthenticated requests
correctly getting 401, duplicate usernames correctly rejected, and — the real proof — logging in
as a brand new employee immediately after creating them, which only works if the transaction
genuinely wrote both rows together.

## What's scaffolded but not wired up yet

The full database schema (`src/schema.sql`) already covers every record type from the old
system — projects, attendance, vouchers, rates, payroll, ledger, expenses, vendors, equipment,
bills, parties, quotations, invoices, and an `audit_log` table that every important write should
insert into (see `writeAudit()` in `src/db.js`). The tables exist; the routes for them don't yet.

**The pattern is proven** — `src/routes/employees.js` is the template. Every remaining resource
follows the same shape: a route file, a `requireAuth()` check with the right roles, and — for
anything that touches more than one table (like paying a voucher, which should update the
voucher AND write a ledger entry) — wrap it in `transaction()` from `src/db.js` so it's atomic.

Suggested build order, mirroring the original backend plan:
1. Projects + project assignments
2. Attendance + approvals
3. Vouchers + approvals + payments
4. Rates + payroll payments
5. Ledger (manual entries + every auto-posted payment from steps above)
6. Everything else (vendors, equipment, billing) — lower traffic, same pattern

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
