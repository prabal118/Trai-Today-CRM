-- Trai Media Ops — database schema
-- SQLite for now (zero-setup local development). Comments note what changes for a Postgres
-- migration later, since SQLite's single-writer model isn't right for real concurrent production
-- traffic once this is genuinely live for the whole team — see README.md.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- scrypt hash, see src/auth.js — never plain text
  role TEXT NOT NULL CHECK (role IN ('admin','manager','accountant','employee')),
  employee_code TEXT,                    -- set only when role = 'employee'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS employees (
  code TEXT PRIMARY KEY,                 -- e.g. EMP-001
  name TEXT NOT NULL,
  department TEXT,
  designation TEXT,
  employment_type TEXT,
  joining_date TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'Active', -- Active/Inactive/Suspended/Resigned/Terminated/Archived
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT,
  status TEXT NOT NULL DEFAULT 'Planning',
  start_date TEXT,
  end_date TEXT,
  quote_amount REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_assignments (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL REFERENCES employees(code) ON DELETE CASCADE,
  PRIMARY KEY (project_id, employee_code)
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employees(code),
  project_id TEXT REFERENCES projects(id),
  date TEXT NOT NULL,
  status TEXT NOT NULL,                  -- Present/Absent/Leave
  role TEXT,
  start_time TEXT,
  end_time TEXT,
  approval TEXT NOT NULL DEFAULT 'Pending', -- Pending/Approved/Rejected
  approved_by TEXT REFERENCES users(id),
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rates (
  id TEXT PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employees(code),
  project_id TEXT NOT NULL REFERENCES projects(id),
  day_rate REAL NOT NULL,
  ot_amount REAL NOT NULL DEFAULT 0,     -- fixed bonus if a day exceeds 11 hours, NOT hourly
  UNIQUE(employee_code, project_id)
);

CREATE TABLE IF NOT EXISTS payroll_payments (
  id TEXT PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employees(code),
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  attendance_ids TEXT,                    -- JSON array of attendance.id covered by this payment
  note TEXT
);

CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employees(code),
  project_id TEXT REFERENCES projects(id),
  type TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  date TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending/Approved/Rejected/Partially Paid/Paid
  paid_amount REAL NOT NULL DEFAULT 0,
  payment_mode TEXT,
  account TEXT,
  payment_reference TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  category TEXT NOT NULL,
  vendor TEXT,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS fixed_expenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  amount REAL NOT NULL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Income','Expense','Asset Purchase','Loss Booking')),
  category TEXT NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash','Account')),
  account TEXT,                          -- 'Trai' or "Today's" — only when payment_mode = 'Account'
  party TEXT,
  project_id TEXT REFERENCES projects(id),
  amount REAL NOT NULL,
  note TEXT,
  voided INTEGER NOT NULL DEFAULT 0,     -- 0/1 — never hard-delete a ledger entry, void it
  void_reason TEXT,
  voided_at TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  email TEXT,
  category TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  make TEXT,
  model TEXT,
  serial TEXT,
  purchase_date TEXT,
  purchase_cost REAL,
  status TEXT NOT NULL DEFAULT 'Available',
  location TEXT
);

CREATE TABLE IF NOT EXISTS equipment_hires (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(id),
  item TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id),
  hire_date TEXT,
  expected_return TEXT,
  actual_return TEXT,
  cost REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Hired',
  payment_status TEXT NOT NULL DEFAULT 'Unpaid'
);

CREATE TABLE IF NOT EXISTS vendor_bills (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(id),
  bill_number TEXT,
  project_id TEXT REFERENCES projects(id),
  amount REAL NOT NULL,
  paid_amount REAL NOT NULL DEFAULT 0,
  bill_date TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'Due',
  note TEXT
);

CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,                             -- Vendor/Client/Freelancer/Other
  contact TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quote_number TEXT UNIQUE NOT NULL,
  client TEXT,
  project_id TEXT REFERENCES projects(id),
  description TEXT,
  amount REAL,
  tax_pct REAL NOT NULL DEFAULT 0,
  total REAL,
  status TEXT NOT NULL DEFAULT 'Draft',
  valid_until TEXT,
  date TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client TEXT,
  project_id TEXT REFERENCES projects(id),
  quotation_id TEXT REFERENCES quotations(id),
  amount REAL,
  tax_pct REAL NOT NULL DEFAULT 0,
  total REAL,
  amount_paid REAL NOT NULL DEFAULT 0,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'Issued',
  date TEXT
);

-- Every important write should also insert here, in the SAME transaction as the change it
-- describes, so nothing important can disappear silently the way it could in the browser-only
-- version. See src/db.js writeAudit().
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,                  -- e.g. 'create', 'update', 'void', 'archive'
  module TEXT NOT NULL,                  -- e.g. 'employees', 'ledger'
  record_id TEXT,
  old_value TEXT,                        -- JSON
  new_value TEXT,                        -- JSON
  at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS security (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- singleton row
  recovery_phrase_hash TEXT
);
