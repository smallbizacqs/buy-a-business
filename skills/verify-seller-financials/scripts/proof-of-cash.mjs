#!/usr/bin/env node
// Proof of cash: monthly bank deposits vs booked revenue vs tax-return gross receipts, with a gap list.
// Plain Node, no dependencies, no network. It compares numbers the user typed or exported; it cannot tell
// whether a bank statement, ledger or return is genuine. It is not a quality of earnings (QoE) report.
//
// Usage:
//   node proof-of-cash.mjs --bank bank.csv --books books.csv [--tax tax.csv]
//     [--threshold 5] [--annual-threshold 2] [--fy-end-month 12] [--json]
//
// bank.csv, either format (header required):
//   summary:      month,account,total_deposits[,transfers_in][,loan_proceeds][,owner_contributions][,refunds][,other_nonrevenue]
//   transactions: date,account,amount,category[,description]
//                 category: revenue | transfer | loan | owner | refund | other_nonrevenue | unknown
//                 (negative amounts are withdrawals and are ignored; blank category = unknown)
// books.csv:      month,revenue[,sales_tax_collected][,ar_change][,processor_fees]
//                 ar_change = increase in receivables that month; processor_fees = card fees netted out before deposit
// tax.csv:        year,gross_receipts[,source]                      (year = the fiscal year the return covers)
// month is YYYY-MM; date is YYYY-MM-DD.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const NONREV_COLUMNS = ['transfers_in', 'loan_proceeds', 'owner_contributions', 'refunds', 'other_nonrevenue'];
export const TXN_CATEGORIES = ['revenue', 'transfer', 'loan', 'owner', 'refund', 'other_nonrevenue', 'unknown'];

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
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row);
  if (!rows.length) return { header: [], rows: [] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return { header, rows: rows.slice(1).map((r, n) => Object.fromEntries(header.map((h, k) => [h, (r[k] ?? '').trim()]).concat([['_line', n + 2]]))) };
}

