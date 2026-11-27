import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annualDebtService, noteCoverageFactor, valuationCheck, normalize, coverageAt, maxPrice, breakEvenDecline, run, toMarkdown, parseArgs, TARGETS, capitalStack, MAX_7A_LOAN } from './dscr.mjs';

const close = (a, b, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('amortizing payment matches the standard formula', () => {
  // $100,000 at 10% for 10 years: $1,321.51 a month.
  close(annualDebtService(100000, 10, 10), 1321.507 * 12, 0.1);
  // zero rate: straight-line
  close(annualDebtService(120000, 0, 10), 12000, 1e-9);
  assert.equal(annualDebtService(0, 10, 10), 0);
});

test('SOP targets: 1.25 for acquisitions and buyouts, 1.15 for business expansion', () => {
  assert.equal(TARGETS['initial-acquisition'], 1.25);
  assert.equal(TARGETS['business-expansion'], 1.15);
  assert.equal(TARGETS['owner-buyout'], 1.25);
  assert.equal(normalize({ ebitda: 1, rate: 10, term: 10, type: 'business-expansion' }).target, 1.15);
});

test('coverage at the max price equals the target (senior only)', () => {
  const p = normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10 });
  const m = maxPrice(400000, p);
  close(m.totalDs, 400000 / 1.25, 0.01);
  close(m.dscr, 1.25, 1e-9);
  close(m.senior, m.price * 0.9, 0.01);
});

test('seller note payments are part of combined post-transaction debt service', () => {
  const base = { ebitda: 400000, rate: 10, term: 10, equityPct: 10 };
  const withNote = normalize({ ...base, notePct: 10, noteRate: 6, noteTerm: 10 });
  const standby = normalize({ ...base, notePct: 10, noteRate: 6, noteTerm: 10, noteStandby: true });
  const mNote = maxPrice(400000, withNote);
  const mStandby = maxPrice(400000, standby);
  close(mNote.dscr, 1.25, 1e-9);
  assert.ok(mNote.noteDs > 0);
  assert.equal(mStandby.noteDs, 0);
  assert.ok(mStandby.price > mNote.price, 'excluding note payments raises the max price');
});

test('other debt service and financed costs reduce the max price', () => {
  const a = maxPrice(400000, normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10 }));
  const b = maxPrice(400000, normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, otherDebtService: 20000 }));
  const c = maxPrice(400000, normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, financedCosts: 50000 }));
  assert.ok(b.price < a.price);
  close(c.price, a.price - 50000 / 0.9, 1);
  close(b.dscr, 1.25, 1e-9);
});

test('fixed equity and note amounts solve correctly', () => {
  const p = normalize({ ebitda: 300000, rate: 11, term: 10, equityAmount: 150000, noteAmount: 100000, noteRate: 7, noteTerm: 5 });
  const m = maxPrice(300000, p);
  close(m.dscr, 1.25, 1e-9);
  close(m.senior, m.price - 250000, 0.01);
});

test('two fiscal years give last-year and two-year-average bases', () => {
  const out = run({ ebitda: '420000,380000', rate: 10, term: 10, equityPct: 10, price: 1500000 });
  assert.equal(out.results.length, 2);
  assert.equal(out.results[1].ebitda, 400000);
  assert.ok(out.results[0].max.price > out.results[1].max.price);
  assert.equal(out.sensitivity.length, 9);
});

test('SDE minus owner replacement cost becomes EBITDA', () => {
  const p = normalize({ sde: 500000, ownerComp: 100000, rate: 10, term: 10 });
  assert.deepEqual(p.ebitdaYears, [400000]);
});

test('break-even decline: coverage hits the level exactly', () => {
  const p = normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10 });
  const d = breakEvenDecline(1200000, 400000, p, 1);
  close(coverageAt(1200000, 400000 * (1 - d), p).dscr, 1, 1e-9);
});

