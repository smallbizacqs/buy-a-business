import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthlyPayment, balanceAfter, exposure, toMarkdown } from './pg-exposure.mjs';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('balance after N months matches the amortization formula', () => {
  const P = 1_000_000, r = 0.10 / 12, pmt = monthlyPayment(P, 10, 120);
  const expected = P * Math.pow(1 + r, 12) - pmt * ((Math.pow(1 + r, 12) - 1) / r);
  near(balanceAfter({ principal: P, ratePct: 10, years: 10 }, 12), expected, 0.01);
  near(balanceAfter({ principal: P, ratePct: 10, years: 10 }, 120), 0, 0.01);
});

test('standby balance grows with accrual', () => {
  near(balanceAfter({ principal: 100_000, ratePct: 6, years: 5, standbyMonths: 24 }, 24), 100_000 * Math.pow(1.005, 24), 0.01);
});

test('shortfall = owed + collection costs - business liquidation value, floored at zero', () => {
  const res = exposure({
    guaranteedLoans: [{ principal: 1_000_000, ratePct: 0, years: 10 }],
    failureYears: [1, 9], businessLiquidationValue: 300_000, collectionCostsPct: 10, equityInvested: 150_000,
  });
  // year 1: owed 900,000; costs 90,000; shortfall 690,000
  near(res.rows[0].owed, 900_000);
  near(res.rows[0].shortfall, 690_000);
  near(res.rows[0].totalPersonalLoss, 840_000);
  // year 9: owed 100,000; costs 10,000; covered by assets
  near(res.rows[1].shortfall, 0);
});

test('pledged collateral absorbs the shortfall first; remainder compared to other assets', () => {
  const res = exposure({
    guaranteedLoans: [{ principal: 500_000, ratePct: 0, years: 10 }], failureYears: [0],
    businessLiquidationValue: 100_000, pledgedCollateral: [{ name: 'home equity', netValue: 250_000 }], otherPersonalAssets: 300_000,
  });
  near(res.rows[0].shortfall, 400_000);
  near(res.rows[0].fromPledgedCollateral, 250_000);
  near(res.rows[0].remainingShortfall, 150_000);
  near(res.rows[0].remainingVsOtherAssets, 0.5);
  assert.match(toMarkdown(res), /home equity/);
});

test('no guaranteed loans is an error', () => {
  assert.throws(() => exposure({}), /guaranteedLoans/);
});
