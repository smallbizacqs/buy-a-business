#!/usr/bin/env node
// Arithmetic behind an LOI's economic terms: does the consideration add up to the price, what does
// each piece represent, what does a seller note cost per month, and when does exclusivity end.
// Plain Node, no dependencies, no network. It checks math; it does not judge terms.
//
// Usage: node loi-math.mjs terms.json [--json]
//   terms.json: { "price": 1200000,
//                 "consideration": { "buyerEquity": 120000, "seniorLoan": 900000, "sellerNote": 180000, "earnoutMax": 0, "rollover": 0 },
//                 "financedCosts": 45000,
//                 "seniorLoanTerms": { "annualRate": 0.105, "years": 10 },
//                 "sellerNote": { "annualRate": 0.07, "years": 10, "standbyMonths": 24, "standbyInterest": "accrue" },
//                 "signDate": "2026-12-01", "exclusivityDays": 60 }
//   Rates are decimals (0.07 = 7% a year); payments are monthly.
//
// Conventions, matched to sba-dscr-and-affordability (scripts/dscr.mjs) so the two skills give the same numbers:
//   - consideration.seniorLoan is the part of the loan paid toward the PRICE. Costs financed in the same loan
//     (closing costs, fees, working capital) go in "financedCosts", outside the price. The senior loan amount is
//     price - seller note - buyer equity - other non-loan pieces + financed costs, which is how dscr.mjs builds it.
//   - Seller note payments counted for coverage: a note on full standby (no payments of principal or interest
//     for the 7(a) loan's term) counts 0; an interest-only note is tested as amortizing over its term or 10 years,
//     whichever is shorter; any other note is tested as amortizing over its full term from closing. A partial
//     standby (payments start before the 7(a) loan is repaid) is not full standby: dscr.mjs counts it as
//     amortizing from closing, so this script also shows the higher payment once the standby ends.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const round = (x) => Math.round(x * 100) / 100;
const PIECES = { buyerEquity: 'Buyer cash (equity) at closing', seniorLoan: 'Senior loan proceeds at closing', otherCash: 'Other cash at closing', sellerNote: 'Seller note (paid over time)', earnoutMax: 'Earnout (maximum, contingent)', rollover: 'Seller rollover equity (value)' };
const AT_CLOSE = ['buyerEquity', 'seniorLoan', 'otherCash'];

export function consideration({ price, consideration: c }) {
  if (!(price > 0)) throw new Error('price must be a positive number');
  const unknown = Object.keys(c).filter((k) => !PIECES[k]);
  if (unknown.length) throw new Error(`unknown consideration pieces: ${unknown.join(', ')}`);
  const lines = Object.entries(c).filter(([, v]) => v).map(([k, v]) => ({ key: k, label: PIECES[k], amount: v, share: round((v / price) * 100) }));
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const cashAtClose = AT_CLOSE.reduce((s, k) => s + (c[k] ?? 0), 0);
  const contingent = c.earnoutMax ?? 0;
  const issues = [];
  if (round(total) !== round(price)) issues.push(`Pieces add up to ${round(total)}, not the price ${price} (difference ${round(total - price)}).`);
  return { price, lines, total: round(total), cashAtClose: round(cashAtClose), cashAtCloseShare: round((cashAtClose / price) * 100), guaranteed: round(total - contingent - (c.rollover ?? 0)), contingent, issues };
}

// Level monthly payment on an amortizing loan.
export function levelPayment(principal, annualRate, months) {
  if (months <= 0) throw new Error('term must be at least one month');
  const r = annualRate / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - (1 + r) ** -months);
}

// Seller note with optional standby months at the start (no payments). During standby interest either
// accrues onto the principal ('accrue') or is waived ('none'). Payments then amortize over the remaining term.
export function sellerNote({ principal, annualRate, years, standbyMonths = 0, standbyInterest = 'accrue' }) {
  if (!['accrue', 'none'].includes(standbyInterest)) throw new Error('standbyInterest must be accrue or none');
  const months = Math.round(years * 12);
  if (standbyMonths >= months) throw new Error('standby must be shorter than the note term');
  const r = annualRate / 12;
  const startBalance = standbyInterest === 'accrue' ? principal * (1 + r) ** standbyMonths : principal;
  const payMonths = months - standbyMonths;
  const monthly = levelPayment(startBalance, annualRate, payMonths);
  const totalPaid = monthly * payMonths;
  return { principal, annualRate, months, standbyMonths, standbyInterest, balanceAfterStandby: round(startBalance), monthlyPayment: round(monthly), annualPayment: round(monthly * 12), paymentMonths: payMonths, totalPaid: round(totalPaid), totalInterest: round(totalPaid - principal) };
}

