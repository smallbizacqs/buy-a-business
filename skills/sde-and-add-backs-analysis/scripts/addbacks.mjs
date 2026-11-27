#!/usr/bin/env node
// Add-back schedule -> SDE and EBITDA under three evidence cases. Plain Node, no dependencies, no network.
//
// Usage:
//   node addbacks.mjs schedule.csv --replacement-cost 95000 [--capex 30000]
//     [--claimed-sde 412000 | --claimed-sde 2024=380000,2025=412000] [--claimed-source "listing p.2"]
//     [--pre-document] [--json]
//
// schedule.csv columns (header required, any order): year,item,category,amount,status,evidence[,by]
//   year      fiscal year or period label (2024, 2025, TTM-2026-09); kept in order of first appearance
//   category  net_income (the starting profit for that year, exactly one row per year) | owner_comp |
//             interest | depreciation | amortization | income_tax | discretionary | one_time | other
//   amount    signed effect on earnings: add-backs positive, normalizations that lower earnings negative
//             (e.g. -18000 to bring related-party rent up to market). $ , and (1,234) accepted.
//   status    supported | assumed | unsupported   (ignored for net_income)
//   evidence  what backs it: document, page, line. A "supported" row with no evidence is counted as assumed.
//   by        who put the row on the schedule: seller (the seller's or broker's own add-back) | buyer (your
//             normalization, e.g. rent brought up to market, a hire for a job you won't do). Optional; when
//             blank, a positive row counts as the seller's and a negative row as the buyer's.
//
// Cases:
//   as claimed          starting profit + every seller row, whatever its status. It should reproduce the
//                       seller's or broker's own SDE (pass it with --claimed-sde to check). Buyer rows never
//                       enter it.
//   buyer adjustments   a separate step: buyer rows marked supported or assumed (unsupported ones are ignored).
//   supported only      starting profit + supported seller rows + buyer adjustments that lower earnings
//                       (supported or assumed) + supported buyer rows that raise them.
//   supported + assumed starting profit + supported and assumed seller rows + buyer adjustments.
// --pre-document: no tax return is on file yet. Every "supported" row is counted as assumed, the supported
//   case is reported as not meaningful, and the title says "seller's claims, pre-document".

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const CATEGORIES = ['net_income', 'owner_comp', 'interest', 'depreciation', 'amortization', 'income_tax', 'discretionary', 'one_time', 'other'];
export const STATUSES = ['supported', 'assumed', 'unsupported'];
export const BY = ['seller', 'buyer'];

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


const RETURN_RE = /\b(tax return|return|1120|1120-?s|1065|1040|schedule c|4562)\b/i;

/** Parse --claimed-sde: "412000" (applies to the last year) or "2024=380000,2025=412000". */
export function parseClaimed(v) {
  if (v === undefined || v === null || String(v).trim() === '') return undefined;
  if (typeof v === 'number') return { _last: v };
  const out = {};
  for (const part of String(v).split(/,(?=[^,=]+=)/)) {
    const k = part.indexOf('=');
    const [key, amt] = k >= 0 ? [part.slice(0, k).trim(), part.slice(k + 1)] : ['_last', part];
    const n = money(amt);
    if (!Number.isFinite(n)) throw new Error(`--claimed-sde: "${part}" is not a number`);
    out[key] = n;
  }
  return out;
}

