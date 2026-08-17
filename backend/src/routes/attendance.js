import { db, writeAudit } from "../db.js";
import { newId, requireAuth } from "../auth.js";

const STATUSES = ["Present", "Absent", "Leave"];
const ROLE_OPTIONS = ["Director", "Replay Operator", "Graphics Operator", "Technician", "Stream Operator", "Drone Operator", "Camera-Man", "Audio Operator", "Helper", "Producer", "Commentator", "Floor Manager", "Others"];

function rowWithNames(row) {
  const employee = db.prepare("SELECT name FROM employees WHERE code = ?").get(row.employee_code);
  const project = row.project_id ? db.prepare("SELECT name FROM projects WHERE id = ?").get(row.project_id) : null;
  return { ...row, employeeName: employee?.name || null, projectName: project?.name || null };
}

export async function handleAttendanceRoutes({ req, res, path, sendJSON }) {
  const idMatch = path.match(/^\/api\/attendance\/([^/]+)$/);

  // GET /api/attendance — everyone signed in can read, but an employee is ALWAYS scoped to their
  // own records regardless of any query params they pass. This is enforced here, server-side —
  // the old browser version could only ever hide the option in the UI, never actually stop a
  // request for someone else's data. Optional filters (approval, employeeCode, project, date)
  // are AND-combined for Admin/Manager/Accountant, who legitimately need to see everyone's.
  if (path === "/api/attendance" && req.method === "GET") {
    if (!requireAuth(req, res, sendJSON)) return;

    const clauses = [];
    const params = [];
    if (req.user.role === "employee") {
      clauses.push("employee_code = ?");
      params.push(req.user.employeeCode);
    } else {
      if (req.query.employeeCode) { clauses.push("employee_code = ?"); params.push(req.query.employeeCode); }
      if (req.query.project) { clauses.push("project_id = ?"); params.push(req.query.project); }
    }
    if (req.query.approval) { clauses.push("approval = ?"); params.push(req.query.approval); }
    if (req.query.date) { clauses.push("date = ?"); params.push(req.query.date); }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db.prepare(`SELECT * FROM attendance ${where} ORDER BY date DESC, created_at DESC`).all(...params);
    return sendJSON(res, 200, { attendance: rows.map(rowWithNames) });
  }

  // POST /api/attendance — employee only, and always for THEIR OWN employee_code. Any
  // employeeCode sent in the body is ignored — it's taken from the authenticated session, never
  // from client input, so there's no way to submit attendance as someone else no matter what the
  // request body contains.
  if (path === "/api/attendance" && req.method === "POST") {
    if (!requireAuth(req, res, sendJSON, ["employee"])) return;
    if (!req.user.employeeCode) return sendJSON(res, 500, { error: "This session has no employee code attached — sign in again." });
    const { date, status, project, role, startTime, endTime } = req.body || {};

    if (!date) return sendJSON(res, 400, { error: "date is required." });
    if (!STATUSES.includes(status)) return sendJSON(res, 400, { error: `status must be one of: ${STATUSES.join(", ")}` });
    if (role && !ROLE_OPTIONS.includes(role)) return sendJSON(res, 400, { error: `role must be one of: ${ROLE_OPTIONS.join(", ")}` });

    if (project) {
      const proj = db.prepare("SELECT id FROM projects WHERE id = ?").get(project);
      if (!proj) return sendJSON(res, 404, { error: "Project not found." });
      const assigned = db.prepare("SELECT 1 FROM project_assignments WHERE project_id = ? AND employee_code = ?").get(project, req.user.employeeCode);
      if (!assigned) return sendJSON(res, 403, { error: "You're not assigned to that project." });
    }

    const id = newId("ATT");
    db.prepare(
      `INSERT INTO attendance (id, employee_code, project_id, date, status, role, start_time, end_time, approval)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`
    ).run(id, req.user.employeeCode, project || null, date, status, role || null, startTime || null, endTime || null);
    writeAudit({ userId: req.user.sub, action: "create", module: "attendance", recordId: id, newValue: { date, status, project } });

    const row = db.prepare("SELECT * FROM attendance WHERE id = ?").get(id);
    return sendJSON(res, 201, { attendance: rowWithNames(row) });
  }

  // PATCH /api/attendance/:id — admin or manager only, approve or reject. Accountant can read
  // (for "Approved Records" reporting) but never decides — that mirrors the original app, where
  // approval was always a Manager/Admin action, never an Accountant one.
  if (idMatch && req.method === "PATCH") {
    if (!requireAuth(req, res, sendJSON, ["admin", "manager"])) return;
    const id = idMatch[1];
    const { approval } = req.body || {};
    if (!["Approved", "Rejected"].includes(approval)) {
      return sendJSON(res, 400, { error: "approval must be 'Approved' or 'Rejected'." });
    }
    const existing = db.prepare("SELECT * FROM attendance WHERE id = ?").get(id);
    if (!existing) return sendJSON(res, 404, { error: "Attendance record not found." });

    db.prepare("UPDATE attendance SET approval = ?, approved_by = ?, approved_at = datetime('now') WHERE id = ?").run(approval, req.user.sub, id);
    writeAudit({ userId: req.user.sub, action: approval.toLowerCase(), module: "attendance", recordId: id, oldValue: { approval: existing.approval }, newValue: { approval } });

    const row = db.prepare("SELECT * FROM attendance WHERE id = ?").get(id);
    return sendJSON(res, 200, { attendance: rowWithNames(row) });
  }

  sendJSON(res, 404, { error: "Not found." });
}