export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) throw new Error(`bad date "${date}"`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Senior loan amount, built the way sba-dscr-and-affordability builds it.
export function seniorLoan(t, c) {
  const financedCosts = t.financedCosts ?? 0;
  if (!(financedCosts >= 0)) throw new Error('financedCosts must be zero or a positive number');
  const towardPrice = t.consideration.seniorLoan ?? 0;
  const out = { towardPrice, financedCosts, total: round(towardPrice + financedCosts),
    convention: 'Senior loan = price − seller note − buyer equity − other non-loan pieces + costs financed in the loan (the convention sba-dscr-and-affordability uses).' };
  if (t.seniorLoanTerms) {
    const { annualRate, years } = t.seniorLoanTerms;
    if (!(annualRate >= 0) || !(years > 0)) throw new Error('seniorLoanTerms needs annualRate (decimal) and years');
    out.annualRate = annualRate; out.years = years;
    out.monthlyPayment = round(levelPayment(out.total, annualRate, Math.round(years * 12)));
    out.annualDebtService = round(out.monthlyPayment * 12);
  }
  return out;
}

// What sba-dscr-and-affordability counts for the seller note in its coverage test, beside what the note actually pays.
export function noteCoverage(principal, n, senior) {
  const { annualRate, years, standbyMonths = 0, interestOnly = false, fullStandby = false } = n;
  if (fullStandby && interestOnly) throw new Error('a note cannot be both on full standby and interest-only; pick one');
  if (fullStandby) return { model: 'full standby: no payments of principal or interest for the 7(a) loan\'s term', annualForCoverage: 0, dscrFlag: '--note-standby' };
  if (interestOnly) {
    const testYears = Math.min(years, 10);
    return { model: `interest only, tested as amortizing over ${testYears} years`, annualForCoverage: round(levelPayment(principal, annualRate, Math.round(testYears * 12)) * 12), actualAnnual: round(principal * annualRate), dscrFlag: '--note-interest-only' };
  }
  const out = { model: `amortizing over its ${years}-year term from closing`, annualForCoverage: round(levelPayment(principal, annualRate, Math.round(years * 12)) * 12), dscrFlag: '' };
  if (standbyMonths > 0) out.model += `; a ${standbyMonths}-month standby that ends before the 7(a) loan is repaid is not full standby`;
  if (senior?.years && standbyMonths >= Math.round(senior.years * 12)) out.hint = 'The standby lasts the whole 7(a) loan term: if no principal or interest is paid until the loan is repaid, set "fullStandby": true.';
  return out;
}

export function summarize(t) {
  const out = { consideration: consideration(t) };
  out.seniorLoan = seniorLoan(t, out.consideration);
  const c = t.consideration;
  if (t.sellerNote && c.sellerNote) {
    const n = t.sellerNote;
    if (n.fullStandby) {
      const loanMonths = t.seniorLoanTerms ? Math.round(t.seniorLoanTerms.years * 12) : undefined;
      out.sellerNote = { principal: c.sellerNote, annualRate: n.annualRate, months: Math.round(n.years * 12), fullStandby: true, standbyMonths: loanMonths };
      if (loanMonths !== undefined && Math.round(n.years * 12) > loanMonths) Object.assign(out.sellerNote, sellerNote({ principal: c.sellerNote, annualRate: n.annualRate, years: n.years, standbyMonths: loanMonths, standbyInterest: n.standbyInterest ?? 'accrue' }), { fullStandby: true });
    } else if (n.interestOnly) {
      const months = Math.round(n.years * 12);
      out.sellerNote = { principal: c.sellerNote, annualRate: n.annualRate, months, interestOnly: true, standbyMonths: 0, monthlyPayment: round(c.sellerNote * n.annualRate / 12), annualPayment: round(c.sellerNote * n.annualRate), paymentMonths: months, balloon: c.sellerNote };
    } else {
      out.sellerNote = sellerNote({ principal: c.sellerNote, ...n });
    }
    out.sellerNote.coverage = noteCoverage(c.sellerNote, n, t.seniorLoanTerms);
    const cov = out.sellerNote.coverage;
    if (!n.fullStandby && !n.interestOnly && (n.standbyMonths ?? 0) > 0 && out.sellerNote.annualPayment > cov.annualForCoverage) {
      cov.postStandbyExtra = round(out.sellerNote.annualPayment - cov.annualForCoverage);
    }
  }
  if (t.seniorLoanTerms) {
    out.debtServiceForCoverage = round(out.seniorLoan.annualDebtService + (out.sellerNote?.coverage.annualForCoverage ?? 0));
    const nonLoan = (c.buyerEquity ?? 0) + (c.otherCash ?? 0) + (c.rollover ?? 0) + (c.earnoutMax ?? 0);
    const n = t.sellerNote;
    const parts = ['node scripts/dscr.mjs', `--price ${t.price}`, `--equity-amount ${nonLoan}`, `--financed-costs ${out.seniorLoan.financedCosts}`,
      `--rate ${+(t.seniorLoanTerms.annualRate * 100).toFixed(4)}`, `--term ${t.seniorLoanTerms.years}`];
    if (c.sellerNote && n) parts.push(`--note-amount ${c.sellerNote}`, `--note-rate ${+(n.annualRate * 100).toFixed(4)}`, `--note-term ${n.years}`, out.sellerNote.coverage.dscrFlag);
    out.dscrCommand = { command: parts.filter(Boolean).join(' ') + ' --ebitda <FY1>,<FY2> --earnings-case <case>', equityAmountIncludes: 'buyer equity + other cash + rollover + earnout, so dscr.mjs builds the same senior loan' };
  }
  if (t.signDate && t.exclusivityDays) out.exclusivityEnds = addDays(t.signDate, t.exclusivityDays);
  const fc = t.financedCosts ?? 0;
  if (fc > 0 && round(out.consideration.total - out.consideration.price) === round(fc)) out.consideration.issues.push('The pieces exceed the price by exactly the financed costs: enter only the part of the senior loan paid toward the price in consideration.seniorLoan; financedCosts adds the rest.');
  return out;
}

export function toMarkdown(s) {
  const c = s.consideration;
  const fmt = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
  const rows = c.lines.map((l) => `| ${l.label} | ${fmt(l.amount)} | ${l.share}% |`);
  const lines = ['| Piece | Amount | Share of price |', '|---|---:|---:|', ...rows, `| **Total** | **${fmt(c.total)}** | |`, '',
    `Cash to the seller at closing: ${fmt(c.cashAtClose)} (${c.cashAtCloseShare}% of price). Contingent: ${fmt(c.contingent)}.`];
  const sl = s.seniorLoan;
  lines.push('', `Senior loan: ${fmt(sl.towardPrice)} toward the price + ${fmt(sl.financedCosts)} of financed costs = ${fmt(sl.total)}. ${sl.convention}`);
  if (sl.annualDebtService !== undefined) lines.push(`Senior loan payments: ${fmt(sl.monthlyPayment)} a month (${fmt(sl.annualDebtService)} a year) at ${+(sl.annualRate * 100).toFixed(4)}% over ${sl.years} years.`);
  if (s.sellerNote) {
    const n = s.sellerNote;
    if (n.fullStandby) lines.push(`Seller note: full standby, no payments until the 7(a) loan is repaid${n.paymentMonths ? `, then ${fmt(n.monthlyPayment)} a month for ${n.paymentMonths} months` : ''}.`);
    else if (n.interestOnly) lines.push(`Seller note: interest only, ${fmt(n.monthlyPayment)} a month (${fmt(n.annualPayment)} a year) for ${n.paymentMonths} months, then ${fmt(n.balloon)} due at the end.`);
    else lines.push(`Seller note: ${n.standbyMonths} months of standby, then ${fmt(n.monthlyPayment)} a month for ${n.paymentMonths} months (${fmt(n.annualPayment)} a year).`);
    lines.push(`Seller note payments counted for coverage (as sba-dscr-and-affordability models it: ${n.coverage.model}): ${fmt(n.coverage.annualForCoverage)} a year.`);
    if (n.coverage.hint) lines.push(`CHECK: ${n.coverage.hint}`);
    if (n.coverage.postStandbyExtra) lines.push(`After the standby the note pays ${fmt(n.coverage.postStandbyExtra)} a year more than that. To test those years in sba-dscr-and-affordability, add it with --other-debt-service ${Math.round(n.coverage.postStandbyExtra)}.`);
  }
  if (s.debtServiceForCoverage !== undefined) lines.push(`Debt service counted for coverage: ${fmt(s.debtServiceForCoverage)} a year (senior loan + seller note as modeled above).`);
  if (s.dscrCommand) lines.push(`Same terms in sba-dscr-and-affordability: \`${s.dscrCommand.command}\` (--equity-amount = ${s.dscrCommand.equityAmountIncludes}).`);
  if (s.exclusivityEnds) lines.push(`Exclusivity ends: ${s.exclusivityEnds}.`);
  for (const i of c.issues) lines.push(`CHECK: ${i}`);
  return lines.join('\n') + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('usage: node loi-math.mjs terms.json [--json]');
    const s = summarize(JSON.parse(readFileSync(process.argv[2], 'utf8')));
    process.stdout.write(process.argv.includes('--json') ? JSON.stringify(s, null, 2) + '\n' : toMarkdown(s));
  } catch (e) { console.error(e.message); process.exit(1); }
}
