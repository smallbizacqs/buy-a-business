#!/usr/bin/env node
// Compares offers that trade price against terms, and sizes a reprice from a diligence finding.
// Plain Node, no dependencies, no network. The discount rate and the probabilities are the user's
// assumptions; the script only does the arithmetic so two offers can be read on the same basis.
//
// Usage: node offer-compare.mjs offers.json
//   { "discountRate": 0.10,
//     "offers": [ { "name": "A: higher price", "cashAtClose": 1100000,
//                   "sellerNote": { "principal": 300000, "annualRate": 0.06, "years": 10, "standbyMonths": 24 },
//                   "earnout": { "max": 100000, "probability": 0.5, "yearsOut": 2 },
//                   "consulting": { "annual": 60000, "years": 1 } } ],
//     "reprice": { "price": 1500000, "sdeAtLoi": 500000, "sdeVerified": 440000, "oneTimeCosts": 25000 } }
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const round = (x) => Math.round(x * 100) / 100;

function notePayments({ principal, annualRate, years, standbyMonths = 0 }) {
  const n = Math.round(years * 12) - standbyMonths;
  if (n <= 0) throw new Error('seller note standby must be shorter than its term');
  const r = annualRate / 12;
  const bal = principal * (1 + r) ** standbyMonths; // interest accrues during standby
  const pmt = r === 0 ? bal / n : (bal * r) / (1 - (1 + r) ** -n);
  return Array.from({ length: n }, (_, i) => ({ month: standbyMonths + i + 1, amount: pmt }));
}

export function sellerView(offer, { discountRate = 0.1 } = {}) {
  const m = discountRate / 12;
  const pv = (amount, month) => amount / (1 + m) ** month;
  const cash = offer.cashAtClose ?? 0;
  let noteNominal = 0, notePv = 0;
  if (offer.sellerNote?.principal) for (const p of notePayments(offer.sellerNote)) { noteNominal += p.amount; notePv += pv(p.amount, p.month); }
  const e = offer.earnout ?? { max: 0, probability: 0, yearsOut: 0 };
  const earnoutExpected = (e.max ?? 0) * (e.probability ?? 0);
  const earnoutPv = pv(earnoutExpected, (e.yearsOut ?? 0) * 12);
  const c = offer.consulting ?? { annual: 0, years: 0 };
  let consultingNominal = 0, consultingPv = 0;
  for (let mo = 1; mo <= Math.round((c.years ?? 0) * 12); mo++) { consultingNominal += c.annual / 12; consultingPv += pv(c.annual / 12, mo); }
  const headline = cash + (offer.sellerNote?.principal ?? 0) + (e.max ?? 0);
  return {
    name: offer.name, headline: round(headline), cashAtClose: cash,
    cashAtCloseShare: headline ? round((cash / headline) * 100) : 0,
    sellerNoteNominal: round(noteNominal), sellerNotePv: round(notePv),
    earnoutMax: e.max ?? 0, earnoutExpected: round(earnoutExpected), earnoutPv: round(earnoutPv),
    consultingNominal: round(consultingNominal), consultingPv: round(consultingPv),
    expectedPvToSeller: round(cash + notePv + earnoutPv + consultingPv),
  };
}

export function compareOffers(offers, opts) {
  return offers.map((o) => sellerView(o, opts)).sort((a, b) => b.expectedPvToSeller - a.expectedPvToSeller);
}

// Keeps the multiple the parties agreed at the LOI and applies it to verified earnings; one-time
// costs (a repair, a past-due tax) come off dollar for dollar.
export function repriceFromFinding({ price, sdeAtLoi, sdeVerified, oneTimeCosts = 0 }) {
  if (!(price > 0 && sdeAtLoi > 0)) throw new Error('price and sdeAtLoi must be positive');
  const multiple = price / sdeAtLoi;
  const atSameMultiple = multiple * sdeVerified;
  const proposed = atSameMultiple - oneTimeCosts;
  return {
    multipleAtLoi: round(multiple), sdeChange: round(sdeVerified - sdeAtLoi), priceAtSameMultiple: round(atSameMultiple),
    oneTimeCosts, proposedPrice: round(proposed), reduction: round(price - proposed), reductionPct: round(((price - proposed) / price) * 100),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('usage: node offer-compare.mjs offers.json');
    const i = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const out = {};
    if (i.offers) out.offers = compareOffers(i.offers, { discountRate: i.discountRate ?? 0.1 });
    if (i.reprice) out.reprice = repriceFromFinding(i.reprice);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } catch (e) { console.error(e.message); process.exit(1); }
}
