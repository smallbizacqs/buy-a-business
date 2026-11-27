#!/usr/bin/env node
// Debt service coverage (DSCR) and affordability scenarios for buying a small business.
// Plain Node, no dependencies, no network. Arithmetic only: it never decides whether a lender will lend.
//
// Usage (all money in dollars, rates in percent per year):
//   node dscr.mjs --ebitda 420000,380000 --rate 10.5 --term 10 \
//     --note-pct 10 --note-rate 6 --note-term 10 --equity-pct 10 \
//     --financed-costs 60000 --other-debt-service 0 --type initial-acquisition --price 1600000
//   Add --json for machine-readable output.
//
// --ebitda takes one or two fiscal-year values, most recent first. With two, the script shows both
// bases the SOP allows the lender to test on (last fiscal year-end, or the average of the last two).
// --sde S --owner-comp C can be given instead of --ebitda: EBITDA = SDE - market cost to replace the owner.
// --valuation V (the lender's business valuation, if known) adds the equity-gap and total-debt checks.

import { fileURLToPath } from 'node:url';

export const TARGETS = {
  // SOP 50 10 8.1, Appendix 15, Para. C.2 (data/sources/sba-sop-50-10-8-1-dsc-ratio.yaml)
  'initial-acquisition': 1.25,
  'business-expansion': 1.15,
  'owner-buyout': 1.25,
  'esop-cooperative': 1.25,
};

/** Annual payments on a fully amortizing loan with monthly payments. */
export function annualDebtService(principal, ratePct, termYears) {
  if (principal < 0) throw new Error('principal must be >= 0');
  if (!(termYears > 0)) throw new Error('term must be > 0 years');
  if (principal === 0) return 0;
  const n = Math.round(termYears * 12);
  const r = ratePct / 100 / 12;
  const monthly = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  return monthly * 12;
}

/** Annual debt service per dollar of principal (linear in principal at a fixed rate and term). */
export function serviceFactor(ratePct, termYears, interestOnly = false) {
  if (interestOnly) return ratePct / 100;
  return annualDebtService(1, ratePct, termYears);
}

/** Seller-note service per dollar for the coverage test.
 *  Full standby: no payments for the 7(a) loan's term (sba-sop-50-10-8-1-seller-debt-equity) -> 0.
 *  Interest-only and not on full standby: the lender applies an amortization of no more than 10 years
 *  (sba-sop-50-10-8-1-interest-only-debt), so coverage uses min(note term, 10) years, never interest only. */
export function noteCoverageFactor(p) {
  if (p.noteStandby) return 0;
  if (p.noteInterestOnly) return annualDebtService(1, p.noteRate, Math.min(p.noteTerm, 10));
  return serviceFactor(p.noteRate, p.noteTerm);
}

function num(v, name, { min = -Infinity } = {}) {
  const x = Number(v);
  if (!Number.isFinite(x)) throw new Error(`${name} must be a number (got "${v}")`);
  if (x < min) throw new Error(`${name} must be >= ${min}`);
  return x;
}

