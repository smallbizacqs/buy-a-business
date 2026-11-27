#!/usr/bin/env node
// Builds a diligence calendar counted back from the exclusivity end date, and turns a request list
// into rows for deals/<slug>/diligence-tracker.csv (columns from workspace/SPEC.md).
// Plain Node, no dependencies, no network. Dates are YYYY-MM-DD, computed in UTC.
//
// Usage:
//   node diligence-calendar.mjs --start 2026-12-01 --exclusivity-end 2027-01-29 [--closing 2027-02-12]
//       prints the calendar as JSON
//   node diligence-calendar.mjs --start ... --exclusivity-end ... --requests request-list.json \
//       --tracker acquisition/deals/<slug>/diligence-tracker.csv [--exclude inventory,real-estate] [--write]
//       prints the merged tracker CSV; with --write, writes it to --tracker (created with a header if missing)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const COLUMNS = ['id', 'area', 'request', 'why', 'owner', 'requested_on', 'due', 'status', 'received_on', 'file', 'finding', 'follow_up'];
export const AREAS = ['financial', 'legal', 'operational', 'lender', 'insurance', 'other'];
export const STATUSES = ['open', 'requested', 'received', 'reviewed', 'issue', 'closed'];
// Id prefixes from workspace/SPEC.md (P pre-offer rows belong to screen-business-cim), then a two-digit number: F07.
export const PREFIX = { financial: 'F', legal: 'L', operational: 'O', lender: 'B', insurance: 'I', other: 'X' };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(s) {
  if (!DATE.test(String(s))) throw new Error(`bad date "${s}" (want YYYY-MM-DD)`);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) throw new Error(`bad date "${s}"`);
  return d;
}

export function addDays(s, n) {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / 86400000);
}

// A due date on a Saturday or Sunday moves back to the Friday before it.
export function previousBusinessDay(s) {
  const dow = parseDate(s).getUTCDay();
  return dow === 6 ? addDays(s, -1) : dow === 0 ? addDays(s, -2) : s;
}

// Counts back from the exclusivity end:
//   decision  = exclusivity end - decisionBufferDays (time to raise a reprice or ask for an extension)
//   findings  = decision - findingsBufferDays (all paid work reported; phase 2 ends)
//   phase 1   = start + phase1Share of the working days (cheap checks done; decide whether to spend on phase 2)
// Due dates that land on a weekend move to the previous business day (never to or before the start).
export function buildCalendar({ start, exclusivityEnd, closingTarget = null, decisionBufferDays = 7, findingsBufferDays = 3, phase1Share = 0.35 }) {
  const windowDays = daysBetween(start, exclusivityEnd);
  if (windowDays <= 0) throw new Error('exclusivity end must be after the start date');
  const decision = addDays(exclusivityEnd, -decisionBufferDays);
  const findings = addDays(decision, -findingsBufferDays);
  const workDays = daysBetween(start, findings);
  if (workDays < 2) throw new Error(`the window is too short: findings would be due ${findings}, at or before the start ${start}`);
  const raw = { phase1: addDays(start, Math.min(workDays - 1, Math.max(1, Math.round(workDays * phase1Share)))), findings, decision };
  const due = {};
  const movedForWeekend = [];
  for (const [k, d] of Object.entries(raw)) {
    const b = previousBusinessDay(d);
    due[k] = b > start ? b : d;
    if (due[k] !== d) movedForWeekend.push({ key: k, from: d, to: due[k] });
  }
  const warnings = [];
  if (windowDays < 30) warnings.push(`Only ${windowDays} days of exclusivity. Ask for an extension now, in writing, rather than at the end.`);
  if (workDays < 14) warnings.push(`Only ${workDays} days between the start and findings due (${findings}). Paid work (QoE, legal review) may not fit.`);
  if (closingTarget) {
    parseDate(closingTarget);
    if (closingTarget > exclusivityEnd) warnings.push(`Target closing ${closingTarget} is after exclusivity ends ${exclusivityEnd}. Plan to ask for an extension before ${due.decision}.`);
    else if (closingTarget >= addDays(exclusivityEnd, -7)) warnings.push(`Target closing ${closingTarget} is within 7 days of exclusivity ending ${exclusivityEnd}: any slip in the loan or the documents runs past exclusivity. Consider asking for an extension before ${due.decision}.`);
  }
  const milestones = [
    { key: 'start', date: start, label: 'Diligence starts' },
    { key: 'phase1', date: due.phase1, label: 'Phase 1 done: request lists out, core documents in, low-cost checks done. Decide whether to spend on phase 2.' },
    { key: 'phase2', date: due.findings, label: 'Phase 2 done: paid work (QoE, legal review, customer calls) reported. Findings due.' },
    { key: 'decision', date: due.decision, label: 'Go / reprice / walk decision. Raise any reprice with the seller now.' },
    { key: 'exclusivity', date: exclusivityEnd, label: 'Exclusivity ends' },
  ];
  if (closingTarget) milestones.push({ key: 'closing', date: closingTarget, label: 'Target closing' });
  milestones.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { start, exclusivityEnd, closingTarget, windowDays, due: { phase1: due.phase1, phase2: due.findings, findings: due.findings, decision: due.decision }, movedForWeekend, milestones, warnings };
}

