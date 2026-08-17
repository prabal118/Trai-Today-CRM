import { dbGet, dbAll, transaction, writeAudit } from "../db.js";
import { hashPassword, newId, requireAuth } from "../auth.js";

export async function handleEmployeeRoutes({ req, res, path, sendJSON }) {
  // GET /api/employees — any signed-in user can list (the frontend narrows what's shown per role)
  if (path === "/api/employees" && req.method === "GET") {
    if (!requireAuth(req, res, sendJSON)) return;
    const rows = await dbAll(
      `SELECT e.*, u.username AS login_username
       FROM employees e
       LEFT JOIN users u ON u.employee_code = e.code
       ORDER BY e.code`
    );
    return sendJSON(res, 200, { employees: rows });
  }

  // POST /api/employees — admin only. Creates the employee AND their login in ONE transaction.
  // This is the actual fix for the bug that took several rounds to work around in the browser
  // version: there, two separate writes could race and one could silently erase the other. Here,
  // if anything fails partway through, the whole thing rolls back — neither half is left dangling.
  if (path === "/api/employees" && req.method === "POST") {
    if (!requireAuth(req, res, sendJSON, ["admin"])) return;
    const { name, department, designation, employmentType, joiningDate, phone, email, username, password } = req.body || {};
    if (!name?.trim() || !username?.trim() || !password || password.length < 4) {
      return sendJSON(res, 400, { error: "Name, username, and a password (4+ chars) are required." });
    }
    const usernameTaken = await dbGet("SELECT 1 FROM users WHERE username = ?", [username.trim()]);
    if (usernameTaken) return sendJSON(res, 409, { error: "That username is already taken." });

    try {
      const result = await transaction(async (tx) => {
        const { max } = await tx.get(
          `SELECT MAX(CAST(SUBSTR(code, 5) AS INTEGER)) as max FROM employees WHERE code LIKE 'EMP-%'`
        );
        const code = `EMP-${String((max || 0) + 1).padStart(3, "0")}`;

        await tx.run(
          `INSERT INTO employees (code, name, department, designation, employment_type, joining_date, phone, email, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
          [code, name.trim(), department || null, designation || null, employmentType || null, joiningDate || null, phone || null, email || null]
        );

        const userId = newId("USR");
        await tx.run(
          `INSERT INTO users (id, name, username, password_hash, role, employee_code) VALUES (?, ?, ?, ?, 'employee', ?)`,
          [userId, name.trim(), username.trim(), hashPassword(password), code]
        );

        await writeAudit({ userId: req.user.sub, action: "create", module: "employees", recordId: code, newValue: { name, code } }, tx);
        return { code, name: name.trim(), department, status: "Active", loginUsername: username.trim() };
      });
      return sendJSON(res, 201, { employee: result });
    } catch (err) {
      const isUniqueConflict = /unique|constraint/i.test(err?.message || "");
      return sendJSON(res, isUniqueConflict ? 409 : 500, {
        error: isUniqueConflict
          ? "That username was just taken by someone else — nothing was saved. Try a different one."
          : "Could not create employee — nothing was saved (transaction rolled back).",
      });
    }
  }

  sendJSON(res, 404, { error: "Not found." });
}
