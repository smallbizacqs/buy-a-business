import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sopCheck, monthlyPayment, toMarkdown } from './sop-check.mjs';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);
const byId = (res, id) => res.checks.find((c) => c.id === id);

const deal = {
  transactionType: 'initial-acquisition', loanNumberDate: '2026-11-20',
  businessPurchasePrice: 2_000_000, closingCosts: 80_000, workingCapital: 120_000,
  valuation: 2_000_000,
  equity: { unborrowedCash: 120_000, standbySellerNote: 100_000 },
  sba: { principal: 1_980_000, ratePct: 10.5, amortYears: 10 },
  sellerNote: { principal: 100_000, ratePct: 6, years: 10, fullStandbyForLoanTerm: true },
  ebitdaLastFye: 420_000, ebitdaPriorFye: 380_000,
  sellerConsultingMonths: 12, leaseTermYearsInclRenewals: 15,
};

test('equity: 10% of total project cost, limited sources capped at half', () => {
  const res = sopCheck(deal);
  assert.equal(res.projectCost, 2_200_000);
  near(res.requiredEquity, 220_000);
  assert.equal(byId(res, 'C3').result, 'consistent');
  assert.equal(byId(res, 'C4').result, 'consistent');
  const short = sopCheck({ ...deal, equity: { unborrowedCash: 80_000, standbySellerNote: 140_000 } });
  assert.equal(byId(short, 'C4').result, 'conflicts');
  assert.equal(byId(short, 'C3').result, 'conflicts', 'only $110K of the $140K standby note counts');
});

test('seller note counted as equity must be on full standby', () => {
  const res = sopCheck({ ...deal, sellerNote: { ...deal.sellerNote, fullStandbyForLoanTerm: false } });
  assert.equal(byId(res, 'C6').result, 'conflicts');
});

test('coverage = EBITDA / combined debt service against 1.25 for an initial acquisition', () => {
  const res = sopCheck(deal);
  const ds = monthlyPayment(1_980_000, 10.5, 120) * 12;
  const c = byId(res, 'C13');
  assert.match(c.dealFact, new RegExp((420_000 / ds).toFixed(2)));
  assert.equal(c.result, 'consistent');
  const weak = sopCheck({ ...deal, ebitdaLastFye: 300_000, ebitdaPriorFye: 280_000 });
  assert.equal(byId(weak, 'C13').result, 'conflicts');
});

test('business expansion uses 1.15', () => {
  const ds = monthlyPayment(1_980_000, 10.5, 120) * 12;
  const res = sopCheck({ ...deal, transactionType: 'business-expansion', ebitdaLastFye: ds * 1.2, ebitdaPriorFye: null });
  assert.equal(byId(res, 'C13').result, 'consistent');
  assert.equal(byId(res, 'C3').result, 'lender-call');
});

test('price above valuation and debt above valuation conflict', () => {
  const res = sopCheck({ ...deal, valuation: 1_800_000 });
  assert.equal(byId(res, 'C8').result, 'conflicts');
  assert.equal(byId(res, 'C9').result, 'conflicts');
});

test('QoE trigger at $3M, loan cap, amortization, earnout, consultant period, lease', () => {
  const res = sopCheck({ ...deal, businessPurchasePrice: 3_000_000, sba: { principal: 5_100_000, ratePct: 10, amortYears: 12, balloon: true }, earnout: true, sellerConsultingMonths: 30, leaseTermYearsInclRenewals: 8 });
  assert.equal(byId(res, 'C10').result, 'lender-call');
  assert.equal(byId(res, 'C11').result, 'conflicts');
  assert.equal(byId(res, 'C12').result, 'conflicts');
  assert.equal(byId(res, 'C14').result, 'conflicts');
  assert.equal(byId(res, 'C17').result, 'conflicts');
  assert.equal(byId(res, 'C18').result, 'conflicts');
});

test('missing facts are reported, not guessed', () => {
  const res = sopCheck({ transactionType: 'initial-acquisition' });
  assert.equal(byId(res, 'C1').result, 'missing-fact');
  assert.equal(byId(res, 'C3').result, 'missing-fact');
  assert.equal(byId(res, 'C8').result, 'missing-fact');
  assert.equal(byId(res, 'C13').result, 'missing-fact');
});

test('an earlier loan number date flags a different SOP', () => {
  assert.equal(byId(sopCheck({ ...deal, loanNumberDate: '2026-09-15' }), 'C1').result, 'lender-call');
});

test('output never calls the deal eligible', () => {
  const md = toMarkdown(sopCheck(deal));
  assert.doesNotMatch(md, /\bis eligible\b|SBA-eligible/i);
  assert.match(md, /not an eligibility decision/);
});
