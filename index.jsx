import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Users, User, FileText, Briefcase, DollarSign, Check, X, Plus,
  LogOut, ShieldCheck, Receipt, FolderKanban, ClipboardList, Trash2,
  CalendarCheck, Loader2, AlertCircle, ChevronRight, Lock, KeyRound, UserPlus,
  Download, LayoutDashboard, Wallet, TrendingUp, ListChecks, RefreshCw, Upload, Bell, Sparkles, Pencil
} from "lucide-react";

// Brand palette derived from the Trai Media & Entertainment logo
// (green-to-gold arc with an orange play mark; TRAI in green, MEDIA in orange, & ENTERTAINMENT in gold)
const BRAND = {
  green: "#1C6B3F",
  greenBright: "#2E9E5B",
  orange: "#E8821E",
  gold: "#F2B705",
};

const C = {
  bg: "#0A0D0A",
  surface: "#131712",
  surface2: "#1A201A",
  surface3: "#212822",
  border: "#2A322A",
  text: "#ECE9E2",
  textDim: "#8A9188",
  rec: "#E1483B",
  tally: BRAND.greenBright,
  amber: BRAND.orange,
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

* { box-sizing: border-box; }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
::selection { background: rgba(46,158,91,0.35); color: #ECE9E2; }
[style*="IBM Plex Mono"] { font-variant-numeric: tabular-nums; }

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: #0A0D0A; }
::-webkit-scrollbar-thumb { background: #2A322A; border-radius: 6px; border: 2px solid #0A0D0A; }
::-webkit-scrollbar-thumb:hover { background: #2E9E5B; }

@keyframes tm-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(46,158,91,0.45); }
  50% { opacity: 0.5; box-shadow: 0 0 0 5px rgba(46,158,91,0); }
}
@keyframes tm-scan {
  0% { background-position: -300px 0; }
  100% { background-position: 300px 0; }
}
@keyframes tm-fade-up {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes tm-glow-drift {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.7; }
}

.tm-live-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  background: #2E9E5B;
  animation: tm-pulse 2.2s ease-in-out infinite;
}

.tm-grid-bg {
  background-image:
    linear-gradient(rgba(46,158,91,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46,158,91,0.045) 1px, transparent 1px),
    radial-gradient(ellipse 900px 500px at 50% -8%, rgba(46,158,91,0.07), transparent 70%);
  background-size: 36px 36px, 36px 36px, 100% 100%;
}

.tm-card {
  position: relative;
  overflow: hidden;
  animation: tm-fade-up 0.2s ease;
  box-shadow: 0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px -14px rgba(0,0,0,0.55);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.tm-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 16px 32px -14px rgba(0,0,0,0.65), 0 0 0 1px rgba(46,158,91,0.18);
}
.tm-card::before {
  content: "";
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent 0%, #2E9E5B 35%, #F2B705 55%, #E8821E 75%, transparent 100%);
  background-size: 300px 100%;
  animation: tm-scan 7s linear infinite;
  opacity: 0.6;
}

.tm-glow-orb {
  position: absolute; top: 0; left: 50%; width: 340px; height: 340px; border-radius: 50%;
  background: radial-gradient(circle, rgba(46,158,91,0.16), rgba(232,130,30,0.06) 55%, transparent 75%);
  filter: blur(10px); pointer-events: none; z-index: 0;
  animation: tm-glow-drift 6s ease-in-out infinite;
}

input:focus, select:focus, textarea:focus {
  outline: none !important;
  border-color: #2E9E5B !important;
  box-shadow: 0 0 0 3px rgba(46,158,91,0.16), 0 0 14px rgba(46,158,91,0.12) !important;
  transition: box-shadow .15s, border-color .15s;
}

.tm-tab-active { position: relative; color: #ECE9E2 !important; }
.tm-tab-active::before {
  content: "";
  position: absolute; top: 3px; bottom: 5px; left: 2px; right: 2px;
  background: rgba(46,158,91,0.09); border-radius: 6px 6px 0 0; z-index: -1;
}
.tm-tab-active::after {
  content: "";
  position: absolute; bottom: -1px; left: 2px; right: 2px; height: 2px;
  background: #2E9E5B; box-shadow: 0 0 8px rgba(46,158,91,0.75);
}

@keyframes tm-toast-in {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}
.tm-toast { animation: tm-toast-in 0.2s ease; }
`;

function Logo({ size = 22, showWordmark = true }) {
  return (
    <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: size * 0.78, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      <span style={{ color: BRAND.greenBright }}>TRAI</span>{" "}
      <span style={{ color: BRAND.orange }}>MEDIA</span>
    </span>
  );
}

const AVATAR_COLORS = [BRAND.greenBright, BRAND.orange, BRAND.gold, "#5B8DEF", "#B565D8", "#4CC9C0", "#E1483B"];
function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}
function colorForName(str) {
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function Avatar({ name, size = 28 }) {
  const bg = colorForName(name || "");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: `${bg}22`, border: `1px solid ${bg}55`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      fontFamily: "Oswald", fontWeight: 600, fontSize: size * 0.4, color: bg, letterSpacing: "0.02em",
    }}>{initials(name)}</div>
  );
}

function ToastHost({ toast }) {
  if (!toast) return null;
  const good = toast.tone !== "bad";
  return (
    <div className="tm-toast" style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 100,
      display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8,
      background: "#131712F2", backdropFilter: "blur(6px)", border: `1px solid ${good ? "#2E9E5B55" : "#E1483B55"}`,
      boxShadow: `0 8px 24px -8px rgba(0,0,0,0.6), 0 0 16px ${good ? "#2E9E5B22" : "#E1483B22"}`,
      fontFamily: "Inter", fontSize: 13, fontWeight: 600, color: "#ECE9E2",
    }}>
      {good ? <Check size={14} color="#2E9E5B" /> : <AlertCircle size={14} color="#E1483B" />}
      {toast.text}
    </div>
  );
}

function ConfirmDialog({ state, onConfirm, onCancel }) {
  if (!state) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(4,6,4,0.72)", backdropFilter: "blur(2px)", padding: 16,
    }} onClick={onCancel}>
      <div className="tm-card" style={{
        background: C.surface, border: `1px solid ${C.rec}55`, borderRadius: 10, padding: 22, maxWidth: 400, width: "100%",
        boxShadow: "0 24px 60px -16px rgba(0,0,0,0.75)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: `${C.rec}18`, border: `1px solid ${C.rec}44`, flexShrink: 0 }}>
            <AlertCircle size={16} color={C.rec} />
          </span>
          <h3 style={{ fontFamily: "Oswald", fontSize: 16, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0, color: C.text }}>Confirm Delete</h3>
        </div>
        <p style={{ color: C.textDim, fontSize: 13.5, marginBottom: 20, lineHeight: 1.5 }}>{state.message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn onClick={onConfirm} style={{ background: C.rec, color: "#fff", border: `1px solid ${C.rec}` }}><Trash2 size={13} /> Delete</Btn>
        </div>
      </div>
    </div>
  );
}

const todayStr = () => new Date().toISOString().slice(0, 10);
// A monotonic counter guarantees uniqueness even if many IDs are generated within the same
// millisecond (confirmed by testing: 2000 rapid calls without this landed in one millisecond,
// leaving only a 1000-value random suffix to tell them apart — real collisions resulted).
let uidCounter = 0;
const uid = (p) => {
  uidCounter += 1;
  return `${p}-${Date.now().toString(36)}${uidCounter.toString(36)}${Math.floor(Math.random() * 1000)}`;
};
const money = (n) => `₹${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const DEPARTMENTS = ["Camera", "Sound", "Editing", "Production", "Direction", "Admin/Ops"];
const EMPLOYEE_STATUSES = ["Active", "Inactive", "Suspended", "Resigned", "Terminated", "Archived"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Freelance", "Contract"];
const EXPENSE_CATEGORIES = ["Equipment", "Travel", "Location", "Talent", "Post-Production", "Misc"];
const VOUCHER_TYPES = ["Travel", "Meal", "Equipment", "Accommodation", "Other"];
const ROLE_OPTIONS = ["Director", "Replay Operator", "Graphics Operator", "Technician", "Stream Operator", "Drone Operator", "Camera-Man", "Audio Operator", "Helper", "Producer", "Commentator", "Floor Manager", "Others"];
const PROJECT_STATUSES = ["Planning", "Active", "On Hold", "Completed"];
const STAFF_ROLES = ["admin", "manager", "accountant"];
const LEDGER_TYPES = ["Income", "Expense", "Asset Purchase", "Loss Booking"];
const PAYMENT_MODES = ["Cash", "Account"];
const ACCOUNTS = ["Trai", "Today's"];
const LEDGER_CATEGORIES = {
  "Income": ["Client Payment", "Advance Received", "Other Income"],
  "Expense": ["Equipment", "Vendor Bill", "Travel", "Location", "Talent", "Post-Production", "Salary/Remuneration", "Rent", "Utilities", "Misc"],
  "Asset Purchase": ["Camera Gear", "Computer/IT", "Vehicle", "Furniture", "Other Asset"],
  "Loss Booking": ["Bad Debt", "Damaged Equipment", "Theft/Loss", "Write-off", "Other Loss"],
};
const BILL_STATUSES = ["Due", "Partially Paid", "Paid"];
const FIXED_EXPENSE_CATEGORIES = ["Staff Salary", "Office Rent", "Office Expense", "Utilities", "Internet/Phone", "Insurance", "Other"];
const PIE_COLORS = [BRAND.greenBright, BRAND.orange, BRAND.gold, "#5B8DEF", "#B565D8", "#4CC9C0", "#E1483B", "#8A9188"];
const EQUIPMENT_CATEGORIES = ["Camera", "Lens", "Audio", "Lighting", "Computer/IT", "Vehicle", "Other"];
const EQUIPMENT_STATUSES = ["Available", "Assigned", "On Project", "Under Maintenance", "Damaged", "Lost", "Sold"];
const QUOTE_STATUSES = ["Draft", "Sent", "Accepted", "Rejected", "Expired"];
const INVOICE_STATUSES = ["Draft", "Issued", "Partially Paid", "Paid", "Overdue", "Cancelled"];
const PARTY_TYPES = ["Vendor", "Client", "Freelancer", "Other"];

function useTimecode() {
  const [tc, setTc] = useState("00:00:00:00");
  useEffect(() => {
    const iv = setInterval(() => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      const ff = String(Math.floor((d.getMilliseconds() / 1000) * 25)).padStart(2, "0");
      setTc(`${hh}:${mm}:${ss}:${ff}`);
    }, 200); // updates 5x/sec — enough to feel live without re-rendering the header 25x/sec
    return () => clearInterval(iv);
  }, []);
  return tc;
}

// ---------- CSV export ----------
function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Full-system backup — every stored record, as one downloadable JSON file. This is the actual
// safety net: CSV exports cover single lists, but this is what you'd restore the whole app from
// if data ever goes missing (whether from a bug, an accident, or testing on the wrong link).
const BACKUP_KEYS = ["employees", "projects", "attendance", "vouchers", "expenses", "users", "security", "ledger", "rates", "payroll", "fixedExpenses", "equipment", "vendors", "quotations", "invoices", "hires", "parties", "bills"];

function exportFullBackup(data) {
  const backup = { app: "Trai Media Ops", exportedAt: new Date().toISOString(), version: 1, data };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `trai_media_backup_${todayStr()}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function projectFinancials(project, expenses, vouchers) {
  const projExpenses = expenses.filter((e) => e.project === project.name);
  const projVouchers = vouchers.filter((v) => v.kind === "voucher" && v.project === project.name && ["Approved", "Partially Paid", "Paid"].includes(v.status));
  const totalExpenses = projExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalVouchers = projVouchers.reduce((s, v) => s + (v.amount || 0), 0);
  const totalSpent = totalExpenses + totalVouchers;
  const quote = project.quoteAmount || 0;
  const variance = quote - totalSpent;
  const utilization = quote > 0 ? (totalSpent / quote) * 100 : null;
  return { projExpenses, projVouchers, totalExpenses, totalVouchers, totalSpent, quote, variance, utilization };
}

// Dashboard filtering — shared across every role's dashboard. Deliberately returns the SAME
// shape as the original data object, with only the activity arrays (attendance, vouchers,
// expenses, ledger, payroll, invoices) narrowed — never the employee/project lists themselves in
// time-based modes, since headcount and a project's current status are present-tense facts, not
// something that happened "in August." This means every existing dashboard calculation, written
// against `data.X`, works correctly unchanged when handed this filtered object instead — nothing
// downstream needs to know filtering happened at all.
function applyDashboardFilter(data, filter) {
  const { mode, year, month, projectId } = filter;
  if (mode === "overall" || !mode) return data;

  if (mode === "project") {
    if (!projectId) return data;
    const project = data.projects.find((p) => p.id === projectId);
    const projectName = project?.name;
    return {
      ...data,
      projects: project ? [project] : [],
      attendance: data.attendance.filter((a) => a.project === projectName),
      vouchers: data.vouchers.filter((v) => v.project === projectName),
      expenses: data.expenses.filter((e) => e.project === projectName),
      ledger: (data.ledger || []).filter((l) => l.project === projectName),
      invoices: (data.invoices || []).filter((i) => i.project === projectName),
    };
  }

  const matchesDate = mode === "yearly"
    ? (d) => d && d.slice(0, 4) === String(year)
    : (d) => d && d.slice(0, 7) === month;

  return {
    ...data,
    attendance: data.attendance.filter((a) => matchesDate(a.date)),
    vouchers: data.vouchers.filter((v) => matchesDate(v.date)),
    expenses: data.expenses.filter((e) => matchesDate(e.date)),
    ledger: (data.ledger || []).filter((l) => matchesDate(l.date)),
    payroll: (data.payroll || []).filter((p) => matchesDate(p.date)),
    invoices: (data.invoices || []).filter((i) => matchesDate(i.date)),
  };
}

// Years offered in the Yearly picker: always includes the current year, plus any year that
// actually has real records, so the list is never empty on a fresh company and never missing a
// year that genuinely has history.
function getAvailableYears(data) {
  const years = new Set([new Date().getFullYear()]);
  const collect = (arr) => (arr || []).forEach((item) => { if (item.date) years.add(parseInt(item.date.slice(0, 4), 10)); });
  collect(data.attendance); collect(data.vouchers); collect(data.expenses); collect(data.ledger); collect(data.invoices);
  return [...years].sort((a, b) => b - a);
}

function DashboardFilterBar({ filter, setFilter, projects }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
      <SelectInput value={filter.mode} onChange={(e) => setFilter({ ...filter, mode: e.target.value })} style={{ width: 160 }}>
        <option value="overall">Overall (Total)</option>
        <option value="yearly">Yearly</option>
        <option value="monthly">Monthly</option>
        <option value="project">Project-wise</option>
      </SelectInput>
      {filter.mode === "yearly" && (
        <SelectInput value={filter.year} onChange={(e) => setFilter({ ...filter, year: e.target.value })} style={{ width: 110 }}>
          {filter.availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectInput>
      )}
      {filter.mode === "monthly" && (
        <TextInput type="month" value={filter.month} onChange={(e) => setFilter({ ...filter, month: e.target.value })} style={{ width: 160 }} />
      )}
      {filter.mode === "project" && (
        <SelectInput value={filter.projectId} onChange={(e) => setFilter({ ...filter, projectId: e.target.value })} style={{ width: 220 }}>
          <option value="">Select project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </SelectInput>
      )}
      {filter.mode !== "overall" && <span style={{ color: C.textDim, fontSize: 11.5 }}>Employee/project counts stay current — only activity totals are scoped to this filter.</span>}
    </div>
  );
}

// Computes the "needs your attention" list per role. Pure and cheap — recalculated from data
// already in memory, no extra storage reads. Each item names the tab it belongs to, so the
// notification bell can jump straight there when clicked.
function computeNotifications(data, roleLabel, empCode) {
  const role = (roleLabel || "").toLowerCase();
  const today = todayStr();
  const items = [];
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  if (role === "admin" || role === "manager") {
    const pendingVouchers = (data.vouchers || []).filter((v) => v.status === "Pending").length;
    if (pendingVouchers > 0) items.push({ id: "pv", text: `${plural(pendingVouchers, "voucher")} awaiting approval`, tone: "warn", tab: "Approvals" });
    const pendingAttendance = (data.attendance || []).filter((a) => a.approval === "Pending").length;
    if (pendingAttendance > 0) items.push({ id: "pa", text: `${plural(pendingAttendance, "attendance record")} awaiting approval`, tone: "warn", tab: "Approvals" });
  }

  if (role === "admin" || role === "accountant") {
    const payableVouchers = (data.vouchers || []).filter((v) => v.kind === "voucher" && ["Approved", "Partially Paid"].includes(v.status)).length;
    if (payableVouchers > 0) items.push({ id: "pyv", text: `${plural(payableVouchers, "voucher")} approved, awaiting payment`, tone: "warn", tab: "Voucher Payments" });
    const overdueInvoices = (data.invoices || []).filter((i) => i.dueDate && i.dueDate < today && i.status !== "Paid" && i.status !== "Cancelled").length;
    if (overdueInvoices > 0) items.push({ id: "oi", text: `${plural(overdueInvoices, "invoice")} overdue`, tone: "bad", tab: "Billing" });
    const billsDue = (data.bills || []).filter((b) => (Number(b.amount) || 0) - (Number(b.paidAmount) || 0) > 0).length;
    if (billsDue > 0) items.push({ id: "bd", text: `${plural(billsDue, "vendor bill")} due`, tone: "warn", tab: "Vendor" });
    const overdueHires = (data.hires || []).filter((h) => h.status === "Hired" && h.expectedReturn && h.expectedReturn < today).length;
    if (overdueHires > 0) items.push({ id: "oh", text: `${plural(overdueHires, "equipment hire")} overdue for return`, tone: "bad", tab: "Vendor" });
    const overBudget = (data.projects || []).filter((p) => {
      if (p.status !== "Active") return false;
      const f = projectFinancials(p, data.expenses || [], data.vouchers || []);
      return f.utilization !== null && f.utilization >= 85;
    }).length;
    if (overBudget > 0) items.push({ id: "ob", text: `${plural(overBudget, "project")} at 85%+ of budget`, tone: "bad", tab: "Projects" });
  }

  if (role === "employee" && empCode) {
    const rejectedVouchers = (data.vouchers || []).filter((v) => v.code === empCode && v.status === "Rejected").length;
    if (rejectedVouchers > 0) items.push({ id: "rv", text: `${plural(rejectedVouchers, "voucher")} rejected`, tone: "bad", tab: "Vouchers" });
    const rejectedAttendance = (data.attendance || []).filter((a) => a.code === empCode && a.approval === "Rejected").length;
    if (rejectedAttendance > 0) items.push({ id: "ra", text: `${plural(rejectedAttendance, "attendance record")} rejected`, tone: "bad", tab: "Attendance" });
  }

  return items;
}

function NotificationBell({ data, roleLabel, empCode, onNavigate }) {
  const [open, setOpen] = useState(false);
  const notifications = computeNotifications(data, roleLabel, empCode);
  const count = notifications.length;

  useEffect(() => {
    document.title = count > 0 ? `(${count}) Trai Media Ops` : "Trai Media Ops";
  }, [count]);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} title="Notifications" style={{
        position: "relative", background: open ? C.surface3 : "transparent", border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center", transition: "background .15s",
      }}>
        <Bell size={15} color={C.text} />
        {count > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5, background: C.rec, color: "#fff",
            fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
            fontFamily: "IBM Plex Mono", boxShadow: `0 0 8px ${C.rec}88`,
          }}>{count}</span>
        )}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div className="tm-card" style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, zIndex: 91,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 8,
            boxShadow: "0 20px 50px -12px rgba(0,0,0,0.7)", maxHeight: 380, overflowY: "auto",
          }}>
            <div style={{ fontFamily: "Oswald", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", color: C.textDim, padding: "6px 8px" }}>Notifications</div>
            {notifications.length === 0 ? (
              <div style={{ padding: "20px 8px", textAlign: "center", color: C.textDim, fontSize: 12.5 }}>You're all caught up.</div>
            ) : notifications.map((n) => (
              <button key={n.id} onClick={() => { onNavigate(n.tab); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                background: "none", border: "none", padding: "9px 8px", borderRadius: 6, cursor: "pointer",
                fontFamily: "Inter", fontSize: 12.5, color: C.text, transition: "background .1s",
              }} onMouseEnter={(e) => (e.currentTarget.style.background = C.surface3)} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                <Pill tone={n.tone}>{n.tone === "bad" ? "!" : "•"}</Pill>
                <span style={{ flex: 1 }}>{n.text}</span>
                <ChevronRight size={13} color={C.textDim} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function exportProjectReport(project, expenses, vouchers) {
  const f = projectFinancials(project, expenses, vouchers);
  const rows = [
    ["PROJECT EXPENSE REPORT"],
    ["Project", project.name],
    ["Client", project.client || ""],
    ["Status", project.status],
    ["Deadline", project.deadline || ""],
    ["Quoted Amount", f.quote],
    ["Generated", new Date().toISOString()],
    [],
    ["EXPENSES (Accountant-logged)"],
    ["Date", "Category", "Vendor", "Amount", "Note"],
    ...f.projExpenses.map((e) => [e.date, e.category, e.vendor || "", e.amount, e.note || ""]),
    ["", "", "Total Expenses", f.totalExpenses, ""],
    [],
    ["APPROVED EMPLOYEE VOUCHERS"],
    ["Date", "Employee Code", "Type", "Amount", "Note"],
    ...f.projVouchers.map((v) => [v.date, v.code, v.type, v.amount, v.note || ""]),
    ["", "", "Total Approved Vouchers", f.totalVouchers, ""],
    [],
    ["SUMMARY"],
    ["Quoted Amount", f.quote],
    ["Total Expenses", f.totalExpenses],
    ["Total Approved Vouchers", f.totalVouchers],
    ["Total Spent", f.totalSpent],
    ["Variance (Quoted - Spent)", f.variance],
    ["Utilization", f.utilization === null ? "N/A" : `${f.utilization.toFixed(1)}%`],
  ];
  downloadCSV(`${project.name.replace(/\s+/g, "_")}_expense_report_${todayStr()}.csv`, rows);
}

function exportAllProjectsSummary(projects, expenses, vouchers) {
  const rows = [
    ["ALL PROJECTS — EXPENSE SUMMARY", "", "", "", "", "", "", ""],
    ["Generated", new Date().toISOString()],
    [],
    ["Project", "Client", "Status", "Quoted", "Expenses", "Approved Vouchers", "Total Spent", "Variance", "Utilization"],
    ...projects.map((p) => {
      const f = projectFinancials(p, expenses, vouchers);
      return [p.name, p.client || "", p.status, f.quote, f.totalExpenses, f.totalVouchers, f.totalSpent, f.variance, f.utilization === null ? "N/A" : `${f.utilization.toFixed(1)}%`];
    }),
  ];
  downloadCSV(`all_projects_summary_${todayStr()}.csv`, rows);
}

// ---------- Ledger & Payroll math ----------
function hoursBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin < startMin) endMin += 24 * 60; // overnight shift
  return (endMin - startMin) / 60;
}

function employeeEarnings(empCode, data) {
  const records = (data.attendance || []).filter((a) => a.code === empCode && a.approval === "Approved" && a.status === "Present" && a.project);
  const paidIds = new Set((data.payroll || []).filter((p) => p.employeeCode === empCode).flatMap((p) => p.attendanceIds || []));
  const rows = records.map((a) => {
    const rate = (data.rates || []).find((r) => r.employeeCode === empCode && r.project === a.project);
    const hours = hoursBetween(a.startTime, a.endTime);
    const base = rate ? rate.dayRate : 0;
    const otHours = hours > 11 ? hours - 11 : 0;
    const overtime = rate && hours > 11 ? rate.otRate : 0; // fixed overtime amount, not per-hour — triggers once the 11h threshold is crossed
    const total = base + overtime;
    return { ...a, hours, base, otHours, overtime, total, hasRate: !!rate, paid: paidIds.has(a.id) };
  }).sort((x, y) => y.date.localeCompare(x.date));
  const totalEarned = rows.reduce((s, r) => s + r.total, 0);
  const totalPaid = rows.filter((r) => r.paid).reduce((s, r) => s + r.total, 0);
  const balance = totalEarned - totalPaid;
  return { rows, totalEarned, totalPaid, balance };
}

function employeeIncomeBreakdown(empCode, data, dimension) {
  const { rows } = employeeEarnings(empCode, data);
  const groups = {};
  rows.forEach((r) => {
    const key = dimension === "project" ? (r.project || "Unassigned") : (r.date ? r.date.slice(0, 7) : "Unknown");
    groups[key] = (groups[key] || 0) + r.total;
  });
  const list = Object.entries(groups).map(([key, total]) => ({ key, total }));
  return dimension === "month" ? list.sort((a, b) => a.key.localeCompare(b.key)) : list.sort((a, b) => b.total - a.total);
}

function ledgerBreakdown(ledger, projects, dimension) {
  const groups = {};
  (ledger || []).filter((e) => !e.voided).forEach((e) => {
    if (e.type !== "Income" && e.type !== "Expense") return;
    let key;
    if (dimension === "project") key = e.project || "Unassigned";
    else if (dimension === "month") key = e.date ? e.date.slice(0, 7) : "Unknown";
    else {
      const proj = projects.find((p) => p.name === e.project);
      key = proj?.client ? proj.client : (e.project ? "No client set" : "Company-wide");
    }
    if (!groups[key]) groups[key] = { income: 0, expense: 0 };
    if (e.type === "Income") groups[key].income += e.amount;
    else groups[key].expense += e.amount;
  });
  return Object.entries(groups)
    .map(([key, v]) => ({ key, income: v.income, expense: v.expense, net: v.income - v.expense }))
    .sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
}


function ledgerSummary(ledger) {
  const list = (ledger || []).filter((e) => !e.voided);
  const sumFor = (pred) => list.filter(pred).reduce((s, e) => s + (e.amount || 0), 0);
  const isOutflow = (e) => e.type === "Expense" || e.type === "Asset Purchase" || e.type === "Loss Booking";
  const cashBalance = sumFor((e) => e.type === "Income" && e.paymentMode === "Cash") - sumFor((e) => isOutflow(e) && e.paymentMode === "Cash");
  const traiBalance = sumFor((e) => e.type === "Income" && e.paymentMode === "Account" && e.account === "Trai") - sumFor((e) => isOutflow(e) && e.paymentMode === "Account" && e.account === "Trai");
  const todaysBalance = sumFor((e) => e.type === "Income" && e.paymentMode === "Account" && e.account === "Today's") - sumFor((e) => isOutflow(e) && e.paymentMode === "Account" && e.account === "Today's");
  const totalIncome = sumFor((e) => e.type === "Income");
  const totalExpense = sumFor((e) => e.type === "Expense");
  const totalAsset = sumFor((e) => e.type === "Asset Purchase");
  const totalLoss = sumFor((e) => e.type === "Loss Booking");
  const netPL = totalIncome - totalExpense - totalLoss;
  return { cashBalance, traiBalance, todaysBalance, totalIncome, totalExpense, totalAsset, totalLoss, netPL };
}

// Builds the data snapshot handed to the AI — deliberately reuses the SAME computed functions the
// dashboard itself uses (ledgerSummary, projectFinancials, monthlySalaryReport), so the AI's answers
// can never drift from what's actually shown on screen. It's a summary, not a raw data dump — keeps
// the request small and avoids exposing anything not needed to answer business questions.
function buildAIContext(data) {
  const today = todayStr();
  const ls = ledgerSummary(data.ledger || []);
  const lines = [];

  lines.push(`Today's date: ${today}`);
  lines.push(`Total employees: ${data.employees.length} (${data.employees.filter((e) => e.status === "Active").length} active)`);

  lines.push(`\nCASH & ACCOUNTS:`);
  lines.push(`Cash balance: ${money(ls.cashBalance)}`);
  lines.push(`Trai A/C balance: ${money(ls.traiBalance)}`);
  lines.push(`Today's A/C balance: ${money(ls.todaysBalance)}`);
  lines.push(`Net P&L (all time): ${money(ls.netPL)}`);

  lines.push(`\nPROJECTS:`);
  if (data.projects.length === 0) lines.push("(none yet)");
  data.projects.forEach((p) => {
    const f = projectFinancials(p, data.expenses || [], data.vouchers || []);
    const timeline = p.endDate ? ` · ends ${p.endDate}${p.endDate < today && p.status === "Active" ? " (PAST END DATE, still Active)" : ""}` : (p.deadline ? ` · due ${p.deadline}` : "");
    const staffing = ` · ${p.assigned.length} assigned`;
    lines.push(`- ${p.name} (${p.status}, client: ${p.client || "—"}): quoted ${money(f.quote)}, spent ${money(f.totalSpent)}${f.utilization !== null ? `, ${f.utilization.toFixed(0)}% of budget used` : ", no quote set"}${timeline}${staffing}`);
  });

  lines.push(`\nAPPROVALS PENDING:`);
  const pendingVouchers = (data.vouchers || []).filter((v) => v.status === "Pending");
  const pendingAttendance = (data.attendance || []).filter((a) => a.approval === "Pending");
  lines.push(`- ${pendingVouchers.length} vouchers awaiting approval, totaling ${money(pendingVouchers.reduce((s, v) => s + (v.amount || 0), 0))}`);
  lines.push(`- ${pendingAttendance.length} attendance records awaiting approval`);
  const payableVouchers = (data.vouchers || []).filter((v) => v.kind === "voucher" && ["Approved", "Partially Paid"].includes(v.status));
  lines.push(`- ${payableVouchers.length} vouchers approved and awaiting payment, totaling ${money(payableVouchers.reduce((s, v) => s + ((v.amount || 0) - (Number(v.paidAmount) || 0)), 0))}`);

  lines.push(`\nPAYROLL (${today.slice(0, 7)}):`);
  const salaryReport = monthlySalaryReport(data, today.slice(0, 7));
  lines.push(`- Total payroll this month: ${money(salaryReport.reduce((s, r) => s + r.total, 0))}, of which ${money(salaryReport.reduce((s, r) => s + r.due, 0))} is still unpaid`);

  lines.push(`\nBILLING:`);
  const overdueInvoices = (data.invoices || []).filter((i) => i.dueDate && i.dueDate < today && i.status !== "Paid" && i.status !== "Cancelled");
  lines.push(`- ${overdueInvoices.length} overdue invoices, totaling ${money(overdueInvoices.reduce((s, i) => s + (i.total - i.amountPaid), 0))}`);
  const billsDue = (data.bills || []).filter((b) => (Number(b.amount) || 0) - (Number(b.paidAmount) || 0) > 0);
  lines.push(`- ${billsDue.length} vendor bills due, totaling ${money(billsDue.reduce((s, b) => s + ((Number(b.amount) || 0) - (Number(b.paidAmount) || 0)), 0))}`);

  return lines.join("\n");
}

const AI_SYSTEM_PROMPT = "You are a sharp, concise business analyst for Trai Media & Entertainment, a broadcast production company in India. Answer using ONLY the data snapshot given to you — never invent numbers that aren't there. Use ₹ for money. Keep answers short and direct, like a knowledgeable colleague, not a chatbot. If something asked isn't covered by the data, say so plainly rather than guessing. You can reference earlier turns in this conversation.";

// apiMessages: real conversation history (alternating user/assistant), so follow-up questions
// like "what about last month?" work — each USER turn carries a freshly rebuilt data snapshot
// (built by the caller) so answers never go stale as the conversation continues, while prior
// assistant answers are kept as-is for genuine multi-turn context.
async function askAI(apiMessages) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: AI_SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const json = await response.json();
  const text = (json.content || []).map((item) => (item.type === "text" ? item.text : "")).filter(Boolean).join("\n");
  return text || "I couldn't generate a response for that.";
}

// Smart categorization: given a ledger entry's note/party and its type, asks AI to pick the single
// best-matching category from the exact allowed list for that type. Constrained to return ONLY a
// category name so it's safe to auto-fill a dropdown with — validated against the real list before
// use, so a malformed or unexpected response never silently sets something invalid.
async function suggestLedgerCategory(type, note, party, categories) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 20,
      messages: [{
        role: "user",
        content: `A ${type} ledger entry has note: "${note || "(none)"}" and party: "${party || "(none)"}". Pick the single best-matching category from this exact list, responding with ONLY the category text and nothing else: ${categories.join(" | ")}`,
      }],
    }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const json = await response.json();
  const text = (json.content || []).map((item) => (item.type === "text" ? item.text : "")).join("").trim();
  return categories.find((c) => text.toLowerCase().includes(c.toLowerCase())) || null;
}

