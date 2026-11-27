#!/usr/bin/env node
// Checks diligence results against walk-away criteria the buyer set before diligence, totals the
// price effect of findings, and recomputes debt service coverage. Plain Node, no dependencies, no network.
// It reports which lines were crossed; the buyer makes the decision, and the lender decides on coverage.
//
// Usage: node go-no-go.mjs review.json
//   { "criteria": [ { "id": "W1", "label": "Verified SDE at least", "metric": "sde", "op": ">=", "value": 420000, "kind": "walk" } ],
//     "facts": { "sde": 405000 },
//     "findings": [ { "id": "F1", "type": "recurring", "annualImpact": -40000 }, { "id": "F2", "type": "one-time", "cost": 18000 } ],
//     "price": 1500000, "sdeAtLoi": 500000,
//     "coverage": { "ebitda": 380000, "annualDebtService": 290000, "threshold": 1.25 } }
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const round = (x) => Math.round(x * 100) / 100;
const OPS = { '>=': (a, b) => a >= b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '<': (a, b) => a < b, '==': (a, b) => a === b };

export function checkCriteria(criteria, facts) {
  const results = criteria.map((c) => {
    if (!OPS[c.op]) throw new Error(`criterion ${c.id}: op must be one of ${Object.keys(OPS).join(' ')}`);
    if (!['walk', 'reprice', 'watch'].includes(c.kind)) throw new Error(`criterion ${c.id}: kind must be walk, reprice or watch`);
    const v = facts[c.metric];
    if (v === undefined || v === null) return { ...c, actual: null, status: 'unknown' };
    return { ...c, actual: v, status: OPS[c.op](v, c.value) ? 'met' : 'breached' };
  });
  const breached = (k) => results.filter((r) => r.kind === k && r.status === 'breached').map((r) => r.id);
  const summary = {
    walkBreached: breached('walk'), repriceBreached: breached('reprice'), watchBreached: breached('watch'),
    unknown: results.filter((r) => r.status === 'unknown').map((r) => r.id),
  };
  summary.headline = summary.walkBreached.length ? 'A walk-away line set in advance was crossed.'
    : summary.unknown.length ? 'Some criteria cannot be checked yet; the review is not complete.'
      : summary.repriceBreached.length ? 'No walk-away line crossed; reprice lines crossed.'
        : 'No line set in advance was crossed.';
  return { results, summary };
}

// Recurring impacts change earnings (and price at the LOI multiple); one-time costs come off dollar for dollar.
export function findingsImpact(findings, { price, sdeAtLoi } = {}) {
  let recurring = 0, oneTime = 0;
  for (const f of findings) {
    if (f.type === 'recurring') recurring += f.annualImpact ?? 0;
    else if (f.type === 'one-time') oneTime += f.cost ?? 0;
    else if (f.type !== 'unquantified') throw new Error(`finding ${f.id}: type must be recurring, one-time or unquantified`);
  }
  const out = { recurringAnnual: round(recurring), oneTimeCosts: round(oneTime), unquantified: findings.filter((f) => f.type === 'unquantified').map((f) => f.id) };
  if (price && sdeAtLoi) {
    const multiple = price / sdeAtLoi;
    out.multipleAtLoi = round(multiple);
    out.priceEffect = round(multiple * recurring - oneTime);
    out.priceAfterFindings = round(price + out.priceEffect);
  }
  return out;
}

export function coverage({ ebitda, annualDebtService, threshold }) {
  if (!(annualDebtService > 0)) throw new Error('annualDebtService must be positive');
  const ratio = ebitda / annualDebtService;
  const out = { ratio: round(ratio) };
  if (threshold) {
    out.threshold = threshold;
    out.meetsThreshold = ratio >= threshold;
    out.coverageVsTest = `coverage ${ratio >= threshold ? 'at or above' : 'below'} the ${threshold}x test on these inputs (not an approval)`;
    out.maxDebtServiceAtThreshold = round(ebitda / threshold);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('usage: node go-no-go.mjs review.json');
    const i = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const out = {};
    if (i.criteria) out.criteria = checkCriteria(i.criteria, i.facts ?? {});
    if (i.findings) out.findings = findingsImpact(i.findings, { price: i.price, sdeAtLoi: i.sdeAtLoi });
    if (i.coverage) out.coverage = coverage(i.coverage);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } catch (e) { console.error(e.message); process.exit(1); }
}
