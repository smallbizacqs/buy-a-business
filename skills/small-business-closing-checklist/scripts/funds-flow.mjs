#!/usr/bin/env node
// Funds-flow check for a small-business closing: do sources equal uses, to the cent?
// Arithmetic only. The closing statement from the lender and lawyers is the one that counts.
//
// Usage: node funds-flow.mjs <funds-flow.json>
//
// Input JSON:
// {
//   "sources": [ { "label": "Senior loan", "kind": "loan", "amount": 1080000 },
//                { "label": "Seller note", "kind": "seller-note", "amount": 135000 },
//                { "label": "Buyer equity", "kind": "buyer-cash", "amount": 185000 } ],
//   "uses":    [ { "label": "Price paid at close", "amount": 1215000 },
//                { "label": "Seller note portion of price", "amount": 135000 },
//                { "label": "Closing costs", "amount": 30000 },
//                { "label": "Working-capital reserve", "amount": 20000 } ]
// }
// kind is one of: loan, seller-note, buyer-cash, investor, credit-line, other.
// Amounts are dollars (up to 2 decimals). Negative amounts are rejected; put credits on the other side.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const KINDS = ['loan', 'seller-note', 'buyer-cash', 'investor', 'credit-line', 'other'];
// Sources that arrive as money from the buyer's side at closing (wired), as opposed to paper (seller note)
// or money the lender funds directly.
const WIRED_BY_BUYER = new Set(['buyer-cash', 'investor']);

function toCents(n, where) {
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(`${where}: amount must be a number`);
  if (n < 0) throw new Error(`${where}: amount must not be negative`);
  const c = Math.round(n * 100);
  if (Math.abs(c - n * 100) > 1e-6) throw new Error(`${where}: amount has more than 2 decimals`);
  return c;
}

export function fundsFlow(input) {
  const sources = input?.sources ?? [];
  const uses = input?.uses ?? [];
  if (!Array.isArray(sources) || !Array.isArray(uses) || sources.length === 0 || uses.length === 0)
    throw new Error('need at least one source and one use');
  const src = sources.map((s, i) => {
    const where = `sources[${i}] ${s.label ?? ''}`.trim();
    if (!s.label) throw new Error(`${where}: label is required`);
    if (!KINDS.includes(s.kind)) throw new Error(`${where}: kind must be one of ${KINDS.join(', ')}`);
    return { label: s.label, kind: s.kind, cents: toCents(s.amount, where) };
  });
  const use = uses.map((u, i) => {
    const where = `uses[${i}] ${u.label ?? ''}`.trim();
    if (!u.label) throw new Error(`${where}: label is required`);
    return { label: u.label, cents: toCents(u.amount, where) };
  });
  const sum = (xs) => xs.reduce((a, x) => a + x.cents, 0);
  const totalSources = sum(src);
  const totalUses = sum(use);
  const byKind = Object.fromEntries(KINDS.map((k) => [k, sum(src.filter((s) => s.kind === k)) / 100]));
  return {
    totalSources: totalSources / 100,
    totalUses: totalUses / 100,
    difference: (totalSources - totalUses) / 100, // positive: sources exceed uses
    balanced: totalSources === totalUses,
    byKind,
    buyerSideWire: sum(src.filter((s) => WIRED_BY_BUYER.has(s.kind))) / 100,
    sourceShares: src.map((s) => ({ label: s.label, kind: s.kind, amount: s.cents / 100, shareOfSources: totalSources ? s.cents / totalSources : 0 })),
    uses: use.map((u) => ({ label: u.label, amount: u.cents / 100 })),
  };
}

const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export function report(r) {
  const lines = ['Sources'];
  for (const s of r.sourceShares) lines.push(`  ${s.label} (${s.kind}): ${usd(s.amount)}  ${(s.shareOfSources * 100).toFixed(1)}%`);
  lines.push(`  Total sources: ${usd(r.totalSources)}`, 'Uses');
  for (const u of r.uses) lines.push(`  ${u.label}: ${usd(u.amount)}`);
  lines.push(`  Total uses: ${usd(r.totalUses)}`);
  lines.push(r.balanced ? 'Balanced: yes' : `Balanced: NO. Sources minus uses = ${usd(r.difference)}. Ask the lender and lawyer; don't adjust numbers to force a balance.`);
  lines.push(`Buyer-side money to wire (buyer cash + investor): ${usd(r.buyerSideWire)}`);
  lines.push('Arithmetic only; the agreed closing statement governs. Verify wire instructions by phone.');
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node funds-flow.mjs <funds-flow.json>'); process.exit(2); }
  try {
    const r = fundsFlow(JSON.parse(readFileSync(file, 'utf8')));
    console.log(report(r));
    process.exit(r.balanced ? 0 : 1);
  } catch (e) { console.error(`error: ${e.message}`); process.exit(2); }
}