export function analyze(rows, { replacementCost, capex = 0, claimedSde, claimedSource = '', preDocument = false } = {}) {
  if (replacementCost === undefined || !Number.isFinite(Number(replacementCost))) throw new Error('need --replacement-cost: the market cost (salary, payroll taxes, benefits) to replace the owner\'s work');
  const rc = Number(replacementCost);
  const errors = [], warnings = [];
  const years = [];
  const by = new Map();
  let defaultedBuyer = 0;
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
    let who = (r.by ?? '').toLowerCase();
    if (who && !BY.includes(who)) { errors.push(`line ${r._line}: by must be seller or buyer (got "${r.by}")`); continue; }
    if (!who) { who = amt < 0 ? 'buyer' : 'seller'; if (amt < 0) defaultedBuyer++; }
    let downgraded = false;
    if (status === 'supported' && !r.evidence) { status = 'assumed'; downgraded = true; warnings.push(`${year} "${r.item}": marked supported with no evidence; counted as assumed`); }
    if (status === 'supported' && preDocument) { status = 'assumed'; downgraded = true; warnings.push(`${year} "${r.item}": marked supported, but this is a pre-document run; counted as assumed`); }
    y.items.push({ item: r.item, category: cat, amount: amt, status, evidence: r.evidence ?? '', by: who, downgraded });
  }
  for (const y of by.values()) if (y.base === null) errors.push(`${y.year}: no net_income row (the starting profit)`);
  if (errors.length) { const e = new Error(errors.join('\n')); e.details = errors; throw e; }
  if (defaultedBuyer) warnings.push(`${defaultedBuyer} negative row(s) had no "by" value and were treated as your (buyer) adjustments, outside "as claimed". If the seller listed one of them, mark it by=seller`);

  const claimed = parseClaimed(claimedSde) ?? {};
  for (const k of Object.keys(claimed)) if (k !== '_last' && !by.has(k)) throw new Error(`--claimed-sde: no year "${k}" in the schedule`);

  const results = years.map((label, idx) => {
    const y = by.get(label);
    const sum = (f) => y.items.filter(f).reduce((a, i) => a + i.amount, 0);
    const seller = (i) => i.by === 'seller', buyer = (i) => i.by === 'buyer';
    const supported = sum((i) => seller(i) && i.status === 'supported');
    const assumed = sum((i) => seller(i) && i.status === 'assumed');
    const unsupported = sum((i) => seller(i) && i.status === 'unsupported');
    const buyerAll = sum((i) => buyer(i) && i.status !== 'unsupported');
    const buyerSupportedCase = sum((i) => buyer(i) && (i.status === 'supported' || (i.status === 'assumed' && i.amount < 0)));
    for (const i of y.items) if (buyer(i) && i.status === 'unsupported') warnings.push(`${label} "${i.item}": your own adjustment is marked unsupported, so it is left out of every case`);
    const ownerRows = y.items.filter((i) => i.category === 'owner_comp' && seller(i));
    if (ownerRows.length === 0) warnings.push(`${label}: no owner_comp row. SDE adds back one owner's total pay; check whether the owner was paid through payroll, distributions or not at all`);
    if (ownerRows.length > 1 && new Set(ownerRows.map((i) => i.item.toLowerCase())).size > 1) warnings.push(`${label}: owner pay added back for more than one person. SDE normally adds back one owner; a second working owner's pay is a real cost unless the role goes away`);
    if (!preDocument && RETURN_RE.test(y.baseEvidence)) for (const i of y.items) {
      if (['depreciation', 'amortization', 'interest'].includes(i.category) && i.status === 'assumed' && !i.downgraded) warnings.push(`${label} "${i.item}": the starting profit comes from a tax return. If that return is in financials/ and shows this amount, mark it supported and cite the line (interest only if the seller's debt is paid off at closing)`);
    }
    // Discretionary share: the seller's own discretionary, one-time and other add-backs over the seller's SDE. Buyer rows stay out.
    const discretionary = sum((i) => seller(i) && (i.category === 'discretionary' || i.category === 'one_time' || i.category === 'other'));
    const sde = {
      supported: y.base + supported + buyerSupportedCase,
      withAssumed: y.base + supported + assumed + buyerAll,
      asClaimed: y.base + supported + assumed + unsupported,
    };
    sde.asClaimedAfterBuyer = sde.asClaimed + buyerAll;
    const ebitda = Object.fromEntries(Object.entries(sde).map(([k, v]) => [k, v - rc]));
    const afterCapex = Object.fromEntries(Object.entries(ebitda).map(([k, v]) => [k, v - capex]));
    const discShare = sde.asClaimed !== 0 ? discretionary / sde.asClaimed : NaN;
    const supportedMeaningful = !preDocument && y.items.some((i) => seller(i) && i.status === 'supported');
    if (!preDocument && !supportedMeaningful) warnings.push(`${label}: no seller add-back is documented yet, so "supported only" is little more than the starting profit. It is not meaningful yet and is not a pricing basis; get the tax return and payroll records first`);
    const stated = claimed[label] ?? (idx === years.length - 1 ? claimed._last : undefined);
    let claimedDiff;
    if (stated !== undefined) {
      claimedDiff = sde.asClaimed - stated;
      if (Math.abs(claimedDiff) >= 1) warnings.push(`${label}: the schedule's "as claimed" SDE (${$(sde.asClaimed)}) does not reproduce the stated SDE (${$(stated)}${claimedSource ? ', ' + claimedSource : ''}); difference ${$(claimedDiff)}. Find the missing or extra seller add-back, or the different starting profit, before comparing cases`);
    }
    return { year: label, base: y.base, baseEvidence: y.baseEvidence, supported, assumed, unsupported, buyerAdjustments: buyerAll, buyerAdjustmentsSupportedCase: buyerSupportedCase, discretionary, discShare, sde, ebitda, afterCapex, stated, claimedDiff, supportedMeaningful, items: y.items };
  });
  if (results.length >= 2 && !preDocument) {
    const a = results[results.length - 1].sde.supported, b = results[results.length - 2].sde.supported;
    if (b !== 0 && (a - b) / Math.abs(b) < -0.1) warnings.push(`Supported SDE fell ${(((b - a) / Math.abs(b)) * 100).toFixed(1)}% from ${results[results.length - 2].year} to ${results[results.length - 1].year}; price on the trend, not the best year`);
  }
  return { replacementCost: rc, capex, preDocument, claimedSource, results, warnings };
}