function exportLedgerCSV(ledger) {
  const s = ledgerSummary(ledger);
  const rows = [
    ["LEDGER EXPORT"],
    ["Generated", new Date().toISOString()],
    [],
    ["Date", "Type", "Category", "Party", "Project", "Payment Mode", "Account", "Amount", "Voided", "Void Reason", "Note"],
    ...ledger.map((e) => [e.date, e.type, e.category, e.party || "", e.project || "", e.paymentMode, e.paymentMode === "Account" ? e.account : "", e.amount, e.voided ? "Yes" : "No", e.voided ? (e.voidReason || "") : "", e.note || ""]),
    [],
    ["SUMMARY (excludes voided entries)"],
    ["Total Income", s.totalIncome],
    ["Total Expense", s.totalExpense],
    ["Total Asset Purchases", s.totalAsset],
    ["Total Loss Booked", s.totalLoss],
    ["Net P&L (Income - Expense - Loss)", s.netPL],
    ["Cash Balance", s.cashBalance],
    ["Trai A/C Balance", s.traiBalance],
    ["Today's A/C Balance", s.todaysBalance],
  ];
  downloadCSV(`ledger_export_${todayStr()}.csv`, rows);
}

// ---------- storage ----------
const STORE_KEY_LABELS = {
  employees: "Employees", projects: "Projects", attendance: "Attendance", vouchers: "Vouchers",
  expenses: "Expenses", users: "Accounts", security: "Security", ledger: "Ledger", rates: "Rates",
  payroll: "Payroll", fixedExpenses: "Fixed Expenses", equipment: "Equipment", vendors: "Vendors",
  quotations: "Quotations", invoices: "Invoices", hires: "Equipment Hires", parties: "Parties", bills: "Vendor Bills",
};

// Physical storage layout: 18 logical record types share just 4 actual storage keys ("buckets").
// This is the real fix for the repeated "some data didn't load / only 2 of 4 employees showed up"
// reports — every load or refresh used to fire 18 separate requests against a shared rate limit;
// now it's 4. The rest of the app is completely unaffected: it still reads/writes data.employees,
// data.projects, etc. exactly as before — only useStore knows buckets exist.
const BUCKETS = {
  hr: ["employees", "users", "security"],
  ops: ["projects", "attendance", "vouchers", "rates", "payroll"],
  finance: ["ledger", "expenses", "fixedExpenses", "quotations", "invoices", "bills"],
  vendor: ["equipment", "vendors", "hires", "parties"],
};
const KEY_TO_BUCKET = {};
Object.entries(BUCKETS).forEach(([bucket, keys]) => keys.forEach((k) => { KEY_TO_BUCKET[k] = bucket; }));
const emptyValueFor = (key) => (key === "security" ? {} : []);

function useStore() {
  const [data, setData] = useState({ employees: [], projects: [], attendance: [], vouchers: [], expenses: [], users: [], security: {}, ledger: [], rates: [], payroll: [], fixedExpenses: [], equipment: [], vendors: [], quotations: [], invoices: [], hires: [], parties: [], bills: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const showToast = useCallback((text, tone = "good") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // fallback: what to use for a key if its read fails. On first load there's nothing yet, so
  // empty is correct. On any later refresh, a failed read must NOT wipe good data already in
  // memory — that previously caused accounts to vanish (and logins to fail) on a single flaky read.
  // Buckets are fetched concurrently, with automatic retries per bucket: a transient failure gets
  // two more attempts with a short backoff before falling back, instead of failing on the first hiccup.
  const loadAll = useCallback(async (fallback) => {
    const failedBuckets = [];
    const bucketNames = Object.keys(BUCKETS);
    const fetchBucket = async (bucketName, attempt = 0) => {
      const bucketKeys = BUCKETS[bucketName];
      try {
        const r = await window.storage.get(bucketName, true);
        const parsed = r ? JSON.parse(r.value) : {};
        const filled = {};
        bucketKeys.forEach((k) => { filled[k] = parsed[k] !== undefined ? parsed[k] : emptyValueFor(k); });
        return filled;
      } catch {
        if (attempt < 2) {
          await new Promise((res) => setTimeout(res, 250 * (attempt + 1)));
          return fetchBucket(bucketName, attempt + 1);
        }
        failedBuckets.push(bucketName);
        const filled = {};
        bucketKeys.forEach((k) => { filled[k] = fallback && fallback[k] !== undefined ? fallback[k] : emptyValueFor(k); });
        return filled;
      }
    };
    const bucketResults = await Promise.all(bucketNames.map((b) => fetchBucket(b)));
    const out = Object.assign({}, ...bucketResults);
    const failedKeys = failedBuckets.flatMap((b) => BUCKETS[b]);
    return { out, anyFailed: failedBuckets.length > 0, failedKeys };
  }, []);

  useEffect(() => {
    loadAll(null).then(({ out }) => { setData(out); setLoading(false); }).catch(() => {
      setErr("Could not load data. Try refreshing.");
      setLoading(false);
    });
  }, [loadAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { out, anyFailed, failedKeys } = await loadAll(dataRef.current);
      setData(out);
      setErr(anyFailed ? `Couldn't refresh ${failedKeys.map((k) => STORE_KEY_LABELS[k] || k).join(", ")} after retrying — showing the last known values for it. Click Refresh to try again.` : null);
    } catch {
      setErr("Could not refresh data. Try again.");
    }
    setRefreshing(false);
  }, [loadAll]);

  // NOTE: no automatic background polling — see the bucket comment above for why request volume
  // matters here. Refreshing is manual (the header Refresh button): reliable, on demand, no runaway
  // request volume.

  // Fetches the CURRENT stored value for every key in a bucket (fresh from storage, not from
  // possibly-stale local memory), falling back to local memory only if that read itself fails.
  // Used by both persist() and persistAppend() so a write never blindly clobbers a sibling key's
  // more recent value with what this browser tab happened to have loaded earlier.
  const fetchFreshBucket = useCallback(async (bucketName) => {
    const bucketKeys = BUCKETS[bucketName];
    try {
      const r = await window.storage.get(bucketName, true);
      const parsed = r ? JSON.parse(r.value) : {};
      const filled = {};
      bucketKeys.forEach((k) => { filled[k] = parsed[k] !== undefined ? parsed[k] : (dataRef.current[k] !== undefined ? dataRef.current[k] : emptyValueFor(k)); });
      return filled;
    } catch {
      const filled = {};
      bucketKeys.forEach((k) => { filled[k] = dataRef.current[k] !== undefined ? dataRef.current[k] : emptyValueFor(k); });
      return filled;
    }
  }, []);

  const persist = useCallback(async (key, value) => {
    // Captured BEFORE setData below — this is what THIS session actually saw for this key when
    // the user started their edit, used for safe three-way reconciliation just below.
    const originalLocal = Array.isArray(dataRef.current[key]) ? dataRef.current[key] : null;
    setData((prev) => ({ ...prev, [key]: value }));
    const bucketName = KEY_TO_BUCKET[key];
    try {
      const fresh = await fetchFreshBucket(bucketName);
      let finalValue = value;
      // Three-way reconciliation: persistAppend already protects pure additions, but an edit or
      // delete built from data.X.map(...)/.filter(...) is built from whatever THIS session had
      // loaded — which может be missing something another session added in the meantime (e.g. a
      // Manager approving a voucher while an employee submits a new one). Comparing what this
      // session started with (originalLocal) against what's actually on the server right now
      // (fresh[key]) tells us, unambiguously, which items are "new from elsewhere" (present on
      // the server, absent from originalLocal — restore them) versus "removed on purpose by this
      // session" (present in originalLocal, absent from value — leave them removed). No guessing.
      if (Array.isArray(value) && Array.isArray(fresh[key]) && originalLocal) {
        const idOf = (item) => item?.id ?? item?.code ?? null;
        const originalIds = new Set(originalLocal.map(idOf).filter(Boolean));
        const concurrentAdds = fresh[key].filter((item) => {
          const id = idOf(item);
          return id && !originalIds.has(id);
        });
        if (concurrentAdds.length > 0) finalValue = [...value, ...concurrentAdds];
      }
      const payload = { ...fresh, [key]: finalValue };
      const r = await window.storage.set(bucketName, JSON.stringify(payload), true);
      if (!r) { setErr(`Failed to save ${key}. Changes may not persist.`); showToast(`Couldn't save ${STORE_KEY_LABELS[key] || key}`, "bad"); }
      else { setErr(null); showToast(`${STORE_KEY_LABELS[key] || key} saved`); }
    } catch {
      setErr(`Failed to save ${key}. Changes may not persist.`);
      showToast(`Couldn't save ${STORE_KEY_LABELS[key] || key}`, "bad");
    }
  }, [showToast, fetchFreshBucket]);

  // Concurrency-safe add: for "create a new record" actions, two people saving to the same list
  // around the same time can otherwise silently erase each other's new record — each save is built
  // from whatever was in that browser tab's memory, not from what's actually in storage right then.
  // This re-reads the real current value immediately before writing and appends onto THAT, so a
  // record someone else just added in another session survives instead of being overwritten.
  const persistAppend = useCallback(async (key, newItem) => {
    const bucketName = KEY_TO_BUCKET[key];
    const fresh = await fetchFreshBucket(bucketName);
    const baseArray = Array.isArray(fresh[key]) ? fresh[key] : [];
    const merged = [...baseArray, newItem];
    setData((prev) => ({ ...prev, [key]: merged }));
    try {
      const payload = { ...fresh, [key]: merged };
      const r = await window.storage.set(bucketName, JSON.stringify(payload), true);
      if (!r) { setErr(`Failed to save ${key}. Changes may not persist.`); showToast(`Couldn't save ${STORE_KEY_LABELS[key] || key}`, "bad"); }
      else { setErr(null); showToast(`${STORE_KEY_LABELS[key] || key} saved`); }
    } catch {
      setErr(`Failed to save ${key}. Changes may not persist.`);
      showToast(`Couldn't save ${STORE_KEY_LABELS[key] || key}`, "bad");
    }
  }, [showToast, fetchFreshBucket]);

  const resetAll = useCallback(async () => {
    for (const bucketName of Object.keys(BUCKETS)) {
      try { await window.storage.delete(bucketName, true); } catch {}
    }
    setData({ employees: [], projects: [], attendance: [], vouchers: [], expenses: [], users: [], security: {}, ledger: [], rates: [], payroll: [], fixedExpenses: [], equipment: [], vendors: [], quotations: [], invoices: [], hires: [], parties: [], bills: [] });
  }, []);

  const [confirmState, setConfirmState] = useState(null); // { message, onConfirm } | null
  const confirmDelete = useCallback((message, onConfirm) => {
    setConfirmState({ message, onConfirm });
  }, []);
  const cancelConfirm = useCallback(() => setConfirmState(null), []);
  const runConfirm = useCallback(() => {
    if (confirmState?.onConfirm) confirmState.onConfirm();
    setConfirmState(null);
  }, [confirmState]);

  return { data, persist, persistAppend, loading, refreshing, refresh, err, resetAll, toast, confirmState, confirmDelete, cancelConfirm, runConfirm };
}

// ---------- small UI atoms ----------
const Label = ({ children }) => (
  <label style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textDim, fontFamily: "Inter", fontWeight: 600, display: "block", marginBottom: 6 }}>
    {children}
  </label>
);

const inputStyle = {
  width: "100%", background: C.surface3, border: `1px solid ${C.border}`, borderRadius: 6,
  padding: "9px 11px", color: C.text, fontFamily: "Inter", fontSize: 14, outline: "none", boxSizing: "border-box",
};

const TextInput = (props) => <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;

function PasswordField({ label, value, onChange, placeholder, onKeyDown }) {
  const [show, setShow] = useState(false);
  const id = React.useId ? React.useId() : `pw-${label}`;
  return (
    <div>
      {label && <Label>{label}</Label>}
      <TextInput type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} />
      <label htmlFor={id} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, cursor: "pointer", userSelect: "none" }}>
        <input id={id} type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} style={{ accentColor: C.tally, width: 13, height: 13, cursor: "pointer" }} />
        <span style={{ fontSize: 11.5, color: C.textDim, fontFamily: "Inter" }}>Show password</span>
      </label>
    </div>
  );
}
const SelectInput = ({ children, ...props }) => <select {...props} style={{ ...inputStyle, ...(props.style || {}) }}>{children}</select>;
const TextArea = (props) => <textarea {...props} style={{ ...inputStyle, resize: "vertical", minHeight: 60, ...(props.style || {}) }} />;

const Btn = ({ children, variant = "primary", ...props }) => {
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.tally}, #248a4d)`, color: "#08120D", border: `1px solid ${C.tally}`, boxShadow: `0 0 0px ${C.tally}` },
    danger: { background: "transparent", color: C.rec, border: `1px solid ${C.rec}55` },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    amber: { background: `linear-gradient(135deg, ${C.amber}, #c96f14)`, color: "#241A05", border: `1px solid ${C.amber}` },
  };
  const glow = {
    primary: `0 0 16px ${C.tally}66`,
    danger: `0 0 12px ${C.rec}44`,
    ghost: `0 0 10px ${C.tally}22`,
    amber: `0 0 14px ${C.amber}55`,
  };
  return (
    <button
      {...props}
      style={{
        ...variants[variant], fontFamily: "Inter", fontWeight: 600, fontSize: 13, borderRadius: 6,
        padding: "8px 14px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
        transition: "opacity .15s, box-shadow .15s, transform .1s", ...(props.style || {}),
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.boxShadow = glow[variant]; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.boxShadow = variants[variant].boxShadow || "none"; }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
};

const Pill = ({ tone = "dim", children }) => {
  const tones = {
    dim: { color: C.textDim, border: `1px solid ${C.border}` },
    good: { color: C.tally, border: `1px solid ${C.tally}55`, background: `${C.tally}14`, boxShadow: `0 0 8px ${C.tally}22` },
    warn: { color: C.amber, border: `1px solid ${C.amber}55`, background: `${C.amber}14`, boxShadow: `0 0 8px ${C.amber}22` },
    bad: { color: C.rec, border: `1px solid ${C.rec}55`, background: `${C.rec}14`, boxShadow: `0 0 8px ${C.rec}22` },
  };
  return <span style={{ ...tones[tone], fontFamily: "IBM Plex Mono", fontSize: 11, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.03em" }}>{children}</span>;
};

const statusTone = (s) => (s === "Approved" || s === "Paid" || s === "Present" || s === "Active" || s === "Completed" ? "good" : s === "Rejected" || s === "Absent" ? "bad" : "warn");

const Card = ({ children, style }) => (
  <div className="tm-card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, ...style }}>{children}</div>
);

const SectionTitle = ({ icon: Icon, children, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {Icon && (
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7,
          background: `${C.tally}14`, border: `1px solid ${C.tally}33`, boxShadow: `0 0 10px ${C.tally}1f`, flexShrink: 0,
        }}>
          <Icon size={14} color={C.tally} />
        </span>
      )}
      <h3 style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: 15, letterSpacing: "0.06em", margin: 0, color: C.text, textTransform: "uppercase" }}>{children}</h3>
    </div>
    {right}
  </div>
);

const EmptyState = ({ text }) => (
  <div style={{ padding: "30px 16px", textAlign: "center", color: C.textDim, fontFamily: "Inter", fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 8, background: `${C.surface3}66` }}>{text}</div>
);

const ProgressBar = ({ pct }) => {
  const p = pct === null ? 0 : Math.min(pct, 100);
  const over = pct !== null && pct > 100;
  const fillColor = over ? C.rec : p > 85 ? C.amber : C.tally;
  return (
    <div style={{ height: 6, background: C.surface3, borderRadius: 4, overflow: "hidden", marginTop: 6, border: `1px solid ${C.border}` }}>
      <div style={{ height: "100%", width: `${p}%`, background: fillColor, boxShadow: `0 0 8px ${fillColor}88`, transition: "width .3s" }} />
    </div>
  );
};

// ---------- Auth screens ----------
function BootstrapAdmin({ onCreate }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim() || !username.trim() || password.length < 4) { setError("Fill in your name, a username, and a password (4+ characters)."); return; }
    if (recoveryPhrase.trim().length < 4) { setError("Set a recovery phrase (4+ characters) — you'll need it if you ever get locked out."); return; }
    onCreate({ name: name.trim(), username: username.trim(), password, recoveryPhrase: recoveryPhrase.trim() });
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: "0 16px", position: "relative" }}>
      <div className="tm-glow-orb" />
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 10 }}>
          <Logo size={26} />
        </div>
        <p style={{ color: C.textDim, fontFamily: "Inter", fontSize: 13.5 }}>No accounts exist yet. Set up the first admin account to get started.</p>
      </div>
      <Card>
        <SectionTitle icon={ShieldCheck}>Create Admin Account</SectionTitle>
        <div style={{ display: "grid", gap: 10 }}>
          <div><Label>Your name</Label><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></div>
          <div><Label>Username</Label><TextInput value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin" /></div>
          <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 4 characters" />
          <div>
            <PasswordField label="Recovery phrase" value={recoveryPhrase} onChange={(e) => setRecoveryPhrase(e.target.value)} placeholder="A phrase only you'd know" />
            <p style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Keep this somewhere safe — it's the only way to wipe and restart the system if the admin password is ever lost. Don't share it with staff.</p>
          </div>
          {error && <div style={{ color: C.rec, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} />{error}</div>}
          <Btn onClick={submit}><ShieldCheck size={14} /> Create Admin & Sign In</Btn>
        </div>
      </Card>
      <p style={{ textAlign: "center", color: C.textDim, fontSize: 11.5, marginTop: 14, fontFamily: "Inter" }}>Demo-grade auth — credentials are stored as plain data, not securely hashed. Don't reuse real passwords.</p>
    </div>
  );
}