export function money(v) {
  const t = String(v ?? '').trim();
  if (t === '') return 0;
  const neg = /^\(.*\)$/.test(t) || t.startsWith('-');
  const n = Number(t.replace(/[()$,\s-]/g, ''));
  if (!Number.isFinite(n)) throw new Error(`"${v}" is not a number`);
  return neg ? -n : n;
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY = /^(\d{4}-(0[1-9]|1[0-2]))-\d{2}$/;

function monthRange(a, b) {
  const out = [];
  let [y, m] = a.split('-').map(Number);
  const [yb, mb] = b.split('-').map(Number);
  while (y < yb || (y === yb && m <= mb)) { out.push(`${y}-${String(m).padStart(2, '0')}`); m++; if (m > 12) { m = 1; y++; } }
  return out;
}

export function fiscalYear(month, fyEndMonth = 12) {
  const [y, m] = month.split('-').map(Number);
  return m > fyEndMonth ? y + 1 : y;
}

/** Bank CSV -> Map(month -> {total, nonrev, unknown, accounts:Set}) and the set of months each account appears. */
export function readBank(text) {
  const { header, rows } = parseCsv(text);
  const errors = [];
  const months = new Map();
  const accountMonths = new Map();
  const isTxn = header.includes('date') && header.includes('amount');
  const isSummary = header.includes('month') && header.includes('total_deposits');
  if (!isTxn && !isSummary) throw new Error('bank CSV needs either month,account,total_deposits,... or date,account,amount,category columns');
  const nonrevCols = NONREV_COLUMNS.filter((c) => header.includes(c));
  const get = (m) => { if (!months.has(m)) months.set(m, { total: 0, nonrev: 0, unknown: 0, byCat: {} }); return months.get(m); };
  for (const r of rows) {
    try {
      const account = r.account || 'unnamed';
      let m;
      if (isTxn) {
        const d = r.date.match(DAY);
        if (!d) throw new Error(`date "${r.date}" must be YYYY-MM-DD`);
        m = d[1];
        const amt = money(r.amount);
        if (amt <= 0) continue;
        const cat = (r.category || 'unknown').toLowerCase();
        if (!TXN_CATEGORIES.includes(cat)) throw new Error(`category "${r.category}" must be one of ${TXN_CATEGORIES.join(', ')}`);
        const b = get(m);
        b.total += amt;
        if (cat === 'unknown') b.unknown += amt;
        else if (cat !== 'revenue') b.nonrev += amt;
        b.byCat[cat] = (b.byCat[cat] ?? 0) + amt;
      } else {
        if (!MONTH.test(r.month)) throw new Error(`month "${r.month}" must be YYYY-MM`);
        m = r.month;
        const b = get(m);
        b.total += money(r.total_deposits);
        for (const c of nonrevCols) { const v = money(r[c]); b.nonrev += v; b.byCat[c] = (b.byCat[c] ?? 0) + v; }
      }
      if (!accountMonths.has(account)) accountMonths.set(account, new Set());
      accountMonths.get(account).add(m);
    } catch (e) { errors.push(`bank line ${r._line}: ${e.message}`); }
  }
  return { months, accountMonths, format: isTxn ? 'transactions' : 'summary', nonrevCols, errors };
}

export function readBooks(text) {
  const { header, rows } = parseCsv(text);
  if (!header.includes('month') || !header.includes('revenue')) throw new Error('books CSV needs month,revenue columns');
  const errors = [];
  const months = new Map();
  for (const r of rows) {
    try {
      if (!MONTH.test(r.month)) throw new Error(`month "${r.month}" must be YYYY-MM`);
      if (months.has(r.month)) throw new Error(`month ${r.month} appears twice`);
      const revenue = money(r.revenue), salesTax = money(r.sales_tax_collected), arChange = money(r.ar_change), fees = money(r.processor_fees);
      months.set(r.month, { revenue, salesTax, arChange, fees, expected: revenue + salesTax - arChange - fees });
    } catch (e) { errors.push(`books line ${r._line}: ${e.message}`); }
  }
  return { months, hasSalesTax: header.includes('sales_tax_collected'), hasAr: header.includes('ar_change'), errors };
}

export function readTax(text) {
  const { header, rows } = parseCsv(text);
  if (!header.includes('year') || !header.includes('gross_receipts')) throw new Error('tax CSV needs year,gross_receipts columns');
  const errors = [];
  const years = new Map();
  for (const r of rows) {
    try {
      if (!/^\d{4}$/.test(r.year)) throw new Error(`year "${r.year}" must be YYYY`);
      years.set(Number(r.year), { grossReceipts: money(r.gross_receipts), source: r.source ?? '' });
    } catch (e) { errors.push(`tax line ${r._line}: ${e.message}`); }
  }
  return { years, errors };
}

export function proofOfCash({ bank, books, tax }, { threshold = 5, annualThreshold = 2, fyEndMonth = 12 } = {}) {
  const errors = [...bank.errors, ...books.errors, ...(tax?.errors ?? [])];
  if (errors.length) { const e = new Error(errors.join('\n')); e.details = errors; throw e; }
  if (!(fyEndMonth >= 1 && fyEndMonth <= 12)) throw new Error('fy-end-month must be 1-12');
  const gaps = [];
  const all = [...new Set([...bank.months.keys(), ...books.months.keys()])].sort();
  if (!all.length) throw new Error('no months found in the bank or books files');
  const span = monthRange(all[0], all[all.length - 1]);

  const monthly = span.map((m) => {
    const b = bank.months.get(m), k = books.months.get(m);
    const row = { month: m, deposits: b?.total ?? null, nonrev: b?.nonrev ?? null, unknown: b?.unknown ?? 0, revenueDeposits: b ? b.total - b.nonrev : null, booked: k?.revenue ?? null, expected: k?.expected ?? null };
    if (!b && !k) gaps.push({ kind: 'missing-both', month: m, text: `${m}: no bank data and no books` });
    else if (!b) gaps.push({ kind: 'missing-bank', month: m, text: `${m}: books show revenue but no bank deposits were provided` });
    else if (!k) gaps.push({ kind: 'missing-books', month: m, text: `${m}: bank deposits but no booked revenue for the month` });
    if (b && k) {
      row.diff = row.revenueDeposits - row.expected;
      row.pct = row.expected !== 0 ? row.diff / row.expected : (row.diff === 0 ? 0 : Infinity);
      row.flag = Math.abs(row.pct) * 100 > threshold;
      if (row.flag) gaps.push({ kind: row.diff > 0 ? 'deposits-over' : 'deposits-under', month: m, amount: row.diff,
        text: `${m}: revenue deposits ${row.diff > 0 ? 'exceed' : 'fall short of'} expected receipts by ${fmt$(Math.abs(row.diff))} (${(row.pct * 100).toFixed(1)}%)${row.diff > 0 ? '; look for unclassified transfers, loans, owner money or unbooked sales' : '; look for a missing account, cash not deposited, or revenue booked that was never collected'}` });
    }
    if (row.unknown > 0) gaps.push({ kind: 'unknown-deposits', month: m, amount: row.unknown, text: `${m}: ${fmt$(row.unknown)} of deposits not yet classified (counted as revenue until explained)` });
    return row;
  });

  for (const [acct, set] of bank.accountMonths) {
    const ms = [...set].sort();
    const missing = monthRange(ms[0], ms[ms.length - 1]).filter((m) => !set.has(m));
    if (missing.length) gaps.push({ kind: 'statement-gap', account: acct, text: `Account "${acct}": no statement for ${missing.join(', ')} inside the period it covers` });
    const firstAll = span[0], lastAll = span[span.length - 1];
    if (ms[0] > firstAll || ms[ms.length - 1] < lastAll) gaps.push({ kind: 'account-coverage', account: acct, text: `Account "${acct}" covers ${ms[0]} to ${ms[ms.length - 1]}, not the whole period ${firstAll} to ${lastAll}; ask whether it opened or closed, or statements are missing` });
  }
  if (bank.format === 'summary' && bank.nonrevCols.length === 0) gaps.push({ kind: 'no-nonrev', text: 'No non-revenue deposits identified (transfers, loans, owner money, refunds). Total deposits overstate revenue receipts unless every deposit is a sale.' });
  if (!books.hasSalesTax) gaps.push({ kind: 'no-sales-tax', text: 'Books file has no sales_tax_collected column. If the business collects sales tax, deposits will run above revenue by roughly that amount.' });

  const fy = new Map();
  for (const r of monthly) {
    const y = fiscalYear(r.month, fyEndMonth);
    if (!fy.has(y)) fy.set(y, { year: y, bankMonths: 0, bookMonths: 0, revenueDeposits: 0, booked: 0, expected: 0 });
    const a = fy.get(y);
    if (r.revenueDeposits !== null) { a.bankMonths++; a.revenueDeposits += r.revenueDeposits; }
    if (r.booked !== null) { a.bookMonths++; a.booked += r.booked; a.expected += r.expected; }
  }
  const annual = [...fy.values()].sort((a, b) => a.year - b.year).map((a) => {
    const t = tax?.years.get(a.year);
    const out = { ...a, complete: a.bankMonths === 12 && a.bookMonths === 12, taxReceipts: t ? t.grossReceipts : null, taxSource: t?.source ?? '' };
    if (t) {
      out.booksVsTax = a.booked - t.grossReceipts;
      out.depositsVsTax = a.revenueDeposits - t.grossReceipts;
      if (!out.complete) gaps.push({ kind: 'partial-year', year: a.year, text: `FY${a.year}: only ${a.bankMonths} months of bank data and ${a.bookMonths} of books; annual comparison to the return is partial` });
      else {
        if (t.grossReceipts !== 0 && Math.abs(out.booksVsTax / t.grossReceipts) * 100 > annualThreshold) gaps.push({ kind: 'books-vs-tax', year: a.year, amount: out.booksVsTax, text: `FY${a.year}: booked revenue differs from return gross receipts by ${fmt$(out.booksVsTax)} (${((out.booksVsTax / t.grossReceipts) * 100).toFixed(1)}%)` });
        if (t.grossReceipts !== 0 && Math.abs(out.depositsVsTax / t.grossReceipts) * 100 > annualThreshold) gaps.push({ kind: 'deposits-vs-tax', year: a.year, amount: out.depositsVsTax, text: `FY${a.year}: revenue deposits differ from return gross receipts by ${fmt$(out.depositsVsTax)} (${((out.depositsVsTax / t.grossReceipts) * 100).toFixed(1)}%)` });
      }
    } else if (tax && out.complete) gaps.push({ kind: 'missing-return', year: a.year, text: `FY${a.year}: a full year of data but no tax return gross receipts entered` });
    return out;
  });
  return { settings: { threshold, annualThreshold, fyEndMonth, bankFormat: bank.format }, monthly, annual, gaps };
}

function fmt$(x) { return Number.isFinite(x) ? (x < 0 ? '-$' : '$') + Math.abs(Math.round(x)).toLocaleString('en-US') : 'n/a'; }
const cell = (x) => (x === null || x === undefined ? '—' : fmt$(x));

export function toMarkdown(out) {
  const s = out.settings;
  const L = ['## Proof of cash (bank deposits vs books vs tax returns)', ''];
  L.push(`Not a quality of earnings report. Compares the figures entered; does not authenticate any statement. Review triggers chosen by the user: ${s.threshold}% a month, ${s.annualThreshold}% a year. Fiscal year ends in month ${s.fyEndMonth}. Bank file format: ${s.bankFormat}.`, '');
  L.push('### By month', '', '| Month | Total deposits | Non-revenue | Revenue deposits | Booked revenue | Expected receipts | Difference | % | Flag |', '|---|---|---|---|---|---|---|---|---|');
  for (const r of out.monthly) L.push(`| ${r.month} | ${cell(r.deposits)} | ${cell(r.nonrev)} | ${cell(r.revenueDeposits)} | ${cell(r.booked)} | ${cell(r.expected)} | ${r.diff === undefined ? '—' : fmt$(r.diff)} | ${r.pct === undefined ? '—' : Number.isFinite(r.pct) ? (r.pct * 100).toFixed(1) + '%' : 'n/a'} | ${r.flag ? 'CHECK' : ''} |`);
  L.push('', '### By fiscal year', '', '| FY | Months (bank/books) | Revenue deposits | Booked revenue | Return gross receipts | Books − return | Deposits − return |', '|---|---|---|---|---|---|---|');
  for (const a of out.annual) L.push(`| ${a.year} | ${a.bankMonths}/${a.bookMonths}${a.complete ? '' : ' (partial)'} | ${fmt$(a.revenueDeposits)} | ${fmt$(a.booked)} | ${cell(a.taxReceipts)} | ${a.booksVsTax === undefined ? '—' : fmt$(a.booksVsTax)} | ${a.depositsVsTax === undefined ? '—' : fmt$(a.depositsVsTax)} |`);
  L.push('', '### Gaps to explain', '');
  if (!out.gaps.length) L.push('None above the review triggers. That is not proof the figures are genuine.');
  out.gaps.forEach((g, i) => L.push(`${i + 1}. ${g.text}`));
  return L.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const o = {};
  for (let k = 0; k < argv.length; k++) {
    const a = argv[k];
    if (a === '--json') o.json = true;
    else if (['--bank', '--books', '--tax', '--threshold', '--annual-threshold', '--fy-end-month'].includes(a) && argv[k + 1] !== undefined) o[a.slice(2)] = argv[++k];
    else { console.error(`error: unknown or incomplete argument ${a}`); process.exit(1); }
  }
  try {
    if (!o.bank || !o.books) throw new Error('need --bank <file> and --books <file> (and optionally --tax <file>)');
    const out = proofOfCash({
      bank: readBank(readFileSync(o.bank, 'utf8')),
      books: readBooks(readFileSync(o.books, 'utf8')),
      tax: o.tax ? readTax(readFileSync(o.tax, 'utf8')) : undefined,
    }, { threshold: Number(o.threshold ?? 5), annualThreshold: Number(o['annual-threshold'] ?? 2), fyEndMonth: Number(o['fy-end-month'] ?? 12) });
    console.log(o.json ? JSON.stringify(out, null, 2) : toMarkdown(out));
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(1);
  }
}