function $(x) { return Number.isFinite(x) ? (x < 0 ? '-$' : '$') + Math.abs(Math.round(x)).toLocaleString('en-US') : 'n/a'; }

export function toMarkdown(out) {
  const L = [out.preDocument ? "## Earnings (SDE and EBITDA): seller's claims, pre-document" : '## Earnings (SDE and EBITDA)', ''];
  if (out.preDocument) L.push('No tax return is in financials/ yet. Every row is the seller\'s claim or your assumption; nothing here is a basis for pricing or lending.', '');
  L.push(`Owner replacement cost used: ${$(out.replacementCost)} a year. Maintenance capital spending used: ${$(out.capex)} a year.`, '');
  const ys = out.results;
  const nm = (y, v) => (y.supportedMeaningful ? v : `${v} (not meaningful yet)`);
  L.push(`| | ${ys.map((y) => y.year).join(' | ')} |`, `|---|${ys.map(() => '---').join('|')}|`);
  const row = (label, f) => L.push(`| ${label} | ${ys.map((y) => f(y)).join(' | ')} |`);
  row('Starting profit', (y) => $(y.base));
  row('+ Seller add-backs, supported', (y) => $(y.supported));
  row('+ Seller add-backs, assumed', (y) => $(y.assumed));
  row('+ Seller add-backs, unsupported', (y) => $(y.unsupported));
  row('**SDE as claimed** (the seller\'s own schedule)', (y) => `**${$(y.sde.asClaimed)}**`);
  if (ys.some((y) => y.stated !== undefined)) {
    row(`Seller's or broker's stated SDE${out.claimedSource ? ` (${out.claimedSource})` : ''}`, (y) => (y.stated !== undefined ? $(y.stated) : '–'));
    row('Difference (as claimed − stated)', (y) => (y.stated !== undefined ? $(y.claimedDiff) : '–'));
  }
  row('Buyer adjustments (your normalizations, a separate step)', (y) => $(y.buyerAdjustments));
  row('SDE as claimed, after buyer adjustments', (y) => $(y.sde.asClaimedAfterBuyer));
  row('**SDE, supported only** (supported seller add-backs + buyer adjustments that lower earnings)', (y) => `**${nm(y, $(y.sde.supported))}**`);
  row('SDE, supported + assumed (+ buyer adjustments)', (y) => $(y.sde.withAssumed));
  row('**EBITDA, supported only** (SDE − replacement cost)', (y) => `**${nm(y, $(y.ebitda.supported))}**`);
  row('EBITDA, supported + assumed', (y) => $(y.ebitda.withAssumed));
  row('EBITDA as claimed', (y) => $(y.ebitda.asClaimed));
  if (out.capex) row('EBITDA − maintenance capex, supported only', (y) => nm(y, $(y.afterCapex.supported)));
  row('Seller\'s discretionary + one-time + other add-backs as % of SDE as claimed', (y) => (Number.isFinite(y.discShare) ? (y.discShare * 100).toFixed(1) + '%' : 'n/a'));
  L.push('', '### Add-back schedule', '', '| Year | Item | Category | Amount | Status | By | Evidence |', '|---|---|---|---|---|---|---|');
  for (const y of ys) {
    L.push(`| ${y.year} | Starting profit | net_income | ${$(y.base)} | source | – | ${y.baseEvidence || 'none noted'} |`);
    for (const i of y.items) L.push(`| ${y.year} | ${i.item} | ${i.category} | ${$(i.amount)} | ${i.status}${i.downgraded ? ' (downgraded)' : ''} | ${i.by} | ${i.evidence || 'none'} |`);
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
    else if (argv[k] === '--claimed-sde') opt.claimedSde = argv[++k];
    else if (argv[k] === '--claimed-source') opt.claimedSource = argv[++k];
    else if (argv[k] === '--pre-document') opt.preDocument = true;
    else if (argv[k] === '--json') opt.json = true;
    else if (!file && !argv[k].startsWith('--')) file = argv[k];
    else { console.error(`error: unknown argument ${argv[k]}`); process.exit(1); }
  }
  try {
    if (!file) throw new Error('usage: node addbacks.mjs schedule.csv --replacement-cost <amount> [--capex <amount>] [--claimed-sde <amount>|<year>=<amount>,...] [--claimed-source <where>] [--pre-document] [--json]');
    const out = analyze(parseCsv(readFileSync(file, 'utf8')), opt);
    console.log(opt.json ? JSON.stringify(out, null, 2) : toMarkdown(out));
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(1);
  }
}
