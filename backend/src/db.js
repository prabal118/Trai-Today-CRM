import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "trai-crm.db");

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

// Every important write should happen inside one of these, so a multi-step action (like creating
// an employee AND their login, or paying a voucher AND writing the ledger entry) either fully
// succeeds or fully rolls back — this is the real fix for the "two writes race and one overwrites
// the other" class of bug the browser-storage version could only ever partially work around.
export function transaction(fn) {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function writeAudit({ userId, action, module, recordId, oldValue, newValue }) {
  db.prepare(
    `INSERT INTO audit_log (id, user_id, action, module, record_id, old_value, new_value)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId || null,
    action,
    module,
    recordId || null,
    oldValue ? JSON.stringify(oldValue) : null,
    newValue ? JSON.stringify(newValue) : null
  );
}
