#!/usr/bin/env node
// Add-back schedule -> SDE and EBITDA under three evidence cases. Plain Node, no dependencies, no network.
//
// Usage:
//   node addbacks.mjs schedule.csv --replacement-cost 95000 [--capex 30000] [--json]
//
// schedule.csv columns (header required, any order): year,item,category,amount,status,evidence
//   year      fiscal year or period label (2024, 2025, TTM-2026-09); kept in order of first appearance
//   category  net_income (the starting profit for that year, exactly one row per year) | owner_comp |
//             interest | depreciation | amortization | income_tax | discretionary | one_time | other
//   amount    signed effect on earnings: add-backs positive, normalizations that lower earnings negative
//             (e.g. -18000 to bring related-party rent up to market). $ , and (1,234) accepted.
//   status    supported | assumed | unsupported   (ignored for net_income)
//   evidence  what backs it: document, page, line. A "supported" row with no evidence is counted as assumed.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const CATEGORIES = ['net_income', 'owner_comp', 'interest', 'depreciation', 'amortization', 'income_tax', 'discretionary', 'one_time', 'other'];
export const STATUSES = ['supported', 'assumed', 'unsupported'];

/** Minimal RFC 4180 CSV parser: quoted fields, escaped quotes, CRLF. Returns array of objects keyed by header. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const s = text.replace(/^﻿/, '');
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
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r, n) => Object.fromEntries(header.map((h, k) => [h, (r[k] ?? '').trim()]).concat([['_line', n + 2]])));
}

/** Parse "$1,234", "(1,234)", "-1234.5" into a number. */
export function money(v) {
  const t = String(v ?? '').trim();
  if (t === '') return NaN;
  const neg = /^\(.*\)$/.test(t) || t.startsWith('-');
  const n = Number(t.replace(/[()$,\s-]/g, ''));
  return neg ? -n : n;
}

export function analyze(rows, { replacementCost, capex = 0 } = {}) {
  if (replacementCost === undefined || !Number.isFinite(Number(replacementCost))) throw new Error('need --replacement-cost: the market cost (salary, payroll taxes, benefits) to replace the owner\'s work');
  const rc = Number(replacementCost);
  const errors = [], warnings = [];
  const years = [];
  const by = new Map();
  for (const r of rows) {
    const year = r.year;
    const cat = (r.category ?? '').toLowerCase();
    const amt = money(r.amount);
    let status = (r.status ?? '').toLowerCase();
    if (!year) { errors.push(`line ${r._line}: missing year`); continue; }
    if (!CATEGORIES.includes(cat)) { errors.push(`line ${r._line}: unknown category "${r.category}"`); continue; }
    if (!Number.isFinite(amt)) { errors.push(`line ${r._line}: amount "${r.amount}" is not a number`); continue; }
    if (!by.has(year)) { by.set(year, { year, base: null, baseEvidence: '', items: [] }); years.push(year); }
    const y = by.get(year);
    if (cat === 'net_income') {
      if (y.base !== null) errors.push(`line ${r._line}: second net_income row for ${year}`);
      y.base = amt; y.baseEvidence = r.evidence ?? '';
      if (!r.evidence) warnings.push(`${year}: the starting profit has no source document noted`);
      continue;
    }
    if (!STATUSES.includes(status)) { errors.push(`line ${r._line}: status must be supported, assumed or unsupported (got "${r.status}")`); continue; }
    let downgraded = false;
    if (status === 'supported' && !r.evidence) { status = 'assumed'; downgraded = true; warnings.push(`${year} "${r.item}": marked supported with no evidence; counted as assumed`); }
    y.items.push({ item: r.item, category: cat, amount: amt, status, evidence: r.evidence ?? '', downgraded });
  }
  for (const y of by.values()) if (y.base === null) errors.push(`${y.year}: no net_income row (the starting profit)`);
  if (errors.length) { const e = new Error(errors.join('\n')); e.details = errors; throw e; }

  const results = years.map((label) => {
    const y = by.get(label);
    const sum = (f) => y.items.filter(f).reduce((a, i) => a + i.amount, 0);
    const supported = sum((i) => i.status === 'supported');
    const assumed = sum((i) => i.status === 'assumed');
    const unsupported = sum((i) => i.status === 'unsupported');
    const ownerRows = y.items.filter((i) => i.category === 'owner_comp');
    if (ownerRows.length === 0) warnings.push(`${label}: no owner_comp row. SDE adds back one owner's total pay; check whether the owner was paid through payroll, distributions or not at all`);
    if (ownerRows.length > 1 && new Set(ownerRows.map((i) => i.item.toLowerCase())).size > 1) warnings.push(`${label}: owner pay added back for more than one person. SDE normally adds back one owner; a second working owner's pay is a real cost unless the role goes away`);
    const discretionary = sum((i) => i.category === 'discretionary' || i.category === 'one_time' || i.category === 'other');
    const sde = { supported: y.base + supported, withAssumed: y.base + supported + assumed, asClaimed: y.base + supported + assumed + unsupported };
    const ebitda = Object.fromEntries(Object.entries(sde).map(([k, v]) => [k, v - rc]));
    const afterCapex = Object.fromEntries(Object.entries(ebitda).map(([k, v]) => [k, v - capex]));
    const discShare = sde.asClaimed !== 0 ? discretionary / sde.asClaimed : NaN;
    return { year: label, base: y.base, baseEvidence: y.baseEvidence, supported, assumed, unsupported, discretionary, discShare, sde, ebitda, afterCapex, items: y.items };
  });
  if (results.length >= 2) {
    const a = results[results.length - 1].sde.supported, b = results[results.length - 2].sde.supported;
    if (b !== 0 && (a - b) / Math.abs(b) < -0.1) warnings.push(`Supported SDE fell ${(((b - a) / Math.abs(b)) * 100).toFixed(1)}% from ${results[results.length - 2].year} to ${results[results.length - 1].year}; price on the trend, not the best year`);
  }
  return { replacementCost: rc, capex, results, warnings };
}

