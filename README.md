# Trai Media Ops — Backend (Turso / libSQL)

Real, database-backed backend for Trai Media & Entertainment's ops system. This version runs on
[Turso](https://turso.tech) — a SQLite-compatible database with a real network API, which is what
makes it work from a serverless host like Vercel (a local SQLite *file*, which the previous
version of this backend used, doesn't survive between serverless function invocations — that's
what caused the "worked once then the data was gone" issue).

## Set up your Turso database

```bash
# Install the CLI (macOS/Linux)
curl -sSfL https://get.tur.so/install.sh | bash

turso auth login
turso db create trai-media-ops
turso db show trai-media-ops --url          # → TURSO_DATABASE_URL
turso db tokens create trai-media-ops       # → TURSO_AUTH_TOKEN
```

Put both values in `.env` (copy `.env.example` first).

## Running it

```bash
npm install
npm start
```

Tables are created automatically on first run if they don't exist yet (see `initSchema()` in
`src/db.js`) — no separate migration step needed.

## What changed from the SQLite version, concretely

Every database call in every route file is now `async`/`await` — a network call to Turso can't be
synchronous the way reading a local file could be with `node:sqlite`. The route *logic* is
unchanged; only how each call is made changed (`db.prepare(sql).get(x)` → `await dbGet(sql, [x])`,
same idea for `.all()`/`.run()`). Transactions now use libSQL's interactive transaction API
(`client.transaction("write")`) instead of raw `BEGIN`/`COMMIT`, for the same reason — atomic
multi-step writes (like creating an employee and their login together) still succeed or fail as a
single unit, just over the network now instead of locally.

### A real bug this migration caught

While testing this before handing it over, every request after the very first one started failing
with "no such table: users" — the schema file's leading comment block (four lines, before the
first `CREATE TABLE`) was getting glued onto that first statement when splitting the file on `;`,
and a naive filter discarded the whole glued-together chunk because it *started* with a comment,
silently dropping the `users` table. Caught and fixed by actually running a full test suite
against this version — bootstrap, login, employee creation with immediate login as that new
employee, role-permission enforcement, assignment-based attendance restrictions — all passing
cleanly, server surviving the whole run with no errors logged, before this was packaged up. I
can't install and test against the real Turso service directly (no network access in the
environment I build in), so I built a local stand-in with the exact same interface
(`execute`/`transaction`, `{rows, rowsAffected}`) backed by a real SQL engine, and ran the actual
production route files against it unmodified. That's how this bug surfaced instead of shipping
silently.

## What's implemented and tested (same scope as before, now on Turso)

- `POST /api/auth/bootstrap`, `POST /api/auth/login` — real password hashing (scrypt), signed
  session tokens carrying `employeeCode` for employee accounts
- `GET/POST /api/employees` — atomic employee + login creation
- `GET/POST /api/users` — staff account management
- `GET/POST/PATCH/DELETE /api/projects` + `POST /api/projects/:id/assignments` — full lifecycle,
  per-field role permissions (Admin/Manager for status & assignments, Admin/Accountant for budget)
- `GET/POST/PATCH /api/attendance` — server-enforced project-assignment restriction, employee
  identity always taken from the session token (never trusted from request bodies), approval
  restricted to Admin/Manager

## What's still scaffolded but not wired up

Vouchers, Rates/Payroll, Ledger, Billing, Vendor, Equipment — same as before this migration. The
schema (`src/schema.sql`) already covers all of them; the route files don't exist yet. Same
pattern to follow when building them: a route file, `requireAuth()` with the right roles,
`transaction()` for anything touching more than one table.

## Deploying on Vercel

Good news, and a correction to what I said last message: Vercel added native support for exactly
this file's shape. It automatically detects a Node.js server entrypoint at `server.{js,...}` or
`src/server.{js,...}` that calls `server.listen()` during startup, and captures it as a Vercel
Function — no `/api` directory restructuring needed. This file already matches that: it's at
`src/server.js`, and `server.listen()` is now called synchronously at module load (fixed as part
of this update — it was previously deferred inside an async chain waiting on schema
initialization, which risked Vercel's detection missing it; schema readiness is now checked
lazily on the first real request instead, since `CREATE TABLE IF NOT EXISTS` is safe to run then).

No `vercel.json` is required for this — it's genuinely zero-config for this pattern. Set your
environment variables (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET`, `CORS_ORIGIN`)
in the Vercel dashboard, and deploy.

**Recommended: deploy this backend as its own separate Vercel project from the frontend.**
Vercel's docs mention combining a raw Node server with a frontend in one project requires their
newer "Services" feature — two separate, simpler projects (one for `/backend`, one for
`/frontend`) avoids that complexity and is the more predictable, well-established pattern.

I verified the corrected startup sequence actually works — confirmed the health endpoint responds
within 200ms of process start (proving `listen()` really is synchronous now, not deferred), then
ran the full bootstrap → create employee → log in as that new employee flow through the lazily-
initialized schema, all passing.
