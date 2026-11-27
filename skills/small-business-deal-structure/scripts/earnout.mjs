#!/usr/bin/env node
// Earnout arithmetic: what an earnout pays under a given design and set of results, and how the
// headline price splits into cash at closing, deferred (seller note) and contingent (earnout) money.
// Plain Node, no dependencies, no network. Not a forecast and not a judgment of the design.
//
// Usage: node earnout.mjs earnout.json
//   { "design": { "type": "percent-over-baseline", "baseline": 1000000, "percent": 0.10, "periodCap": 50000, "totalCap": 150000 },
//     "results": [ { "label": "Year 1", "actual": 1150000 }, ... ],
//     "mix": { "price": 1500000, "cashAtClose": 1200000, "sellerNote": 150000, "earnoutMax": 150000 } }
//   design.type "tiers": { "tiers": [ { "threshold": 1100000, "payout": 25000 }, { "threshold": 1200000, "payout": 50000 } ], "totalCap": 150000, "catchUp": false }
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const round = (x) => Math.round(x * 100) / 100;

function periodPayout(design, actual) {
  if (design.type === 'percent-over-baseline') {
    const raw = Math.max(0, actual - design.baseline) * design.percent;
    return design.periodCap !== undefined ? Math.min(raw, design.periodCap) : raw;
  }
  if (design.type === 'tiers') {
    const met = [...design.tiers].sort((a, b) => a.threshold - b.threshold).filter((t) => actual >= t.threshold);
    return met.length ? met.at(-1).payout : 0;
  }
  throw new Error(`unknown design type "${design.type}" (use percent-over-baseline or tiers)`);
}

// catchUp (tiers only): a later period that meets the top tier also pays amounts missed in earlier periods.
export function earnoutPayout(design, results) {
  const totalCap = design.totalCap ?? Infinity;
  let paid = 0, missed = 0;
  const top = design.type === 'tiers' ? Math.max(...design.tiers.map((t) => t.payout)) : null;
  const periods = results.map((r) => {
    let due = periodPayout(design, r.actual);
    if (design.catchUp && design.type === 'tiers') {
      if (due === top) { due += missed; missed = 0; } else missed += top - due;
    }
    const pay = Math.max(0, Math.min(due, totalCap - paid));
    paid += pay;
    return { label: r.label, actual: r.actual, earned: round(due), paid: round(pay), cumulative: round(paid) };
  });
  return { periods, total: round(paid), cappedAt: Number.isFinite(totalCap) ? totalCap : null };
}

export function mix({ price, cashAtClose = 0, sellerNote = 0, earnoutMax = 0, rollover = 0 }) {
  const parts = { cashAtClose, sellerNote, earnoutMax, rollover };
  const sum = Object.values(parts).reduce((s, x) => s + x, 0);
  const pct = (x) => round((x / price) * 100);
  return {
    price, ...parts, sumOfParts: sum, mismatch: round(sum - price),
    shares: { cashAtClose: pct(cashAtClose), sellerNote: pct(sellerNote), earnoutMax: pct(earnoutMax), rollover: pct(rollover) },
    guaranteedAtOrAfterClose: cashAtClose + sellerNote, contingent: earnoutMax,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('usage: node earnout.mjs earnout.json');
    const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const out = {};
    if (input.design) out.earnout = earnoutPayout(input.design, input.results ?? []);
    if (input.mix) out.mix = mix(input.mix);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } catch (e) { console.error(e.message); process.exit(1); }
}
