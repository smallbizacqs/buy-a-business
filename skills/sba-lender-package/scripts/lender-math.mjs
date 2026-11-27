#!/usr/bin/env node
// Lender-process arithmetic: a closing timeline counted back from the target closing date, and a
// side-by-side of term sheets (monthly payment, annual debt service, fees, coverage).
// Plain Node, no dependencies, no network. The step lead times are planning placeholders, not rules:
// replace them with the turnaround each lender quotes. Coverage thresholds come from data/sources.
//
// Usage:
//   node lender-math.mjs timeline --closing 2027-03-15 [--today 2026-12-01] [--exclusivity-end 2027-02-28] [--steps steps.json]
//     steps.json: [ { "key": "approval", "daysBefore": 30, "label": "..." }, ... ] replaces DEFAULT_STEPS
//   node lender-math.mjs steps   prints DEFAULT_STEPS as JSON, to copy and edit with each lender's quoted turnaround
//   node lender-math.mjs compare term-sheets.json
//     { "ebitda": 420000, "otherAnnualDebtService": 24000, "threshold": 1.25,
//       "sheets": [ { "lender": "Lender A", "principal": 1100000, "annualRate": 0.0975, "years": 10, "fees": 15000 } ] }
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const round = (x) => Math.round(x * 100) / 100;

export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) throw new Error(`bad date "${date}"`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Days before closing. Placeholders for planning only; each lender's own timeline replaces them.
export const DEFAULT_STEPS = [
  { key: 'shortlist', daysBefore: 90, label: 'Lenders shortlisted; buyer package (personal financials, resume, tax returns) ready to send' },
  { key: 'package', daysBefore: 75, label: 'Full package to chosen lender: business financials, LOI, buyer documents, projections' },
  { key: 'term-sheet', daysBefore: 65, label: 'Term sheet signed; lender fee or deposit paid if any' },
  { key: 'third-party', daysBefore: 55, label: 'Third-party reports ordered (business valuation, lien and tax checks, any real-estate reports)' },
  { key: 'approval', daysBefore: 35, label: 'Credit approval and commitment letter received; conditions list in hand' },
  { key: 'pa-to-lender', daysBefore: 21, label: 'Purchase agreement draft and closing documents list to the lender' },
  { key: 'conditions', daysBefore: 7, label: 'Closing conditions cleared (insurance binders, lease, entity documents, equity in place)' },
  { key: 'closing', daysBefore: 0, label: 'Closing and funding' },
];

export function timeline({ closing, today = null, exclusivityEnd = null, steps = DEFAULT_STEPS }) {
  addDays(closing, 0);
  const rows = [...steps].sort((a, b) => b.daysBefore - a.daysBefore).map((s) => ({ ...s, date: addDays(closing, -s.daysBefore) }));
  const warnings = [];
  if (today) {
    const late = rows.filter((r) => r.date < today);
    if (late.length) warnings.push(`${late.length} step(s) were due before ${today}: ${late.map((r) => r.key).join(', ')}. Ask the lender whether ${closing} is still realistic.`);
  }
  if (exclusivityEnd && closing > exclusivityEnd) warnings.push(`Closing ${closing} is after exclusivity ends ${exclusivityEnd}; ask the seller for an extension in writing.`);
  return { closing, rows, warnings, note: 'Lead times are planning placeholders; replace them with each lender\'s quoted turnaround.' };
}

export function monthlyPayment(principal, annualRate, years) {
  const n = Math.round(years * 12);
  if (n <= 0) throw new Error('years must be positive');
  const r = annualRate / 12;
  return r === 0 ? principal / n : (principal * r) / (1 - (1 + r) ** -n);
}

export function compareSheets({ sheets, ebitda = null, otherAnnualDebtService = 0, threshold = null }) {
  return sheets.map((s) => {
    const m = monthlyPayment(s.principal, s.annualRate, s.years);
    const annual = m * 12;
    const out = { lender: s.lender, principal: s.principal, annualRate: s.annualRate, years: s.years, monthlyPayment: round(m), annualDebtService: round(annual), fees: s.fees ?? 0, totalCostOverTerm: round(annual * s.years + (s.fees ?? 0) - s.principal) };
    if (ebitda) {
      const combined = annual + otherAnnualDebtService;
      out.combinedAnnualDebtService = round(combined);
      out.coverage = round(ebitda / combined);
      if (threshold) out.meetsThreshold = ebitda / combined >= threshold;
    }
    return out;
  });
}

function opts(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
    else o._.push(argv[i]);
  }
  return o;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const o = opts(process.argv.slice(2));
    let out;
    if (o._[0] === 'timeline') out = timeline({ closing: o.closing, today: o.today ?? null, exclusivityEnd: o['exclusivity-end'] ?? null, steps: o.steps ? JSON.parse(readFileSync(o.steps, 'utf8')) : DEFAULT_STEPS });
    else if (o._[0] === 'steps') out = DEFAULT_STEPS;
    else if (o._[0] === 'compare') out = compareSheets(JSON.parse(readFileSync(o._[1], 'utf8')));
    else throw new Error('usage: node lender-math.mjs timeline --closing YYYY-MM-DD [--steps steps.json] | steps | compare term-sheets.json');
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } catch (e) { console.error(e.message); process.exit(1); }
}
