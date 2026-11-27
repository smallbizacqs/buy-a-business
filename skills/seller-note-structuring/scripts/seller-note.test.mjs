import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthlyPayment, analyzeNote, toMarkdown } from './seller-note.mjs';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('plain amortizing note: level payment, total interest', () => {
  const n = analyzeNote({ principal: 300_000, ratePct: 6, years: 5 });
  near(n.levelMonthlyPayment, monthlyPayment(300_000, 6, 60));
  near(n.levelMonthlyPayment, 5799.84);
  near(n.totalPaid, n.levelMonthlyPayment * 60, 0.05);
  near(n.totalInterest, n.totalPaid - 300_000);
  assert.equal(n.firstPaymentMonth, 1);
  assert.equal(n.annual.length, 5);
  near(n.annual.at(-1).endBalance, 0);
});

test('24 months of standby with accrual: first payment month 25 and a larger balance', () => {
  const n = analyzeNote({ principal: 300_000, ratePct: 6, years: 5, standbyMonths: 24 });
  assert.equal(n.firstPaymentMonth, 25);
  near(n.balanceAfterStandby, 300_000 * Math.pow(1.005, 24), 0.01);
  near(n.levelMonthlyPayment, monthlyPayment(n.balanceAfterStandby, 6, 60), 0.01);
  assert.equal(n.annual[0].payments, 0);
  assert.equal(n.annual[1].payments, 0);
});

test('standby without accrual: same balance, no interest during standby', () => {
  const n = analyzeNote({ principal: 300_000, ratePct: 6, years: 5, standbyMonths: 24, accrueDuringStandby: false });
  near(n.balanceAfterStandby, 300_000);
});

test('balloon: remaining balance paid in the balloon month', () => {
  const n = analyzeNote({ principal: 400_000, ratePct: 7, years: 10, balloonMonth: 36 });
  assert.equal(n.horizonMonths, 36);
  assert.ok(n.balloon > 250_000 && n.balloon < 400_000);
  near(n.annual.at(-1).endBalance, 0);
});

test('present value to the seller is below face when the discount rate exceeds the note rate', () => {
  const n = analyzeNote({ principal: 200_000, ratePct: 5, years: 5, discountPct: 12 });
  assert.ok(n.presentValue < 200_000);
  const same = analyzeNote({ principal: 200_000, ratePct: 6, years: 5, discountPct: 6 });
  near(same.presentValue, 200_000, 0.5);
});

test('markdown compares several structures', () => {
  const md = toMarkdown([
    analyzeNote({ label: 'A', principal: 200_000, ratePct: 6, years: 5 }),
    analyzeNote({ label: 'B', principal: 200_000, ratePct: 6, years: 5, standbyMonths: 24 }),
  ]);
  assert.match(md, /\| A \|/);
  assert.match(md, /\| Year \| A \| B \|/);
});

test('principal is required', () => {
  assert.throws(() => analyzeNote({ ratePct: 6 }), /principal/);
});
