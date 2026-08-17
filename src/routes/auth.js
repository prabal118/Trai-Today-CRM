import { dbGet, dbRun, transaction, writeAudit } from "../db.js";
import { hashPassword, verifyPassword, createToken, newId } from "../auth.js";

export async function handleAuthRoutes({ req, res, path, sendJSON, SESSION_SECRET }) {
  // POST /api/auth/bootstrap — creates the first admin account. Only works while zero users exist,
  // same rule as the browser prototype's bootstrap screen, enforced here at the database level
  // instead of just in the UI.
  if (path === "/api/auth/bootstrap" && req.method === "POST") {
    const { name, username, password, recoveryPhrase } = req.body || {};
    if (!name?.trim() || !username?.trim() || !password || password.length < 4 || !recoveryPhrase?.trim()) {
      return sendJSON(res, 400, { error: "Name, username, a password (4+ chars), and a recovery phrase are all required." });
    }
    const existing = await dbGet("SELECT COUNT(*) as n FROM users");
    if (existing.n > 0) {
      return sendJSON(res, 409, { error: "An admin already exists — use /api/auth/login instead." });
    }
    const user = await transaction(async (tx) => {
      const id = newId("USR");
      await tx.run(
        `INSERT INTO users (id, name, username, password_hash, role, employee_code) VALUES (?, ?, ?, ?, 'admin', NULL)`,
        [id, name.trim(), username.trim(), hashPassword(password)]
      );
      await tx.run(`INSERT INTO security (id, recovery_phrase_hash) VALUES (1, ?)`, [hashPassword(recoveryPhrase.trim())]);
      await writeAudit({ userId: id, action: "create", module: "users", recordId: id, newValue: { name, username, role: "admin" } }, tx);
      return { id, name: name.trim(), username: username.trim(), role: "admin" };
    });
    const token = createToken({ sub: user.id, role: user.role, employeeCode: null }, SESSION_SECRET);
    return sendJSON(res, 201, { token, user });
  }

  // POST /api/auth/login
  if (path === "/api/auth/login" && req.method === "POST") {
    const { username, password } = req.body || {};
    if (!username || !password) return sendJSON(res, 400, { error: "Username and password are required." });

    const row = await dbGet("SELECT * FROM users WHERE username = ?", [username.trim()]);
    if (!row || !verifyPassword(password, row.password_hash)) {
      return sendJSON(res, 401, { error: "Invalid username or password." });
    }

    if (row.role === "employee" && row.employee_code) {
      const emp = await dbGet("SELECT status FROM employees WHERE code = ?", [row.employee_code]);
      if (emp && emp.status !== "Active") {
        return sendJSON(res, 403, { error: `This account is ${emp.status.toLowerCase()}. Contact your admin.` });
      }
    }

    await dbRun("UPDATE users SET last_login = datetime('now') WHERE id = ?", [row.id]);
    const user = { id: row.id, name: row.name, username: row.username, role: row.role, employeeCode: row.employee_code };
    // employeeCode MUST be signed into the token itself, not just returned in this response body —
    // every later request only carries the token, never this response. Missing it here was a real
    // bug: every employee-scoped route (attendance, vouchers, ...) silently had no way to know
    // which employee was making the request after the very first login.
    const token = createToken({ sub: row.id, role: row.role, employeeCode: row.employee_code }, SESSION_SECRET);
    return sendJSON(res, 200, { token, user });
  }

  sendJSON(res, 404, { error: "Not found." });
}
