// Real auth primitives — no external dependency needed, node:crypto covers all of it.
// This directly replaces the browser prototype's plain-text password storage, which was flagged
// repeatedly as the thing that genuinely needed a real backend to fix properly.

import crypto from "node:crypto";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  if (check.length !== expected.length) return false;
  return crypto.timingSafeEqual(check, expected);
}

// Simple HMAC-signed session tokens (a minimal JWT-equivalent) — no external library needed.
// Not encrypted (payload is base64, readable), only tamper-proof — don't put secrets in it.
function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

export function createToken(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const encoded = base64url(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token, secret) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  const a = Buffer.from(sig || "");
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
  } catch {
    return null;
  }
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
}

export function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

// Kept here (not in server.js) specifically to avoid a circular import between server.js and
// the route modules, which both need this.
export function requireAuth(req, res, sendJSON, roles) {
  if (!req.user) { sendJSON(res, 401, { error: "Not signed in." }); return false; }
  if (roles && !roles.includes(req.user.role)) { sendJSON(res, 403, { error: "Not allowed for this role." }); return false; }
  return true;
}

