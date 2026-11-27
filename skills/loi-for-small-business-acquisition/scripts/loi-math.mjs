#!/usr/bin/env node
// Arithmetic behind an LOI's economic terms: does the consideration add up to the price, what does
// each piece represent, what does a seller note cost per month, and when does exclusivity end.
// Plain Node, no dependencies, no network. It checks math; it does not judge terms.
//
// Usage: node loi-math.mjs terms.json
//   terms.json: { "price": 1200000,
//                 "consideration": { "buyerEquity": 120000, "seniorLoan": 900000, "sellerNote": 180000, "earnoutMax": 0, "rollover": 0 },
//                 "sellerNote": { "annualRate": 0.07, "years": 10, "standbyMonths": 24, "standbyInterest": "accrue" },
//                 "signDate": "2026-12-01", "exclusivityDays": 60 }
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

export function summarize(t) {
  const out = { consideration: consideration(t) };
  if (t.sellerNote && t.consideration.sellerNote) out.sellerNote = sellerNote({ principal: t.consideration.sellerNote, ...t.sellerNote });
  if (t.signDate && t.exclusivityDays) out.exclusivityEnds = addDays(t.signDate, t.exclusivityDays);
  return out;
}

export function toMarkdown(s) {
  const c = s.consideration;
  const fmt = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
  const rows = c.lines.map((l) => `| ${l.label} | ${fmt(l.amount)} | ${l.share}% |`);
  const lines = ['| Piece | Amount | Share of price |', '|---|---:|---:|', ...rows, `| **Total** | **${fmt(c.total)}** | |`, '',
    `Cash to the seller at closing: ${fmt(c.cashAtClose)} (${c.cashAtCloseShare}% of price). Contingent: ${fmt(c.contingent)}.`];
  if (s.sellerNote) lines.push(`Seller note: ${s.sellerNote.standbyMonths} months of standby, then ${fmt(s.sellerNote.monthlyPayment)} a month for ${s.sellerNote.paymentMonths} months (${fmt(s.sellerNote.annualPayment)} a year).`);
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
