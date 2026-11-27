import { test } from 'node:test';
import assert from 'node:assert/strict';
import { earnoutPayout, mix } from './earnout.mjs';

const pct = { type: 'percent-over-baseline', baseline: 1000000, percent: 0.1, periodCap: 50000, totalCap: 90000 };

test('percent over baseline with period and total caps', () => {
  const r = earnoutPayout(pct, [
    { label: 'Y1', actual: 1150000 }, // 15,000
    { label: 'Y2', actual: 900000 }, // 0
    { label: 'Y3', actual: 1800000 }, // 80,000 -> period cap 50,000
    { label: 'Y4', actual: 1500000 }, // 50,000 -> total cap leaves 25,000
  ]);
  assert.deepEqual(r.periods.map((p) => p.paid), [15000, 0, 50000, 25000]);
  assert.equal(r.total, 90000);
  assert.equal(r.cappedAt, 90000);
});

test('tiers pay the highest tier met', () => {
  const d = { type: 'tiers', tiers: [{ threshold: 1200000, payout: 50000 }, { threshold: 1100000, payout: 25000 }] };
  const r = earnoutPayout(d, [{ label: 'Y1', actual: 1099999 }, { label: 'Y2', actual: 1100000 }, { label: 'Y3', actual: 1300000 }]);
  assert.deepEqual(r.periods.map((p) => p.paid), [0, 25000, 50000]);
  assert.equal(r.cappedAt, null);
});

test('catch-up pays missed amounts when the top tier is later met', () => {
  const d = { type: 'tiers', tiers: [{ threshold: 100, payout: 10 }, { threshold: 200, payout: 30 }], catchUp: true };
  const r = earnoutPayout(d, [{ label: 'Y1', actual: 150 }, { label: 'Y2', actual: 50 }, { label: 'Y3', actual: 250 }]);
  // Y1 pays 10 (missed 20), Y2 pays 0 (missed 50 total), Y3 pays 30 + 50
  assert.deepEqual(r.periods.map((p) => p.paid), [10, 0, 80]);
});

test('unknown design types throw', () => {
  assert.throws(() => earnoutPayout({ type: 'ebitda-ish' }, [{ actual: 1 }]), /unknown design/);
});

test('mix splits the headline price', () => {
  const m = mix({ price: 1500000, cashAtClose: 1200000, sellerNote: 150000, earnoutMax: 150000 });
  assert.equal(m.mismatch, 0);
  assert.deepEqual(m.shares, { cashAtClose: 80, sellerNote: 10, earnoutMax: 10, rollover: 0 });
  assert.equal(m.guaranteedAtOrAfterClose, 1350000);
  assert.equal(mix({ price: 100, cashAtClose: 90 }).mismatch, -10);
});
