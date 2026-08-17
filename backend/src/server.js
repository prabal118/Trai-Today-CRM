import http from "node:http";
import { verifyToken } from "./auth.js";
import { handleAuthRoutes } from "./routes/auth.js";
import { handleEmployeeRoutes } from "./routes/employees.js";
import { handleUserRoutes } from "./routes/users.js";
import { handleProjectRoutes } from "./routes/projects.js";
import { handleAttendanceRoutes } from "./routes/attendance.js";
const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me-before-real-use";

function sendJSON(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; if (data.length > 5_000_000) req.destroy(); });
    req.on("end", () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

// Attaches req.user if a valid Bearer token is present. Routes that require auth check
// req.user themselves and return 401 if it's missing — this just does the verification.
function attachUser(req) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  req.user = token ? verifyToken(token, SESSION_SECRET) : null;
}

const server = http.createServer(async (req, res) => {
  // A single route handler throwing an unexpected error must NEVER take down the whole process —
  // that would mean one bad or unusual request could knock the API offline for every other user
  // signed in at the time. This was a real gap, not theoretical: it's exactly what happened during
  // testing when one route hit an unexpected value. Everything below runs inside this guard.
  try {
    if (req.method === "OPTIONS") { sendJSON(res, 204, {}); return; }

    attachUser(req);
    const url = new URL(req.url, `http://localhost:${PORT}`);
    req.query = Object.fromEntries(url.searchParams);

    try {
      req.body = req.method === "GET" ? {} : await readBody(req);
    } catch {
      return sendJSON(res, 400, { error: "Invalid JSON body." });
    }

    const ctx = { req, res, path: url.pathname, sendJSON, SESSION_SECRET };

    if (url.pathname.startsWith("/api/auth")) return await handleAuthRoutes(ctx);
    if (url.pathname.startsWith("/api/employees")) return await handleEmployeeRoutes(ctx);
    if (url.pathname.startsWith("/api/users")) return await handleUserRoutes(ctx);
    if (url.pathname.startsWith("/api/projects")) return await handleProjectRoutes(ctx);
    if (url.pathname.startsWith("/api/attendance")) return await handleAttendanceRoutes(ctx);
    if (url.pathname === "/api/health") return sendJSON(res, 200, { ok: true, time: new Date().toISOString() });

    sendJSON(res, 404, { error: "Not found." });
  } catch (err) {
    console.error("Unhandled route error:", err);
    if (!res.headersSent) sendJSON(res, 500, { error: "Something went wrong on our end." });
  }
});

server.listen(PORT, () => {
  console.log(`Trai Media Ops API listening on http://localhost:${PORT}`);
});
