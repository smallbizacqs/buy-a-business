#!/usr/bin/env node
// Turns advisor quotes into a low/high budget, and shows how much is spent before closing (money
// lost if the deal dies) versus paid at closing. Plain Node, no dependencies, no network.
// The numbers are the quotes the user collected; the script invents none.
//
// Usage: node advisor-budget.mjs quotes.json
//   [ { "role": "lawyer", "basis": "fixed", "amount": 15000, "whenPaid": "split", "beforeClosePct": 0.5 },
//     { "role": "qoe", "basis": "fixed", "amount": 20000, "whenPaid": "before-close" },
//     { "role": "cpa", "basis": "hourly", "rate": 300, "hoursLow": 10, "hoursHigh": 25, "whenPaid": "before-close" },
//     { "role": "lender packaging", "basis": "percent", "percent": 0.01, "base": 1000000, "whenPaid": "at-close" } ]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const round = (x) => Math.round(x * 100) / 100;

export function quoteRange(q) {
  switch (q.basis) {
    case 'fixed': return { low: q.amount, high: q.amountHigh ?? q.amount };
    case 'hourly': {
      if (!(q.rate > 0) || q.hoursLow === undefined || q.hoursHigh === undefined) throw new Error(`${q.role}: hourly quotes need rate, hoursLow and hoursHigh`);
      const high = q.cap !== undefined ? Math.min(q.cap, q.rate * q.hoursHigh) : q.rate * q.hoursHigh;
      return { low: q.rate * q.hoursLow, high };
    }
    case 'percent': return { low: q.percent * q.base, high: q.percent * q.base };
    default: throw new Error(`${q.role}: basis must be fixed, hourly or percent`);
  }
}

export function budget(quotes, { dealPrice = null } = {}) {
  const lines = quotes.map((q) => {
    const { low, high } = quoteRange(q);
    const when = q.whenPaid ?? 'before-close';
    if (!['before-close', 'at-close', 'split'].includes(when)) throw new Error(`${q.role}: whenPaid must be before-close, at-close or split`);
    const share = when === 'before-close' ? 1 : when === 'at-close' ? 0 : q.beforeClosePct ?? 0.5;
    return { role: q.role, basis: q.basis, low: round(low), high: round(high), whenPaid: when, atRiskLow: round(low * share), atRiskHigh: round(high * share) };
  });
  const sum = (k) => round(lines.reduce((s, l) => s + l[k], 0));
  const out = { lines, totalLow: sum('low'), totalHigh: sum('high'), atRiskIfDealDiesLow: sum('atRiskLow'), atRiskIfDealDiesHigh: sum('atRiskHigh') };
  if (dealPrice) { out.pctOfPriceLow = round((out.totalLow / dealPrice) * 100); out.pctOfPriceHigh = round((out.totalHigh / dealPrice) * 100); }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('usage: node advisor-budget.mjs quotes.json [--price 1500000]');
    const i = process.argv.indexOf('--price');
    const out = budget(JSON.parse(readFileSync(process.argv[2], 'utf8')), { dealPrice: i > 0 ? Number(process.argv[i + 1]) : null });
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } catch (e) { console.error(e.message); process.exit(1); }
}
