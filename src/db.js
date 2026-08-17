import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set — see .env.example. Create a database with the Turso CLI first (see README.md).");
}

export const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

// Thin async helpers matching the shape the route files use — get/all/run instead of node:sqlite's
// db.prepare(sql).get(...)/.all(...)/.run(...). The route logic reads almost identically to the
// SQLite version; the real difference is everything is `await`ed now, because a network call
// fundamentally can't be synchronous the way a local file read could.
export async function dbGet(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows[0] ? { ...result.rows[0] } : undefined;
}

export async function dbAll(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows.map((r) => ({ ...r }));
}

export async function dbRun(sql, args = []) {
  const result = await client.execute({ sql, args });
  return { rowsAffected: result.rowsAffected };
}

// Runs the full schema file. libSQL's execute() runs one statement per call — unlike
// node:sqlite's db.exec(), which accepted the whole multi-statement file directly — so the file
// is split into individual statements and each is sent separately. Comments are stripped
// line-by-line BEFORE splitting on ";" — a comment block with no semicolon of its own (like the
// file header) would otherwise glue onto the next real statement and get discarded whole by a
// naive "does this chunk start with --" check, silently dropping that table's creation.
export async function initSchema() {
  const raw = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const withoutComments = raw
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("--");
      return idx === -1 ? line : line.slice(0, idx);
    })
    .join("\n");
  const statements = withoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await client.execute(stmt);
  }
}

// Interactive transaction — needed (rather than the simpler batch() API) because several routes
// need to READ something first (e.g. "what's the highest existing employee code?") and use that
// result to decide what to WRITE, all atomically. batch() only accepts statements known upfront;
// this gives fn() a tx object it can call get/all/run on multiple times, with real logic in
// between, before everything commits together or rolls back together on any failure.
export async function transaction(fn) {
  const txn = await client.transaction("write");
  try {
    const tx = {
      get: async (sql, args = []) => {
        const r = await txn.execute({ sql, args });
        return r.rows[0] ? { ...r.rows[0] } : undefined;
      },
      all: async (sql, args = []) => {
        const r = await txn.execute({ sql, args });
        return r.rows.map((row) => ({ ...row }));
      },
      run: async (sql, args = []) => {
        const r = await txn.execute({ sql, args });
        return { rowsAffected: r.rowsAffected };
      },
    };
    const result = await fn(tx);
    await txn.commit();
    return result;
  } catch (err) {
    await txn.rollback();
    throw err;
  }
}

export async function writeAudit({ userId, action, module, recordId, oldValue, newValue }, tx = null) {
  const runner = tx ? tx.run : dbRun;
  await runner(
    `INSERT INTO audit_log (id, user_id, action, module, record_id, old_value, new_value)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId || null,
      action,
      module,
      recordId || null,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
    ]
  );
}