/** Normalize inputs; throws on anything missing or impossible. */
export function normalize(input) {
  const i = { ...input };
  let ebitdaYears;
  if (i.ebitda !== undefined) {
    ebitdaYears = (Array.isArray(i.ebitda) ? i.ebitda : String(i.ebitda).split(',')).map((v) => num(v, 'ebitda'));
  } else if (i.sde !== undefined && i.ownerComp !== undefined) {
    const sde = (Array.isArray(i.sde) ? i.sde : String(i.sde).split(',')).map((v) => num(v, 'sde'));
    const comp = num(i.ownerComp, 'owner-comp', { min: 0 });
    ebitdaYears = sde.map((s) => s - comp);
  } else {
    throw new Error('need --ebitda, or --sde together with --owner-comp (the market cost to replace the owner)');
  }
  if (ebitdaYears.length < 1 || ebitdaYears.length > 2) throw new Error('give one or two fiscal years of EBITDA, most recent first');
  const type = i.type ?? 'initial-acquisition';
  if (i.target === undefined && !(type in TARGETS)) throw new Error(`unknown --type "${type}"; use one of ${Object.keys(TARGETS).join(', ')} or pass --target`);
  const target = i.target !== undefined ? num(i.target, 'target', { min: 0.01 }) : TARGETS[type];
  if (i.rate === undefined || i.term === undefined) throw new Error('need --rate (senior loan, % per year) and --term (years)');
  const out = {
    ebitdaYears,
    type,
    target,
    targetSource: i.target !== undefined ? 'user-set' : 'SOP 50 10 8.1 App. 15 C.2',
    basis: i.basis ?? 'historical',
    rate: num(i.rate, 'rate', { min: 0 }),
    term: num(i.term, 'term', { min: 0.0833 }),
    notePct: num(i.notePct ?? 0, 'note-pct', { min: 0 }),
    noteAmount: num(i.noteAmount ?? 0, 'note-amount', { min: 0 }),
    noteRate: num(i.noteRate ?? 0, 'note-rate', { min: 0 }),
    noteTerm: num(i.noteTerm ?? 10, 'note-term', { min: 0.0833 }),
    noteInterestOnly: !!i.noteInterestOnly,
    noteStandby: !!i.noteStandby,
    equityPct: num(i.equityPct ?? 0, 'equity-pct', { min: 0 }),
    equityAmount: num(i.equityAmount ?? 0, 'equity-amount', { min: 0 }),
    financedCosts: num(i.financedCosts ?? 0, 'financed-costs', { min: 0 }),
    otherDebtService: num(i.otherDebtService ?? 0, 'other-debt-service', { min: 0 }),
    price: i.price !== undefined ? num(i.price, 'price', { min: 0 }) : undefined,
    valuation: i.valuation !== undefined ? num(i.valuation, 'valuation', { min: 0 }) : undefined,
  };
  if (out.noteStandby && out.noteInterestOnly) throw new Error('a note cannot be both on full standby and interest-only; pick one');
  if (!['historical', 'adjusted', 'projected'].includes(out.basis)) throw new Error('--basis must be historical, adjusted or projected');
  if (out.notePct + out.equityPct >= 100) throw new Error('note-pct + equity-pct must be under 100');
  return out;
}

/** Split a price into senior loan, seller note and equity. */
export function capitalStack(price, p) {
  const note = p.notePct / 100 * price + p.noteAmount;
  const equity = p.equityPct / 100 * price + p.equityAmount;
  const senior = price - note - equity + p.financedCosts;
  return { price, senior, note, equity, financedCosts: p.financedCosts };
}

/** Annual debt service and coverage at a given price and EBITDA. */
export function coverageAt(price, ebitda, p) {
  const s = capitalStack(price, p);
  if (s.senior < 0) throw new Error(`at a price of ${price} the note and equity exceed the price; the senior loan would be negative`);
  const seniorDs = annualDebtService(s.senior, p.rate, p.term);
  const noteDs = s.note * noteCoverageFactor(p);
  const totalDs = seniorDs + noteDs + p.otherDebtService;
  return { ...s, ebitda, seniorDs, noteDs, otherDs: p.otherDebtService, totalDs, dscr: totalDs > 0 ? ebitda / totalDs : Infinity, cashAfterDebt: ebitda - totalDs };
}

/** Highest price whose combined post-transaction debt service still meets the target coverage. */
export function maxPrice(ebitda, p) {
  const maxDs = ebitda / p.target;
  const fs = serviceFactor(p.rate, p.term);
  const fn = noteCoverageFactor(p);
  // totalDs(price) = fs * (price*(1 - np - ep) - nA - eA + costs) + fn * (np*price + nA) + other  (linear in price)
  const np = p.notePct / 100, ep = p.equityPct / 100;
  const slope = fs * (1 - np - ep) + fn * np;
  const intercept = fs * (p.financedCosts - p.noteAmount - p.equityAmount) + fn * p.noteAmount + p.otherDebtService;
  const price = (maxDs - intercept) / slope;
  if (!(price > 0)) return { price: 0, maxDs, reason: 'EBITDA does not cover the fixed debt service (other debt, financed costs) at the target coverage' };
  const at = coverageAt(price, ebitda, p);
  if (at.senior < 0) return { price: 0, maxDs, reason: 'the fixed note and equity amounts exceed the price this EBITDA supports' };
  return { price, maxDs, ...at };
}

/** EBITDA decline (as a fraction) at which coverage at this price falls to a given level. */
export function breakEvenDecline(price, ebitda, p, level) {
  const { totalDs } = coverageAt(price, ebitda, p);
  return 1 - (level * totalDs) / ebitda;
}

/** Checks against a business valuation: price above it must be equity; debt (senior + paying note) capped at it. */
export function valuationCheck(stack, p) {
  const debt = stack.senior + (p.noteStandby ? 0 : stack.note);
  return { priceOverValuation: Math.max(0, stack.price - p.valuation), debt, debtOverValuation: Math.max(0, debt - p.valuation) };
}

