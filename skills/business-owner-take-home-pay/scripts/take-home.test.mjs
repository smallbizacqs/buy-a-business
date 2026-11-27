import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthlyPayment, loanSchedule, annualize, takeHome, toMarkdown } from './take-home.mjs';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('level payment matches the standard amortization formula', () => {
  near(monthlyPayment(1_000_000, 10, 120), 13215.07);
  near(monthlyPayment(120_000, 0, 120), 1000);
  assert.equal(monthlyPayment(0, 10, 120), 0);
});

test('a loan pays off to zero over its term', () => {
  const rows = loanSchedule({ principal: 500_000, ratePct: 8, years: 10 }, 120);
  near(rows.at(-1).balance, 0, 0.01);
  const total = rows.reduce((a, r) => a + r.principal, 0);
  near(total, 500_000, 0.01);
});

test('standby with accrual capitalizes interest and defers payments', () => {
  const rows = loanSchedule({ principal: 100_000, ratePct: 6, years: 5, standbyMonths: 24 }, 24);
  assert.ok(rows.every((r) => r.payment === 0));
  near(rows.at(-1).balance, 100_000 * Math.pow(1.005, 24), 0.01);
});

test('standby without accrual keeps the balance flat', () => {
  const rows = loanSchedule({ principal: 100_000, ratePct: 6, years: 5, standbyMonths: 24, accrueDuringStandby: false }, 24);
  near(rows.at(-1).balance, 100_000);
});

test('interest-only months pay interest and leave principal', () => {
  const rows = loanSchedule({ principal: 120_000, ratePct: 12, years: 5, interestOnlyMonths: 12 }, 12);
  near(rows[0].payment, 1200);
  near(rows.at(-1).balance, 120_000);
});

test('balloon pays the remaining balance in the balloon month', () => {
  const y = annualize(loanSchedule({ principal: 200_000, ratePct: 7, years: 10, balloonMonth: 60 }, 72), 6);
  assert.ok(y[4].balloon > 0);
  near(y[4].endBalance, 0);
  assert.equal(y[5].payment, 0);
});

test('take-home subtracts manager pay, capex and debt service from SDE', () => {
  const res = takeHome({
    sde: 500_000, years: 3, managerSalary: 0, capexReserve: 20_000,
    loans: [{ name: 'bank', principal: 1_000_000, ratePct: 10, years: 10 }],
    targetPay: 300_000,
  });
  const ds = monthlyPayment(1_000_000, 10, 120) * 12;
  near(res.rows[0].debtService, ds, 0.05);
  near(res.rows[0].ownerTakeHome, 500_000 - 20_000 - ds, 0.05);
  assert.equal(res.firstYearAtTarget, 1);
});

test('the J-curve: year-1 dip and seller-note standby ending', () => {
  const res = takeHome({
    sde: 400_000, years: 4, year1DipPct: 15, growthPct: 5, minPay: 120_000, targetPay: 200_000,
    loans: [
      { name: 'bank', principal: 900_000, ratePct: 10.5, years: 10 },
      { name: 'seller note', principal: 200_000, ratePct: 6, years: 5, standbyMonths: 24 },
    ],
  });
  near(res.rows[0].sde, 340_000);
  assert.equal(res.rows[0].byLoan[1].payment, 0);
  assert.ok(res.rows[2].byLoan[1].payment > 0, 'seller note pays from year 3');
  assert.ok(res.rows[2].debtService > res.rows[1].debtService);
  assert.equal(typeof toMarkdown(res), 'string');
});

test('tax set-aside is a percentage of cash before debt less interest', () => {
  const res = takeHome({ sde: 300_000, years: 1, taxSetAsidePct: 25, loans: [] });
  near(res.rows[0].taxSetAside, 75_000);
  near(res.rows[0].ownerTakeHome, 225_000);
});

test('missing SDE is an error, not a guess', () => {
  assert.throws(() => takeHome({ loans: [] }), /sde/);
});

test('principal repaid per year is reported (debt paydown)', () => {
  const res = takeHome({ sde: 300_000, years: 10, loans: [{ principal: 500_000, ratePct: 8, years: 10 }] });
  const paid = res.rows.reduce((a, r) => a + r.principalPaid, 0);
  near(paid, 500_000, 0.05);
  assert.match(toMarkdown(res), /principal repaid/);
});