test('projected basis and standby produce warnings; markdown never says eligible', () => {
  const out = run({ ebitda: 400000, rate: 10, term: 10, basis: 'projected', notePct: 10, noteRate: 6, noteStandby: true, price: 1000000 });
  assert.ok(out.warnings.some((w) => /special purpose property/.test(w)));
  assert.ok(out.warnings.some((w) => /standby/.test(w)));
  const md = toMarkdown(out);
  assert.match(md, /not a lender decision/);
  assert.doesNotMatch(md, /eligible/i);
});

test('rejects missing or impossible inputs', () => {
  assert.throws(() => normalize({ rate: 10, term: 10 }), /ebitda/);
  assert.throws(() => normalize({ ebitda: 1, term: 10 }), /rate/);
  assert.throws(() => normalize({ ebitda: 1, rate: 10, term: 10, notePct: 60, equityPct: 40 }), /under 100/);
  assert.throws(() => normalize({ ebitda: '1,2,3', rate: 10, term: 10 }), /one or two/);
  assert.throws(() => normalize({ ebitda: 1, rate: 10, term: 10, type: 'nope' }), /unknown --type/);
  assert.throws(() => parseArgs(['--bogus', '1']), /unknown flag/);
});

test('EBITDA too small for fixed obligations returns zero with a reason', () => {
  const m = maxPrice(10000, normalize({ ebitda: 10000, rate: 10, term: 10, otherDebtService: 50000 }));
  assert.equal(m.price, 0);
  assert.match(m.reason, /does not cover/);
});

test('interest-only note is tested as amortizing over at most 10 years (SOP interest-only rule)', () => {
  const io = normalize({ ebitda: 400000, rate: 10, term: 10, notePct: 10, noteRate: 6, noteTerm: 15, noteInterestOnly: true });
  close(noteCoverageFactor(io), annualDebtService(1, 6, 10), 1e-12);
  const io5 = normalize({ ebitda: 400000, rate: 10, term: 10, notePct: 10, noteRate: 6, noteTerm: 5, noteInterestOnly: true });
  close(noteCoverageFactor(io5), annualDebtService(1, 6, 5), 1e-12);
  assert.ok(run({ ebitda: 400000, rate: 10, term: 10, notePct: 10, noteRate: 6, noteInterestOnly: true }).warnings.some((w) => /no more than 10 years/.test(w)));
  assert.throws(() => normalize({ ebitda: 1, rate: 10, term: 10, noteStandby: true, noteInterestOnly: true }), /both/);
});

test('valuation checks: price above valuation is equity; paying debt capped at valuation', () => {
  const p = normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, notePct: 10, noteRate: 6, valuation: 1000000 });
  const v = valuationCheck(coverageAt(1200000, 400000, p), p);
  assert.equal(v.priceOverValuation, 200000);
  close(v.debt, 1080000, 0.01);
  close(v.debtOverValuation, 80000, 0.01);
  const ps = normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, notePct: 10, noteRate: 6, noteStandby: true, valuation: 1000000 });
  close(valuationCheck(coverageAt(1000000, 400000, ps), ps).debt, 800000, 0.01);
  const md = toMarkdown(run({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, valuation: 1000000, price: 1200000 }));
  assert.match(md, /Against the business valuation/);
  assert.match(md, /total-debt-cap/);
});

test('--equity-of project applies the equity share to price + financed costs, and max price still hits the target', () => {
  const p = normalize({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, equityOf: 'project', financedCosts: 100000 });
  const st = capitalStack(1000000, p);
  close(st.equity, 110000, 1e-6);
  close(st.senior, 990000, 1e-6);
  close(st.equityShareOfProject, 0.1, 1e-12);
  const m = maxPrice(400000, p);
  close(m.dscr, 1.25, 1e-9);
  close(m.equity, 0.1 * (m.price + 100000), 0.01);
  assert.throws(() => normalize({ ebitda: 1, rate: 10, term: 10, equityOf: 'bogus' }), /equity-of/);
});