function LoginForm({ users, employees, security, onSuccess, onResetAll }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [phraseError, setPhraseError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const submit = () => {
    const u = users.find((x) => x.username.toLowerCase() === username.trim().toLowerCase());
    if (!u || u.password !== password) { setError("Invalid username or password."); return; }
    if (u.role === "employee") {
      const emp = employees.find((e) => e.code === u.employeeCode);
      if (emp && emp.status !== "Active") { setError(`This account is ${emp.status.toLowerCase()}. Contact your admin.`); return; }
    }
    onSuccess(u);
  };

  const checkPhrase = () => {
    if (!security?.recoveryPhrase || phrase.trim() !== security.recoveryPhrase) {
      setPhraseError("That recovery phrase doesn't match.");
      return;
    }
    setPhraseError("");
    setConfirmReset(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: "0 16px", position: "relative" }}>
      <div className="tm-glow-orb" />
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 10 }}>
          <Logo size={26} />
        </div>
        <p style={{ color: C.textDim, fontFamily: "Inter", fontSize: 13.5 }}>Sign in with the username & password your admin gave you.</p>
      </div>
      <Card>
        <SectionTitle icon={Lock}>Sign In</SectionTitle>
        <div style={{ display: "grid", gap: 10 }}>
          <div><Label>Username</Label><TextInput value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} /></div>
          <PasswordField label="Password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} />
          {error && <div style={{ color: C.rec, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} />{error}</div>}
          <Btn onClick={submit}><ChevronRight size={14} /> Sign In</Btn>
        </div>
      </Card>
      <p style={{ textAlign: "center", color: C.textDim, fontSize: 11.5, marginTop: 14, fontFamily: "Inter" }}>No account? Ask your admin to create one for you.</p>

      <div style={{ textAlign: "center", marginTop: 22, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        {!showRecovery ? (
          <button onClick={() => setShowRecovery(true)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 11.5, fontFamily: "Inter", cursor: "pointer", textDecoration: "underline" }}>
            Lost admin access? Reset with recovery phrase
          </button>
        ) : !confirmReset ? (
          <div style={{ display: "inline-flex", flexDirection: "column", gap: 8, alignItems: "center", maxWidth: 300 }}>
            <span style={{ color: C.textDim, fontSize: 11.5, fontFamily: "Inter" }}>Enter the recovery phrase set when this system was first created.</span>
            <TextInput type="password" value={phrase} onChange={(e) => { setPhrase(e.target.value); setPhraseError(""); }} placeholder="Recovery phrase" style={{ maxWidth: 220 }} />
            {phraseError && <span style={{ color: C.rec, fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={13} />{phraseError}</span>}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={checkPhrase}>Verify</Btn>
              <Btn variant="ghost" onClick={() => { setShowRecovery(false); setPhrase(""); setPhraseError(""); }}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <div style={{ display: "inline-flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <span style={{ color: C.rec, fontSize: 12, fontFamily: "Inter", maxWidth: 320 }}>
              Phrase confirmed. This permanently deletes every account, employee, project, attendance, voucher, expense, ledger, and payroll record. There's no undo.
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="danger" onClick={onResetAll}><Trash2 size={13} /> Yes, wipe everything</Btn>
              <Btn variant="ghost" onClick={() => { setConfirmReset(false); setShowRecovery(false); setPhrase(""); }}>Cancel</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Shell ----------
function Shell({ roleLabel, user, onLogout, onRefresh, refreshing, data, children, tabs, active, setActive }) {
  const tc = useTimecode();
  return (
    <div className="tm-grid-bg" style={{ minHeight: "100%", background: C.bg, color: C.text, fontFamily: "Inter" }}>
      <style>{FONTS}</style>
      <div style={{ borderBottom: `1px solid ${C.border}`, background: `${C.surface}F2`, backdropFilter: "blur(6px)", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 0 rgba(46,158,91,0.15)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={20} />
            <span style={{ marginLeft: 6, display: "flex", alignItems: "center", gap: 7 }}>
              <Avatar name={user?.name} size={22} />
              <Pill tone="dim">{roleLabel} · {user?.name}{user?.employeeCode ? ` · ${user.employeeCode}` : ""}</Pill>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.surface3 }}>
              <span className="tm-live-dot" />
              <span style={{ fontFamily: "IBM Plex Mono", fontSize: 12.5, color: C.tally, letterSpacing: "0.06em" }}>{tc}</span>
            </div>
            {data && <NotificationBell data={data} roleLabel={roleLabel} empCode={user?.employeeCode} onNavigate={setActive} />}
            {onRefresh && <Btn variant="ghost" onClick={onRefresh} title="Refresh data"><RefreshCw size={13} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} /> Refresh</Btn>}
            <Btn variant="ghost" onClick={onLogout}><LogOut size={13} /> Sign out</Btn>
          </div>
        </div>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px", display: "flex", gap: 4, overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setActive(t)} className={active === t ? "tm-tab-active" : ""} style={{
              background: "none", border: "none", cursor: "pointer", padding: "10px 14px", fontFamily: "Inter", fontWeight: 600, fontSize: 13,
              color: active === t ? C.text : C.textDim, borderBottom: "2px solid transparent", whiteSpace: "nowrap", transition: "color .15s",
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div key={active} style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 16px 60px", animation: "tm-fade-up 0.25s ease" }}>{children}</div>
    </div>
  );
}

// ---------- Shared: Dashboard ----------
// ---------- Income & Expense breakdown (project / month / client) with pie chart ----------
function IncomeExpenseBreakdown({ data }) {
  const [dimension, setDimension] = useState("project");
  const groups = ledgerBreakdown(data.ledger || [], data.projects, dimension);
  const pieDataRaw = groups.filter((g) => g.expense > 0).slice(0, 6).map((g) => ({ name: g.key, value: g.expense }));
  const otherExpense = groups.filter((g) => g.expense > 0).slice(6).reduce((s, g) => s + g.expense, 0);
  const pieData = otherExpense > 0 ? [...pieDataRaw, { name: "Other", value: otherExpense }] : pieDataRaw;
  const totalIncome = groups.reduce((s, g) => s + g.income, 0);
  const totalExpense = groups.reduce((s, g) => s + g.expense, 0);
  const dimLabel = dimension === "project" ? "Project-wise" : dimension === "month" ? "Month-wise" : "Client-wise";

  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionTitle icon={TrendingUp} right={
        <div style={{ display: "flex", gap: 6 }}>
          {[["project", "Project"], ["month", "Month"], ["client", "Client"]].map(([val, label]) => (
            <Btn key={val} variant={dimension === val ? "primary" : "ghost"} onClick={() => setDimension(val)} style={{ padding: "6px 10px" }}>{label}</Btn>
          ))}
        </div>
      }>Income & Expenses — {dimLabel}</SectionTitle>

      {groups.length === 0 ? <EmptyState text="No income or expense entries logged yet — add some in the Ledger tab." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
          <div>
            {groups.map((g) => (
              <div key={g.key} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>{g.key}</span>
                  <span style={{ fontFamily: "IBM Plex Mono", color: g.net >= 0 ? C.tally : C.rec }}>{money(g.net)}</span>
                </div>
                <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 2 }}>Income {money(g.income)} · Expense {money(g.expense)}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontSize: 13, fontWeight: 600 }}>
              <span>Total</span>
              <span style={{ fontFamily: "IBM Plex Mono" }}>{money(totalIncome - totalExpense)}</span>
            </div>
          </div>
          <div>
            {pieData.length === 0 ? <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState text="No expenses to chart yet." /></div> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: C.textDim }}>
                    {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: "Inter", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div style={{ textAlign: "center", color: C.textDim, fontSize: 11.5, marginTop: 4 }}>Expense distribution by {dimension}</div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---------- Fixed / recurring monthly expenses ----------
function FixedExpensesPanel({ data, persist, persistAppend, confirmDelete }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(FIXED_EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const addItem = () => {
    if (!name.trim() || !amount) return;
    persist("fixedExpenses", [...(data.fixedExpenses || []), { id: uid("FIX"), name: name.trim(), category, amount: parseFloat(amount), note: note.trim() }]);
    setName(""); setAmount(""); setNote("");
  };
  const removeItem = (id) => persist("fixedExpenses", (data.fixedExpenses || []).filter((i) => i.id !== id));

  const currentMonth = todayStr().slice(0, 7);
  const isPostedThisMonth = (item) => (data.ledger || []).some((e) => e.type === "Expense" && e.party === item.name && e.category === item.category && e.date.startsWith(currentMonth) && e.note && e.note.includes("Fixed expense"));

  const postItem = (item) => {
    persistAppend("ledger", {
      id: uid("LED"), date: todayStr(), type: "Expense", paymentMode: "Cash", account: null,
      category: item.category, party: item.name, project: "", amount: item.amount,
      note: `Fixed expense — ${item.name} (${currentMonth})`, createdAt: new Date().toISOString(),
    });
  };

  const totalMonthly = (data.fixedExpenses || []).reduce((s, i) => s + i.amount, 0);

  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionTitle icon={Wallet}>Fixed Monthly Expenses — {money(totalMonthly)}/mo</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end", marginBottom: 14 }}>
        <div><Label>Name</Label><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Office Rent — HQ" /></div>
        <div><Label>Category</Label><SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>{FIXED_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</SelectInput></div>
        <div><Label>Monthly Amount (₹)</Label><TextInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div><Label>Note</Label><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" /></div>
        <Btn onClick={addItem}><Plus size={14} /> Add Fixed Expense</Btn>
      </div>
      {(data.fixedExpenses || []).length === 0 ? <EmptyState text="No fixed expenses set up yet — add recurring costs like staff salary, office rent, and office expenses." /> : (
        <div>
          {(data.fixedExpenses || []).map((item) => {
            const posted = isPostedThisMonth(item);
            return (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.name}</span> <span style={{ color: C.textDim }}>· {item.category}</span>
                  {item.note && <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 2 }}>{item.note}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "IBM Plex Mono", color: C.amber }}>{money(item.amount)}/mo</span>
                  {posted ? <Pill tone="good">Posted for {currentMonth}</Pill> : <Btn variant="ghost" onClick={() => postItem(item)} style={{ padding: "5px 10px" }}>Post This Month</Btn>}
                  <Btn variant="danger" onClick={() => confirmDelete(`Delete the fixed expense "${item.name}"? This won't affect entries already posted to the Ledger.`, () => removeItem(item.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}


function voucherSummaryForEmployee(empCode, data) {
  const vouchers = (data.vouchers || []).filter((v) => v.code === empCode && v.kind === "voucher");
  const approved = vouchers.filter((v) => ["Approved", "Partially Paid", "Paid"].includes(v.status));
  const submitted = vouchers.reduce((s, v) => s + (Number(v.amount) || 0), 0);
  const paid = approved.reduce((s, v) => s + (Number(v.paidAmount) || (v.status === "Paid" ? Number(v.amount) || 0 : 0)), 0);
  const due = Math.max(0, submitted - paid);
  const pending = vouchers.filter((v) => v.status === "Pending").reduce((s, v) => s + (Number(v.amount) || 0), 0);
  const approvedDue = approved.reduce((s, v) => s + Math.max(0, (Number(v.amount) || 0) - (Number(v.paidAmount) || (v.status === "Paid" ? Number(v.amount) || 0 : 0))), 0);
  return { vouchers, submitted, paid, due, pending, approvedDue };
}

function VoucherPaymentsPanel({ data, persist, persistAppend }) {
  const [payingId, setPayingId] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [payAccount, setPayAccount] = useState(ACCOUNTS[0]);
  const [payRef, setPayRef] = useState("");
  const [showEmployee, setShowEmployee] = useState(false);
  const [showMonth, setShowMonth] = useState(false);

  const payable = useMemo(() => (data.vouchers || []).filter((v) => v.kind === "voucher" && ["Approved", "Partially Paid"].includes(v.status)), [data.vouchers]);
  const totalApproved = payable.reduce((s, v) => s + (Number(v.amount) || 0), 0);
  const totalPaid = (data.vouchers || []).filter((v) => v.kind === "voucher").reduce((s, v) => s + (Number(v.paidAmount) || (v.status === "Paid" ? Number(v.amount) || 0 : 0)), 0);
  const totalDue = payable.reduce((s, v) => s + Math.max(0, (Number(v.amount) || 0) - (Number(v.paidAmount) || 0)), 0);

  const startPay = (v) => {
    const due = Math.max(0, (Number(v.amount) || 0) - (Number(v.paidAmount) || 0));
    setPayingId(v.id);
    setPayAmount(due.toFixed(2));
    setPayMode("Cash");
    setPayAccount(ACCOUNTS[0]);
    setPayRef("");
  };

  const cancelPay = () => {
    setPayingId(null); setPayAmount(""); setPayRef("");
  };

  const confirmPay = (v) => {
    const amount = parseFloat(payAmount);
    const currentPaid = Number(v.paidAmount) || 0;
    const due = Math.max(0, (Number(v.amount) || 0) - currentPaid);
    if (!Number.isFinite(amount) || amount <= 0 || amount > due) return;
    const newPaid = currentPaid + amount;
    const fullyPaid = newPaid >= (Number(v.amount) || 0);
    const now = new Date().toISOString();

    persist("vouchers", (data.vouchers || []).map((x) => x.id === v.id ? {
      ...x,
      status: fullyPaid ? "Paid" : "Partially Paid",
      paidAmount: newPaid,
      balanceDue: Math.max(0, (Number(x.amount) || 0) - newPaid),
      paidAt: now,
      paymentMode: payMode,
      account: payMode === "Account" ? payAccount : null,
      paymentReference: payRef.trim(),
      lastPaymentAmount: amount,
    } : x));

    persistAppend("ledger", {
      id: uid("LED"),
      date: todayStr(),
      type: "Expense",
      paymentMode: payMode,
      account: payMode === "Account" ? payAccount : null,
      category: "Employee Voucher",
      party: v.code,
      project: v.project || "",
      amount,
      note: `Voucher payment — ${v.type || "Expense"} — ${v.id}${payRef.trim() ? ` · Ref ${payRef.trim()}` : ""}`,
      voided: false,
      createdAt: now,
      voucherId: v.id,
    });
    cancelPay();
  };

  const grouped = useMemo(() => {
    if (!showEmployee && !showMonth) return null;
    const groups = {};
    payable.forEach((v) => {
      const parts = [];
      if (showEmployee) { const emp = data.employees.find((e) => e.code === v.code); parts.push(`${v.code} · ${emp?.name || v.code}`); }
      if (showMonth) parts.push(v.date ? v.date.slice(0, 7) : "Unknown");
      const key = parts.join(" — ");
      if (!groups[key]) groups[key] = { key, items: [] };
      groups[key].items.push(v);
    });
    return Object.values(groups).map((g) => ({
      ...g,
      approved: g.items.reduce((s, v) => s + (Number(v.amount) || 0), 0),
      paid: g.items.reduce((s, v) => s + (Number(v.paidAmount) || 0), 0),
      due: g.items.reduce((s, v) => s + Math.max(0, (Number(v.amount) || 0) - (Number(v.paidAmount) || 0)), 0),
    })).sort((a, b) => a.key.localeCompare(b.key));
  }, [payable, showEmployee, showMonth, data.employees]);

  const renderVoucherRow = (v) => {
    const paid = Number(v.paidAmount) || 0;
    const due = Math.max(0, (Number(v.amount) || 0) - paid);
    const isPaying = payingId === v.id;
    const employee = data.employees.find((e) => e.code === v.code);
    return (
      <div key={v.id} style={{ padding: 11, borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div><span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{v.code}</span> · {employee?.name || v.code} · {v.type} · {money(v.amount)}</div>
            <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>{v.project || "Company-wide"} · {v.date} · Paid {money(paid)} · Due {money(due)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Pill tone={v.status === "Partially Paid" ? "warn" : "good"}>{v.status}</Pill>
            {due > 0 && <Btn onClick={() => startPay(v)} style={{ padding: "6px 10px" }}><DollarSign size={13} /> Pay Voucher</Btn>}
          </div>
        </div>
        {isPaying && (
          <div style={{ marginTop: 10, padding: 10, background: C.surface2, borderRadius: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
            <div><Label>Payment Amount (₹)</Label><TextInput type="number" min="0.01" max={due} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={{ width: 130 }} /></div>
            <div><Label>Payment Mode</Label><SelectInput value={payMode} onChange={(e) => setPayMode(e.target.value)} style={{ width: 130 }}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</SelectInput></div>
            {payMode === "Account" && <div><Label>Account</Label><SelectInput value={payAccount} onChange={(e) => setPayAccount(e.target.value)} style={{ width: 130 }}>{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</SelectInput></div>}
            <div><Label>Payment Reference</Label><TextInput value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="UTR / receipt no." style={{ width: 150 }} /></div>
            <Btn onClick={() => confirmPay(v)}><Check size={13} /> Confirm Payment</Btn>
            <Btn variant="ghost" onClick={cancelPay}>Cancel</Btn>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <Card><Receipt size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalApproved)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Approved Vouchers</div></Card>
        <Card><Check size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalPaid)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Voucher Paid</div></Card>
        <Card><DollarSign size={16} color={C.amber} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: totalDue > 0 ? C.amber : C.tally }}>{money(totalDue)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Voucher Due</div></Card>
      </div>

      <Card>
        <SectionTitle icon={Wallet} right={
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <Btn variant={(!showEmployee && !showMonth) ? "primary" : "ghost"} onClick={() => { setShowEmployee(false); setShowMonth(false); }} style={{ padding: "6px 10px" }}>Total</Btn>
            <Btn variant={showEmployee ? "primary" : "ghost"} onClick={() => setShowEmployee((v) => !v)} style={{ padding: "6px 10px" }}>Employee-wise</Btn>
            <Btn variant={showMonth ? "primary" : "ghost"} onClick={() => setShowMonth((v) => !v)} style={{ padding: "6px 10px" }}>Month-wise</Btn>
            {payable.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`voucher_payment_queue_${todayStr()}.csv`, [["Employee", "Type", "Project", "Amount", "Paid", "Due", "Status", "Date"], ...payable.map((v) => [v.code, v.type, v.project || "", v.amount, Number(v.paidAmount) || 0, Math.max(0, (Number(v.amount) || 0) - (Number(v.paidAmount) || 0)), v.status, v.date])])}><Download size={13} /> Export Queue</Btn>}
          </div>
        }>Voucher Payment Queue</SectionTitle>
        {payable.length === 0 ? <EmptyState text="No approved vouchers are waiting for payment." /> : grouped ? (
          <div>
            {grouped.map((g) => (
              <div key={g.key} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: C.surface3, borderRadius: 6, marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontFamily: "Oswald", fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{g.key}</span>
                  <span style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: C.textDim }}>Approved {money(g.approved)} · Paid {money(g.paid)} · Due <span style={{ color: g.due > 0 ? C.amber : C.tally }}>{money(g.due)}</span></span>
                </div>
                {g.items.map(renderVoucherRow)}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {payable.map(renderVoucherRow)}
          </div>
        )}
      </Card>
    </div>
  );
}

function DashboardPanel({ data: rawData, persist, persistAppend, confirmDelete, variant }) {
  const [filter, setFilter] = useState({ mode: "overall", year: String(new Date().getFullYear()), month: todayStr().slice(0, 7), projectId: "", availableYears: getAvailableYears(rawData) });
  const data = applyDashboardFilter(rawData, filter);
  const today = todayStr();
  const presentToday = data.attendance.filter((a) => a.date === today && a.status === "Present" && a.approval === "Approved").length;
  const pendingAttendance = data.attendance.filter((a) => a.approval === "Pending").length;
  const pendingVouchers = data.vouchers.filter((v) => v.status === "Pending").length;
  const activeProjects = data.projects.filter((p) => p.status === "Active").length;

  const totalQuoted = data.projects.reduce((s, p) => s + (Number(p.quoteAmount) || 0), 0);
  const totalExpenses = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const voucherPaid = data.vouchers.filter((v) => v.kind === "voucher").reduce((s, v) => s + (Number(v.paidAmount) || (v.status === "Paid" ? Number(v.amount) || 0 : 0)), 0);
  const voucherDue = data.vouchers.filter((v) => v.kind === "voucher" && ["Approved", "Partially Paid"].includes(v.status)).reduce((s, v) => s + Math.max(0, (Number(v.amount) || 0) - (Number(v.paidAmount) || 0)), 0);
  const totalApprovedVouchers = data.vouchers.filter((v) => v.kind === "voucher" && ["Approved", "Partially Paid", "Paid"].includes(v.status)).reduce((s, v) => s + (Number(v.amount) || 0), 0);
  const totalSpent = totalExpenses + totalApprovedVouchers;
  const overallUtil = totalQuoted > 0 ? (totalSpent / totalQuoted) * 100 : null;
  const ledger = ledgerSummary(data.ledger || []);
  const invoices = data.invoices || [];
  const totalInvoiced = invoices.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const totalCollected = invoices.reduce((s, i) => s + (Number(i.amountPaid) || 0), 0);
  const receivable = Math.max(0, totalInvoiced - totalCollected);
  const overdueInvoices = invoices.filter((i) => i.dueDate && i.dueDate < today && (Number(i.total) || 0) > (Number(i.amountPaid) || 0) && i.status !== "Cancelled");
  const activeEmployees = data.employees.filter((e) => e.status === "Active").length;
  const payrollDue = data.employees.filter((e) => e.status === "Active").reduce((s, e) => s + Math.max(0, employeeEarnings(e.code, data).balance), 0);

  const opsStats = [
    ["Employees", activeEmployees, Users],
    ["Active Projects", activeProjects, Briefcase],
    ["Present Today", presentToday, CalendarCheck],
    ["Action Queue", pendingVouchers + pendingAttendance, ClipboardList],
  ];
  const financeStats = [
    ["Total Quoted", money(totalQuoted), Wallet],
    ["Total Spent", money(totalSpent), TrendingUp],
    ["Overall Utilization", overallUtil === null ? "N/A" : `${overallUtil.toFixed(1)}%`, LayoutDashboard],
    ["Voucher Due", money(voucherDue), Receipt],
  ];
  const stats = variant === "accountant" ? financeStats : opsStats;

  const projectHealth = data.projects.map((p) => {
    const f = projectFinancials(p, data.expenses, data.vouchers);
    return { ...p, ...f };
  }).sort((a, b) => (b.utilization || 0) - (a.utilization || 0));
  const atRiskProjects = projectHealth.filter((p) => p.quote > 0 && p.utilization >= 85).slice(0, 6);
  const recent = [...(data.vouchers || [])].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);

  return (
    <div>
      <DashboardFilterBar filter={filter} setFilter={setFilter} projects={rawData.projects} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Btn variant="ghost" onClick={() => downloadCSV(`dashboard_summary_${todayStr()}.csv`, [
          ["DASHBOARD SUMMARY", variant],
          ["Generated", new Date().toISOString()],
          [],
          ["Metric", "Value"],
          ...stats.map(([label, val]) => [label, val]),
          ...((variant === "admin" || variant === "accountant") ? [
            [],
            ["Cash Balance", money(ledger.cashBalance)],
            ["Trai A/C", money(ledger.traiBalance)],
            ["Today's A/C", money(ledger.todaysBalance)],
            ["Net P&L", money(ledger.netPL)],
            ["Receivables", money(receivable)],
            ["Payroll Due", money(payrollDue)],
          ] : []),
          [],
          ["PROJECT HEALTH"],
          ["Project", "Status", "Spent", "Quoted", "Utilization %"],
          ...projectHealth.map((p) => [p.name, p.status, p.totalSpent, p.quote, p.utilization === null ? "N/A" : p.utilization.toFixed(1)]),
        ])}><Download size={13} /> Export Dashboard Summary</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        {stats.map(([label, val, Icon]) => (
          <Card key={label}>
            <Icon size={16} color={C.tally} />
            <div style={{ fontFamily: "IBM Plex Mono", fontSize: 22, marginTop: 8 }}>{val}</div>
            <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{label}</div>
          </Card>
        ))}
      </div>

      {(variant === "admin" || variant === "accountant") && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            ["Cash Balance", money(ledger.cashBalance), Wallet, ledger.cashBalance < 0],
            ["Trai A/C", money(ledger.traiBalance), Wallet, ledger.traiBalance < 0],
            ["Today's A/C", money(ledger.todaysBalance), Wallet, ledger.todaysBalance < 0],
            ["Net P&L", money(ledger.netPL), TrendingUp, ledger.netPL < 0],
            ["Receivables", money(receivable), Receipt, receivable > 0],
            ["Payroll Due", money(payrollDue), Users, payrollDue > 0],
          ].map(([label, val, Icon, warn]) => (
            <Card key={label}>
              <Icon size={16} color={warn ? C.amber : C.tally} />
              <div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: warn ? C.amber : C.text }}>{val}</div>
              <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{label}</div>
            </Card>
          ))}
        </div>
      )}

      {variant === "admin" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 16, marginBottom: 20 }}>
          <Card>
            <SectionTitle icon={ClipboardList}>Management Action Center</SectionTitle>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["Pending Voucher Approvals", pendingVouchers, () => {}, "Review employee claims"],
                ["Pending Attendance", pendingAttendance, () => {}, "Review attendance"],
                ["Voucher Payments Due", data.vouchers.filter((v) => v.kind === "voucher" && ["Approved", "Partially Paid"].includes(v.status)).length, () => {}, "Pay approved claims"],
                ["Overdue Invoices", overdueInvoices.length, () => {}, "Follow up with clients"],
                ["Projects ≥85% Budget", atRiskProjects.length, () => {}, "Review project costs"],
              ].map(([label, count, action, hint]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div><div style={{ color: C.textDim, fontSize: 11.5 }}>{hint}</div></div>
                  <Pill tone={count > 0 ? "warn" : "good"}>{count}</Pill>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle icon={Briefcase}>Project Health</SectionTitle>
            {projectHealth.length === 0 ? <EmptyState text="No projects yet." /> : (
              <div style={{ display: "grid", gap: 9 }}>
                {projectHealth.slice(0, 6).map((p) => (
                  <div key={p.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                      <span>{p.name}</span>
                      <span style={{ fontFamily: "IBM Plex Mono", color: p.utilization >= 85 ? C.rec : C.textDim }}>{p.quote ? `${p.utilization.toFixed(0)}%` : "No budget"}</span>
                    </div>
                    <ProgressBar pct={p.utilization} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {(variant === "accountant" || variant === "admin") && (
        <Card style={{ marginBottom: 20 }}>
          <SectionTitle icon={Receipt}>Client Receivables</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
            <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18 }}>{money(totalInvoiced)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Total Invoiced</div></div>
            <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18 }}>{money(totalCollected)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Collected</div></div>
            <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18, color: receivable > 0 ? C.amber : C.text }}>{money(receivable)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Outstanding</div></div>
            <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18, color: overdueInvoices.length ? C.rec : C.text }}>{overdueInvoices.length}</div><div style={{ color: C.textDim, fontSize: 12 }}>Overdue</div></div>
          </div>
        </Card>
      )}

      {(variant === "accountant" || variant === "admin") && (() => {
        const hires = data.hires || [];
        const hireCost = hires.reduce((s, h) => s + (Number(h.cost) || 0), 0);
        const hireUnpaid = hires.filter((h) => h.paymentStatus !== "Paid").reduce((s, h) => s + (Number(h.cost) || 0), 0);
        const activeHires = hires.filter((h) => h.status === "Hired").length;
        const overdueHires = hires.filter((h) => h.status === "Hired" && h.expectedReturn && h.expectedReturn < today).length;
        if (hires.length === 0 && (data.parties || []).length === 0 && (data.vendors || []).length === 0) return null;
        return (
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle icon={Wallet}>Vendors & Equipment Hire</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
              <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18 }}>{money(hireCost)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Total Hire Cost</div></div>
              <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18, color: hireUnpaid > 0 ? C.amber : C.text }}>{money(hireUnpaid)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Unpaid to Vendors</div></div>
              <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18 }}>{activeHires}</div><div style={{ color: C.textDim, fontSize: 12 }}>Currently Hired Out</div></div>
              <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18, color: overdueHires ? C.rec : C.text }}>{overdueHires}</div><div style={{ color: C.textDim, fontSize: 12 }}>Overdue Returns</div></div>
            </div>
          </Card>
        );
      })()}

      {(variant === "accountant" || variant === "admin") && <IncomeExpenseBreakdown data={data} />}
      {(variant === "accountant" || variant === "admin") && persist && <FixedExpensesPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}

      {variant === "accountant" && (
        <Card style={{ marginBottom: 20 }}>
          <SectionTitle icon={Wallet} right={
            data.projects.length > 0 && <Btn variant="ghost" onClick={() => exportAllProjectsSummary(data.projects, data.expenses, data.vouchers)}><Download size={13} /> Export All Projects Summary</Btn>
          }>Budget vs Spend by Project</SectionTitle>
          {data.projects.length === 0 ? <EmptyState text="No projects yet." /> : (
            <div style={{ display: "grid", gap: 12 }}>
              {projectHealth.map((p) => (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>{p.name}</span>
                    <span style={{ fontFamily: "IBM Plex Mono", color: C.textDim }}>{money(p.totalSpent)} / {p.quote ? money(p.quote) : "no quote"}</span>
                  </div>
                  <ProgressBar pct={p.utilization} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {variant === "admin" && (
        <Card style={{ marginBottom: 20 }}>
          <SectionTitle icon={Receipt}>Recent Activity</SectionTitle>
          {recent.length === 0 ? <EmptyState text="No voucher activity yet." /> : (
            <div>
              {recent.map((v) => (
                <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8 }}>
                  <span>{v.code} · {v.type || v.docType} · {money(v.amount || 0)} {v.project && `· ${v.project}`}</span>
                  <Pill tone={statusTone(v.status)}>{v.status}</Pill>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle icon={Receipt}>Recent Submissions</SectionTitle>
        {data.vouchers.length === 0 ? <EmptyState text="No vouchers or documents submitted yet." /> : (
          <div>
            {[...data.vouchers].slice(-6).reverse().map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span>{v.code} · {v.type || v.docType} {v.amount ? `· ${money(v.amount)}` : ""}</span>
                <Pill tone={statusTone(v.status)}>{v.status}</Pill>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Shared: Projects ----------
function ProjectsPanel({ data, persist, persistAppend, confirmDelete, mode }) {
  const canCreate = mode === "admin" || mode === "manager";
  const canAssign = mode === "admin" || mode === "manager";
  const canQuote = mode === "admin" || mode === "accountant";
  const canExport = mode === "admin" || mode === "accountant";
  const canDelete = mode === "admin" || mode === "manager";

  const [pname, setPname] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assigning, setAssigning] = useState(null);
  const [quoteDraft, setQuoteDraft] = useState({});

  const clientParties = (data.parties || []).filter((p) => p.type === "Client");

  const addProject = () => {
    if (!pname.trim()) return;
    persistAppend("projects", { id: uid("PRJ"), name: pname.trim(), client, startDate, endDate, deadline: endDate, status: "Active", assigned: [], quoteAmount: 0 });
    setPname(""); setClient(""); setStartDate(""); setEndDate("");
  };
  const setProjectStatus = (id, status) => persist("projects", data.projects.map((p) => p.id === id ? { ...p, status } : p));
  const removeProject = (id) => persist("projects", data.projects.filter((p) => p.id !== id));
  const toggleAssign = (id, code) => {
    persist("projects", data.projects.map((p) => {
      if (p.id !== id) return p;
      const has = p.assigned.includes(code);
      return { ...p, assigned: has ? p.assigned.filter((c) => c !== code) : [...p.assigned, code] };
    }));
  };
  const saveQuote = (id) => {
    const val = parseFloat(quoteDraft[id]);
    if (isNaN(val)) return;
    persist("projects", data.projects.map((p) => p.id === id ? { ...p, quoteAmount: val } : p));
    setQuoteDraft((d) => ({ ...d, [id]: undefined }));
  };

  return (
    <div>
      {canCreate && (
        <Card style={{ marginBottom: 16 }}>
          <SectionTitle icon={Plus}>New Project</SectionTitle>
          {clientParties.length === 0 ? (
            <p style={{ color: C.textDim, fontSize: 12.5, marginBottom: 12 }}>No client parties registered yet — register one on the Party tab (type "Client") before creating a project.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
              <div><Label>Project name</Label><TextInput value={pname} onChange={(e) => setPname(e.target.value)} placeholder="Monsoon Documentary" /></div>
              <div><Label>Client</Label>
                <SelectInput value={client} onChange={(e) => setClient(e.target.value)}>
                  <option value="">Select client</option>
                  {clientParties.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </SelectInput>
              </div>
              <div><Label>Start Date</Label><TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div><Label>End Date</Label><TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              <Btn onClick={addProject}><Plus size={14} /> Create</Btn>
            </div>
          )}
        </Card>
      )}

      {data.projects.length > 0 && canExport && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <Btn variant="ghost" onClick={() => exportAllProjectsSummary(data.projects, data.expenses, data.vouchers)}><Download size={13} /> Export All Projects</Btn>
        </div>
      )}

      {data.projects.length === 0 ? <EmptyState text="No projects yet." /> : (
        <div style={{ display: "grid", gap: 12 }}>
          {data.projects.map((p) => {
            const f = projectFinancials(p, data.expenses, data.vouchers);
            return (
              <Card key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: "Oswald", fontSize: 16, textTransform: "uppercase", letterSpacing: "0.02em" }}>{p.name}</div>
                    <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 2 }}>{p.client || "No client set"} {p.startDate && `· ${p.startDate}`}{p.endDate ? ` → ${p.endDate}` : (p.deadline && !p.startDate ? ` · due ${p.deadline}` : "")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {canCreate ? (
                      <SelectInput value={p.status} onChange={(e) => setProjectStatus(p.id, e.target.value)} style={{ width: 130 }}>
                        {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </SelectInput>
                    ) : <Pill tone={statusTone(p.status)}>{p.status}</Pill>}
                    {canDelete && <Btn variant="danger" onClick={() => confirmDelete(`Delete the project "${p.name}"? This removes it permanently, including its assignment list. Expenses and vouchers already tied to it will keep the project name as text but lose the link.`, () => removeProject(p.id))} style={{ padding: "5px 8px" }}><Trash2 size={13} /></Btn>}
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {p.assigned.length === 0 ? <span style={{ color: C.amber, fontSize: 12 }}>No one assigned yet — employees won't see this project until you assign them below.</span> :
                    p.assigned.map((code) => <Pill key={code} tone="good">{code}</Pill>)}
                </div>

                <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  {canQuote ? (
                    <div style={{ display: "flex", alignItems: "end", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 160 }}>
                        <Label>Quoted amount (₹)</Label>
                        <TextInput type="number" placeholder={String(p.quoteAmount || 0)} value={quoteDraft[p.id] ?? ""} onChange={(e) => setQuoteDraft((d) => ({ ...d, [p.id]: e.target.value }))} />
                      </div>
                      <Btn variant="ghost" onClick={() => saveQuote(p.id)}>Save Quote</Btn>
                      <div style={{ fontSize: 12.5, color: C.textDim, marginLeft: "auto" }}>
                        Spent {money(f.totalSpent)} of {p.quoteAmount ? money(p.quoteAmount) : "—"}
                        {f.utilization !== null && ` · ${f.utilization.toFixed(1)}%`}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: C.textDim }}>Quoted: {p.quoteAmount ? money(p.quoteAmount) : "not set"} · Spent so far: {money(f.totalSpent)}</div>
                  )}
                  {p.quoteAmount > 0 && <ProgressBar pct={f.utilization} />}
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {canAssign && (
                    <Btn variant="ghost" onClick={() => setAssigning(assigning === p.id ? null : p.id)}>
                      <Users size={13} /> {assigning === p.id ? "Close" : "Assign employees"}
                    </Btn>
                  )}
                  {canExport && (
                    <Btn variant="ghost" onClick={() => exportProjectReport(p, data.expenses, data.vouchers)}>
                      <Download size={13} /> Export Report
                    </Btn>
                  )}
                </div>

                {assigning === p.id && canAssign && (
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    {data.employees.filter((e) => e.status === "Active").length === 0 ? <EmptyState text="No active employees to assign." /> :
                      data.employees.filter((e) => e.status === "Active").map((e) => {
                        const on = p.assigned.includes(e.code);
                        return (
                          <button key={e.code} onClick={() => toggleAssign(p.id, e.code)} style={{
                            cursor: "pointer", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontFamily: "IBM Plex Mono",
                            background: on ? `${C.tally}22` : "transparent", color: on ? C.tally : C.textDim, border: `1px solid ${on ? C.tally : C.border}`,
                          }}>{e.code} · {e.name}</button>
                        );
                      })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Ledger (full accounting book) ----------
function LedgerPanel({ data, persist, persistAppend }) {
  const [date, setDate] = useState(todayStr());
  const [type, setType] = useState(LEDGER_TYPES[0]);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [category, setCategory] = useState(LEDGER_CATEGORIES[LEDGER_TYPES[0]][0]);
  const [party, setParty] = useState("");
  const [project, setProject] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [voidingId, setVoidingId] = useState(null);
  const [voidReason, setVoidReason] = useState("");

  const changeType = (t) => { setType(t); setCategory(LEDGER_CATEGORIES[t][0]); };

  const [suggesting, setSuggesting] = useState(false);
  const [suggestMsg, setSuggestMsg] = useState("");
  const handleSuggestCategory = async () => {
    if (suggesting) return;
    setSuggesting(true);
    setSuggestMsg("");
    try {
      const result = await suggestLedgerCategory(type, note, party, LEDGER_CATEGORIES[type]);
      if (result) { setCategory(result); setSuggestMsg(`Set to "${result}"`); }
      else setSuggestMsg("Couldn't tell from that note — pick one manually.");
    } catch {
      setSuggestMsg("Suggestion failed — pick one manually.");
    }
    setSuggesting(false);
  };

  const addEntry = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    persistAppend("ledger", {
      id: uid("LED"), date, type, paymentMode, account: paymentMode === "Account" ? account : null,
      category, party: party.trim(), project, amount: parseFloat(amount), note: note.trim(),
      voided: false, createdAt: new Date().toISOString(),
    });
    setParty(""); setAmount(""); setNote(""); setProject("");
  };
  const startVoid = (id) => { setVoidingId(id); setVoidReason(""); };
  const confirmVoid = (id) => {
    persist("ledger", (data.ledger || []).map((e) => e.id === id ? { ...e, voided: true, voidReason: voidReason.trim() || "No reason given", voidedAt: new Date().toISOString() } : e));
    setVoidingId(null); setVoidReason("");
  };

  const s = ledgerSummary(data.ledger || []);
  const entries = [...(data.ledger || [])].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filterType === "All" ? entries : entries.filter((e) => e.type === filterType);

  const typeTone = (t) => t === "Income" ? "good" : t === "Loss Booking" ? "bad" : t === "Asset Purchase" ? "warn" : "dim";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Card><Wallet size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(s.cashBalance)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Cash Balance</div></Card>
        <Card><Wallet size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(s.traiBalance)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Trai A/C Balance</div></Card>
        <Card><Wallet size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(s.todaysBalance)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Today's A/C Balance</div></Card>
        <Card><TrendingUp size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: s.netPL < 0 ? C.rec : C.text }}>{money(s.netPL)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Net P&L</div></Card>
      </div>
      <p style={{ color: C.textDim, fontSize: 11.5, marginTop: -8, marginBottom: 16 }}>Net P&L = Income − Expense − Loss Booking. Asset purchases are tracked separately as capital spend, not counted against P&L.</p>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>New Ledger Entry</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {LEDGER_TYPES.map((t) => (
            <Btn key={t} variant={type === t ? "primary" : "ghost"} onClick={() => changeType(t)}>{t}</Btn>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
          <div><Label>Date</Label><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div>
            <Label>Category</Label>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>{LEDGER_CATEGORIES[type].map((c) => <option key={c}>{c}</option>)}</SelectInput>
              <Btn variant="ghost" onClick={handleSuggestCategory} disabled={suggesting} title="Suggest category from the note (AI)" style={{ padding: "9px 10px", flexShrink: 0 }}><Sparkles size={13} /></Btn>
            </div>
            {suggestMsg && <p style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{suggestMsg}</p>}
          </div>
          <div><Label>Payment Mode</Label><SelectInput value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</SelectInput></div>
          {paymentMode === "Account" && (
            <div><Label>Account</Label><SelectInput value={account} onChange={(e) => setAccount(e.target.value)}>{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</SelectInput></div>
          )}
          <div><Label>Party (payee/payer)</Label><TextInput list="ledger-party-options" value={party} onChange={(e) => setParty(e.target.value)} placeholder="Optional — type or pick a registered party" />
            <datalist id="ledger-party-options">{(data.parties || []).map((p) => <option key={p.id} value={p.name} />)}{(data.vendors || []).map((v) => <option key={v.id} value={v.name} />)}</datalist>
          </div>
          <div><Label>Project</Label>
            <SelectInput value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="">Not project-specific</option>
              {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </SelectInput>
          </div>
          <div><Label>Amount (₹)</Label><TextInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><Label>Note</Label><TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional details" /></div>
        </div>
        <div style={{ marginTop: 12 }}><Btn onClick={addEntry}><Plus size={14} /> Add Entry</Btn></div>
      </Card>

      <Card>
        <SectionTitle icon={ListChecks} right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SelectInput value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: 160 }}>
              <option value="All">All Types</option>
              {LEDGER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </SelectInput>
            {entries.length > 0 && <Btn variant="ghost" onClick={() => exportLedgerCSV(entries)}><Download size={13} /> Export Ledger</Btn>}
          </div>
        }>Ledger Entries ({filtered.length})</SectionTitle>
        {filtered.length === 0 ? <EmptyState text="No ledger entries yet." /> : (
          <div>
            {filtered.map((e) => (
              <div key={e.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, opacity: e.voided ? 0.5 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Pill tone={typeTone(e.type)}>{e.type}</Pill>
                      {e.voided && <Pill tone="bad">VOIDED</Pill>}
                      <span style={{ fontWeight: 600, textDecoration: e.voided ? "line-through" : "none" }}>{e.category}</span>
                      {e.party && <span>· {e.party}</span>}
                      {e.project && <span>· {e.project}</span>}
                    </div>
                    <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>
                      {e.date} · {e.paymentMode}{e.paymentMode === "Account" ? ` (${e.account})` : ""} {e.note && `· ${e.note}`}
                      {e.voided && ` · Void reason: ${e.voidReason}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "IBM Plex Mono", color: e.type === "Income" ? C.tally : C.amber }}>{e.type === "Income" ? "+" : "−"}{money(e.amount)}</span>
                    {!e.voided && <Btn variant="danger" onClick={() => startVoid(e.id)} style={{ padding: "4px 10px" }}>Void</Btn>}
                  </div>
                </div>
                {voidingId === e.id && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <TextInput value={voidReason} onChange={(ev) => setVoidReason(ev.target.value)} placeholder="Reason for voiding (required for the record)" style={{ maxWidth: 320 }} />
                    <Btn variant="danger" onClick={() => confirmVoid(e.id)}>Confirm Void</Btn>
                    <Btn variant="ghost" onClick={() => setVoidingId(null)}>Cancel</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Payroll (rate cards, overtime, employee payments) ----------
// ---------- Salary (monthly, employee-wise, from approved attendance) ----------
function monthlySalaryReport(data, month) {
  return data.employees.filter((e) => e.status === "Active").map((e) => {
    const { rows } = employeeEarnings(e.code, data);
    const monthRows = rows.filter((r) => r.date.startsWith(month));
    const base = monthRows.reduce((s, r) => s + r.base, 0);
    const overtime = monthRows.reduce((s, r) => s + r.overtime, 0);
    const total = monthRows.reduce((s, r) => s + r.total, 0);
    const paid = monthRows.filter((r) => r.paid).reduce((s, r) => s + r.total, 0);
    const due = total - paid;
    const unpaidIds = monthRows.filter((r) => r.hasRate && !r.paid).map((r) => r.id);
    return { code: e.code, name: e.name, department: e.department, daysWorked: monthRows.length, base, overtime, total, paid, due, monthRows, unpaidIds };
  });
}

function exportSalaryCSV(report, month) {
  const rows = [
    ["MONTHLY SALARY REGISTER", month],
    ["Generated", new Date().toISOString()],
    [],
    ["Employee Code", "Name", "Department", "Days Worked", "Base Pay", "Overtime", "Total Salary", "Paid", "Due"],
    ...report.map((r) => [r.code, r.name, r.department, r.daysWorked, r.base, r.overtime, r.total, r.paid, r.due]),
    [],
    ["Total Payroll", "", "", report.reduce((s, r) => s + r.daysWorked, 0), report.reduce((s, r) => s + r.base, 0), report.reduce((s, r) => s + r.overtime, 0), report.reduce((s, r) => s + r.total, 0), report.reduce((s, r) => s + r.paid, 0), report.reduce((s, r) => s + r.due, 0)],
  ];
  downloadCSV(`salary_register_${month}.csv`, rows);
}

function SalaryPanel({ data, persist, persistAppend }) {
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const [payingCode, setPayingCode] = useState(null);
  const [payMode, setPayMode] = useState("Cash");
  const [payAccount, setPayAccount] = useState(ACCOUNTS[0]);

  const report = monthlySalaryReport(data, month);
  const totalPayroll = report.reduce((s, r) => s + r.total, 0);
  const totalPaid = report.reduce((s, r) => s + r.paid, 0);
  const totalDue = report.reduce((s, r) => s + r.due, 0);

  const startPay = (code) => { setPayingCode(code); setPayMode("Cash"); setPayAccount(ACCOUNTS[0]); };
  const confirmPay = (row) => {
    if (row.unpaidIds.length === 0 || row.due <= 0) { setPayingCode(null); return; }
    persistAppend("payroll", {
      id: uid("PAY"), employeeCode: row.code, date: todayStr(), amount: row.due, attendanceIds: row.unpaidIds,
      note: `Salary for ${month}`, createdAt: new Date().toISOString(),
    });
    persistAppend("ledger", {
      id: uid("LED"), date: todayStr(), type: "Expense", paymentMode: payMode, account: payMode === "Account" ? payAccount : null,
      category: "Salary/Remuneration", party: row.name, project: "", amount: row.due,
      note: `Salary — ${month} — ${row.code}`, voided: false, createdAt: new Date().toISOString(),
    });
    setPayingCode(null);
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={CalendarCheck} right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TextInput type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 160 }} />
            {report.length > 0 && <Btn variant="ghost" onClick={() => exportSalaryCSV(report, month)}><Download size={13} /> Export Register</Btn>}
          </div>
        }>Monthly Salary — {month}</SectionTitle>
        <p style={{ color: C.textDim, fontSize: 11.5, marginTop: -6 }}>Calculated directly from approved attendance for this month, using each employee's day rate and overtime rate. Set rates on the Payroll tab if an employee shows no pay.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 14 }}>
          <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18 }}>{money(totalPayroll)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Total Payroll</div></div>
          <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18 }}>{money(totalPaid)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Paid</div></div>
          <div><div style={{ fontFamily: "IBM Plex Mono", fontSize: 18, color: totalDue > 0 ? C.amber : C.text }}>{money(totalDue)}</div><div style={{ color: C.textDim, fontSize: 12 }}>Due</div></div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Users}>Employee-wise Salary ({report.length})</SectionTitle>
        {report.length === 0 ? <EmptyState text="No active employees." /> : (
          <div>
            {report.map((r) => (
              <div key={r.code} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{r.code}</span> <span style={{ fontWeight: 600 }}>{r.name}</span> <span style={{ color: C.textDim }}>· {r.department}</span>
                    <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{r.daysWorked} day(s) · Base {money(r.base)}{r.overtime > 0 && ` · OT ${money(r.overtime)}`} · Total {money(r.total)} · Paid {money(r.paid)} · Due <span style={{ color: r.due > 0 ? C.amber : C.tally }}>{money(r.due)}</span></div>
                  </div>
                  {r.due > 0 && <Btn onClick={() => startPay(r.code)} style={{ padding: "6px 10px" }}><DollarSign size={13} /> Pay Salary</Btn>}
                </div>
                {payingCode === r.code && (
                  <div style={{ marginTop: 8, padding: 10, background: C.surface2, borderRadius: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                    <div><Label>Payment Mode</Label><SelectInput value={payMode} onChange={(e) => setPayMode(e.target.value)} style={{ width: 140 }}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</SelectInput></div>
                    {payMode === "Account" && <div><Label>Account</Label><SelectInput value={payAccount} onChange={(e) => setPayAccount(e.target.value)} style={{ width: 140 }}>{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</SelectInput></div>}
                    <span style={{ fontSize: 12.5, color: C.textDim }}>Paying {money(r.due)}</span>
                    <Btn onClick={() => confirmPay(r)}><Check size={13} /> Confirm Payment</Btn>
                    <Btn variant="ghost" onClick={() => setPayingCode(null)}>Cancel</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function PayrollPanel({ data, persist, persistAppend, confirmDelete }) {
  const [rEmployee, setREmployee] = useState("");
  const [rProject, setRProject] = useState("");
  const [rDayRate, setRDayRate] = useState("");
  const [rOtRate, setROtRate] = useState("");
  const [rateErr, setRateErr] = useState("");

  const [payingCode, setPayingCode] = useState(null);
  const [payMode, setPayMode] = useState("Cash");
  const [payAccount, setPayAccount] = useState(ACCOUNTS[0]);
  const [expanded, setExpanded] = useState(null);

  const saveRate = () => {
    setRateErr("");
    if (!rEmployee || !rProject || !rDayRate) { setRateErr("Employee, project, and day rate are required."); return; }
    const existing = (data.rates || []).find((r) => r.employeeCode === rEmployee && r.project === rProject);
    const rate = { id: existing ? existing.id : uid("RATE"), employeeCode: rEmployee, project: rProject, dayRate: parseFloat(rDayRate), otRate: parseFloat(rOtRate) || 0 };
    const next = existing ? (data.rates || []).map((r) => r.id === existing.id ? rate : r) : [...(data.rates || []), rate];
    persist("rates", next);
    setREmployee(""); setRProject(""); setRDayRate(""); setROtRate("");
  };
  const removeRate = (id) => persist("rates", (data.rates || []).filter((r) => r.id !== id));

  const startPay = (code) => { setPayingCode(code); setPayMode("Cash"); setPayAccount(ACCOUNTS[0]); };
  const cancelPay = () => setPayingCode(null);

  const confirmPay = (code) => {
    const emp = data.employees.find((e) => e.code === code);
    const { rows, balance } = employeeEarnings(code, data);
    const unpaid = rows.filter((r) => r.hasRate && !r.paid);
    if (unpaid.length === 0 || balance <= 0) { setPayingCode(null); return; }
    const amount = unpaid.reduce((s, r) => s + r.total, 0);
    const attendanceIds = unpaid.map((r) => r.id);
    persistAppend("payroll", {
      id: uid("PAY"), employeeCode: code, date: todayStr(), amount, attendanceIds,
      note: `Payroll for ${unpaid.length} day(s)`, createdAt: new Date().toISOString(),
    });
    persistAppend("ledger", {
      id: uid("LED"), date: todayStr(), type: "Expense", paymentMode: payMode, account: payMode === "Account" ? payAccount : null,
      category: "Salary/Remuneration", party: emp?.name || code, project: "", amount, note: `Payroll payment — ${code}`,
      createdAt: new Date().toISOString(),
    });
    setPayingCode(null);
  };

  const activeEmployees = data.employees.filter((e) => e.status === "Active");

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>Set Rate (project-wise, per day)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
          <div><Label>Employee</Label>
            <SelectInput value={rEmployee} onChange={(e) => setREmployee(e.target.value)}>
              <option value="">Select employee</option>
              {data.employees.map((e) => <option key={e.code} value={e.code}>{e.code} · {e.name}</option>)}
            </SelectInput>
          </div>
          <div><Label>Project</Label>
            <SelectInput value={rProject} onChange={(e) => setRProject(e.target.value)}>
              <option value="">Select project</option>
              {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </SelectInput>
          </div>
          <div><Label>Day Rate (₹)</Label><TextInput type="number" value={rDayRate} onChange={(e) => setRDayRate(e.target.value)} placeholder="Per day" /></div>
          <div><Label>Overtime Amount (Fixed ₹)</Label><TextInput type="number" value={rOtRate} onChange={(e) => setROtRate(e.target.value)} placeholder="Flat bonus if day exceeds 11 hrs" /></div>
          <Btn onClick={saveRate}><Plus size={14} /> Save Rate</Btn>
        </div>
        {rateErr && <div style={{ color: C.rec, fontSize: 12.5, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} />{rateErr}</div>}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={ListChecks} right={
          (data.rates || []).length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`rate_cards_${todayStr()}.csv`, [["Employee Code", "Name", "Project", "Day Rate", "OT Amount (Fixed)"], ...(data.rates || []).map((r) => [r.employeeCode, (data.employees.find((e) => e.code === r.employeeCode) || {}).name || "", r.project, r.dayRate, r.otRate])])}><Download size={13} /> Export Rates</Btn>
        }>Rate Cards ({(data.rates || []).length})</SectionTitle>
        {(data.rates || []).length === 0 ? <EmptyState text="No rates set yet. Set a day rate above so earnings can be calculated." /> : (
          <div>
            {(data.rates || []).map((r) => {
              const emp = data.employees.find((e) => e.code === r.employeeCode);
              return (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8, flexWrap: "wrap" }}>
                  <span>{r.employeeCode} · {emp?.name || "—"} · {r.project}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "IBM Plex Mono", color: C.textDim }}>{money(r.dayRate)}/day · OT {money(r.otRate)} fixed (days over 11h)</span>
                    <Btn variant="danger" onClick={() => confirmDelete(`Delete this rate card (${r.employeeCode} · ${r.project})? Future salary calculations for this project won't have a rate until you set a new one.`, () => removeRate(r.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={Wallet} right={
          activeEmployees.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`earnings_payments_${todayStr()}.csv`, [
            ["Employee Code", "Name", "Total Earned", "Total Paid", "Balance Due"],
            ...activeEmployees.map((e) => { const s = employeeEarnings(e.code, data); return [e.code, e.name, s.totalEarned, s.totalPaid, s.balance]; }),
          ])}><Download size={13} /> Export Summary</Btn>
        }>Earnings & Payments</SectionTitle>
        {activeEmployees.length === 0 ? <EmptyState text="No active employees." /> : (
          <div style={{ display: "grid", gap: 10 }}>
            {activeEmployees.map((e) => {
              const { rows, totalEarned, totalPaid, balance } = employeeEarnings(e.code, data);
              const isPaying = payingCode === e.code;
              const isExpanded = expanded === e.code;
              return (
                <div key={e.code} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                    <div>
                      <span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{e.code}</span> <span style={{ fontWeight: 600 }}>{e.name}</span>
                      <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Earned {money(totalEarned)} · Paid {money(totalPaid)} · Balance <span style={{ color: balance > 0 ? C.amber : C.tally }}>{money(balance)}</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="ghost" onClick={() => setExpanded(isExpanded ? null : e.code)} style={{ padding: "6px 10px" }}>{isExpanded ? "Hide" : "Details"}</Btn>
                      {balance > 0 && !isPaying && <Btn onClick={() => startPay(e.code)} style={{ padding: "6px 10px" }}><DollarSign size={13} /> Pay Now</Btn>}
                    </div>
                  </div>

                  {isPaying && (
                    <div style={{ marginTop: 10, padding: 10, background: C.surface2, borderRadius: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                      <div><Label>Payment Mode</Label><SelectInput value={payMode} onChange={(ev) => setPayMode(ev.target.value)} style={{ width: 140 }}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</SelectInput></div>
                      {payMode === "Account" && <div><Label>Account</Label><SelectInput value={payAccount} onChange={(ev) => setPayAccount(ev.target.value)} style={{ width: 140 }}>{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</SelectInput></div>}
                      <span style={{ fontSize: 12.5, color: C.textDim }}>Paying {money(balance)}</span>
                      <Btn onClick={() => confirmPay(e.code)}><Check size={13} /> Confirm Payment</Btn>
                      <Btn variant="ghost" onClick={cancelPay}>Cancel</Btn>
                    </div>
                  )}

                  {isExpanded && (
                    <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                      {rows.length === 0 ? <EmptyState text="No approved present days yet." /> : (
                        <div>
                          {rows.map((r) => (
                            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12.5, gap: 8, flexWrap: "wrap" }}>
                              <span>{r.date} · {r.project} {r.role && `· ${r.role}`} · {r.hours.toFixed(1)}h{r.otHours > 0 && ` (${r.otHours.toFixed(1)}h OT)`}</span>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                {!r.hasRate ? <Pill tone="warn">No rate set</Pill> : (
                                  <>
                                    <span style={{ fontFamily: "IBM Plex Mono" }}>{money(r.total)}</span>
                                    <Pill tone={r.paid ? "good" : "warn"}>{r.paid ? "Paid" : "Unpaid"}</Pill>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}


// ---------- Equipment & Vendors ----------
function EquipmentPanel({ data, persist, persistAppend, confirmDelete }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(EQUIPMENT_CATEGORIES[0]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayStr());
  const [purchaseCost, setPurchaseCost] = useState("");
  const [location, setLocation] = useState("");

  const addEquipment = () => {
    if (!name.trim()) return;
    persistAppend("equipment", {
      id: uid("EQP"), name: name.trim(), category, make: make.trim(), model: model.trim(), serial: serial.trim(),
      purchaseDate, purchaseCost: parseFloat(purchaseCost) || 0, status: "Available", location: location.trim(), condition: "Good", notes: "",
    });
    setName(""); setMake(""); setModel(""); setSerial(""); setPurchaseCost(""); setLocation("");
  };
  const setEquipStatus = (id, status) => persist("equipment", (data.equipment || []).map((eq) => eq.id === id ? { ...eq, status } : eq));
  const setEquipCategory = (id, cat) => persist("equipment", (data.equipment || []).map((eq) => eq.id === id ? { ...eq, category: cat } : eq));
  const removeEquipment = (id) => persist("equipment", (data.equipment || []).filter((eq) => eq.id !== id));

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>Add Equipment</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, alignItems: "end" }}>
          <div><Label>Name</Label><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Sony PXW-Z190" /></div>
          <div><Label>Category</Label><SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>{EQUIPMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</SelectInput></div>
          <div><Label>Make</Label><TextInput value={make} onChange={(e) => setMake(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Model</Label><TextInput value={model} onChange={(e) => setModel(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Serial No.</Label><TextInput value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Purchase Date</Label><TextInput type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} /></div>
          <div><Label>Purchase Cost (₹)</Label><TextInput type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} /></div>
          <div><Label>Location</Label><TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" /></div>
          <Btn onClick={addEquipment}><Plus size={14} /> Add</Btn>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={ListChecks} right={
          (data.equipment || []).length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`equipment_inventory_${todayStr()}.csv`, [["Name", "Category", "Make", "Model", "Serial", "Purchase Date", "Purchase Cost", "Status", "Location"], ...(data.equipment || []).map((eq) => [eq.name, eq.category, eq.make || "", eq.model || "", eq.serial || "", eq.purchaseDate || "", eq.purchaseCost || 0, eq.status, eq.location || ""])])}><Download size={13} /> Export Inventory</Btn>
        }>Equipment Inventory ({(data.equipment || []).length})</SectionTitle>
        {(data.equipment || []).length === 0 ? <EmptyState text="No equipment added yet." /> : (
          <div>
            {(data.equipment || []).map((eq) => (
              <div key={eq.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{eq.name}</span>{eq.make && <span style={{ color: C.textDim }}> · {eq.make} {eq.model}</span>}{eq.serial && <span style={{ color: C.textDim }}> · SN {eq.serial}</span>}
                  {eq.location && <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 2 }}>{eq.location} {eq.purchaseCost > 0 && `· ${money(eq.purchaseCost)}`}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SelectInput value={eq.category} onChange={(e) => setEquipCategory(eq.id, e.target.value)} style={{ width: 130, padding: "4px 8px", fontSize: 12 }}>
                    {EQUIPMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </SelectInput>
                  <SelectInput value={eq.status} onChange={(e) => setEquipStatus(eq.id, e.target.value)} style={{ width: 150, padding: "4px 8px", fontSize: 12 }}>
                    {EQUIPMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </SelectInput>
                  <Btn variant="danger" onClick={() => confirmDelete(`Delete "${eq.name}" from equipment inventory?`, () => removeEquipment(eq.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Vendors (equipment hire) ----------
function vendorHireSummary(vendorId, data) {
  const hires = (data.hires || []).filter((h) => h.vendorId === vendorId);
  const totalCost = hires.reduce((s, h) => s + (Number(h.cost) || 0), 0);
  const unpaid = hires.filter((h) => h.paymentStatus !== "Paid").reduce((s, h) => s + (Number(h.cost) || 0), 0);
  const activeHires = hires.filter((h) => h.status === "Hired").length;
  return { hires, totalCost, unpaid, activeHires };
}

function VendorPanel({ data, persist, persistAppend, confirmDelete }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Equipment Rental");

  const addVendor = () => {
    if (!name.trim()) return;
    persistAppend("vendors", { id: uid("VEN"), name: name.trim(), contact: contact.trim(), phone: phone.trim(), email: email.trim(), category: category.trim(), active: true });
    setName(""); setContact(""); setPhone(""); setEmail("");
  };
  const removeVendor = (id) => persist("vendors", (data.vendors || []).filter((v) => v.id !== id));

  const [hVendor, setHVendor] = useState("");
  const [hItem, setHItem] = useState("");
  const [hProject, setHProject] = useState("");
  const [hDate, setHDate] = useState(todayStr());
  const [hReturn, setHReturn] = useState("");
  const [hCost, setHCost] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [payMode, setPayMode] = useState("Cash");
  const [payAccount, setPayAccount] = useState(ACCOUNTS[0]);

  const addHire = () => {
    if (!hVendor || !hItem.trim() || !hCost) return;
    persistAppend("hires", {
      id: uid("HIRE"), vendorId: hVendor, item: hItem.trim(), project: hProject,
      hireDate: hDate, expectedReturn: hReturn, actualReturn: "", cost: parseFloat(hCost) || 0,
      status: "Hired", paymentStatus: "Unpaid",
    });
    setHItem(""); setHProject(""); setHReturn(""); setHCost("");
  };
  const markReturned = (id) => persist("hires", (data.hires || []).map((h) => h.id === id ? { ...h, status: "Returned", actualReturn: todayStr() } : h));
  const removeHire = (id) => persist("hires", (data.hires || []).filter((h) => h.id !== id));

  const startPay = (h) => { setPayingId(h.id); setPayMode("Cash"); setPayAccount(ACCOUNTS[0]); };
  const confirmPay = (h) => {
    const vendor = (data.vendors || []).find((v) => v.id === h.vendorId);
    persist("hires", (data.hires || []).map((x) => x.id === h.id ? { ...x, paymentStatus: "Paid" } : x));
    persistAppend("ledger", {
      id: uid("LED"), date: todayStr(), type: "Expense", paymentMode: payMode, account: payMode === "Account" ? payAccount : null,
      category: "Equipment", party: vendor?.name || "Vendor", project: h.project || "", amount: h.cost,
      note: `Equipment hire — ${h.item}`, voided: false, createdAt: new Date().toISOString(),
    });
    setPayingId(null);
  };

  // Vendor bills — separate from a specific hire, supports partial payment
  const [bVendor, setBVendor] = useState("");
  const [bNumber, setBNumber] = useState("");
  const [bProject, setBProject] = useState("");
  const [bAmount, setBAmount] = useState("");
  const [bDate, setBDate] = useState(todayStr());
  const [bDue, setBDue] = useState("");
  const [bNote, setBNote] = useState("");
  const [payingBillId, setPayingBillId] = useState(null);
  const [billPayAmount, setBillPayAmount] = useState("");
  const [billPayMode, setBillPayMode] = useState("Cash");
  const [billPayAccount, setBillPayAccount] = useState(ACCOUNTS[0]);

  const addBill = () => {
    if (!bVendor || !bAmount || parseFloat(bAmount) <= 0) return;
    persistAppend("bills", {
      id: uid("BILL"), vendorId: bVendor, billNumber: bNumber.trim(), project: bProject,
      amount: parseFloat(bAmount), paidAmount: 0, billDate: bDate, dueDate: bDue,
      status: "Due", note: bNote.trim(), createdAt: new Date().toISOString(),
    });
    setBNumber(""); setBAmount(""); setBDue(""); setBNote(""); setBProject("");
  };
  const removeBill = (id) => persist("bills", (data.bills || []).filter((b) => b.id !== id));
  const startPayBill = (b) => {
    const due = Math.max(0, (Number(b.amount) || 0) - (Number(b.paidAmount) || 0));
    setPayingBillId(b.id); setBillPayAmount(due.toFixed(2)); setBillPayMode("Cash"); setBillPayAccount(ACCOUNTS[0]);
  };
  const confirmPayBill = async (b) => {
    const amt = parseFloat(billPayAmount);
    const currentPaid = Number(b.paidAmount) || 0;
    const due = Math.max(0, (Number(b.amount) || 0) - currentPaid);
    if (!Number.isFinite(amt) || amt <= 0 || amt > due) return;
    const newPaid = currentPaid + amt;
    const fullyPaid = newPaid >= (Number(b.amount) || 0);
    const vendor = (data.vendors || []).find((v) => v.id === b.vendorId);
    // "bills" and "ledger" now share the "finance" bucket — sequenced for the same reason as
    // addEmployee above, so this payment doesn't wipe the ledger entry it just wrote (or vice versa).
    await persist("bills", (data.bills || []).map((x) => x.id === b.id ? { ...x, paidAmount: newPaid, status: fullyPaid ? "Paid" : "Partially Paid" } : x));
    await persistAppend("ledger", {
      id: uid("LED"), date: todayStr(), type: "Expense", paymentMode: billPayMode, account: billPayMode === "Account" ? billPayAccount : null,
      category: "Vendor Bill", party: vendor?.name || "Vendor", project: b.project || "", amount: amt,
      note: `Bill payment${b.billNumber ? ` — ${b.billNumber}` : ""}`, voided: false, createdAt: new Date().toISOString(),
    });
    setPayingBillId(null);
  };

  const today = todayStr();
  const hires = data.hires || [];
  const bills = data.bills || [];
  const totalHireCost = hires.reduce((s, h) => s + (Number(h.cost) || 0), 0);
  const unpaidHires = hires.filter((h) => h.paymentStatus !== "Paid").reduce((s, h) => s + (Number(h.cost) || 0), 0);
  const billsDue = bills.reduce((s, b) => s + Math.max(0, (Number(b.amount) || 0) - (Number(b.paidAmount) || 0)), 0);
  const overdueHires = hires.filter((h) => h.status === "Hired" && h.expectedReturn && h.expectedReturn < today);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Card><Wallet size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalHireCost)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Hire Cost</div></Card>
        <Card><DollarSign size={16} color={C.amber} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: (unpaidHires + billsDue) > 0 ? C.amber : C.text }}>{money(unpaidHires + billsDue)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Due to Vendors</div></Card>
        <Card><Receipt size={16} color={C.amber} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: billsDue > 0 ? C.amber : C.text }}>{money(billsDue)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Bills Due</div></Card>
        <Card><AlertCircle size={16} color={overdueHires.length ? C.rec : C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: overdueHires.length ? C.rec : C.text }}>{overdueHires.length}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Overdue Returns</div></Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>Register Vendor</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end" }}>
          <div><Label>Vendor Name</Label><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ABC Rentals" /></div>
          <div><Label>Contact Person</Label><TextInput value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Phone</Label><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Email</Label><TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Category</Label><TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Equipment Rental" /></div>
          <Btn onClick={addVendor}><Plus size={14} /> Register Vendor</Btn>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Users} right={
          (data.vendors || []).length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`vendor_data_${todayStr()}.csv`, [
            ["VENDORS"],
            ["Name", "Category", "Contact", "Phone", "Email"],
            ...(data.vendors || []).map((v) => [v.name, v.category || "", v.contact || "", v.phone || "", v.email || ""]),
            [],
            ["EQUIPMENT HIRE LOG"],
            ["Vendor", "Item", "Project", "Hire Date", "Expected Return", "Actual Return", "Cost", "Status", "Payment Status"],
            ...hires.map((h) => [(data.vendors.find((v) => v.id === h.vendorId) || {}).name || "", h.item, h.project || "", h.hireDate, h.expectedReturn || "", h.actualReturn || "", h.cost, h.status, h.paymentStatus]),
            [],
            ["VENDOR BILLS"],
            ["Vendor", "Bill #", "Project", "Amount", "Paid", "Due Date", "Status"],
            ...bills.map((b) => [(data.vendors.find((v) => v.id === b.vendorId) || {}).name || "", b.billNumber || "", b.project || "", b.amount, b.paidAmount || 0, b.dueDate || "", b.status]),
          ])}><Download size={13} /> Export Vendor Data</Btn>
        }>Vendors ({(data.vendors || []).length})</SectionTitle>
        {(data.vendors || []).length === 0 ? <EmptyState text="No vendors registered yet." /> : (
          <div>
            {(data.vendors || []).map((v) => {
              const s = vendorHireSummary(v.id, data);
              return (
                <div key={v.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={v.name} size={24} />{v.name} {v.category && <span style={{ color: C.textDim }}>· {v.category}</span>}{v.contact && <span style={{ color: C.textDim }}> · {v.contact}</span>}{v.phone && <span style={{ color: C.textDim }}> · {v.phone}</span>}</span>
                    <Btn variant="danger" onClick={() => confirmDelete(`Delete vendor "${v.name}"? Their hire log and bill history will stay but will show as an unlinked vendor.`, () => removeVendor(v.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                  </div>
                  {s.hires.length > 0 && <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>{s.hires.length} hire(s) · {money(s.totalCost)} total {s.unpaid > 0 && `· ${money(s.unpaid)} unpaid`} {s.activeHires > 0 && `· ${s.activeHires} currently out`}</div>}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>Hire Equipment from Vendor</SectionTitle>
        {(data.vendors || []).length === 0 ? <EmptyState text="Register a vendor above first." /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end" }}>
            <div><Label>Vendor</Label>
              <SelectInput value={hVendor} onChange={(e) => setHVendor(e.target.value)}>
                <option value="">Select vendor</option>
                {(data.vendors || []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </SelectInput>
            </div>
            <div><Label>Item</Label><TextInput value={hItem} onChange={(e) => setHItem(e.target.value)} placeholder="e.g. Drone + operator" /></div>
            <div><Label>Project</Label>
              <SelectInput value={hProject} onChange={(e) => setHProject(e.target.value)}>
                <option value="">Not project-specific</option>
                {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </SelectInput>
            </div>
            <div><Label>Hire Date</Label><TextInput type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} /></div>
            <div><Label>Expected Return</Label><TextInput type="date" value={hReturn} onChange={(e) => setHReturn(e.target.value)} /></div>
            <div><Label>Cost (₹)</Label><TextInput type="number" value={hCost} onChange={(e) => setHCost(e.target.value)} /></div>
            <Btn onClick={addHire}><Plus size={14} /> Log Hire</Btn>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={ListChecks}>Hire Log ({hires.length})</SectionTitle>
        {hires.length === 0 ? <EmptyState text="No equipment hired yet." /> : (
          <div>
            {hires.map((h) => {
              const vendor = (data.vendors || []).find((v) => v.id === h.vendorId);
              const isOverdue = h.status === "Hired" && h.expectedReturn && h.expectedReturn < today;
              return (
                <div key={h.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span>{h.item} · {vendor?.name || "—"} {h.project && `· ${h.project}`} · {money(h.cost)}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Pill tone={isOverdue ? "bad" : h.status === "Returned" ? "good" : "warn"}>{isOverdue ? "Overdue" : h.status}</Pill>
                      <Pill tone={h.paymentStatus === "Paid" ? "good" : "warn"}>{h.paymentStatus}</Pill>
                      {h.status === "Hired" && <Btn variant="ghost" onClick={() => markReturned(h.id)} style={{ padding: "5px 10px" }}>Mark Returned</Btn>}
                      {h.paymentStatus !== "Paid" && <Btn variant="ghost" onClick={() => startPay(h)} style={{ padding: "5px 10px" }}>Pay Vendor</Btn>}
                      <Btn variant="danger" onClick={() => confirmDelete(`Delete this hire record for "${h.item}"? This removes it from the log entirely — if it was paid, that Ledger entry stays but won't be linked to a hire anymore.`, () => removeHire(h.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                    </div>
                  </div>
                  <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>Hired {h.hireDate}{h.expectedReturn && ` · due back ${h.expectedReturn}`}{h.actualReturn && ` · returned ${h.actualReturn}`}</div>
                  {payingId === h.id && (
                    <div style={{ marginTop: 8, padding: 10, background: C.surface2, borderRadius: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                      <div><Label>Payment Mode</Label><SelectInput value={payMode} onChange={(e) => setPayMode(e.target.value)} style={{ width: 130 }}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</SelectInput></div>
                      {payMode === "Account" && <div><Label>Account</Label><SelectInput value={payAccount} onChange={(e) => setPayAccount(e.target.value)} style={{ width: 130 }}>{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</SelectInput></div>}
                      <span style={{ fontSize: 12.5, color: C.textDim }}>Paying {money(h.cost)}</span>
                      <Btn onClick={() => confirmPay(h)}><Check size={13} /> Confirm Payment</Btn>
                      <Btn variant="ghost" onClick={() => setPayingId(null)}>Cancel</Btn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 16, marginBottom: 16 }}>
        <SectionTitle icon={Plus}>Add Vendor Bill</SectionTitle>
        {(data.vendors || []).length === 0 ? <EmptyState text="Register a vendor above first." /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end" }}>
            <div><Label>Vendor</Label>
              <SelectInput value={bVendor} onChange={(e) => setBVendor(e.target.value)}>
                <option value="">Select vendor</option>
                {(data.vendors || []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </SelectInput>
            </div>
            <div><Label>Bill Number</Label><TextInput value={bNumber} onChange={(e) => setBNumber(e.target.value)} placeholder="Optional" /></div>
            <div><Label>Project</Label>
              <SelectInput value={bProject} onChange={(e) => setBProject(e.target.value)}>
                <option value="">Not project-specific</option>
                {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </SelectInput>
            </div>
            <div><Label>Amount (₹)</Label><TextInput type="number" value={bAmount} onChange={(e) => setBAmount(e.target.value)} /></div>
            <div><Label>Bill Date</Label><TextInput type="date" value={bDate} onChange={(e) => setBDate(e.target.value)} /></div>
            <div><Label>Due Date</Label><TextInput type="date" value={bDue} onChange={(e) => setBDue(e.target.value)} /></div>
            <div style={{ gridColumn: "1 / -1" }}><Label>Note</Label><TextInput value={bNote} onChange={(e) => setBNote(e.target.value)} placeholder="Optional" /></div>
            <Btn onClick={addBill}><Plus size={14} /> Add Bill</Btn>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={Receipt}>Vendor Bills ({bills.length})</SectionTitle>
        {bills.length === 0 ? <EmptyState text="No vendor bills logged yet." /> : (
          <div>
            {bills.map((b) => {
              const vendor = (data.vendors || []).find((v) => v.id === b.vendorId);
              const paid = Number(b.paidAmount) || 0;
              const due = Math.max(0, (Number(b.amount) || 0) - paid);
              const isOverdue = due > 0 && b.dueDate && b.dueDate < today;
              return (
                <div key={b.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span>{vendor?.name || "—"} {b.billNumber && `· ${b.billNumber}`} {b.project && `· ${b.project}`} · {money(b.amount)} {paid > 0 && `· Paid ${money(paid)}`}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Pill tone={isOverdue ? "bad" : statusTone(b.status)}>{isOverdue ? "Overdue" : b.status}</Pill>
                      {due > 0 && <Btn variant="ghost" onClick={() => startPayBill(b)} style={{ padding: "5px 10px" }}>Pay Bill</Btn>}
                      <Btn variant="danger" onClick={() => confirmDelete(`Delete this bill${b.billNumber ? ` (${b.billNumber})` : ""}? Any payments already made against it stay in the Ledger but lose their link to this bill.`, () => removeBill(b.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                    </div>
                  </div>
                  <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>Billed {b.billDate}{b.dueDate && ` · due ${b.dueDate}`}{b.note && ` · ${b.note}`}</div>
                  {payingBillId === b.id && (
                    <div style={{ marginTop: 8, padding: 10, background: C.surface2, borderRadius: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                      <div><Label>Amount (₹)</Label><TextInput type="number" min="0.01" max={due} value={billPayAmount} onChange={(e) => setBillPayAmount(e.target.value)} style={{ width: 120 }} /></div>
                      <div><Label>Payment Mode</Label><SelectInput value={billPayMode} onChange={(e) => setBillPayMode(e.target.value)} style={{ width: 130 }}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</SelectInput></div>
                      {billPayMode === "Account" && <div><Label>Account</Label><SelectInput value={billPayAccount} onChange={(e) => setBillPayAccount(e.target.value)} style={{ width: 130 }}>{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</SelectInput></div>}
                      <Btn onClick={() => confirmPayBill(b)}><Check size={13} /> Confirm Payment</Btn>
                      <Btn variant="ghost" onClick={() => setPayingBillId(null)}>Cancel</Btn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Party ledger (vendors, clients, freelancers — everyone with a running balance) ----------
function partyLedgerStats(partyName, ledger) {
  const list = (ledger || []).filter((e) => !e.voided && e.party === partyName);
  const paid = list.filter((e) => e.type === "Expense" || e.type === "Asset Purchase" || e.type === "Loss Booking").reduce((s, e) => s + (e.amount || 0), 0);
  const received = list.filter((e) => e.type === "Income").reduce((s, e) => s + (e.amount || 0), 0);
  return { paid, received, net: received - paid, count: list.length };
}

function PartyPanel({ data, persist, persistAppend, confirmDelete }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(PARTY_TYPES[0]);
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");
  const [notes, setNotes] = useState("");
  const [filterType, setFilterType] = useState("All");

  const addParty = () => {
    if (!name.trim()) return;
    persistAppend("parties", { id: uid("PTY"), name: name.trim(), type, contact: contact.trim(), phone: phone.trim(), email: email.trim(), gst: gst.trim(), pan: pan.trim(), notes: notes.trim() });
    setName(""); setContact(""); setPhone(""); setEmail(""); setGst(""); setPan(""); setNotes("");
  };
  const removeParty = (id) => persist("parties", (data.parties || []).filter((p) => p.id !== id));

  const [editingId, setEditingId] = useState(null);
  const [eName, setEName] = useState("");
  const [eType, setEType] = useState(PARTY_TYPES[0]);
  const [eContact, setEContact] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [eGst, setEGst] = useState("");
  const [ePan, setEPan] = useState("");
  const [eNotes, setENotes] = useState("");
  const startEdit = (p) => {
    setEditingId(p.id);
    setEName(p.name); setEType(p.type); setEContact(p.contact || ""); setEPhone(p.phone || ""); setEEmail(p.email || ""); setEGst(p.gst || ""); setEPan(p.pan || ""); setENotes(p.notes || "");
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = () => {
    if (!eName.trim()) return;
    persist("parties", (data.parties || []).map((p) => p.id === editingId
      ? { ...p, name: eName.trim(), type: eType, contact: eContact.trim(), phone: ePhone.trim(), email: eEmail.trim(), gst: eGst.trim(), pan: ePan.trim(), notes: eNotes.trim() }
      : p));
    setEditingId(null);
  };

  const parties = (data.parties || []).filter((p) => filterType === "All" || p.type === filterType);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>Register Party</SectionTitle>
        <p style={{ color: C.textDim, fontSize: 11.5, marginTop: -6, marginBottom: 12 }}>A party is anyone you pay or get paid by — vendors, clients, freelancers. Use the same name here as in the Ledger's "Party" field so totals link up automatically.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end" }}>
          <div><Label>Name</Label><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Party / company name" /></div>
          <div><Label>Type</Label><SelectInput value={type} onChange={(e) => setType(e.target.value)}>{PARTY_TYPES.map((t) => <option key={t}>{t}</option>)}</SelectInput></div>
          <div><Label>Contact Person</Label><TextInput value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Phone</Label><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" /></div>
          <div><Label>Email</Label><TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" /></div>
          <div><Label>GST Details</Label><TextInput value={gst} onChange={(e) => setGst(e.target.value)} placeholder="15-character GSTIN, optional" /></div>
          <div><Label>PAN Card</Label><TextInput value={pan} onChange={(e) => setPan(e.target.value)} placeholder="10-character PAN, optional" /></div>
          <div style={{ gridColumn: "1 / -1" }}><Label>Notes</Label><TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" /></div>
          <Btn onClick={addParty}><Plus size={14} /> Register Party</Btn>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Users} right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SelectInput value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: 150 }}>
              <option value="All">All Types</option>
              {PARTY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </SelectInput>
            {parties.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`parties_${todayStr()}.csv`, [["Name", "Type", "Contact", "Phone", "Email", "GST", "PAN", "Paid", "Received", "Net"], ...parties.map((p) => { const s = partyLedgerStats(p.name, data.ledger); return [p.name, p.type, p.contact || "", p.phone || "", p.email || "", p.gst || "", p.pan || "", s.paid, s.received, s.net]; })])}><Download size={13} /> Export Parties</Btn>}
          </div>
        }>Parties ({parties.length})</SectionTitle>
        {parties.length === 0 ? <EmptyState text="No parties registered yet." /> : (
          <div>
            {parties.map((p) => {
              const s = partyLedgerStats(p.name, data.ledger);
              if (p.id === editingId) {
                return (
                  <div key={p.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginBottom: 8 }}>
                      <div><Label>Name</Label><TextInput value={eName} onChange={(e) => setEName(e.target.value)} /></div>
                      <div><Label>Type</Label><SelectInput value={eType} onChange={(e) => setEType(e.target.value)}>{PARTY_TYPES.map((t) => <option key={t}>{t}</option>)}</SelectInput></div>
                      <div><Label>Contact Person</Label><TextInput value={eContact} onChange={(e) => setEContact(e.target.value)} /></div>
                      <div><Label>Phone</Label><TextInput value={ePhone} onChange={(e) => setEPhone(e.target.value)} /></div>
                      <div><Label>Email</Label><TextInput value={eEmail} onChange={(e) => setEEmail(e.target.value)} /></div>
                      <div><Label>GST Details</Label><TextInput value={eGst} onChange={(e) => setEGst(e.target.value)} placeholder="15-character GSTIN, optional" /></div>
                      <div><Label>PAN Card</Label><TextInput value={ePan} onChange={(e) => setEPan(e.target.value)} placeholder="10-character PAN, optional" /></div>
                      <div style={{ gridColumn: "1 / -1" }}><Label>Notes</Label><TextInput value={eNotes} onChange={(e) => setENotes(e.target.value)} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn onClick={saveEdit}><Check size={13} /> Save</Btn>
                      <Btn variant="ghost" onClick={cancelEdit}>Cancel</Btn>
                    </div>
                  </div>
                );
              }
              return (
                <div key={p.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><Avatar name={p.name} size={24} /><span style={{ fontWeight: 600 }}>{p.name}</span> <Pill tone="dim">{p.type}</Pill> {p.contact && <span style={{ color: C.textDim }}> · {p.contact}</span>}{p.phone && <span style={{ color: C.textDim }}> · {p.phone}</span>}{p.gst && <span style={{ color: C.textDim }}> · GST {p.gst}</span>}{p.pan && <span style={{ color: C.textDim }}> · PAN {p.pan}</span>}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn variant="ghost" onClick={() => startEdit(p)} style={{ padding: "4px 8px" }}><Pencil size={12} /> Edit</Btn>
                      <Btn variant="danger" onClick={() => confirmDelete(`Delete party "${p.name}"? Their past Ledger entries stay, but you'll lose the paid/received summary linked to this record.`, () => removeParty(p.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                    </div>
                  </div>
                  <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>
                    {s.count === 0 ? "No ledger activity yet" : <>Paid {money(s.paid)} · Received {money(s.received)} · Net <span style={{ color: s.net >= 0 ? C.tally : C.rec }}>{money(s.net)}</span></>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}


// ---------- Ask AI (reads the live business data, answers in plain language) ----------
const AI_SUGGESTED_QUESTIONS = [
  "Which projects are close to their budget limit?",
  "What payments are due soon?",
  "Summarize what's waiting on approval",
  "How's our cash position?",
];

function AIInsightsPanel({ data }) {
  const [messages, setMessages] = useState([]); // {role, text, kind?} — kind marks Briefing/Risk cards distinctly
  const [apiHistory, setApiHistory] = useState([]); // real Anthropic API message history, for genuine multi-turn memory
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTurn = async (userVisibleText, apiUserContent, kind) => {
    if (loading) return;
    setMessages((m) => [...m, { role: "user", text: userVisibleText, kind }]);
    setInput("");
    setLoading(true);
    setError(null);
    const nextHistory = [...apiHistory, { role: "user", content: apiUserContent }];
    try {
      const answer = await askAI(nextHistory);
      setApiHistory([...nextHistory, { role: "assistant", content: answer }]);
      setMessages((m) => [...m, { role: "assistant", text: answer, kind }]);
    } catch {
      setError("Couldn't get a response — try again in a moment.");
    }
    setLoading(false);
  };

  const send = (questionOverride) => {
    const q = (questionOverride || input).trim();
    if (!q) return;
    const context = buildAIContext(data);
    runTurn(q, `DATA SNAPSHOT (current):\n${context}\n\nQUESTION: ${q}`);
  };

  const runBriefing = () => {
    const context = buildAIContext(data);
    runTurn("Give me today's executive briefing", `DATA SNAPSHOT (current):\n${context}\n\nGive a 3-5 sentence executive briefing: lead with anything urgent (overdue, over-budget, large pending amounts), then overall health in one line. Direct and plain, no headers or bullet points.`, "briefing");
  };

  const runRiskAnalysis = () => {
    const context = buildAIContext(data);
    runTurn("Analyze project risk", `DATA SNAPSHOT (current):\n${context}\n\nLook at every project. Flag ones at real risk — over 85% of budget used, past their end date while still Active, or with zero people assigned. For each flagged project, one line: name and the specific reason. If none are at risk, say so in one line. Don't comment on healthy projects individually.`, "risk");
  };

  const clearConversation = () => { setMessages([]); setApiHistory([]); setError(null); };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Sparkles} right={
          messages.length > 0 && <Btn variant="ghost" onClick={clearConversation} style={{ padding: "6px 10px", fontSize: 12 }}>New Conversation</Btn>
        }>Ask AI About Your Business</SectionTitle>
        <p style={{ color: C.textDim, fontSize: 12.5, marginBottom: 12 }}>
          Reads your current projects, ledger, payroll, and approvals to answer — and remembers this conversation, so follow-up questions work. It won't guess at numbers the data doesn't have.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Btn onClick={runBriefing} disabled={loading} style={{ padding: "6px 12px", fontSize: 12 }}><Sparkles size={12} /> Executive Briefing</Btn>
          <Btn onClick={runRiskAnalysis} disabled={loading} style={{ padding: "6px 12px", fontSize: 12 }}><AlertCircle size={12} /> Analyze Project Risk</Btn>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {AI_SUGGESTED_QUESTIONS.map((q) => (
            <Btn key={q} variant="ghost" onClick={() => send(q)} disabled={loading} style={{ padding: "6px 10px", fontSize: 12 }}>{q}</Btn>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TextInput value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={messages.length > 0 ? "Ask a follow-up…" : "e.g. Which vouchers should I pay first?"} style={{ flex: 1, minWidth: 220 }} />
          <Btn onClick={() => send()} disabled={loading}>{loading ? "Thinking…" : "Ask"}</Btn>
        </div>
        {error && <div style={{ color: C.rec, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
      </Card>

      {messages.length > 0 && (
        <Card>
          <SectionTitle icon={ListChecks}>Conversation</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%",
                background: m.role === "user" ? C.surface3 : (m.kind ? `${C.amber}14` : `${C.tally}14`),
                border: `1px solid ${m.role === "user" ? C.border : (m.kind ? `${C.amber}33` : `${C.tally}33`)}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap",
              }}>
                <div style={{ fontSize: 10.5, color: C.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {m.role === "user" ? "You" : (m.kind === "briefing" ? "AI · Briefing" : m.kind === "risk" ? "AI · Risk Analysis" : "AI")}
                </div>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ color: C.textDim, fontSize: 12.5 }}>Thinking…</div>}
          </div>
        </Card>
      )}
    </div>
  );
}

function ApprovalsPanel({ data, persist }) {
  const decideVoucher = (id, status) => persist("vouchers", data.vouchers.map((v) => v.id === id ? { ...v, status, approvedAt: status === "Approved" ? new Date().toISOString() : v.approvedAt, rejectionReason: status === "Rejected" ? "Rejected during approval" : v.rejectionReason } : v));
  const decideAttendance = (id, approval) => persist("attendance", data.attendance.map((a) => a.id === id ? { ...a, approval } : a));

  const pendingVouchers = data.vouchers.filter((v) => v.status === "Pending");
  const pendingAttendance = data.attendance.filter((a) => a.approval === "Pending");
  const nameFor = (code) => data.employees.find((e) => e.code === code)?.name || code;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle icon={ClipboardList} right={
          pendingVouchers.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`pending_vouchers_${todayStr()}.csv`, [["Employee", "Type", "Amount", "Project", "Date", "Note"], ...pendingVouchers.map((v) => [v.code, v.type, v.amount, v.project || "", v.date, v.note || ""])])}><Download size={13} /> Export</Btn>
        }>Pending Vouchers ({pendingVouchers.length})</SectionTitle>
        {pendingVouchers.length === 0 ? <EmptyState text="Nothing waiting on approval." /> : (
          <div style={{ display: "grid", gap: 10 }}>
            {pendingVouchers.map((v) => (
              <div key={v.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontSize: 13 }}>
                  <div><span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{v.code}</span> · {v.type} voucher {v.amount ? `· ${money(v.amount)}` : ""} {v.project ? `· ${v.project}` : ""}</div>
                  {v.note && <div style={{ color: C.textDim, marginTop: 4 }}>{v.note}</div>}
                  <div style={{ color: C.textDim, marginTop: 4, fontSize: 11.5 }}>{v.date}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Btn onClick={() => decideVoucher(v.id, "Approved")}><Check size={13} /> Approve</Btn>
                  <Btn variant="danger" onClick={() => decideVoucher(v.id, "Rejected")}><X size={13} /> Reject</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={CalendarCheck} right={
          pendingAttendance.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`pending_attendance_${todayStr()}.csv`, [["Employee", "Name", "Date", "Status", "Project", "Role", "Start", "End"], ...pendingAttendance.map((a) => [a.code, nameFor(a.code), a.date, a.status, a.project || "", a.role || "", a.startTime || "", a.endTime || ""])])}><Download size={13} /> Export</Btn>
        }>Pending Attendance ({pendingAttendance.length})</SectionTitle>
        {pendingAttendance.length === 0 ? <EmptyState text="No attendance waiting on approval." /> : (
          <div style={{ display: "grid", gap: 10 }}>
            {pendingAttendance.map((a) => (
              <div key={a.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{a.code}</span> · {nameFor(a.code)} · {a.date} · <Pill tone={statusTone(a.status)}>{a.status}</Pill>
                  {(a.project || a.role || a.startTime || a.endTime) && (
                    <div style={{ color: C.textDim, marginTop: 3 }}>
                      {a.project} {a.role && `· ${a.role}`} {(a.startTime || a.endTime) && `· ${a.startTime || "?"}–${a.endTime || "?"}`}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => decideAttendance(a.id, "Approved")}><Check size={13} /> Approve</Btn>
                  <Btn variant="danger" onClick={() => decideAttendance(a.id, "Rejected")}><X size={13} /> Reject</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Shared: Expenses ----------
// ---------- Billing: Quotations & Invoices ----------
function nextDocNumber(list, prefix, field) {
  const nums = (list || []).map((x) => parseInt((x[field] || "").split("-")[1], 10)).filter((n) => !isNaN(n));
  return `${prefix}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
}

function BillingPanel({ data, persist, persistAppend, confirmDelete }) {
  const clientParties = (data.parties || []).filter((p) => p.type === "Client");

  const [qClient, setQClient] = useState("");
  const [qProject, setQProject] = useState("");
  const [qDescription, setQDescription] = useState("");
  const [qAmount, setQAmount] = useState("");
  const [qTax, setQTax] = useState("0");
  const [qValidUntil, setQValidUntil] = useState("");

  const addQuotation = () => {
    if (!qClient || !qAmount) return;
    const amount = parseFloat(qAmount);
    const tax = parseFloat(qTax) || 0;
    const total = amount * (1 + tax / 100);
    persistAppend("quotations", {
      id: uid("QUO"), quoteNumber: nextDocNumber(data.quotations, "QT", "quoteNumber"),
      client: qClient, project: qProject, description: qDescription.trim(),
      amount, tax, total, status: "Draft", validUntil: qValidUntil, date: todayStr(),
    });
    setQClient(""); setQDescription(""); setQAmount(""); setQTax("0"); setQValidUntil("");
  };
  const setQuoteStatus = (id, status) => persist("quotations", (data.quotations || []).map((q) => q.id === id ? { ...q, status } : q));
  const removeQuote = (id) => persist("quotations", (data.quotations || []).filter((q) => q.id !== id));

  const convertToInvoice = (q) => {
    persistAppend("invoices", {
      id: uid("INV"), invoiceNumber: nextDocNumber(data.invoices, "INV", "invoiceNumber"),
      client: q.client, project: q.project, quotationId: q.id,
      amount: q.amount, tax: q.tax, total: q.total, amountPaid: 0,
      dueDate: "", status: "Issued", date: todayStr(),
    });
  };

  const [iClient, setIClient] = useState("");
  const [iProject, setIProject] = useState("");
  const [iAmount, setIAmount] = useState("");
  const [iTax, setITax] = useState("0");
  const [iDueDate, setIDueDate] = useState("");
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [payAccount, setPayAccount] = useState(ACCOUNTS[0]);

  const addInvoice = () => {
    if (!iClient || !iAmount) return;
    const amount = parseFloat(iAmount);
    const tax = parseFloat(iTax) || 0;
    const total = amount * (1 + tax / 100);
    persistAppend("invoices", {
      id: uid("INV"), invoiceNumber: nextDocNumber(data.invoices, "INV", "invoiceNumber"),
      client: iClient, project: iProject, quotationId: null,
      amount, tax, total, amountPaid: 0, dueDate: iDueDate, status: "Issued", date: todayStr(),
    });
    setIClient(""); setIAmount(""); setITax("0"); setIDueDate("");
  };
  const removeInvoice = (id) => persist("invoices", (data.invoices || []).filter((i) => i.id !== id));

  const startPayInvoice = (inv) => { setPayingInvoiceId(inv.id); setPayAmount(String((inv.total - inv.amountPaid).toFixed(2))); setPayMode("Cash"); };
  const confirmPayInvoice = async (inv) => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { setPayingInvoiceId(null); return; }
    const newPaid = inv.amountPaid + amt;
    const status = newPaid >= inv.total ? "Paid" : "Partially Paid";
    // "invoices" and "ledger" share the "finance" bucket — sequenced, same reasoning as above.
    await persist("invoices", (data.invoices || []).map((i) => i.id === inv.id ? { ...i, amountPaid: newPaid, status } : i));
    await persistAppend("ledger", {
      id: uid("LED"), date: todayStr(), type: "Income", paymentMode: payMode, account: payMode === "Account" ? payAccount : null,
      category: "Client Payment", party: inv.client, project: inv.project || "", amount: amt,
      note: `Payment for ${inv.invoiceNumber}`, voided: false, createdAt: new Date().toISOString(),
    });
    setPayingInvoiceId(null);
  };

  const invoices = data.invoices || [];
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = totalInvoiced - totalCollected;
  const overdue = invoices.filter((i) => i.dueDate && i.dueDate < todayStr() && i.status !== "Paid" && i.status !== "Cancelled");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <Card><Wallet size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalInvoiced)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Invoiced</div></Card>
        <Card><Check size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalCollected)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Collected</div></Card>
        <Card><DollarSign size={16} color={C.amber} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: outstanding > 0 ? C.amber : C.text }}>{money(outstanding)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Outstanding</div></Card>
        <Card><AlertCircle size={16} color={C.rec} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: overdue.length ? C.rec : C.text }}>{overdue.length}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Overdue Invoices</div></Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>New Quotation</SectionTitle>
        {clientParties.length === 0 ? (
          <p style={{ color: C.textDim, fontSize: 12.5 }}>No client parties registered yet — register one on the Party tab (type "Client") first.</p>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end" }}>
          <div><Label>Client</Label>
            <SelectInput value={qClient} onChange={(e) => setQClient(e.target.value)}>
              <option value="">Select client</option>
              {clientParties.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </SelectInput>
          </div>
          <div><Label>Project</Label>
            <SelectInput value={qProject} onChange={(e) => setQProject(e.target.value)}>
              <option value="">Not project-specific</option>
              {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </SelectInput>
          </div>
          <div><Label>Amount (₹)</Label><TextInput type="number" value={qAmount} onChange={(e) => setQAmount(e.target.value)} /></div>
          <div><Label>Tax (%)</Label><TextInput type="number" value={qTax} onChange={(e) => setQTax(e.target.value)} /></div>
          <div><Label>Valid Until</Label><TextInput type="date" value={qValidUntil} onChange={(e) => setQValidUntil(e.target.value)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><Label>Description</Label><TextArea value={qDescription} onChange={(e) => setQDescription(e.target.value)} placeholder="What's being quoted" /></div>
          <Btn onClick={addQuotation}><Plus size={14} /> Create Quotation</Btn>
        </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={ListChecks} right={
          (data.quotations || []).length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`quotations_${todayStr()}.csv`, [["Quote #", "Client", "Project", "Amount", "Tax %", "Total", "Status", "Valid Until"], ...(data.quotations || []).map((q) => [q.quoteNumber, q.client, q.project || "", q.amount, q.tax, q.total, q.status, q.validUntil || ""])])}><Download size={13} /> Export Quotations</Btn>
        }>Quotations ({(data.quotations || []).length})</SectionTitle>
        {(data.quotations || []).length === 0 ? <EmptyState text="No quotations yet." /> : (
          <div>
            {(data.quotations || []).map((q) => (
              <div key={q.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <span><span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{q.quoteNumber}</span> · {q.client} {q.project && `· ${q.project}`} · {money(q.total)}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <SelectInput value={q.status} onChange={(e) => setQuoteStatus(q.id, e.target.value)} style={{ width: 120, padding: "4px 8px", fontSize: 12 }}>{QUOTE_STATUSES.map((s) => <option key={s}>{s}</option>)}</SelectInput>
                    {q.status === "Accepted" && <Btn variant="ghost" onClick={() => convertToInvoice(q)} style={{ padding: "5px 10px" }}>Convert to Invoice</Btn>}
                    <Btn variant="danger" onClick={() => confirmDelete(`Delete quotation ${q.quoteNumber}? This can't be undone.`, () => removeQuote(q.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                  </div>
                </div>
                {q.description && <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>{q.description} {q.validUntil && `· valid until ${q.validUntil}`}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>New Invoice</SectionTitle>
        {clientParties.length === 0 ? (
          <p style={{ color: C.textDim, fontSize: 12.5 }}>No client parties registered yet — register one on the Party tab (type "Client") first.</p>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end" }}>
          <div><Label>Client</Label>
            <SelectInput value={iClient} onChange={(e) => setIClient(e.target.value)}>
              <option value="">Select client</option>
              {clientParties.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </SelectInput>
          </div>
          <div><Label>Project</Label>
            <SelectInput value={iProject} onChange={(e) => setIProject(e.target.value)}>
              <option value="">Not project-specific</option>
              {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </SelectInput>
          </div>
          <div><Label>Amount (₹)</Label><TextInput type="number" value={iAmount} onChange={(e) => setIAmount(e.target.value)} /></div>
          <div><Label>Tax (%)</Label><TextInput type="number" value={iTax} onChange={(e) => setITax(e.target.value)} /></div>
          <div><Label>Due Date</Label><TextInput type="date" value={iDueDate} onChange={(e) => setIDueDate(e.target.value)} /></div>
          <Btn onClick={addInvoice}><Plus size={14} /> Create Invoice</Btn>
        </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={Receipt} right={invoices.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`invoices_${todayStr()}.csv`, [["Invoice #", "Client", "Project", "Total", "Paid", "Balance", "Status", "Due Date"], ...invoices.map((i) => [i.invoiceNumber, i.client, i.project || "", i.total, i.amountPaid, i.total - i.amountPaid, i.status, i.dueDate || ""])])}><Download size={13} /> Export Invoices</Btn>}>
          Invoices ({invoices.length})
        </SectionTitle>
        {invoices.length === 0 ? <EmptyState text="No invoices yet." /> : (
          <div>
            {invoices.map((inv) => {
              const balance = inv.total - inv.amountPaid;
              const isOverdue = inv.dueDate && inv.dueDate < todayStr() && balance > 0;
              return (
                <div key={inv.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span><span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{inv.invoiceNumber}</span> · {inv.client} {inv.project && `· ${inv.project}`} · {money(inv.total)} · Paid {money(inv.amountPaid)}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Pill tone={isOverdue ? "bad" : statusTone(inv.status)}>{isOverdue ? "Overdue" : inv.status}</Pill>
                      {balance > 0 && <Btn variant="ghost" onClick={() => startPayInvoice(inv)} style={{ padding: "5px 10px" }}>Record Payment</Btn>}
                      <Btn variant="danger" onClick={() => confirmDelete(`Delete invoice ${inv.invoiceNumber}? ${inv.amountPaid > 0 ? "It has payments recorded against it — those Ledger entries will stay but lose their link to this invoice." : "This can't be undone."}`, () => removeInvoice(inv.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                    </div>
                  </div>
                  {inv.dueDate && <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>Due {inv.dueDate} · Balance {money(balance)}</div>}
                  {payingInvoiceId === inv.id && (
                    <div style={{ marginTop: 8, padding: 10, background: C.surface2, borderRadius: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                      <div><Label>Amount (₹)</Label><TextInput type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={{ width: 120 }} /></div>
                      <div><Label>Payment Mode</Label><SelectInput value={payMode} onChange={(e) => setPayMode(e.target.value)} style={{ width: 130 }}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</SelectInput></div>
                      {payMode === "Account" && <div><Label>Account</Label><SelectInput value={payAccount} onChange={(e) => setPayAccount(e.target.value)} style={{ width: 130 }}>{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</SelectInput></div>}
                      <Btn onClick={() => confirmPayInvoice(inv)}><Check size={13} /> Confirm</Btn>
                      <Btn variant="ghost" onClick={() => setPayingInvoiceId(null)}>Cancel</Btn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function ExpensesPanel({ data, persist, persistAppend, confirmDelete }) {
  const [project, setProject] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("All");

  const addExpense = () => {
    if (!project || !amount) return;
    persistAppend("expenses", { id: uid("EXP"), project, category, vendor: vendor.trim(), amount: parseFloat(amount), date, note: note.trim() });
    setVendor(""); setAmount(""); setNote("");
  };
  const removeExpense = (id) => persist("expenses", data.expenses.filter((e) => e.id !== id));

  const filtered = filter === "All" ? data.expenses : data.expenses.filter((e) => e.project === filter);
  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  const filteredVouchers = (data.vouchers || []).filter((v) => v.kind === "voucher" && ["Approved", "Partially Paid", "Paid"].includes(v.status) && (filter === "All" ? !!v.project : v.project === filter));
  const voucherTotal = filteredVouchers.reduce((s, v) => s + (Number(v.amount) || 0), 0);
  const combinedTotal = total + voucherTotal;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Plus}>Log Expense</SectionTitle>
        {data.projects.length === 0 ? <EmptyState text="No projects exist yet — ask a manager to create one first." /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, alignItems: "end" }}>
            <div><Label>Project</Label>
              <SelectInput value={project} onChange={(e) => setProject(e.target.value)}>
                <option value="">Select project</option>
                {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </SelectInput>
            </div>
            <div><Label>Category</Label><SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</SelectInput></div>
            <div><Label>Vendor</Label><TextInput value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Optional" /></div>
            <div><Label>Amount (₹)</Label><TextInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
            <div><Label>Date</Label><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div style={{ gridColumn: "1 / -1" }}><Label>Note</Label><TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional details" /></div>
            <Btn onClick={addExpense}><Plus size={14} /> Add Expense</Btn>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={DollarSign} right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SelectInput value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 180 }}>
              <option value="All">All Projects</option>
              {data.projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </SelectInput>
            {(filtered.length > 0 || filteredVouchers.length > 0) && <Btn variant="ghost" onClick={() => downloadCSV(`project_expenses_${filter === "All" ? "all" : filter.replace(/\s+/g, "_")}_${todayStr()}.csv`, [
              ["PROJECT EXPENSES", filter],
              [],
              ["Date", "Project", "Category", "Vendor", "Amount", "Note"],
              ...filtered.map((e) => [e.date, e.project, e.category, e.vendor || "", e.amount, e.note || ""]),
              ["", "", "", "Total Logged Expenses", total, ""],
              [],
              ["EMPLOYEE VOUCHER EXPENSES"],
              ["Date", "Employee", "Project", "Type", "Amount", "Status"],
              ...filteredVouchers.map((v) => [v.date, v.code, v.project, v.type, v.amount, v.status]),
              ["", "", "", "", "Total Vouchers", voucherTotal],
              [],
              ["Combined Total", combinedTotal],
            ])}><Download size={13} /> Export</Btn>}
          </div>
        }>Logged Expenses — {money(total)}</SectionTitle>
        {filtered.length === 0 ? <EmptyState text="No expenses logged for this view." /> : (
          <div>
            {[...filtered].reverse().map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 10, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{e.project}</span> · {e.category} {e.vendor && `· ${e.vendor}`}
                  <div style={{ color: C.textDim, fontSize: 11.5 }}>{e.date} {e.note && `· ${e.note}`}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "IBM Plex Mono", color: C.amber }}>{money(e.amount)}</span>
                  <Btn variant="danger" onClick={() => confirmDelete(`Delete this ${e.category} expense of ${money(e.amount)} for "${e.project}"? This reduces that project's recorded spend immediately.`, () => removeExpense(e.id))} style={{ padding: "4px 7px" }}><Trash2 size={12} /></Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <SectionTitle icon={Receipt}>Employee Voucher Expenses — {money(voucherTotal)}</SectionTitle>
        <p style={{ color: C.textDim, fontSize: 11.5, marginTop: -6, marginBottom: 10 }}>Approved, partially paid, or paid employee vouchers tied to {filter === "All" ? "a project" : filter} — already counted in project spend and utilization.</p>
        {filteredVouchers.length === 0 ? <EmptyState text="No approved vouchers for this view." /> : (
          <div>
            {[...filteredVouchers].reverse().map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 10, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{v.project}</span> · {v.type} · <span style={{ fontFamily: "IBM Plex Mono", color: C.tally }}>{v.code}</span>
                  <div style={{ color: C.textDim, fontSize: 11.5 }}>{v.date} {v.note && `· ${v.note}`}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "IBM Plex Mono", color: C.amber }}>{money(v.amount)}</span>
                  <Pill tone={statusTone(v.status)}>{v.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTop: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}>
          <span>Combined Total (Logged Expenses + Vouchers)</span>
          <span style={{ fontFamily: "IBM Plex Mono" }}>{money(combinedTotal)}</span>
        </div>
      </Card>
    </div>
  );
}

// ---------- Shared: Approved Records (read-only, accountant/admin) ----------
function ApprovedRecordsPanel({ data }) {
  const approvedAttendance = data.attendance.filter((a) => a.approval === "Approved").sort((a, b) => b.date.localeCompare(a.date));
  const approvedVouchers = data.vouchers.filter((v) => v.status === "Approved").sort((a, b) => b.date.localeCompare(a.date));
  const nameFor = (code) => data.employees.find((e) => e.code === code)?.name || code;
  const totalApprovedVoucherAmt = approvedVouchers.reduce((s, v) => s + (v.amount || 0), 0);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle icon={CalendarCheck} right={
          approvedAttendance.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`approved_attendance_${todayStr()}.csv`, [["Date", "Employee", "Name", "Status", "Project", "Role"], ...approvedAttendance.map((a) => [a.date, a.code, nameFor(a.code), a.status, a.project || "", a.role || ""])])}><Download size={13} /> Export</Btn>
        }>Approved Attendance ({approvedAttendance.length})</SectionTitle>
        {approvedAttendance.length === 0 ? <EmptyState text="No approved attendance yet." /> : (
          <div>
            {approvedAttendance.slice(0, 40).map((a) => (
              <div key={a.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "IBM Plex Mono" }}>{a.date} · {a.code} · {nameFor(a.code)}</span>
                  <Pill tone={statusTone(a.status)}>{a.status}</Pill>
                </div>
                {(a.project || a.role) && <div style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>{a.project} {a.role && `· ${a.role}`} {(a.startTime || a.endTime) && `· ${a.startTime || "?"}–${a.endTime || "?"}`}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle icon={Receipt} right={
          approvedVouchers.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`approved_vouchers_${todayStr()}.csv`, [["Date", "Employee", "Type", "Project", "Amount", "Status"], ...approvedVouchers.map((v) => [v.date, v.code, v.type, v.project || "", v.amount, v.status])])}><Download size={13} /> Export</Btn>
        }>Approved Vouchers — {money(totalApprovedVoucherAmt)} total</SectionTitle>
        {approvedVouchers.length === 0 ? <EmptyState text="Nothing approved yet." /> : (
          <div>
            {approvedVouchers.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8, flexWrap: "wrap" }}>
                <span>{v.code} · {v.type} · {v.project} · {money(v.amount)} <span style={{ color: C.textDim }}>· {v.date}</span></span>
                <Pill tone={v.status === "Paid" ? "good" : "warn"}>{v.status}</Pill>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Admin ----------
function AdminView({ store, user }) {
  const { data, persist, persistAppend, resetAll, confirmDelete } = store;
  const [tab, setTab] = useState("Dashboard");

  const [name, setName] = useState("");
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [joiningDate, setJoiningDate] = useState(todayStr());
  const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
  const [eUsername, setEUsername] = useState("");
  const [ePassword, setEPassword] = useState("");
  const [empErr, setEmpErr] = useState("");

  const [sName, setSName] = useState("");
  const [sUsername, setSUsername] = useState("");
  const [sPassword, setSPassword] = useState("");
  const [sRole, setSRole] = useState("manager");
  const [staffErr, setStaffErr] = useState("");

  const [confirmReset, setConfirmReset] = useState(false);
  const importFileRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");
  const [importing, setImporting] = useState(false);

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const backupData = parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;
      let restoredCount = 0;
      for (const k of BACKUP_KEYS) {
        if (backupData[k] !== undefined) {
          await persist(k, backupData[k]);
          restoredCount++;
        }
      }
      setImportMsg(restoredCount > 0
        ? `Restored ${restoredCount} record set(s)${parsed.exportedAt ? ` from a backup made ${new Date(parsed.exportedAt).toLocaleString()}` : ""}.`
        : "That file didn't contain any recognizable backup data.");
    } catch {
      setImportMsg("Couldn't read that file — make sure it's a backup exported from this app.");
    }
    setImporting(false);
  };

  const [editingUserId, setEditingUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editErr, setEditErr] = useState("");

  const startEditUser = (u) => { setEditingUserId(u.id); setEditUsername(u.username); setEditPassword(""); setEditErr(""); };
  const cancelEditUser = () => { setEditingUserId(null); setEditUsername(""); setEditPassword(""); setEditErr(""); };
  const saveEditUser = () => {
    if (!editUsername.trim()) { setEditErr("Username can't be empty."); return; }
    const clash = data.users.some((x) => x.id !== editingUserId && x.username.toLowerCase() === editUsername.trim().toLowerCase());
    if (clash) { setEditErr("That username is already taken."); return; }
    if (editPassword && editPassword.length < 4) { setEditErr("New password must be 4+ characters."); return; }
    persist("users", data.users.map((x) => x.id === editingUserId ? { ...x, username: editUsername.trim(), password: editPassword ? editPassword : x.password } : x));
    cancelEditUser();
  };

  const usernameTaken = (uname) => data.users.some((u) => u.username.toLowerCase() === uname.trim().toLowerCase());

  const addEmployee = async () => {
    setEmpErr("");
    if (!name.trim() || !eUsername.trim() || ePassword.length < 4) { setEmpErr("Name, username, and a password (4+ chars) are required."); return; }
    if (usernameTaken(eUsername)) { setEmpErr("That username is already taken."); return; }
    const nums = data.employees.map((e) => parseInt(e.code.split("-")[1], 10)).filter((n) => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    const code = `EMP-${String(next).padStart(3, "0")}`;
    // Sequenced (not fired together): employees and users share the "hr" storage bucket now, so
    // writing both at once would race — each would read the bucket before the other's write
    // landed, and whichever finished last would silently erase the other's addition. Awaiting
    // each in turn guarantees the second write always sees the first one's result.
    await persistAppend("employees", {
      code, name: name.trim(), department: dept, status: "Active",
      designation: designation.trim(), phone: phone.trim(), email: email.trim(),
      joiningDate, employmentType,
    });
    await persistAppend("users", { id: uid("USR"), name: name.trim(), username: eUsername.trim(), password: ePassword, role: "employee", employeeCode: code });
    setName(""); setEUsername(""); setEPassword(""); setDesignation(""); setPhone(""); setEmail(""); setJoiningDate(todayStr());
  };

  const addStaff = () => {
    setStaffErr("");
    if (!sName.trim() || !sUsername.trim() || sPassword.length < 4) { setStaffErr("Name, username, and a password (4+ chars) are required."); return; }
    if (usernameTaken(sUsername)) { setStaffErr("That username is already taken."); return; }
    persistAppend("users", { id: uid("USR"), name: sName.trim(), username: sUsername.trim(), password: sPassword, role: sRole, employeeCode: null });
    setSName(""); setSUsername(""); setSPassword("");
  };

  const setEmployeeStatus = (code, status) => persist("employees", data.employees.map((e) => e.code === code ? { ...e, status } : e));
  const setEmployeeDepartment = (code, department) => persist("employees", data.employees.map((e) => e.code === code ? { ...e, department } : e));
  const historySet = useMemo(() => {
    const s = new Set();
    data.attendance.forEach((a) => s.add(a.code));
    (data.payroll || []).forEach((p) => s.add(p.employeeCode));
    data.vouchers.forEach((v) => s.add(v.code));
    return s;
  }, [data.attendance, data.payroll, data.vouchers]);
  const employeeHasHistory = (code) => historySet.has(code);
  const archiveEmployee = (code) => setEmployeeStatus(code, "Archived");
  const deleteEmployee = async (code) => {
    if (employeeHasHistory(code)) return; // safety net — UI already disables this, but never delete a record with history
    await persist("employees", data.employees.filter((e) => e.code !== code));
    await persist("users", data.users.filter((u) => u.employeeCode !== code));
  };
  const removeUser = (id) => persist("users", data.users.filter((u) => u.id !== id));
  const setUserRole = (id, role) => persist("users", data.users.map((u) => u.id === id ? { ...u, role } : u));

  const staffUsers = data.users.filter((u) => u.role !== "employee");

  return (
    <Shell roleLabel="Admin" user={user} onLogout={store.onLogout} onRefresh={store.refresh} refreshing={store.refreshing} data={data} tabs={["Dashboard", "Insights", "Employees", "Staff Accounts", "Projects", "Approvals", "Expenses", "Ledger", "Payroll", "Salary", "Voucher Payments", "Billing", "Equipment", "Vendor", "Party"]} active={tab} setActive={setTab}>
      {tab === "Dashboard" && <DashboardPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} variant="admin" />}
      {tab === "Insights" && <AIInsightsPanel data={data} />}

      {tab === "Employees" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle icon={UserPlus}>Add Employee (creates login too)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
              <div><Label>Full name</Label><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Cooper" /></div>
              <div><Label>Department</Label><SelectInput value={dept} onChange={(e) => setDept(e.target.value)}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</SelectInput></div>
              <div><Label>Designation</Label><TextInput value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Editor" /></div>
              <div><Label>Employment Type</Label><SelectInput value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>{EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}</SelectInput></div>
              <div><Label>Joining Date</Label><TextInput type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} /></div>
              <div><Label>Phone</Label><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" /></div>
              <div><Label>Email</Label><TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" /></div>
              <div><Label>Username</Label><TextInput value={eUsername} onChange={(e) => setEUsername(e.target.value)} placeholder="jane.cooper" /></div>
              <PasswordField label="Password" value={ePassword} onChange={(e) => setEPassword(e.target.value)} placeholder="Min 4 characters" />
              <Btn onClick={addEmployee}><Plus size={14} /> Add Employee</Btn>
            </div>
            {empErr && <div style={{ color: C.rec, fontSize: 12.5, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} />{empErr}</div>}
          </Card>
          <Card>
            <SectionTitle icon={Users} right={
              data.employees.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`employees_${todayStr()}.csv`, [
                ["Code", "Name", "Department", "Designation", "Employment Type", "Status", "Joining Date", "Phone", "Email", "Login Username"],
                ...data.employees.map((e) => [e.code, e.name, e.department, e.designation || "", e.employmentType || "", e.status, e.joiningDate || "", e.phone || "", e.email || "", (data.users.find((u) => u.employeeCode === e.code) || {}).username || ""]),
              ])}><Download size={13} /> Export Employees</Btn>
            }>All Employees ({data.employees.length})</SectionTitle>
            {data.employees.length === 0 ? <EmptyState text="No employees added yet." /> : (
              <div style={{ overflowX: "auto" }}>
                {data.employees.map((e) => {
                  const u = data.users.find((x) => x.employeeCode === e.code);
                  const editing = editingUserId === u?.id;
                  const hasHistory = employeeHasHistory(e.code);
                  return (
                    <div key={e.code} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, flexWrap: "wrap" }}>
                        <Avatar name={e.name} size={26} />
                        <span style={{ fontFamily: "IBM Plex Mono", color: C.tally, minWidth: 78 }}>{e.code}</span>
                        <span style={{ flex: 1, minWidth: 100 }}>{e.name}{e.designation && <span style={{ color: C.textDim }}> · {e.designation}</span>}</span>
                        <SelectInput value={e.department} onChange={(ev) => setEmployeeDepartment(e.code, ev.target.value)} style={{ width: 130, padding: "4px 8px", fontSize: 12 }}>
                          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </SelectInput>
                        <span style={{ color: C.textDim, fontFamily: "IBM Plex Mono", fontSize: 11.5 }}>{u ? `Login: ${u.username}` : "no login"}</span>
                        <SelectInput value={e.status} onChange={(ev) => setEmployeeStatus(e.code, ev.target.value)} style={{ width: 120, padding: "4px 8px", fontSize: 12 }}>
                          {EMPLOYEE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </SelectInput>
                        {u && <Btn variant="ghost" onClick={() => startEditUser(u)} style={{ padding: "5px 10px" }}><KeyRound size={12} /> Edit Login</Btn>}
                        {e.status !== "Archived" && <Btn variant="ghost" onClick={() => archiveEmployee(e.code)} style={{ padding: "5px 10px" }}>Archive</Btn>}
                        <Btn variant="danger" onClick={() => confirmDelete(`Permanently delete ${e.name} (${e.code})? This also removes their login. This employee has no attendance/payroll/voucher history, so this is safe — otherwise it would have been blocked.`, () => deleteEmployee(e.code))} disabled={hasHistory} title={hasHistory ? "Has attendance/payroll/voucher history — archive instead of deleting" : "Delete"} style={{ padding: "5px 8px", opacity: hasHistory ? 0.35 : 1, cursor: hasHistory ? "not-allowed" : "pointer" }}><Trash2 size={13} /></Btn>
                      </div>
                      {(e.phone || e.email || e.joiningDate) && (
                        <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 4, paddingLeft: 88 }}>
                          {e.employmentType && `${e.employmentType} · `}{e.joiningDate && `Joined ${e.joiningDate}`}{e.phone && ` · ${e.phone}`}{e.email && ` · ${e.email}`}
                        </div>
                      )}
                      {editing && (
                        <div style={{ marginTop: 10, padding: 12, background: C.surface2, borderRadius: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
                          <div><Label>Username</Label><TextInput value={editUsername} onChange={(ev) => setEditUsername(ev.target.value)} /></div>
                          <PasswordField label="New password (optional)" value={editPassword} onChange={(ev) => setEditPassword(ev.target.value)} placeholder="Leave blank to keep current" />
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn onClick={saveEditUser}><Check size={13} /> Save</Btn>
                            <Btn variant="ghost" onClick={cancelEditUser}>Cancel</Btn>
                          </div>
                          {editErr && <div style={{ color: C.rec, fontSize: 12, gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={13} />{editErr}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "Staff Accounts" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle icon={KeyRound}>Create Staff Account</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
              <div><Label>Full name</Label><TextInput value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Full name" /></div>
              <div><Label>Role</Label><SelectInput value={sRole} onChange={(e) => setSRole(e.target.value)}>{STAFF_ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}</SelectInput></div>
              <div><Label>Username</Label><TextInput value={sUsername} onChange={(e) => setSUsername(e.target.value)} /></div>
              <PasswordField label="Password" value={sPassword} onChange={(e) => setSPassword(e.target.value)} placeholder="Min 4 characters" />
              <Btn onClick={addStaff}><Plus size={14} /> Create Account</Btn>
            </div>
            {staffErr && <div style={{ color: C.rec, fontSize: 12.5, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} />{staffErr}</div>}
          </Card>
          <Card>
            <SectionTitle icon={ShieldCheck} right={
              staffUsers.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`staff_accounts_${todayStr()}.csv`, [["Name", "Username", "Role"], ...staffUsers.map((u) => [u.name, u.username, u.role])])}><Download size={13} /> Export Staff</Btn>
            }>Admins, Managers & Accountants ({staffUsers.length})</SectionTitle>
            {staffUsers.length === 0 ? <EmptyState text="No staff accounts yet besides yours." /> : (
              <div>
                {staffUsers.map((u) => {
                  const editing = editingUserId === u.id;
                  return (
                    <div key={u.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                        <Avatar name={u.name} size={26} />
                        <span style={{ flex: 1 }}>{u.name}</span>
                        <span style={{ color: C.textDim, fontFamily: "IBM Plex Mono", fontSize: 11.5 }}>Login: {u.username}</span>
                        {u.id === user.id ? (
                          <Pill tone="dim">{u.role} (you)</Pill>
                        ) : (
                          <SelectInput value={u.role} onChange={(ev) => setUserRole(u.id, ev.target.value)} style={{ width: 120, padding: "4px 8px", fontSize: 12 }}>
                            {STAFF_ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
                          </SelectInput>
                        )}
                        <Btn variant="ghost" onClick={() => startEditUser(u)} style={{ padding: "5px 10px" }}><KeyRound size={12} /> Edit Login</Btn>
                        {u.id !== user.id && <Btn variant="danger" onClick={() => confirmDelete(`Delete the staff account "${u.name}" (@${u.username}, ${u.role})? They'll lose access immediately and this can't be undone.`, () => removeUser(u.id))} style={{ padding: "5px 8px" }}><Trash2 size={13} /></Btn>}
                      </div>
                      {editing && (
                        <div style={{ marginTop: 10, padding: 12, background: C.surface2, borderRadius: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
                          <div><Label>Username</Label><TextInput value={editUsername} onChange={(ev) => setEditUsername(ev.target.value)} /></div>
                          <PasswordField label="New password (optional)" value={editPassword} onChange={(ev) => setEditPassword(ev.target.value)} placeholder="Leave blank to keep current" />
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn onClick={saveEditUser}><Check size={13} /> Save</Btn>
                            <Btn variant="ghost" onClick={cancelEditUser}>Cancel</Btn>
                          </div>
                          {editErr && <div style={{ color: C.rec, fontSize: 12, gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={13} />{editErr}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "Projects" && <ProjectsPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} mode="admin" />}
      {tab === "Approvals" && <ApprovalsPanel data={data} persist={persist} />}
      {tab === "Expenses" && <ExpensesPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Ledger" && <LedgerPanel data={data} persist={persist} persistAppend={persistAppend} />}
      {tab === "Payroll" && <PayrollPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Salary" && <SalaryPanel data={data} persist={persist} persistAppend={persistAppend} />}
      {tab === "Voucher Payments" && <VoucherPaymentsPanel data={data} persist={persist} persistAppend={persistAppend} />}
      {tab === "Billing" && <BillingPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Equipment" && <EquipmentPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Vendor" && <VendorPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Party" && <PartyPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}

      {tab === "Dashboard" && (
        <div style={{ marginTop: 20 }}>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle icon={Download}>Data Backup</SectionTitle>
            <p style={{ color: C.textDim, fontSize: 12.5, marginBottom: 12 }}>
              Download a complete backup of every record in the system — employees, projects, attendance, ledger, payroll, everything. Keep a recent copy somewhere safe. If data ever looks wrong or goes missing, restore from a backup file here rather than re-entering everything by hand.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Btn onClick={() => exportFullBackup(data)}><Download size={14} /> Download Full Backup</Btn>
              <Btn variant="ghost" onClick={() => importFileRef.current?.click()} disabled={importing}><Upload size={14} /> {importing ? "Restoring…" : "Restore from Backup"}</Btn>
              <input ref={importFileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleImportFile} />
            </div>
            <p style={{ color: C.textDim, fontSize: 11, marginTop: 8 }}>Restoring overwrites current data for any record type present in the backup file — it doesn't merge.</p>
            {importMsg && <div style={{ marginTop: 10, fontSize: 12.5, color: importMsg.startsWith("Couldn't") || importMsg.startsWith("That file") ? C.rec : C.tally }}>{importMsg}</div>}
          </Card>

          {!confirmReset ? (
            <Btn variant="danger" onClick={() => setConfirmReset(true)}><Trash2 size={13} /> Reset all demo data</Btn>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: C.textDim }}>This permanently clears everything, including all accounts. Sure?</span>
              <Btn variant="danger" onClick={() => { resetAll(); setConfirmReset(false); store.onLogout(); }}>Yes, wipe it</Btn>
              <Btn variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Btn>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

// ---------- Manager ----------
function ManagerDashboardPanel({ data: rawData }) {
  const [filter, setFilter] = useState({ mode: "overall", year: String(new Date().getFullYear()), month: todayStr().slice(0, 7), projectId: "", availableYears: getAvailableYears(rawData) });
  const data = applyDashboardFilter(rawData, filter);
  const today = todayStr();

  const activeProjects = data.projects.filter((p) => p.status === "Active").length;
  const pendingVouchers = data.vouchers.filter((v) => v.status === "Pending").length;
  const pendingAttendance = data.attendance.filter((a) => a.approval === "Pending").length;
  const projectHealth = data.projects.map((p) => ({ ...p, ...projectFinancials(p, data.expenses, data.vouchers) })).sort((a, b) => (b.utilization || 0) - (a.utilization || 0));

  return (
    <div>
      <DashboardFilterBar filter={filter} setFilter={setFilter} projects={rawData.projects} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <Card><Briefcase size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 22, marginTop: 8 }}>{activeProjects}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Active Projects</div></Card>
        <Card><Receipt size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 22, marginTop: 8 }}>{pendingVouchers}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Vouchers Awaiting You</div></Card>
        <Card><CalendarCheck size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 22, marginTop: 8 }}>{pendingAttendance}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Attendance Awaiting You</div></Card>
      </div>
      <Card>
        <SectionTitle icon={Briefcase}>Project Health</SectionTitle>
        {projectHealth.length === 0 ? <EmptyState text="No projects yet." /> : (
          <div style={{ display: "grid", gap: 9 }}>
            {projectHealth.map((p) => (
              <div key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span>{p.name}</span>
                  <span style={{ fontFamily: "IBM Plex Mono", color: p.utilization >= 85 ? C.rec : C.textDim }}>{p.quote ? `${p.utilization.toFixed(0)}%` : "No budget"}</span>
                </div>
                <ProgressBar pct={p.utilization} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ManagerView({ store, user }) {
  const { data, persist, persistAppend, confirmDelete } = store;
  const [tab, setTab] = useState("Dashboard");
  return (
    <Shell roleLabel="Manager" user={user} onLogout={store.onLogout} onRefresh={store.refresh} refreshing={store.refreshing} data={data} tabs={["Dashboard", "Projects", "Approvals", "Vendor", "Party"]} active={tab} setActive={setTab}>
      {tab === "Dashboard" && <ManagerDashboardPanel data={data} />}
      {tab === "Projects" && <ProjectsPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} mode="manager" />}
      {tab === "Approvals" && <ApprovalsPanel data={data} persist={persist} />}
      {tab === "Vendor" && <VendorPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Party" && <PartyPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
    </Shell>
  );
}

// ---------- Accountant ----------
function AccountantView({ store, user }) {
  const { data, persist, persistAppend, confirmDelete } = store;
  const [tab, setTab] = useState("Dashboard");
  return (
    <Shell roleLabel="Accountant" user={user} onLogout={store.onLogout} onRefresh={store.refresh} refreshing={store.refreshing} data={data} tabs={["Dashboard", "Insights", "Ledger", "Payroll", "Salary", "Voucher Payments", "Billing", "Projects", "Expenses", "Vendor", "Party", "Approved Records"]} active={tab} setActive={setTab}>
      {tab === "Dashboard" && <DashboardPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} variant="accountant" />}
      {tab === "Insights" && <AIInsightsPanel data={data} />}
      {tab === "Ledger" && <LedgerPanel data={data} persist={persist} persistAppend={persistAppend} />}
      {tab === "Payroll" && <PayrollPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Salary" && <SalaryPanel data={data} persist={persist} persistAppend={persistAppend} />}
      {tab === "Voucher Payments" && <VoucherPaymentsPanel data={data} persist={persist} persistAppend={persistAppend} />}
      {tab === "Billing" && <BillingPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Projects" && <ProjectsPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} mode="accountant" />}
      {tab === "Expenses" && <ExpensesPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Vendor" && <VendorPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Party" && <PartyPanel data={data} persist={persist} persistAppend={persistAppend} confirmDelete={confirmDelete} />}
      {tab === "Approved Records" && <ApprovedRecordsPanel data={data} />}
    </Shell>
  );
}

// ---------- Employee ----------
// ---------- Employee's personal income dashboard ----------
function EmployeeDashboard({ empCode, data: rawData }) {
  const [dimension, setDimension] = useState("month");
  const [filter, setFilter] = useState({ mode: "overall", year: String(new Date().getFullYear()), month: todayStr().slice(0, 7), projectId: "", availableYears: getAvailableYears(rawData) });
  const data = applyDashboardFilter(rawData, filter);
  const myProjects = rawData.projects.filter((p) => p.assigned.includes(empCode));
  const { totalEarned, totalPaid, balance } = employeeEarnings(empCode, data);
  const groups = employeeIncomeBreakdown(empCode, data, dimension);
  const chartData = groups.map((g) => ({ name: g.key, income: g.total }));

  return (
    <div>
      <DashboardFilterBar filter={filter} setFilter={setFilter} projects={myProjects} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Card><Wallet size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalEarned)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Income</div></Card>
        <Card><Check size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalPaid)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Paid</div></Card>
        <Card><DollarSign size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: balance > 0 ? C.amber : C.text }}>{money(balance)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Balance Due</div></Card>
      </div>

      {(() => {
        const vs = voucherSummaryForEmployee(empCode, data);
        const paidCount = vs.vouchers.filter((v) => v.status === "Paid").length;
        const dueVouchers = vs.vouchers.filter((v) => ["Approved", "Partially Paid"].includes(v.status) && Math.max(0, (Number(v.amount) || 0) - (Number(v.paidAmount) || 0)) > 0);
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 12 }}>
              <Card><Receipt size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(vs.submitted)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Voucher Submitted</div><div style={{ color: C.textDim, fontSize: 11, marginTop: 3 }}>{vs.vouchers.length} vouchers</div></Card>
              <Card><Check size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(vs.paid)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Voucher Paid</div><div style={{ color: C.textDim, fontSize: 11, marginTop: 3 }}>{paidCount} fully paid</div></Card>
              <Card><DollarSign size={16} color={C.amber} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: vs.due > 0 ? C.amber : C.tally }}>{money(vs.due)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Voucher Due</div><div style={{ color: C.textDim, fontSize: 11, marginTop: 3 }}>{dueVouchers.length} approved/part-paid</div></Card>
              <Card><ClipboardList size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(vs.pending)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Pending Approval</div></Card>
            </div>
            <Card>
              <SectionTitle icon={Receipt} right={
                vs.vouchers.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`my_vouchers_${todayStr()}.csv`, [["Date", "Type", "Project", "Amount", "Paid", "Due", "Status"], ...vs.vouchers.map((v) => { const paid = Number(v.paidAmount) || (v.status === "Paid" ? Number(v.amount) || 0 : 0); return [v.date, v.type, v.project || "", v.amount, paid, Math.max(0, (Number(v.amount) || 0) - paid), v.status]; })])}><Download size={13} /> Export</Btn>
              }>Voucher Payment Status</SectionTitle>
              {vs.vouchers.length === 0 ? <EmptyState text="No vouchers submitted yet." /> : (
                <div>
                  {vs.vouchers.slice(0, 8).map((v) => {
                    const paid = Number(v.paidAmount) || (v.status === "Paid" ? Number(v.amount) || 0 : 0);
                    const due = Math.max(0, (Number(v.amount) || 0) - paid);
                    return (
                      <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8, flexWrap: "wrap" }}>
                        <span>{v.type} · {v.project || "Company-wide"} · {money(v.amount)} <span style={{ color: C.textDim }}>· {v.date}</span></span>
                        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                          {due > 0 && v.status !== "Pending" && <span style={{ fontFamily: "IBM Plex Mono", color: C.amber }}>Due {money(due)}</span>}
                          <Pill tone={v.status === "Paid" ? "good" : v.status === "Rejected" ? "bad" : "warn"}>{v.status}</Pill>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      <Card>
        <SectionTitle icon={TrendingUp} right={
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Btn variant={dimension === "project" ? "primary" : "ghost"} onClick={() => setDimension("project")} style={{ padding: "6px 10px" }}>Project</Btn>
            <Btn variant={dimension === "month" ? "primary" : "ghost"} onClick={() => setDimension("month")} style={{ padding: "6px 10px" }}>Month</Btn>
            {groups.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`my_income_${dimension}_${todayStr()}.csv`, [[dimension === "project" ? "Project" : "Month", "Income"], ...groups.map((g) => [g.key, g.total])])}><Download size={13} /> Export</Btn>}
          </div>
        }>Income — {dimension === "project" ? "Project-wise" : "Month-wise"}</SectionTitle>

        {groups.length === 0 ? <EmptyState text="Your income breakdown appears here once attendance is approved and a day rate is set for your projects." /> : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <Tooltip formatter={(v) => money(v)} contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: "Inter", fontSize: 12 }} />
                <Bar dataKey="income" fill={BRAND.orange} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="income" stroke={C.rec} strokeWidth={2} dot={{ r: 3, fill: C.rec }} />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 14 }}>
              {groups.map((g) => (
                <div key={g.key} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span>{g.key}</span>
                  <span style={{ fontFamily: "IBM Plex Mono" }}>{money(g.total)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function EmployeeView({ store, user }) {
  const { data, persist, persistAppend } = store;
  const [tab, setTab] = useState("Dashboard");
  const empCode = user.employeeCode;
  const me = data.employees.find((e) => e.code === empCode);
  const activeProjects = data.projects.filter((p) => p.status === "Active" && p.assigned.includes(empCode));

  // attendance form
  const [aDate, setADate] = useState(todayStr());
  const [aStatus, setAStatus] = useState("Present");
  const [aProject, setAProject] = useState("");
  const [aRole, setARole] = useState(ROLE_OPTIONS[0]);
  const [aStart, setAStart] = useState("");
  const [aEnd, setAEnd] = useState("");

  // voucher form
  const [vType, setVType] = useState(VOUCHER_TYPES[0]);
  const [vProject, setVProject] = useState("");
  const [vDate, setVDate] = useState(todayStr());
  const [vAmount, setVAmount] = useState("");
  const [vNote, setVNote] = useState("");

  const myAttendance = data.attendance.filter((a) => a.code === empCode).sort((a, b) => b.date.localeCompare(a.date));
  const myProjects = data.projects.filter((p) => p.assigned.includes(empCode));
  const mySubmissions = data.vouchers.filter((v) => v.code === empCode).sort((a, b) => b.date.localeCompare(a.date));

  const submitAttendance = () => {
    persistAppend("attendance", {
      id: uid("ATT"), code: empCode, date: aDate, status: aStatus,
      project: aProject, role: aRole, startTime: aStart, endTime: aEnd,
      approval: "Pending", markedAt: new Date().toISOString(),
    });
    setAProject(""); setAStart(""); setAEnd("");
  };

  const submitVoucher = () => {
    if (!vProject || !Number.isFinite(parseFloat(vAmount)) || parseFloat(vAmount) <= 0) return;
    persistAppend("vouchers", {
      id: uid("SUB"), code: empCode, kind: "voucher", type: vType, project: vProject,
      amount: parseFloat(vAmount), note: vNote.trim(), date: vDate, status: "Pending",
    });
    setVAmount(""); setVNote(""); setVProject("");
  };

  return (
    <Shell roleLabel="Employee" user={user} onLogout={store.onLogout} onRefresh={store.refresh} refreshing={store.refreshing} data={data} tabs={["Dashboard", "Attendance", "Vouchers", "Earnings", "My Projects"]} active={tab} setActive={setTab}>
      <div style={{ marginBottom: 14, fontSize: 13, color: C.textDim }}>Welcome, <span style={{ color: C.text, fontWeight: 600 }}>{me?.name}</span> · {me?.department}</div>

      {tab === "Dashboard" && <EmployeeDashboard empCode={empCode} data={data} />}

      {tab === "Attendance" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle icon={CalendarCheck}>Log Attendance</SectionTitle>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Btn variant={aStatus === "Present" ? "primary" : "ghost"} onClick={() => setAStatus("Present")}><Check size={13} /> Present</Btn>
              <Btn variant={aStatus === "Leave" ? "amber" : "ghost"} onClick={() => setAStatus("Leave")}>Leave</Btn>
              <Btn variant={aStatus === "Absent" ? "danger" : "ghost"} onClick={() => setAStatus("Absent")}><X size={13} /> Absent</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
              <div><Label>Date</Label><TextInput type="date" value={aDate} onChange={(e) => setADate(e.target.value)} /></div>
              <div><Label>Project</Label>
                <SelectInput value={aProject} onChange={(e) => setAProject(e.target.value)}>
                  <option value="">Select project</option>
                  {activeProjects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </SelectInput>
                {activeProjects.length === 0 && <p style={{ color: C.amber, fontSize: 11, marginTop: 4 }}>No projects assigned to you yet — ask your manager to assign you to a project.</p>}
              </div>
              <div><Label>Role</Label><SelectInput value={aRole} onChange={(e) => setARole(e.target.value)}>{ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}</SelectInput></div>
              <div><Label>Start time</Label><TextInput type="time" value={aStart} onChange={(e) => setAStart(e.target.value)} /></div>
              <div><Label>End time</Label><TextInput type="time" value={aEnd} onChange={(e) => setAEnd(e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 12 }}><Btn onClick={submitAttendance}><Plus size={14} /> Submit for Approval</Btn></div>
          </Card>
          <Card>
            <SectionTitle icon={ClipboardList} right={
              myAttendance.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`my_attendance_${todayStr()}.csv`, [["Date", "Status", "Approval", "Project", "Role", "Start", "End"], ...myAttendance.map((a) => [a.date, a.status, a.approval, a.project || "", a.role || "", a.startTime || "", a.endTime || ""])])}><Download size={13} /> Export</Btn>
            }>History</SectionTitle>
            {myAttendance.length === 0 ? <EmptyState text="No attendance logged yet." /> : (
              <div>
                {myAttendance.slice(0, 30).map((a) => (
                  <div key={a.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontFamily: "IBM Plex Mono" }}>{a.date}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Pill tone={statusTone(a.status)}>{a.status}</Pill>
                        <Pill tone={statusTone(a.approval)}>{a.approval}</Pill>
                      </div>
                    </div>
                    {(a.project || a.role) && (
                      <div style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>
                        {a.project && a.project} {a.role && `· ${a.role}`} {(a.startTime || a.endTime) && `· ${a.startTime || "?"}–${a.endTime || "?"}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "Vouchers" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle icon={Receipt}>New Voucher</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
              <div><Label>Type</Label><SelectInput value={vType} onChange={(e) => setVType(e.target.value)}>{VOUCHER_TYPES.map((t) => <option key={t}>{t}</option>)}</SelectInput></div>
              <div><Label>Project</Label>
                <SelectInput value={vProject} onChange={(e) => setVProject(e.target.value)}>
                  <option value="">Select project</option>
                  {activeProjects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </SelectInput>
                {activeProjects.length === 0 && <p style={{ color: C.amber, fontSize: 11, marginTop: 4 }}>No projects assigned to you yet — ask your manager to assign you to a project.</p>}
              </div>
              <div><Label>Date</Label><TextInput type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} /></div>
              <div><Label>Amount (₹)</Label><TextInput type="number" value={vAmount} onChange={(e) => setVAmount(e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><Label>Note</Label><TextArea value={vNote} onChange={(e) => setVNote(e.target.value)} placeholder="What's this for?" /></div>
            </div>
            <div style={{ marginTop: 12 }}><Btn onClick={submitVoucher}><Plus size={14} /> Submit for Approval</Btn></div>
          </Card>
          <Card>
            <SectionTitle icon={ClipboardList} right={
              mySubmissions.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`my_vouchers_list_${todayStr()}.csv`, [["Date", "Type", "Project", "Amount", "Status"], ...mySubmissions.map((v) => [v.date, v.type, v.project, v.amount, v.status])])}><Download size={13} /> Export</Btn>
            }>My Vouchers</SectionTitle>
            {mySubmissions.length === 0 ? <EmptyState text="Nothing submitted yet." /> : (
              <div>
                {mySubmissions.map((v) => (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8, flexWrap: "wrap" }}>
                    <span>{v.type} · {v.project} · {money(v.amount)} <span style={{ color: C.textDim }}>· {v.date}</span></span>
                    <Pill tone={statusTone(v.status)}>{v.status}</Pill>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "Earnings" && (
        <div>
          {(() => {
            const { rows, totalEarned, totalPaid, balance } = employeeEarnings(empCode, data);
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
                  <Card><Wallet size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalEarned)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Earned</div></Card>
                  <Card><Check size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8 }}>{money(totalPaid)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Total Paid</div></Card>
                  <Card><DollarSign size={16} color={C.tally} /><div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, marginTop: 8, color: balance > 0 ? C.amber : C.text }}>{money(balance)}</div><div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Balance Due</div></Card>
                </div>
                <Card>
                  <SectionTitle icon={ClipboardList}>Earnings by Day</SectionTitle>
                  {rows.length === 0 ? <EmptyState text="Earnings appear here once your attendance is approved and a day rate is set for that project." /> : (
                    <div>
                      {rows.map((r) => (
                        <div key={r.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                            <span>{r.date} · {r.project} {r.role && `· ${r.role}`}</span>
                            {r.hasRate ? (
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontFamily: "IBM Plex Mono" }}>{money(r.total)}</span>
                                <Pill tone={r.paid ? "good" : "warn"}>{r.paid ? "Paid" : "Unpaid"}</Pill>
                              </div>
                            ) : <Pill tone="warn">No rate set</Pill>}
                          </div>
                          <div style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>
                            {r.hours > 0 ? `${r.hours.toFixed(1)}h worked` : "Hours not logged"} {r.otHours > 0 && `· ${r.otHours.toFixed(1)}h overtime`} {r.hasRate && `· Base ${money(r.base)}${r.overtime > 0 ? ` + OT ${money(r.overtime)}` : ""}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            );
          })()}
        </div>
      )}

      {tab === "My Projects" && (
        <Card>
          <SectionTitle icon={Briefcase} right={
            myProjects.length > 0 && <Btn variant="ghost" onClick={() => downloadCSV(`my_projects_${todayStr()}.csv`, [["Project", "Client", "Status", "Deadline"], ...myProjects.map((p) => [p.name, p.client || "", p.status, p.deadline || ""])])}><Download size={13} /> Export</Btn>
          }>Assigned Projects ({myProjects.length})</SectionTitle>
          {myProjects.length === 0 ? <EmptyState text="You haven't been assigned to any projects yet." /> : (
            <div style={{ display: "grid", gap: 10 }}>
              {myProjects.map((p) => (
                <div key={p.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "Oswald", textTransform: "uppercase", letterSpacing: "0.02em" }}>{p.name}</span>
                    <Pill tone={statusTone(p.status)}>{p.status}</Pill>
                  </div>
                  <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 4 }}>{p.client || "No client set"} {p.startDate && `· ${p.startDate}`}{p.endDate ? ` → ${p.endDate}` : (p.deadline && !p.startDate ? ` · due ${p.deadline}` : "")}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </Shell>
  );
}

// ---------- App ----------
export default function App() {
  const store = useStore();
  const [session, setSession] = useState(null);

  const onLogout = () => setSession(null);
  store.onLogout = onLogout;

  const createFirstAdmin = async ({ name, username, password, recoveryPhrase }) => {
    const u = { id: uid("USR"), name, username, password, role: "admin", employeeCode: null };
    await store.persist("users", [u]);
    await store.persist("security", { recoveryPhrase });
    setSession(u);
  };

  if (store.loading) {
    return (
      <div className="tm-grid-bg" style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontFamily: "Inter" }}>
        <style>{FONTS}</style>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Loader2 size={20} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />
        Loading Trai Media Ops...
      </div>
    );
  }

  const wrap = (node) => (
    <div className="tm-grid-bg" style={{ minHeight: "100vh", background: C.bg }}>
      <style>{FONTS}</style>
      {store.err && (
        <div style={{ background: `${C.rec}22`, color: C.rec, fontSize: 12.5, textAlign: "center", padding: "6px 10px", fontFamily: "Inter", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <span>{store.err}</span>
          {store.refresh && <button onClick={store.refresh} style={{ background: "transparent", border: `1px solid ${C.rec}66`, color: C.rec, borderRadius: 6, padding: "3px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "Inter" }}>Retry Now</button>}
        </div>
      )}
      {node}
      <ToastHost toast={store.toast} />
      <ConfirmDialog state={store.confirmState} onConfirm={store.runConfirm} onCancel={store.cancelConfirm} />
    </div>
  );

  if (!session) {
    if (store.data.users.length === 0) return wrap(<BootstrapAdmin onCreate={createFirstAdmin} />);
    return wrap(<LoginForm users={store.data.users} employees={store.data.employees} security={store.data.security} onSuccess={setSession} onResetAll={store.resetAll} />);
  }

  const liveUser = store.data.users.find((u) => u.id === session.id) || session;

  if (liveUser.role === "admin") return wrap(<AdminView store={store} user={liveUser} />);
  if (liveUser.role === "manager") return wrap(<ManagerView store={store} user={liveUser} />);
  if (liveUser.role === "accountant") return wrap(<AccountantView store={store} user={liveUser} />);
  if (liveUser.role === "employee") return wrap(<EmployeeView store={store} user={liveUser} />);
  return null;
}
