import { dbGet, dbAll, dbRun, writeAudit } from "../db.js";
import { hashPassword, newId, requireAuth } from "../auth.js";

const STAFF_ROLES = ["admin", "manager", "accountant"];

export async function handleUserRoutes({ req, res, path, sendJSON }) {
  // GET /api/users — admin only, staff accounts list (never returns password hashes)
  if (path === "/api/users" && req.method === "GET") {
    if (!requireAuth(req, res, sendJSON, ["admin"])) return;
    const rows = await dbAll(
      `SELECT id, name, username, role, employee_code, created_at, last_login FROM users ORDER BY created_at`
    );
    return sendJSON(res, 200, { users: rows });
  }

  // POST /api/users — admin only, creates an admin/manager/accountant login (not an employee login
  // — that's created together with the employee record via POST /api/employees, see that route
  // for why those two writes need to be atomic).
  if (path === "/api/users" && req.method === "POST") {
    if (!requireAuth(req, res, sendJSON, ["admin"])) return;
    const { name, username, password, role } = req.body || {};
    if (!name?.trim() || !username?.trim() || !password || password.length < 4) {
      return sendJSON(res, 400, { error: "Name, username, and a password (4+ chars) are required." });
    }
    if (!STAFF_ROLES.includes(role)) {
      return sendJSON(res, 400, { error: `Role must be one of: ${STAFF_ROLES.join(", ")}` });
    }
    const taken = await dbGet("SELECT 1 FROM users WHERE username = ?", [username.trim()]);
    if (taken) return sendJSON(res, 409, { error: "That username is already taken." });

    const id = newId("USR");
    await dbRun(
      `INSERT INTO users (id, name, username, password_hash, role, employee_code) VALUES (?, ?, ?, ?, ?, NULL)`,
      [id, name.trim(), username.trim(), hashPassword(password), role]
    );
    await writeAudit({ userId: req.user.sub, action: "create", module: "users", recordId: id, newValue: { name, username, role } });
    return sendJSON(res, 201, { user: { id, name: name.trim(), username: username.trim(), role } });
  }

  sendJSON(res, 404, { error: "Not found." });
}
