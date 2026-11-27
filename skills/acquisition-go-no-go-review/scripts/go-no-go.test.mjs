import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCriteria, findingsImpact, coverage } from './go-no-go.mjs';

const criteria = [
  { id: 'W1', label: 'Verified SDE at least', metric: 'sde', op: '>=', value: 420000, kind: 'walk' },
  { id: 'W2', label: 'Top customer share at most', metric: 'topCustomerPct', op: '<=', value: 25, kind: 'walk' },
  { id: 'R1', label: 'Working capital shortfall at most', metric: 'nwcShortfall', op: '<=', value: 20000, kind: 'reprice' },
  { id: 'R2', label: 'Lease term with options, years', metric: 'leaseYears', op: '>=', value: 10, kind: 'watch' },
];

test('walk-away breach is reported first', () => {
  const r = checkCriteria(criteria, { sde: 405000, topCustomerPct: 18, nwcShortfall: 30000, leaseYears: 12 });
  assert.deepEqual(r.summary.walkBreached, ['W1']);
  assert.deepEqual(r.summary.repriceBreached, ['R1']);
  assert.match(r.summary.headline, /walk-away line/);
});

test('missing facts are unknown, not met', () => {
  const r = checkCriteria(criteria, { sde: 450000, topCustomerPct: 10 });
  assert.deepEqual(r.summary.unknown, ['R1', 'R2']);
  assert.match(r.summary.headline, /not complete/);
});

test('all met', () => {
  const r = checkCriteria(criteria, { sde: 450000, topCustomerPct: 10, nwcShortfall: 0, leaseYears: 10 });
  assert.equal(r.summary.headline, 'No line set in advance was crossed.');
  assert.throws(() => checkCriteria([{ id: 'X', op: '~', kind: 'walk' }], {}), /op/);
  assert.throws(() => checkCriteria([{ id: 'X', op: '>=', kind: 'maybe' }], {}), /kind/);
});

test('findings impact at the LOI multiple', () => {
  const r = findingsImpact([
    { id: 'F1', type: 'recurring', annualImpact: -40000 },
    { id: 'F2', type: 'one-time', cost: 18000 },
    { id: 'F3', type: 'unquantified' },
  ], { price: 1500000, sdeAtLoi: 500000 });
  assert.equal(r.multipleAtLoi, 3);
  assert.equal(r.priceEffect, -138000);
  assert.equal(r.priceAfterFindings, 1362000);
  assert.deepEqual(r.unquantified, ['F3']);
  assert.throws(() => findingsImpact([{ id: 'F9', type: 'vibes' }]), /type/);
});

test('coverage ratio against a threshold', () => {
  const c = coverage({ ebitda: 380000, annualDebtService: 290000, threshold: 1.25 });
  assert.equal(c.ratio, 1.31);
  assert.equal(c.meetsThreshold, true);
  assert.equal(c.maxDebtServiceAtThreshold, 304000);
  assert.equal(coverage({ ebitda: 300000, annualDebtService: 290000, threshold: 1.25 }).meetsThreshold, false);
  assert.throws(() => coverage({ ebitda: 1, annualDebtService: 0 }));
});
