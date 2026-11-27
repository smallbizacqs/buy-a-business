#!/usr/bin/env node
// Computes net working capital (NWC) from monthly balance-sheet balances and proposes a peg
// (the working-capital target in the LOI and purchase agreement), plus a closing true-up.
// Plain Node, no dependencies, no network. Arithmetic only: the buyer, the seller and their
// accountants and lawyers decide the definition, the method and the final number.
//
// Input CSV: one row per month-end, a `month` column (YYYY-MM) and one column per balance-sheet line,
// liabilities entered as positive numbers. Column names are classified by DEFAULT_CLASS; any other
// column must be classified with --classify name=asset|liability|exclude|debt-like.
//
// Usage:
//   node nwc-peg.mjs balances.csv [--trailing 12] [--method average|median]
//       [--classify col=asset,col2=exclude] [--debt-like customer_deposits,deferred_revenue]
//       [--closing 123456 --collar 10000 --collar-type deductible|tipping]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Typical treatment in a cash-free, debt-free deal. Every line is a negotiating point; override as agreed.
export const DEFAULT_CLASS = {
  // current operating assets
  accounts_receivable: 'asset', unbilled_receivables: 'asset', inventory: 'asset', prepaid_expenses: 'asset',
  other_current_assets: 'asset', costs_in_excess_of_billings: 'asset', retainage_receivable: 'asset',
  // current operating liabilities
  accounts_payable: 'liability', accrued_expenses: 'liability', accrued_payroll: 'liability', accrued_pto: 'liability',
  sales_tax_payable: 'liability', deferred_revenue: 'liability', customer_deposits: 'liability',
  billings_in_excess_of_costs: 'liability', gift_cards: 'liability', retainage_payable: 'liability',
  // left out of NWC: the seller keeps cash and pays off debt and owner items at closing
  cash: 'exclude', line_of_credit: 'exclude', current_portion_long_term_debt: 'exclude', notes_payable: 'exclude',
  credit_cards: 'exclude', shareholder_loans: 'exclude', due_from_owner: 'exclude', due_to_owner: 'exclude',
  income_taxes_payable: 'exclude',
};
const KINDS = ['asset', 'liability', 'exclude', 'debt-like'];
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseCsv(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) throw new Error('need a header row and at least one month');
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_'));
  if (header[0] !== 'month') throw new Error('first column must be "month" (YYYY-MM)');
  return lines.slice(1).map((line, i) => {
    const cells = line.split(',').map((c) => c.trim());
    const items = {};
    header.slice(1).forEach((h, j) => {
      const raw = (cells[j + 1] ?? '').replace(/[$\s]/g, '');
      const v = raw === '' ? 0 : Number(raw.replace(/^\((.*)\)$/, '-$1'));
      if (!Number.isFinite(v)) throw new Error(`row ${i + 2}, column ${h}: "${cells[j + 1]}" is not a number`);
      items[h] = v;
    });
    return { month: cells[0], items };
  });
}

export function classify(name, overrides = {}, debtLike = []) {
  if (debtLike.includes(name)) return 'debt-like';
  return overrides[name] ?? DEFAULT_CLASS[name];
}

export function computeNwc(months, { overrides = {}, debtLike = [] } = {}) {
  for (const [k, v] of Object.entries(overrides)) if (!KINDS.includes(v)) throw new Error(`--classify ${k}=${v}: use ${KINDS.join('|')}`);
  const names = [...new Set(months.flatMap((m) => Object.keys(m.items)))];
  const unknown = names.filter((n) => !classify(n, overrides, debtLike));
  if (unknown.length) throw new Error(`classify these columns before computing: ${unknown.join(', ')} (asset, liability, exclude or debt-like)`);
  return months.map((m) => {
    if (!MONTH.test(m.month)) throw new Error(`month "${m.month}" must be YYYY-MM`);
    let assets = 0, liabilities = 0, debtLikeTotal = 0;
    for (const [n, v] of Object.entries(m.items)) {
      const k = classify(n, overrides, debtLike);
      if (k === 'asset') assets += v;
      else if (k === 'liability') liabilities += v;
      else if (k === 'debt-like') debtLikeTotal += v;
    }
    return { month: m.month, assets: round(assets), liabilities: round(liabilities), nwc: round(assets - liabilities), debtLike: round(debtLikeTotal) };
  });
}

const round = (x) => Math.round(x * 100) / 100;
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const monthIndex = (m) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7)) - 1;