export function run(input) {
  const p = normalize(input);
  const bases = [{ label: 'Last fiscal year-end', ebitda: p.ebitdaYears[0] }];
  if (p.ebitdaYears.length === 2) bases.push({ label: 'Average of last two fiscal year-ends', ebitda: (p.ebitdaYears[0] + p.ebitdaYears[1]) / 2 });
  const warnings = [];
  if (p.basis === 'projected') warnings.push('Projected basis: under SOP 50 10 8.1 App. 15 C.2 the lender may not rely on projections to meet the coverage requirement, except for the acquisition of an owner-occupied special purpose property. Treat these rows as illustration only.');
  if (p.basis === 'adjusted') warnings.push('Adjusted basis: SOP 50 10 8.1 App. 15 C.2 lets the lender make prudent adjustments for savings the transaction will realize. Which adjustments count is the lender\'s call; list each one and its evidence.');
  if (p.noteStandby) warnings.push('Seller note payments are excluded because the note is entered as on full standby: under SOP 50 10 8.1 that means no payments of principal or interest for the term of the 7(a) loan (sba-sop-50-10-8-1-seller-debt-equity); interest may accrue and be paid after the 7(a) loan is repaid (sba-sop-50-10-8-1-standby-terms). If the note will pay anything sooner, rerun without --note-standby.');
  if (p.noteInterestOnly) warnings.push('Interest-only seller note: for coverage the lender must apply an amortization of no more than 10 years (sba-sop-50-10-8-1-interest-only-debt), so the note is tested as amortizing over ' + Math.min(p.noteTerm, 10) + ' years, not at its interest-only payment.');
  if (p.valuation !== undefined) warnings.push('Business valuation entered: ' + Math.round(p.valuation).toLocaleString('en-US') + '. Total debt, including seller debt not on full standby, is limited to the valuation (sba-sop-50-10-8-1-total-debt-cap), and any price above the valuation must be made up with equity (sba-sop-50-10-8-1-valuation-gap-equity). The SBA valuation is ordered by and prepared for the lender.');
  warnings.push('The lender also runs a global cash flow analysis, including affiliates, that must meet 1:1 (sba-sop-50-10-8-1-global-cash-flow), and the buyer\'s pay from the business must cover their obligations and living expenses (sba-sop-50-10-8-1-owner-compensation).');
  if (p.targetSource === 'user-set') warnings.push(`Target coverage ${p.target} was set by the user, not taken from the SOP table.`);
  warnings.push('Fixed-rate scenario. If the loan rate can float, rerun at higher rates to see the effect.');
  warnings.push('Cash after debt service is before income taxes, capital spending and any draw above the replacement salary already deducted to reach EBITDA.');
  warnings.push('Not modeled: loan size limits, the lender\'s own credit policy, the global cash flow test itself, guaranty fees unless included in financed costs, and the minimum equity the lender will require.');
  const results = bases.map((b) => {
    const r = { ...b, max: maxPrice(b.ebitda, p) };
    if (p.valuation !== undefined) r.max.valuationCheck = valuationCheck(r.max, p);
    if (p.price !== undefined) {
      r.atPrice = coverageAt(p.price, b.ebitda, p);
      if (p.valuation !== undefined) r.atPrice.valuationCheck = valuationCheck(r.atPrice, p);
      r.declineToTarget = breakEvenDecline(p.price, b.ebitda, p, p.target);
      r.declineTo1x = breakEvenDecline(p.price, b.ebitda, p, 1);
    }
    return r;
  });
  const sensitivity = [];
  if (p.price !== undefined) {
    const e0 = bases[0].ebitda;
    for (const dE of [0, -0.1, -0.2]) for (const dR of [0, 1, 2]) {
      const q = { ...p, rate: p.rate + dR };
      const c = coverageAt(p.price, e0 * (1 + dE), q);
      sensitivity.push({ ebitdaChange: dE, rateChange: dR, dscr: c.dscr, cashAfterDebt: c.cashAfterDebt });
    }
  }
  return { inputs: p, results, sensitivity, warnings };
}

const $ = (x) => (Number.isFinite(x) ? '$' + Math.round(x).toLocaleString('en-US') : String(x));
const x2 = (x) => (Number.isFinite(x) ? x.toFixed(2) + 'x' : 'n/a');
const pct = (x) => (x * 100).toFixed(1) + '%';

