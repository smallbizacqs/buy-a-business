import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consideration, levelPayment, sellerNote, addDays, summarize, toMarkdown } from './loi-math.mjs';

const terms = {
  price: 1200000,
  consideration: { buyerEquity: 120000, seniorLoan: 900000, sellerNote: 180000 },
  sellerNote: { annualRate: 0.07, years: 10, standbyMonths: 24, standbyInterest: 'accrue' },
  signDate: '2026-12-01', exclusivityDays: 60,
};

test('consideration adds up and splits cash at close from deferred', () => {
  const c = consideration(terms);
  assert.equal(c.total, 1200000);
  assert.equal(c.cashAtClose, 1020000);
  assert.equal(c.cashAtCloseShare, 85);
  assert.equal(c.guaranteed, 1200000);
  assert.deepEqual(c.issues, []);
});

test('mismatched pieces are flagged, unknown pieces rejected', () => {
  const c = consideration({ price: 1000000, consideration: { buyerEquity: 100000, seniorLoan: 850000, earnoutMax: 100000 } });
  assert.match(c.issues[0], /1050000/);
  assert.equal(c.guaranteed, 950000);
  assert.equal(c.contingent, 100000);
  assert.throws(() => consideration({ price: 1, consideration: { deposit: 1 } }), /unknown/);
  assert.throws(() => consideration({ price: 0, consideration: {} }), /positive/);
});

test('level payment matches the standard formula', () => {
  // $100,000 at 6% over 120 months is $1,110.21
  assert.equal(Math.round(levelPayment(100000, 0.06, 120) * 100) / 100, 1110.21);
  assert.equal(levelPayment(1200, 0, 12), 100);
});

test('seller note with standby: accrued vs waived interest', () => {
  const a = sellerNote({ principal: 180000, annualRate: 0.07, years: 10, standbyMonths: 24, standbyInterest: 'accrue' });
  const n = sellerNote({ principal: 180000, annualRate: 0.07, years: 10, standbyMonths: 24, standbyInterest: 'none' });
  assert.equal(a.paymentMonths, 96);
  assert.ok(a.balanceAfterStandby > 180000 && a.balanceAfterStandby < 210000);
  assert.equal(n.balanceAfterStandby, 180000);
  assert.ok(a.monthlyPayment > n.monthlyPayment);
  assert.throws(() => sellerNote({ principal: 1, annualRate: 0.05, years: 1, standbyMonths: 12 }), /shorter/);
});

test('exclusivity end date and markdown summary', () => {
  assert.equal(addDays('2026-12-01', 60), '2027-01-30');
  const md = toMarkdown(summarize(terms));
  assert.match(md, /\$1,020,000 \(85% of price\)/);
  assert.match(md, /Exclusivity ends: 2027-01-30/);
  assert.match(md, /24 months of standby/);
  assert.doesNotMatch(md, /CHECK/);
});
