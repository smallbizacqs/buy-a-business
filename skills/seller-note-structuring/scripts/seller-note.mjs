#!/usr/bin/env node
// Seller note schedules, side by side: standby, interest-only, amortization, balloon.
// Plain Node, no dependencies, no network. Usage:
//   node seller-note.mjs notes.json          prints markdown (notes.json: one note or an array)
//   node seller-note.mjs notes.json --json   prints JSON
// Optional per note: discountPct, to show what the payment stream is worth to the seller today.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function monthlyPayment(principal, annualRatePct, months) {
  if (!(months > 0) || !(principal > 0)) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

// Standby (no payments), then interest-only, then level amortization over `years`.
export function loanSchedule(loan, horizonMonths) {
  const { principal = 0, ratePct = 0, years = 10, standbyMonths = 0, interestOnlyMonths = 0, accrueDuringStandby = true, balloonMonth = null } = loan;
  const r = ratePct / 100 / 12;
  let bal = principal, pmt = null;
  const rows = [];
  for (let m = 1; m <= horizonMonths; m++) {
    if (bal <= 1e-6) { rows.push({ month: m, payment: 0, interest: 0, principal: 0, balance: 0, balloon: 0 }); continue; }
    let interest = bal * r, payment = 0, princ = 0, balloon = 0;
    if (m <= standbyMonths) { if (accrueDuringStandby) bal += interest; else interest = 0; }
    else if (m <= standbyMonths + interestOnlyMonths) payment = interest;
    else {
      if (pmt === null) pmt = monthlyPayment(bal, ratePct, Math.round(years * 12));
      payment = Math.min(pmt, bal + interest); princ = payment - interest; bal -= princ;
    }
    if (balloonMonth && m === balloonMonth && bal > 1e-6) { balloon = bal; payment += bal; princ += bal; bal = 0; }
    rows.push({ month: m, payment, interest, principal: princ, balance: Math.max(bal, 0), balloon });
  }
  return rows;
}

export function analyzeNote(note) {
  const { label = 'Note', principal, standbyMonths = 0, interestOnlyMonths = 0, years = 5, balloonMonth = null, discountPct = null } = note;
  if (!(principal > 0)) throw new Error('principal is required');
  const horizon = balloonMonth ?? standbyMonths + interestOnlyMonths + Math.round(years * 12);
  const rows = loanSchedule(note, horizon);
  const totalPaid = rows.reduce((a, r) => a + r.payment, 0);
  const firstPaymentMonth = rows.find((r) => r.payment > 0)?.month ?? null;
  const amortStart = rows[standbyMonths + interestOnlyMonths];
  const level = amortStart ? amortStart.payment - amortStart.balloon : 0;
  const yearsN = Math.ceil(horizon / 12);
  const annual = Array.from({ length: yearsN }, (_, i) => {
    const s = rows.slice(i * 12, (i + 1) * 12);
    return { year: i + 1, payments: s.reduce((a, r) => a + r.payment - r.balloon, 0), balloon: s.reduce((a, r) => a + r.balloon, 0), endBalance: s.at(-1)?.balance ?? 0 };
  });
  let presentValue = null;
  if (discountPct != null) {
    const d = discountPct / 100 / 12;
    presentValue = rows.reduce((a, r) => a + r.payment / Math.pow(1 + d, r.month), 0);
  }
  return {
    label, principal, horizonMonths: horizon, firstPaymentMonth,
    balanceAfterStandby: standbyMonths ? rows[standbyMonths - 1].balance : principal,
    levelMonthlyPayment: level, balloon: rows.reduce((a, r) => a + r.balloon, 0),
    totalPaid, totalInterest: totalPaid - principal, annual, discountPct, presentValue,
  };
}

const usd = (n) => (n == null ? 'n/a' : (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'));

export function toMarkdown(list) {
  const L = ['| Structure | Principal | First payment (month) | Balance after standby | Monthly payment when amortizing | Balloon | Total paid | Total interest | Value to seller today |', '|---|---|---|---|---|---|---|---|---|'];
  for (const n of list) L.push(`| ${n.label} | ${usd(n.principal)} | ${n.firstPaymentMonth ?? 'none'} | ${usd(n.balanceAfterStandby)} | ${usd(n.levelMonthlyPayment)} | ${n.balloon ? usd(n.balloon) : 'none'} | ${usd(n.totalPaid)} | ${usd(n.totalInterest)} | ${n.presentValue == null ? 'n/a' : `${usd(n.presentValue)} at ${n.discountPct}%`} |`);
  const maxYears = Math.max(...list.map((n) => n.annual.length));
  L.push('', `| Year | ${list.map((n) => n.label).join(' | ')} |`, `|---|${list.map(() => '---|').join('')}`);
  for (let y = 0; y < maxYears; y++) L.push(`| ${y + 1} | ${list.map((n) => { const a = n.annual[y]; return a ? usd(a.payments) + (a.balloon ? ` + balloon ${usd(a.balloon)}` : '') : '$0'; }).join(' | ')} |`);
  return L.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node seller-note.mjs notes.json [--json]'); process.exit(2); }
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const list = (Array.isArray(raw) ? raw : [raw]).map(analyzeNote);
  console.log(process.argv.includes('--json') ? JSON.stringify(list, null, 2) : toMarkdown(list));
}
