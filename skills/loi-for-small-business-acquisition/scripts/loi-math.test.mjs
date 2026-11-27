import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consideration, levelPayment, sellerNote, addDays, summarize, toMarkdown, seniorLoan, noteCoverage } from './loi-math.mjs';

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

// Reference values computed the way sba-dscr-and-affordability/scripts/dscr.mjs does (monthly amortization):
// senior = price - note - equity + financed costs; a paying note is tested as amortizing over its term from closing.
const annual = (p, r, years) => levelPayment(p, r, years * 12) * 12;

test('senior loan follows the dscr convention: toward price + financed costs', () => {
  const t = { ...terms, financedCosts: 45000, seniorLoanTerms: { annualRate: 0.105, years: 10 } };
  const s = summarize(t);
  assert.equal(s.seniorLoan.towardPrice, 900000);
  assert.equal(s.seniorLoan.total, 945000);
  assert.ok(Math.abs(s.seniorLoan.annualDebtService - annual(945000, 0.105, 10)) < 1);
  assert.match(toMarkdown(s), /\$900,000 toward the price \+ \$45,000 of financed costs = \$945,000/);
  assert.match(toMarkdown(s), /convention sba-dscr-and-affordability uses/);
  // No financed costs: senior loan is just the part toward the price.
  assert.equal(seniorLoan(terms).total, 900000);
});

test('pieces that include financed costs get a specific hint', () => {
  const t = { price: 1000000, consideration: { buyerEquity: 100000, seniorLoan: 830000, sellerNote: 100000 }, financedCosts: 30000 };
  const s = summarize(t);
  assert.ok(s.consideration.issues.some((i) => /exactly the financed costs/.test(i)));
});

test('seller note counted for coverage matches the dscr model', () => {
  // Partial standby: dscr counts it as amortizing over the full term from closing; the higher post-standby payment is shown.
  const s = summarize({ ...terms, seniorLoanTerms: { annualRate: 0.105, years: 10 } });
  const cov = s.sellerNote.coverage;
  assert.ok(Math.abs(cov.annualForCoverage - annual(180000, 0.07, 10)) < 1);
  assert.ok(cov.postStandbyExtra > 0);
  assert.ok(Math.abs(cov.postStandbyExtra - (s.sellerNote.annualPayment - cov.annualForCoverage)) < 0.02);
  assert.ok(Math.abs(s.debtServiceForCoverage - (annual(900000, 0.105, 10) + annual(180000, 0.07, 10))) < 1);
  const md = toMarkdown(s);
  assert.match(md, /--other-debt-service \d+/);
  assert.match(md, /node scripts\/dscr\.mjs --price 1200000 --equity-amount 120000 --financed-costs 0 --rate 10\.5 --term 10 --note-amount 180000 --note-rate 7 --note-term 10 --ebitda/);
  // Interest-only: tested as amortizing over min(term, 10) years.
  const io = noteCoverage(180000, { annualRate: 0.07, years: 15, interestOnly: true });
  assert.ok(Math.abs(io.annualForCoverage - annual(180000, 0.07, 10)) < 1);
  assert.equal(io.actualAnnual, 12600);
  assert.equal(io.dscrFlag, '--note-interest-only');
  // Full standby: counts 0; payments start after the 7(a) loan is repaid.
  const fs = summarize({ ...terms, seniorLoanTerms: { annualRate: 0.105, years: 10 }, sellerNote: { annualRate: 0.07, years: 12, fullStandby: true } });
  assert.equal(fs.sellerNote.coverage.annualForCoverage, 0);
  assert.equal(fs.sellerNote.paymentMonths, 24);
  assert.match(toMarkdown(fs), /--note-standby/);
  assert.throws(() => noteCoverage(1, { annualRate: 0.05, years: 5, interestOnly: true, fullStandby: true }), /both/);
  // A standby as long as the loan should be marked full standby.
  const long = summarize({ ...terms, seniorLoanTerms: { annualRate: 0.105, years: 1 }, sellerNote: { annualRate: 0.07, years: 10, standbyMonths: 12 } });
  assert.match(toMarkdown(long), /CHECK: The standby lasts the whole 7\(a\) loan term/);
});

test('dscr command folds non-loan pieces into equity so the senior loan matches', () => {
  const t = { price: 1000000, consideration: { buyerEquity: 100000, otherCash: 50000, seniorLoan: 750000, sellerNote: 100000 }, financedCosts: 20000,
    seniorLoanTerms: { annualRate: 0.1, years: 10 }, sellerNote: { annualRate: 0.06, years: 10 } };
  const s = summarize(t);
  assert.match(s.dscrCommand.command, /--equity-amount 150000 --financed-costs 20000/);
  assert.equal(s.seniorLoan.total, 1000000 - 100000 - 150000 + 20000);
});
