# Trai Today CRM

Two parts, at two different stages:

## /frontend
`broadcast-ops.jsx` — the working, feature-complete browser prototype (React artifact). Runs on
Claude's artifact storage, not a real server. Everything works: attendance, vouchers, payroll,
ledger, billing, AI insights, dashboard filters. This is what a team can actually use today, with
the residual risks documented in /backend/README.md's intro (plain-text passwords, same-record
edit races, a shared storage rate limit).

## /backend
The real, database-backed replacement — see backend/README.md for what's implemented and tested
(Auth, Employees, Projects, Attendance) versus what's scaffolded but not wired up yet (Vouchers,
Payroll, Ledger, Billing, Vendor, Equipment). Not feature-complete — most of the app's
functionality isn't ported here yet.
