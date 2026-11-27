#!/usr/bin/env node
// Owner take-home after debt service, year by year (the "J-curve").
// Plain Node, no dependencies, no network. Usage:
//   node take-home.mjs input.json          prints a markdown table
//   node take-home.mjs input.json --json   prints JSON
// Every number it prints is arithmetic on the user's inputs, not a forecast or advice.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function monthlyPayment(principal, annualRatePct, months) {
  if (!(months > 0) || !(principal > 0)) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

// One loan, month by month. Order of periods: standby (no payments), interest-only, then
// level amortization over `years` (counted from the end of standby and interest-only).
// accrueDuringStandby: true adds unpaid interest to the balance; false means the note bears
// no interest while on standby (the parties' choice; the lender and the note decide).
export function loanSchedule(loan, horizonMonths) {
  const {
    principal = 0, ratePct = 0, years = 10, standbyMonths = 0, interestOnlyMonths = 0,
    accrueDuringStandby = true, balloonMonth = null,
  } = loan;
  const r = ratePct / 100 / 12;
  const amortMonths = Math.round(years * 12);
  let bal = principal;
  let pmt = null;
  const rows = [];
  for (let m = 1; m <= horizonMonths; m++) {
    if (bal <= 1e-6) { rows.push({ month: m, payment: 0, interest: 0, principal: 0, balance: 0, balloon: 0 }); continue; }
    let interest = bal * r;
    let payment = 0, princ = 0, balloon = 0;
    if (m <= standbyMonths) {
      if (accrueDuringStandby) bal += interest; else interest = 0;
    } else if (m <= standbyMonths + interestOnlyMonths) {
      payment = interest;
    } else {
      if (pmt === null) pmt = monthlyPayment(bal, ratePct, amortMonths);
      payment = Math.min(pmt, bal + interest);
      princ = payment - interest;
      bal -= princ;
    }
    if (balloonMonth && m === balloonMonth && bal > 1e-6) {
      balloon = bal; payment += bal; princ += bal; bal = 0;
    }
    rows.push({ month: m, payment, interest, principal: princ, balance: Math.max(bal, 0), balloon });
  }
  return rows;
}

export function annualize(rows, years) {
  const out = [];
  for (let y = 1; y <= years; y++) {
    const slice = rows.slice((y - 1) * 12, y * 12);
    const sum = (k) => slice.reduce((a, x) => a + x[k], 0);
    out.push({
      year: y, payment: sum('payment'), interest: sum('interest'), principal: sum('principal'),
      balloon: sum('balloon'), endBalance: slice.length ? slice[slice.length - 1].balance : 0,
    });
  }
  return out;
}

export function takeHome(input) {
  const {
    sde, years = 5, growthPct = 0, year1DipPct = 0, sdeByYear = null,
    managerSalary = 0, capexReserve = 0, taxSetAsidePct = 0,
    loans = [], targetPay = null, minPay = null,
  } = input;
  if (!(sde > 0) && !sdeByYear) throw new Error('sde (annual seller\'s discretionary earnings) is required');
  const sched = loans.map((l) => ({ name: l.name ?? 'loan', years: annualize(loanSchedule(l, years * 12), years) }));
  const rows = [];
  for (let y = 1; y <= years; y++) {
    const base = sdeByYear ? sdeByYear[y - 1] : sde * Math.pow(1 + growthPct / 100, y - 1);
    const sdeY = y === 1 && !sdeByYear ? base * (1 - year1DipPct / 100) : base;
    const cashBeforeDebt = sdeY - managerSalary - capexReserve;
    const byLoan = sched.map((s) => ({ name: s.name, payment: s.years[y - 1].payment, interest: s.years[y - 1].interest, endBalance: s.years[y - 1].endBalance }));
    const debtService = byLoan.reduce((a, x) => a + x.payment, 0);
    const interestCash = sched.reduce((a, s) => a + Math.min(s.years[y - 1].interest, s.years[y - 1].payment), 0);
    const taxSetAside = Math.max(0, cashBeforeDebt - interestCash) * (taxSetAsidePct / 100);
    const ownerTakeHome = cashBeforeDebt - debtService - taxSetAside;
    const principalPaid = sched.reduce((a, s) => a + s.years[y - 1].principal, 0);
    rows.push({
      year: y, sde: sdeY, managerSalary, capexReserve, cashBeforeDebt, debtService, byLoan,
      coverage: debtService > 0 ? cashBeforeDebt / debtService : null, taxSetAside, ownerTakeHome, principalPaid,
      belowMinPay: minPay != null ? ownerTakeHome < minPay : null,
    });
  }
  const firstYearAtTarget = targetPay != null ? (rows.find((r) => r.ownerTakeHome >= targetPay)?.year ?? null) : null;
  return { rows, firstYearAtTarget, targetPay, minPay, taxSetAsidePct };
}

const usd = (n) => (n == null ? 'n/a' : (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'));

export function toMarkdown(res) {
  const lines = [];
  lines.push('| Year | SDE | Manager pay | Capex reserve | Cash before debt | Debt service | Coverage (cash/debt) | Tax set-aside | Owner take-home |');
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const r of res.rows) {
    lines.push(`| ${r.year} | ${usd(r.sde)} | ${usd(r.managerSalary)} | ${usd(r.capexReserve)} | ${usd(r.cashBeforeDebt)} | ${usd(r.debtService)} | ${r.coverage == null ? 'n/a' : r.coverage.toFixed(2) + 'x'} | ${usd(r.taxSetAside)} | ${usd(r.ownerTakeHome)}${r.belowMinPay ? ' (below household minimum)' : ''} |`);
  }
  lines.push('');
  const paid = res.rows.reduce((a, r) => a + r.principalPaid, 0);
  if (paid > 0) lines.push(`Loan principal repaid over the ${res.rows.length} years modeled: ${usd(paid)}. That is equity built only if the business keeps its value.`);
  if (res.targetPay != null) lines.push(res.firstYearAtTarget ? `Take-home first reaches the target of ${usd(res.targetPay)} in year ${res.firstYearAtTarget}.` : `Take-home does not reach the target of ${usd(res.targetPay)} within the years modeled.`);
  lines.push(res.taxSetAsidePct ? `Tax set-aside is a placeholder at ${res.taxSetAsidePct}% of cash before debt less interest, not a tax estimate.` : 'Figures are before income taxes.');
  lines.push('Coverage here is cash before debt divided by debt service; it is not the lender\'s DSC test, which uses EBITDA after a market salary for the owner.');
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node take-home.mjs input.json [--json]'); process.exit(2); }
  const res = takeHome(JSON.parse(readFileSync(file, 'utf8')));
  console.log(process.argv.includes('--json') ? JSON.stringify(res, null, 2) : toMarkdown(res));
}
