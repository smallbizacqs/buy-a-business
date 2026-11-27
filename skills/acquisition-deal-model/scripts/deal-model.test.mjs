import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthlyPayment, dealModel, toMarkdown } from './deal-model.mjs';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

const base = {
  label: 'Base', price: 2_000_000, closingCosts: 80_000, workingCapital: 120_000,
  sde: 600_000, ownerSalary: 120_000, capexReserve: 25_000,
  bank: { principal: 1_700_000, ratePct: 10.5, years: 10 },
  sellerNote: { principal: 200_000, ratePct: 6, years: 5, standbyMonths: 24 },
  years: 5,
};

test('equity is the plug that balances sources and uses', () => {
  const m = dealModel(base);
  assert.equal(m.totalUses, 2_200_000);
  assert.equal(m.equity, 300_000);
  near(m.gap, 0);
  near(m.equityPctOfUses, (300_000 / 2_200_000) * 100);
});

test('EBITDA is SDE minus a market owner salary', () => {
  assert.equal(dealModel(base).ebitda, 480_000);
  assert.throws(() => dealModel({ ...base, ownerSalary: null }), /ownerSalary/);
  assert.throws(() => dealModel({ ...base, sde: null }), /ebitda/);
});

test('DSC is EBITDA over combined debt service, heaviest year when the seller note starts paying', () => {
  const m = dealModel(base);
  const bankDs = monthlyPayment(1_700_000, 10.5, 120) * 12;
  near(m.rows[0].debtService, bankDs, 0.05);
  near(m.year1Dsc, 480_000 / bankDs, 1e-6);
  assert.ok(m.worstYear >= 3, 'seller note off standby from year 3');
  assert.ok(m.worstDsc < m.year1Dsc);
});

test('owner pay = salary + EBITDA - debt service - capex', () => {
  const m = dealModel(base);
  const r = m.rows[0];
  near(r.ownerPay, 120_000 + 480_000 - r.debtService - 25_000, 0.01);
});

test('max bank principal at the required coverage solves back to that coverage', () => {
  const m = dealModel(base);
  const alt = dealModel({ ...base, bank: { ...base.bank, principal: m.maxBankPrincipal } });
  near(alt.worstDsc, 1.25, 0.001);
});

test('a given equity amount that does not balance reports the gap', () => {
  const m = dealModel({ ...base, equity: 250_000 });
  near(m.gap, 50_000);
  assert.match(toMarkdown(m), /do not balance/);
});

test('EBITDA cushion: percentage drop to the screen and to break-even', () => {
  const m = dealModel({ price: 1_000_000, ebitda: 250_000, bank: { principal: 1_000_000, ratePct: 0, years: 10 }, years: 1 });
  // debt service 100,000; 1.25x needs 125,000; break-even needs 100,000
  near(m.ebitdaCushionToRequiredPct, 50);
  near(m.ebitdaCushionToBreakEvenPct, 60);
  near(m.sensitivity[2].worstDsc, 2.0);
});

test('balloons are shown apart from regular debt service', () => {
  const m = dealModel({ price: 1_000_000, ebitda: 300_000, bank: { principal: 800_000, ratePct: 9, years: 10 },
    sellerNote: { principal: 200_000, ratePct: 6, years: 10, balloonMonth: 36 }, years: 4 });
  assert.ok(m.rows[2].balloons > 0);
  assert.ok(m.rows[2].debtService < m.rows[2].debtService + m.rows[2].balloons);
  assert.equal(m.rows[3].byLoan[1].payment, 0);
});

test('price is required', () => {
  assert.throws(() => dealModel({ ebitda: 1 }), /price/);
});