export function toMarkdown(out) {
  const p = out.inputs;
  const L = [];
  L.push('## Debt capacity (DSCR scenario, not a lender decision)', '');
  L.push(`Coverage basis: ${p.basis}. Target: ${p.target.toFixed(2)}:1 (${p.type}; source: ${p.targetSource}).`);
  L.push(`Senior loan: ${p.rate}% for ${p.term} years, monthly payments. Seller note: ${p.notePct ? p.notePct + '% of price' : ''}${p.noteAmount ? ' + ' + $(p.noteAmount) : ''}${!p.notePct && !p.noteAmount ? 'none' : ''} at ${p.noteRate}% over ${p.noteTerm} years${p.noteInterestOnly ? ' (interest only; tested as amortizing over ' + Math.min(p.noteTerm, 10) + ' years)' : ''}${p.noteStandby ? ' (full standby: payments excluded)' : ''}.`);
  L.push(`Equity: ${p.equityPct ? p.equityPct + '% of price' : ''}${p.equityAmount ? ' + ' + $(p.equityAmount) : ''}${!p.equityPct && !p.equityAmount ? 'none' : ''}. Costs financed in the senior loan: ${$(p.financedCosts)}. Other debt service after closing: ${$(p.otherDebtService)}/yr.`, '');
  L.push('| Basis | EBITDA | Max total debt service | Max price | Senior loan | Seller note | Equity |', '|---|---|---|---|---|---|---|');
  for (const r of out.results) L.push(`| ${r.label} | ${$(r.ebitda)} | ${$(r.max.maxDs)} | ${$(r.max.price)} | ${$(r.max.senior)} | ${$(r.max.note)} | ${$(r.max.equity)} |`);
  if (out.results[0].atPrice) {
    L.push('', `At the price of ${$(p.price)}:`, '', '| Basis | Total debt service | DSCR | Cash after debt service | EBITDA drop to reach target | EBITDA drop to reach 1.00x |', '|---|---|---|---|---|---|');
    for (const r of out.results) L.push(`| ${r.label} | ${$(r.atPrice.totalDs)} | ${x2(r.atPrice.dscr)} | ${$(r.atPrice.cashAfterDebt)} | ${pct(r.declineToTarget)} | ${pct(r.declineTo1x)} |`);
    L.push('', 'Sensitivity at that price (last fiscal year EBITDA):', '', '| EBITDA change | +0 pts rate | +1 pt rate | +2 pts rate |', '|---|---|---|---|');
    for (const dE of [0, -0.1, -0.2]) {
      const row = out.sensitivity.filter((s) => s.ebitdaChange === dE).map((s) => x2(s.dscr));
      L.push(`| ${dE === 0 ? 'as reported' : pct(dE)} | ${row.join(' | ')} |`);
    }
  }
  if (p.valuation !== undefined) {
    L.push('', `Against the business valuation of ${$(p.valuation)}:`, '', '| Row | Price above valuation (must be equity) | Debt counted | Debt above valuation |', '|---|---|---|---|');
    for (const r of out.results) {
      const v = r.max.valuationCheck;
      if (v) L.push(`| Max price, ${r.label} | ${$(v.priceOverValuation)} | ${$(v.debt)} | ${$(v.debtOverValuation)} |`);
      const a = r.atPrice?.valuationCheck;
      if (a) L.push(`| At ${$(p.price)}, ${r.label} | ${$(a.priceOverValuation)} | ${$(a.debt)} | ${$(a.debtOverValuation)} |`);
    }
  }
  L.push('', 'Notes:');
  for (const w of out.warnings) L.push(`- ${w}`);
  return L.join('\n');
}

const FLAG = {
  '--ebitda': 'ebitda', '--sde': 'sde', '--owner-comp': 'ownerComp', '--rate': 'rate', '--term': 'term', '--target': 'target', '--type': 'type',
  '--basis': 'basis', '--note-pct': 'notePct', '--note-amount': 'noteAmount', '--note-rate': 'noteRate', '--note-term': 'noteTerm',
  '--equity-pct': 'equityPct', '--equity-amount': 'equityAmount', '--financed-costs': 'financedCosts',
  '--other-debt-service': 'otherDebtService', '--price': 'price', '--valuation': 'valuation',
};
const BOOL = { '--note-interest-only': 'noteInterestOnly', '--note-standby': 'noteStandby', '--json': 'json' };

export function parseArgs(argv) {
  const o = {};
  for (let k = 0; k < argv.length; k++) {
    const a = argv[k];
    if (BOOL[a]) { o[BOOL[a]] = true; continue; }
    if (!FLAG[a]) throw new Error(`unknown flag ${a}`);
    if (argv[k + 1] === undefined) throw new Error(`${a} needs a value`);
    o[FLAG[a]] = argv[++k];
  }
  return o;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const out = run(args);
    console.log(args.json ? JSON.stringify(out, null, 2) : toMarkdown(out));
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(1);
  }
}