test('equity below 10% of project cost at the price is flagged for an initial acquisition', () => {
  const out = run({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, financedCosts: 100000, price: 1000000 });
  assert.ok(out.warnings.some((w) => /9\.1% of project cost/.test(w) && /equity-project-cost/.test(w)));
  const ok = run({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, equityOf: 'project', financedCosts: 100000, price: 1000000 });
  assert.ok(!ok.warnings.some((w) => /of project cost \(price/.test(w)));
});

test('senior loan above the 7(a) maximum is warned', () => {
  assert.equal(MAX_7A_LOAN, 5000000);
  const out = run({ ebitda: 2000000, rate: 10, term: 10, equityPct: 10, price: 7000000 });
  assert.ok(out.results[0].atPrice.overMaxLoan);
  assert.ok(out.warnings.some((w) => /Standard 7\(a\) loan is \$5,000,000/.test(w) && /max-loan/.test(w)));
  assert.match(toMarkdown(out), /over the 7\(a\) maximum/);
  assert.ok(!run({ ebitda: 300000, rate: 10, term: 10, equityPct: 10, price: 1000000 }).warnings.some((w) => /max-loan/.test(w)));
});

test('coverage already below target prints "already below target", not a negative drop', () => {
  const md = toMarkdown(run({ ebitda: 200000, rate: 10, term: 10, equityPct: 10, price: 2000000 }));
  assert.match(md, /already below target/);
  assert.match(md, /already below 1\.00x/);
  assert.match(md, /\| already below target \| already below 1\.00x \|/);
});

test('earnings case is recorded; seller-claimed labels every output', () => {
  const out = run({ ebitda: 400000, rate: 10, term: 10, equityPct: 10, price: 1000000, earningsCase: 'seller-claimed' });
  assert.equal(out.inputs.earningsCase, 'seller-claimed');
  assert.ok(out.results.every((r) => /seller-claimed SDE/.test(r.label)));
  const md = toMarkdown(out);
  assert.match(md, /DSCR scenario on seller-claimed SDE/);
  assert.match(md, /Earnings case: seller-claimed \(add-backs untested\)/);
  assert.match(toMarkdown(run({ ebitda: 400000, rate: 10, term: 10, earningsCase: 'supported' })), /Earnings case: supported\./);
  assert.match(toMarkdown(run({ ebitda: 400000, rate: 10, term: 10 })), /Earnings case: not stated/);
});

test('trailing-twelve-month period labels the row and warns', () => {
  const out = run({ ebitda: 400000, rate: 10, term: 10, period: 'ttm' });
  assert.equal(out.results.length, 1);
  assert.match(out.results[0].label, /Trailing twelve months/);
  assert.ok(out.warnings.some((w) => /interim-statements/.test(w)));
  assert.throws(() => normalize({ ebitda: '1,2', rate: 10, term: 10, period: 'ttm' }), /single/);
  assert.throws(() => normalize({ ebitda: 1, rate: 10, term: 10, period: 'week' }), /--period/);
});

test('buy-box mode: hypothetical levels, SDE bridged by owner pay, no price allowed', () => {
  const out = run({ sdeLevels: '400000,700000', ownerComp: 120000, rate: 10, term: 10, equityPct: 10 });
  assert.deepEqual(out.inputs.ebitdaYears, [280000, 580000]);
  assert.equal(out.results.length, 2);
  out.results.forEach((r) => close(r.max.dscr, 1.25, 1e-9));
  assert.match(toMarkdown(out), /Buy-box debt capacity/);
  assert.ok(out.warnings.some((w) => /Nothing here is written to deals/.test(w)));
  assert.equal(run({ ebitdaLevels: '300000,500000,800000', rate: 10, term: 10 }).results.length, 3);
  assert.throws(() => normalize({ ebitdaLevels: '300000', rate: 10, term: 10, price: 1 }), /no --price/);
  assert.throws(() => normalize({ sdeLevels: '300000', rate: 10, term: 10 }), /owner-comp/);
  assert.deepEqual(parseArgs(['--ebitda-levels', '1,2', '--equity-of', 'project', '--earnings-case', 'supported', '--period', 'ttm']),
    { ebitdaLevels: '1,2', equityOf: 'project', earningsCase: 'supported', period: 'ttm' });
});