const $ = (x) => (Number.isFinite(x) ? (x < 0 ? '-$' : '$') + Math.abs(Math.round(x)).toLocaleString('en-US') : 'n/a');

export function toMarkdown(out) {
  const L = ['## Earnings (SDE and EBITDA)', ''];
  L.push(`Owner replacement cost used: ${$(out.replacementCost)} a year. Maintenance capital spending used: ${$(out.capex)} a year.`, '');
  const ys = out.results;
  L.push(`| | ${ys.map((y) => y.year).join(' | ')} |`, `|---|${ys.map(() => '---').join('|')}|`);
  const row = (label, f) => L.push(`| ${label} | ${ys.map((y) => f(y)).join(' | ')} |`);
  row('Starting profit', (y) => $(y.base));
  row('+ Supported add-backs', (y) => $(y.supported));
  row('**SDE, supported only**', (y) => `**${$(y.sde.supported)}**`);
  row('+ Assumed add-backs', (y) => $(y.assumed));
  row('SDE, supported + assumed', (y) => $(y.sde.withAssumed));
  row('+ Unsupported add-backs', (y) => $(y.unsupported));
  row('SDE as claimed', (y) => $(y.sde.asClaimed));
  row('**EBITDA, supported only** (SDE − replacement cost)', (y) => `**${$(y.ebitda.supported)}**`);
  row('EBITDA, supported + assumed', (y) => $(y.ebitda.withAssumed));
  row('EBITDA as claimed', (y) => $(y.ebitda.asClaimed));
  if (out.capex) row('EBITDA − maintenance capex, supported only', (y) => $(y.afterCapex.supported));
  row('Discretionary + one-time + other as % of claimed SDE', (y) => (Number.isFinite(y.discShare) ? (y.discShare * 100).toFixed(1) + '%' : 'n/a'));
  L.push('', '### Add-back schedule', '', '| Year | Item | Category | Amount | Status | Evidence |', '|---|---|---|---|---|---|');
  for (const y of ys) {
    L.push(`| ${y.year} | Starting profit | net_income | ${$(y.base)} | source | ${y.baseEvidence || 'none noted'} |`);
    for (const i of y.items) L.push(`| ${y.year} | ${i.item} | ${i.category} | ${$(i.amount)} | ${i.status}${i.downgraded ? ' (no evidence)' : ''} | ${i.evidence || 'none'} |`);
  }
  if (out.warnings.length) { L.push('', 'Flags:'); for (const w of out.warnings) L.push(`- ${w}`); }
  return L.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const opt = { json: false };
  let file;
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === '--replacement-cost') opt.replacementCost = money(argv[++k]);
    else if (argv[k] === '--capex') opt.capex = money(argv[++k]);
    else if (argv[k] === '--json') opt.json = true;
    else if (!file && !argv[k].startsWith('--')) file = argv[k];
    else { console.error(`error: unknown argument ${argv[k]}`); process.exit(1); }
  }
  try {
    if (!file) throw new Error('usage: node addbacks.mjs schedule.csv --replacement-cost <amount> [--capex <amount>] [--json]');
    const out = analyze(parseCsv(readFileSync(file, 'utf8')), opt);
    console.log(opt.json ? JSON.stringify(out, null, 2) : toMarkdown(out));
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(1);
  }
}