// ---- CSV
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const s = String(text).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

export function readTracker(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const header = rows[0];
  const missing = COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) throw new Error(`tracker is missing columns: ${missing.join(', ')}`);
  return rows.slice(1).map((r) => Object.fromEntries(COLUMNS.map((c) => [c, r[header.indexOf(c)] ?? ''])));
}

const cell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function toCsv(rows) {
  return [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(','))].join('\n') + '\n';
}

// ---- request list -> tracker rows
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

export function selectRequests(list, { exclude = [] } = {}) {
  const items = Array.isArray(list) ? list : list.requests ?? [];
  const area = Array.isArray(list) ? undefined : list.area;
  return items
    .map((r) => ({ ...r, area: r.area ?? area }))
    .filter((r) => !(r.when ?? []).some((t) => exclude.includes(t)));
}

export function trackerRows(requests, calendar, { existing = [] } = {}) {
  const seen = new Set(existing.map((r) => `${r.area}|${norm(r.request)}`));
  const next = {};
  for (const r of existing) {
    const m = String(r.id).match(/^([A-Z])(\d+)$/);
    if (m) next[m[1]] = Math.max(next[m[1]] ?? 0, Number(m[2]));
  }
  const added = [];
  for (const r of requests) {
    if (!AREAS.includes(r.area)) throw new Error(`request "${r.request}" has area "${r.area}"; use one of ${AREAS.join(', ')}`);
    const key = `${r.area}|${norm(r.request)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const p = PREFIX[r.area];
    next[p] = (next[p] ?? 0) + 1;
    const due = r.due ?? calendar.due[r.phase ?? 'phase1'];
    if (!due) throw new Error(`request "${r.request}" has unknown phase "${r.phase}"`);
    added.push({
      id: `${p}${String(next[p]).padStart(2, '0')}`, area: r.area, request: r.request, why: r.why ?? '', owner: r.owner ?? 'seller',
      requested_on: '', due, status: 'open', received_on: '', file: '', finding: '', follow_up: '',
    });
  }
  return { rows: [...existing, ...added], added };
}

// ---- CLI
function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) o[k] = true; else o[k] = argv[++i];
  }
  return o;
}

export function main(argv) {
  const o = args(argv);
  if (!o.start || !o['exclusivity-end']) throw new Error('need --start YYYY-MM-DD and --exclusivity-end YYYY-MM-DD');
  const cal = buildCalendar({ start: o.start, exclusivityEnd: o['exclusivity-end'], closingTarget: o.closing ?? null });
  if (!o.requests) return JSON.stringify(cal, null, 2) + '\n';
  const list = JSON.parse(readFileSync(o.requests, 'utf8'));
  const exclude = typeof o.exclude === 'string' ? o.exclude.split(',').map((s) => s.trim()) : [];
  const existing = o.tracker && existsSync(o.tracker) ? readTracker(readFileSync(o.tracker, 'utf8')) : [];
  const { rows, added } = trackerRows(selectRequests(list, { exclude }), cal, { existing });
  const csv = toCsv(rows);
  if (o.write) {
    if (!o.tracker) throw new Error('--write needs --tracker <path>');
    writeFileSync(o.tracker, csv);
    return `wrote ${o.tracker}: ${added.length} new row(s), ${rows.length} total\n${cal.warnings.map((w) => `WARNING ${w}`).join('\n')}\n`;
  }
  return csv;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { process.stdout.write(main(process.argv.slice(2))); }
  catch (e) { console.error(e.message); process.exit(1); }
}
