import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quoteRange, budget } from './advisor-budget.mjs';

test('quote ranges by basis', () => {
  assert.deepEqual(quoteRange({ role: 'l', basis: 'fixed', amount: 15000 }), { low: 15000, high: 15000 });
  assert.deepEqual(quoteRange({ role: 'c', basis: 'hourly', rate: 300, hoursLow: 10, hoursHigh: 25 }), { low: 3000, high: 7500 });
  assert.deepEqual(quoteRange({ role: 'c', basis: 'hourly', rate: 300, hoursLow: 10, hoursHigh: 25, cap: 6000 }), { low: 3000, high: 6000 });
  assert.deepEqual(quoteRange({ role: 'p', basis: 'percent', percent: 0.01, base: 1000000 }), { low: 10000, high: 10000 });
  assert.throws(() => quoteRange({ role: 'x', basis: 'contingent' }), /basis/);
  assert.throws(() => quoteRange({ role: 'x', basis: 'hourly', rate: 100 }), /hoursLow/);
});

test('budget totals and money at risk before closing', () => {
  const b = budget([
    { role: 'lawyer', basis: 'fixed', amount: 15000, whenPaid: 'split', beforeClosePct: 0.5 },
    { role: 'qoe', basis: 'fixed', amount: 20000, whenPaid: 'before-close' },
    { role: 'cpa', basis: 'hourly', rate: 300, hoursLow: 10, hoursHigh: 25 },
    { role: 'packaging', basis: 'percent', percent: 0.01, base: 1000000, whenPaid: 'at-close' },
  ], { dealPrice: 1500000 });
  assert.equal(b.totalLow, 48000);
  assert.equal(b.totalHigh, 52500);
  assert.equal(b.atRiskIfDealDiesLow, 30500);
  assert.equal(b.atRiskIfDealDiesHigh, 35000);
  assert.equal(b.pctOfPriceLow, 3.2);
  assert.throws(() => budget([{ role: 'x', basis: 'fixed', amount: 1, whenPaid: 'later' }]), /whenPaid/);
});
