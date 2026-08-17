import { dbGet, dbAll, dbRun, transaction, writeAudit } from "../db.js";
import { newId, requireAuth } from "../auth.js";

const PROJECT_STATUSES = ["Planning", "Active", "On Hold", "Completed"];

async function loadProjectWithAssignments(id) {
  const project = await dbGet("SELECT * FROM projects WHERE id = ?", [id]);
  if (!project) return null;
  const assignedRows = await dbAll("SELECT employee_code FROM project_assignments WHERE project_id = ?", [id]);
  return { ...project, assigned: assignedRows.map((r) => r.employee_code) };
}

export async function handleProjectRoutes({ req, res, path, sendJSON }) {
  const idMatch = path.match(/^\/api\/projects\/([^/]+)$/);
  const assignMatch = path.match(/^\/api\/projects\/([^/]+)\/assignments$/);

  // GET /api/projects — anyone signed in can list (the frontend narrows what each role acts on)
  if (path === "/api/projects" && req.method === "GET") {
    if (!requireAuth(req, res, sendJSON)) return;
    const rows = await dbAll("SELECT id FROM projects ORDER BY created_at DESC");
    const projects = await Promise.all(rows.map((r) => loadProjectWithAssignments(r.id)));
    return sendJSON(res, 200, { projects });
  }

  // POST /api/projects — admin or manager only
  if (path === "/api/projects" && req.method === "POST") {
    if (!requireAuth(req, res, sendJSON, ["admin", "manager"])) return;
    const { name, client, startDate, endDate } = req.body || {};
    if (!name?.trim()) return sendJSON(res, 400, { error: "Project name is required." });

    const id = newId("PRJ");
    await dbRun(
      `INSERT INTO projects (id, name, client, status, start_date, end_date, quote_amount) VALUES (?, ?, ?, 'Active', ?, ?, 0)`,
      [id, name.trim(), client || null, startDate || null, endDate || null]
    );
    await writeAudit({ userId: req.user.sub, action: "create", module: "projects", recordId: id, newValue: { name, client } });
    return sendJSON(res, 201, { project: await loadProjectWithAssignments(id) });
  }

  // PATCH /api/projects/:id — status/dates need admin or manager; quoteAmount needs admin or
  // accountant. Both can be sent together only if the caller actually has both permissions —
  // otherwise the whole request is rejected rather than silently applying half of it.
  if (idMatch && req.method === "PATCH") {
    if (!requireAuth(req, res, sendJSON)) return;
    const id = idMatch[1];
    const existing = await dbGet("SELECT * FROM projects WHERE id = ?", [id]);
    if (!existing) return sendJSON(res, 404, { error: "Project not found." });

    const body = req.body || {};
    const touchesOpsFields = ["status", "name", "client", "startDate", "endDate"].some((k) => body[k] !== undefined);
    const touchesQuote = body.quoteAmount !== undefined;

    if (touchesOpsFields && !["admin", "manager"].includes(req.user.role)) {
      return sendJSON(res, 403, { error: "Only Admin or Manager can change project status/details." });
    }
    if (touchesQuote && !["admin", "accountant"].includes(req.user.role)) {
      return sendJSON(res, 403, { error: "Only Admin or Accountant can set the quoted amount." });
    }
    if (body.status && !PROJECT_STATUSES.includes(body.status)) {
      return sendJSON(res, 400, { error: `Status must be one of: ${PROJECT_STATUSES.join(", ")}` });
    }
    if (touchesQuote && (typeof body.quoteAmount !== "number" || body.quoteAmount < 0)) {
      return sendJSON(res, 400, { error: "quoteAmount must be a non-negative number." });
    }

    const fields = [];
    const values = [];
    if (body.name !== undefined) { fields.push("name = ?"); values.push(body.name.trim()); }
    if (body.client !== undefined) { fields.push("client = ?"); values.push(body.client); }
    if (body.status !== undefined) { fields.push("status = ?"); values.push(body.status); }
    if (body.startDate !== undefined) { fields.push("start_date = ?"); values.push(body.startDate); }
    if (body.endDate !== undefined) { fields.push("end_date = ?"); values.push(body.endDate); }
    if (body.quoteAmount !== undefined) { fields.push("quote_amount = ?"); values.push(body.quoteAmount); }
    if (fields.length === 0) return sendJSON(res, 400, { error: "No recognized fields to update." });

    await dbRun(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
    await writeAudit({ userId: req.user.sub, action: "update", module: "projects", recordId: id, oldValue: existing, newValue: body });
    return sendJSON(res, 200, { project: await loadProjectWithAssignments(id) });
  }

  // DELETE /api/projects/:id — admin or manager only
  if (idMatch && req.method === "DELETE") {
    if (!requireAuth(req, res, sendJSON, ["admin", "manager"])) return;
    const id = idMatch[1];
    const existing = await dbGet("SELECT * FROM projects WHERE id = ?", [id]);
    if (!existing) return sendJSON(res, 404, { error: "Project not found." });
    await dbRun("DELETE FROM projects WHERE id = ?", [id]); // project_assignments cascades via FK
    await writeAudit({ userId: req.user.sub, action: "delete", module: "projects", recordId: id, oldValue: existing });
    return sendJSON(res, 200, { ok: true });
  }

  // POST /api/projects/:id/assignments — admin or manager only. Toggles: assigns the employee if
  // not already assigned, unassigns if already assigned. Body: { employeeCode }.
  if (assignMatch && req.method === "POST") {
    if (!requireAuth(req, res, sendJSON, ["admin", "manager"])) return;
    const id = assignMatch[1];
    const { employeeCode } = req.body || {};
    if (!employeeCode) return sendJSON(res, 400, { error: "employeeCode is required." });

    const project = await dbGet("SELECT id FROM projects WHERE id = ?", [id]);
    if (!project) return sendJSON(res, 404, { error: "Project not found." });
    const employee = await dbGet("SELECT code FROM employees WHERE code = ?", [employeeCode]);
    if (!employee) return sendJSON(res, 404, { error: "Employee not found." });

    const result = await transaction(async (tx) => {
      const existing = await tx.get("SELECT 1 FROM project_assignments WHERE project_id = ? AND employee_code = ?", [id, employeeCode]);
      if (existing) {
        await tx.run("DELETE FROM project_assignments WHERE project_id = ? AND employee_code = ?", [id, employeeCode]);
        return "unassigned";
      }
      await tx.run("INSERT INTO project_assignments (project_id, employee_code) VALUES (?, ?)", [id, employeeCode]);
      return "assigned";
    });
    await writeAudit({ userId: req.user.sub, action: result, module: "project_assignments", recordId: `${id}:${employeeCode}` });
    return sendJSON(res, 200, { result, project: await loadProjectWithAssignments(id) });
  }

  sendJSON(res, 404, { error: "Not found." });
}
