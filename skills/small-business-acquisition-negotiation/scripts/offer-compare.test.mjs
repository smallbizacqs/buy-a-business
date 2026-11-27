import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sellerView, compareOffers, repriceFromFinding } from './offer-compare.mjs';

test('all-cash offer is worth its cash', () => {
  const v = sellerView({ name: 'cash', cashAtClose: 1000000 });
  assert.equal(v.headline, 1000000);
  assert.equal(v.expectedPvToSeller, 1000000);
  assert.equal(v.cashAtCloseShare, 100);
});

test('zero-rate note at zero discount is worth its principal', () => {
  const v = sellerView({ cashAtClose: 0, sellerNote: { principal: 120000, annualRate: 0, years: 10 } }, { discountRate: 0 });
  assert.equal(v.sellerNoteNominal, 120000);
  assert.equal(v.sellerNotePv, 120000);
});

test('deferral and contingency lower present value below headline', () => {
  const v = sellerView({ cashAtClose: 900000, sellerNote: { principal: 300000, annualRate: 0.04, years: 10, standbyMonths: 24 }, earnout: { max: 200000, probability: 0.5, yearsOut: 2 } }, { discountRate: 0.1 });
  assert.equal(v.headline, 1400000);
  assert.ok(v.sellerNotePv < 300000);
  assert.ok(v.sellerNoteNominal > 300000);
  assert.equal(v.earnoutExpected, 100000);
  assert.ok(Math.abs(v.earnoutPv - 100000 / (1 + 0.1 / 12) ** 24) < 0.01);
  assert.ok(v.expectedPvToSeller < 1300000);
});

test('compareOffers sorts by expected present value', () => {
  const r = compareOffers([
    { name: 'big headline', cashAtClose: 800000, earnout: { max: 600000, probability: 0.2, yearsOut: 3 } },
    { name: 'lower, all cash', cashAtClose: 1000000 },
  ]);
  assert.deepEqual(r.map((x) => x.name), ['lower, all cash', 'big headline']);
});

test('reprice keeps the LOI multiple and subtracts one-time costs', () => {
  const r = repriceFromFinding({ price: 1500000, sdeAtLoi: 500000, sdeVerified: 440000, oneTimeCosts: 25000 });
  assert.equal(r.multipleAtLoi, 3);
  assert.equal(r.priceAtSameMultiple, 1320000);
  assert.equal(r.proposedPrice, 1295000);
  assert.equal(r.reduction, 205000);
  assert.equal(r.reductionPct, 13.67);
  assert.throws(() => repriceFromFinding({ price: 0, sdeAtLoi: 1, sdeVerified: 1 }));
  assert.throws(() => sellerView({ sellerNote: { principal: 1, annualRate: 0.05, years: 1, standbyMonths: 12 } }), /standby/);
});