export function pegFromMonthly(series, { trailing = 12, method = 'average' } = {}) {
  if (!['average', 'median'].includes(method)) throw new Error('method must be average or median');
  const sorted = [...series].sort((a, b) => monthIndex(a.month) - monthIndex(b.month));
  const used = sorted.slice(-trailing);
  const values = used.map((s) => s.nwc);
  const warnings = [];
  if (used.length < trailing) warnings.push(`Only ${used.length} months available; ${trailing} were asked for. A short history can miss seasonality.`);
  for (let i = 1; i < used.length; i++) {
    if (monthIndex(used[i].month) - monthIndex(used[i - 1].month) !== 1) warnings.push(`Gap or duplicate between ${used[i - 1].month} and ${used[i].month}.`);
  }
  const avg = mean(values), med = median(values), min = Math.min(...values), max = Math.max(...values);
  const peg = method === 'average' ? avg : med;
  const negative = used.filter((s) => s.nwc < 0).map((s) => s.month);
  if (negative.length) warnings.push(`NWC is negative in ${negative.join(', ')}: customers prepay or payables are stretched. Check deferred revenue, deposits and aging.`);
  if (avg !== 0 && (max - min) / Math.abs(avg) > 0.25) warnings.push(`NWC swings ${round(max - min)} across the period (over 25% of the average): the business looks seasonal, so a single average may not fit a closing month. Consider a month-specific or seasonal peg.`);
  let last3 = null;
  if (used.length >= 6) {
    last3 = mean(values.slice(-3));
    if (peg !== 0 && Math.abs(last3 - peg) / Math.abs(peg) > 0.15) warnings.push(`The last three months average ${round(last3)}, more than 15% away from the peg ${round(peg)}. Ask why (collections pushed, payables stretched, inventory run down before a sale).`);
  }
  return {
    method, trailing, monthsUsed: used.map((s) => s.month), peg: round(peg),
    average: round(avg), median: round(med), min: round(min), max: round(max), range: round(max - min),
    last3Average: last3 === null ? null : round(last3), latestDebtLike: used.at(-1)?.debtLike ?? 0, warnings, series: used,
  };
}

// Closing true-up. Positive adjustment: buyer pays the seller more. Negative: price goes down.
// collarType 'deductible' adjusts only the part beyond the collar; 'tipping' adjusts the whole
// difference once the collar is exceeded. A collar of 0 is dollar-for-dollar.
export function trueUp({ peg, closingNwc, collar = 0, collarType = 'deductible' }) {
  if (!['deductible', 'tipping'].includes(collarType)) throw new Error('collarType must be deductible or tipping');
  if (collar < 0) throw new Error('collar must be zero or more');
  const difference = round(closingNwc - peg);
  let adjustment = 0;
  if (Math.abs(difference) > collar) adjustment = collarType === 'tipping' ? difference : Math.sign(difference) * (Math.abs(difference) - collar);
  adjustment = round(adjustment);
  const direction = adjustment > 0 ? 'buyer pays seller more' : adjustment < 0 ? 'price reduced (seller pays buyer)' : 'no adjustment';
  return { peg, closingNwc, difference, collar, collarType, adjustment, direction };
}

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    else o._.push(argv[i]);
  }
  return o;
}

export function main(argv) {
  const o = args(argv);
  if (!o._[0]) throw new Error('usage: node nwc-peg.mjs balances.csv [--trailing 12] [--method average|median] [--classify a=asset] [--debt-like x] [--closing N --collar N --collar-type deductible|tipping]');
  const overrides = typeof o.classify === 'string' ? Object.fromEntries(o.classify.split(',').map((p) => p.split('=').map((s) => s.trim()))) : {};
  const debtLike = typeof o['debt-like'] === 'string' ? o['debt-like'].split(',').map((s) => s.trim()) : [];
  const series = computeNwc(parseCsv(readFileSync(o._[0], 'utf8')), { overrides, debtLike });
  const result = pegFromMonthly(series, { trailing: o.trailing ? Number(o.trailing) : 12, method: o.method ?? 'average' });
  if (o.closing !== undefined) result.trueUp = trueUp({ peg: result.peg, closingNwc: Number(o.closing), collar: Number(o.collar ?? 0), collarType: o['collar-type'] ?? 'deductible' });
  return JSON.stringify(result, null, 2) + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { process.stdout.write(main(process.argv.slice(2))); }
  catch (e) { console.error(e.message); process.exit(1); }
}
