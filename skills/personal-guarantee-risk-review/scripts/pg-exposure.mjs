#!/usr/bin/env node
// Personal guarantee exposure if the business fails in year N: what is still owed, what the
// business assets might cover, and the shortfall the guarantor could be asked to pay.
// Plain Node, no dependencies, no network. Usage:
//   node pg-exposure.mjs input.json          prints markdown
//   node pg-exposure.mjs input.json --json   prints JSON
// This is arithmetic on the user's estimates. What a lender can actually collect, in what order,
// and which assets state law protects are questions for a lawyer.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function monthlyPayment(principal, annualRatePct, months) {
  if (!(months > 0) || !(principal > 0)) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

// Balance after `months` months: standby (no payments), interest-only, then level amortization.
export function balanceAfter(loan, months) {
  const { principal = 0, ratePct = 0, years = 10, standbyMonths = 0, interestOnlyMonths = 0, accrueDuringStandby = true } = loan;
  const r = ratePct / 100 / 12;
  let bal = principal, pmt = null;
  for (let m = 1; m <= months && bal > 1e-6; m++) {
    const interest = bal * r;
    if (m <= standbyMonths) { if (accrueDuringStandby) bal += interest; }
    else if (m <= standbyMonths + interestOnlyMonths) { /* interest paid, balance flat */ }
    else {
      if (pmt === null) pmt = monthlyPayment(bal, ratePct, Math.round(years * 12));
      bal -= Math.min(pmt, bal + interest) - interest;
    }
  }
  return Math.max(bal, 0);
}

export function exposure(input) {
  const {
    guaranteedLoans = [], failureYears = [1, 2, 3, 5], businessLiquidationValue = 0,
    collectionCostsPct = 0, equityInvested = 0, pledgedCollateral = [], otherPersonalAssets = 0,
  } = input;
  if (!guaranteedLoans.length) throw new Error('guaranteedLoans is required: list each loan you would personally guarantee');
  const pledged = pledgedCollateral.reduce((a, c) => a + (c.netValue ?? 0), 0);
  const rows = failureYears.map((y) => {
    const owed = guaranteedLoans.reduce((a, l) => a + balanceAfter(l, y * 12), 0);
    const costs = owed * (collectionCostsPct / 100);
    const shortfall = Math.max(0, owed + costs - businessLiquidationValue);
    const fromPledged = Math.min(shortfall, pledged);
    const remaining = shortfall - fromPledged;
    return {
      failureYear: y, owed, collectionCosts: costs, businessLiquidationValue, shortfall,
      fromPledgedCollateral: fromPledged, remainingShortfall: remaining,
      remainingVsOtherAssets: otherPersonalAssets > 0 ? remaining / otherPersonalAssets : null,
      totalPersonalLoss: equityInvested + shortfall,
    };
  });
  return { rows, pledged, pledgedCollateral, otherPersonalAssets, equityInvested };
}

const usd = (n) => (n == null ? 'n/a' : (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'));

export function toMarkdown(res) {
  const L = ['| Fails in year | Still owed | Collection costs | Business assets might cover | Shortfall under the guarantee | From pledged collateral | Remaining shortfall | Equity lost + shortfall |', '|---|---|---|---|---|---|---|---|'];
  for (const r of res.rows) L.push(`| ${r.failureYear} | ${usd(r.owed)} | ${usd(r.collectionCosts)} | ${usd(r.businessLiquidationValue)} | ${usd(r.shortfall)} | ${usd(r.fromPledgedCollateral)} | ${usd(r.remainingShortfall)} | ${usd(r.totalPersonalLoss)} |`);
  L.push('');
  if (res.pledgedCollateral.length) L.push(`Pledged collateral: ${res.pledgedCollateral.map((c) => `${c.name} ${usd(c.netValue)}`).join(', ')}.`);
  if (res.otherPersonalAssets) L.push(`Other personal assets listed: ${usd(res.otherPersonalAssets)}. Which of these a creditor can reach depends on state law; ask a lawyer.`);
  L.push('Estimates only. Assets can sell for less than their estimated value, and the order and amount of any recovery are not modeled.');
  return L.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node pg-exposure.mjs input.json [--json]'); process.exit(2); }
  const res = exposure(JSON.parse(readFileSync(file, 'utf8')));
  console.log(process.argv.includes('--json') ? JSON.stringify(res, null, 2) : toMarkdown(res));
}
