#!/usr/bin/env node
// Price range from earnings x multiples the USER supplies, with the asking-price gap and sensitivity.
// Plain Node, no dependencies, no network. It has no built-in "typical" multiples on purpose.
//
// Usage:
//   node valuation.mjs --measure SDE --earnings supported=265000,assumed=277000,claimed=310000 \
//     --multiples 2.5,3,3.5 --multiple-source "3 sold comps from broker, 2025" --asking 1100000 \
//     [--revenue 1400000 --revenue-multiples 0.6,0.8] [--assets 180000] [--financeable-max 950000] [--json]

import { fileURLToPath } from 'node:url';

function num(v, name) {
  const x = Number(String(v).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(x)) throw new Error(`${name}: "${v}" is not a number`);
  return x;
}

export function parseCases(s) {
  if (s === undefined || String(s).trim() === '') throw new Error('need --earnings, e.g. supported=265000 or supported=265000,claimed=310000');
  return String(s).split(',').map((part, i) => {
    const [k, v] = part.includes('=') ? part.split('=') : [i === 0 ? 'earnings' : `case${i + 1}`, part];
    return { label: k.trim(), earnings: num(v, `earnings ${k}`) };
  });
}

export function parseList(s, name) {
  if (s === undefined || String(s).trim() === '') return [];
  const xs = String(s).split(',').map((v) => num(v, name));
  if (xs.some((x) => x <= 0)) throw new Error(`${name} must be positive`);
  return [...xs].sort((a, b) => a - b);
}

export function value(input) {
  const measure = String(input.measure ?? '').toUpperCase();
  if (!['SDE', 'EBITDA'].includes(measure)) throw new Error('--measure must be SDE or EBITDA (multiples for one do not apply to the other)');
  const cases = parseCases(input.earnings);
  const multiples = parseList(input.multiples, 'multiples');
  const revenueMultiples = parseList(input.revenueMultiples, 'revenue-multiples');
  if (!multiples.length && !revenueMultiples.length) throw new Error('need --multiples (from comparable sales or another source the user names); this script has no default multiples');
  if (!input.multipleSource) throw new Error('need --multiple-source: where the multiples came from (comps, broker, appraisal, lender), so the range can be judged');
  const asking = input.asking !== undefined ? num(input.asking, 'asking') : undefined;
  const revenue = input.revenue !== undefined ? num(input.revenue, 'revenue') : undefined;
  if (revenueMultiples.length && revenue === undefined) throw new Error('--revenue-multiples needs --revenue');
  const warnings = [];
  for (const c of cases) if (c.earnings <= 0) warnings.push(`${c.label}: earnings are zero or negative; an earnings multiple gives no meaningful value. Look at assets or walk away.`);

  const grid = cases.map((c) => ({ ...c, prices: multiples.map((m) => ({ multiple: m, price: c.earnings * m })) }));
  const mid = multiples.length ? multiples[Math.floor((multiples.length - 1) / 2)] : undefined;
  const out = { measure, multipleSource: input.multipleSource, multiples, mid, cases, grid, warnings };

  if (asking !== undefined) {
    out.asking = asking;
    out.implied = cases.map((c) => ({ label: c.label, multiple: c.earnings > 0 ? asking / c.earnings : Infinity }));
    out.earningsNeeded = multiples.map((m) => ({ multiple: m, earnings: asking / m }));
    if (mid !== undefined) {
      const base = grid[0].prices.find((p) => p.multiple === mid).price;
      out.gap = { basis: `${cases[0].label} × ${mid}`, price: base, amount: asking - base, pct: base > 0 ? (asking - base) / base : Infinity };
      const hi = grid[0].prices[grid[0].prices.length - 1].price;
      if (asking > hi) warnings.push(`Asking price is above the top of the range on ${cases[0].label} earnings (${multiples[multiples.length - 1]}×). Ask what the seller is counting that you are not.`);
    }
  }
  if (multiples.length) {
    out.sensitivity = [-0.2, -0.1, 0, 0.1].map((d) => ({ change: d, prices: multiples.map((m) => ({ multiple: m, price: cases[0].earnings * (1 + d) * m })) }));
  }
  if (revenueMultiples.length) out.revenueGrid = revenueMultiples.map((m) => ({ multiple: m, price: revenue * m }));
  if (input.assets !== undefined) out.assets = num(input.assets, 'assets');
  if (input.financeableMax !== undefined) {
    out.financeableMax = num(input.financeableMax, 'financeable-max');
    if (asking !== undefined && asking > out.financeableMax) warnings.push('Asking price is above the highest price the debt coverage scenario supports; the gap must come from more equity, a seller note, or a lower price.');
  }
  return out;
}

const $ = (x) => (Number.isFinite(x) ? (x < 0 ? '-$' : '$') + Math.abs(Math.round(x)).toLocaleString('en-US') : 'n/a');
const mx = (x) => (Number.isFinite(x) ? x.toFixed(2) + '×' : 'n/a');

export function toMarkdown(o) {
  const L = ['## Valuation (a range under stated assumptions, not an appraisal)', ''];
  L.push(`Measure: ${o.measure}. Multiples used: ${o.multiples.map(mx).join(', ') || 'none'} (source: ${o.multipleSource}).`, '');
  if (o.multiples.length) {
    L.push(`| ${o.measure} case | Earnings | ${o.multiples.map(mx).join(' | ')} |`, `|---|---|${o.multiples.map(() => '---').join('|')}|`);
    for (const g of o.grid) L.push(`| ${g.label} | ${$(g.earnings)} | ${g.prices.map((p) => $(p.price)).join(' | ')} |`);
  }
  if (o.asking !== undefined) {
    L.push('', `Asking price: ${$(o.asking)}.`, '');
    L.push('| Case | Implied multiple of asking price |', '|---|---|');
    for (const i of o.implied) L.push(`| ${i.label} | ${mx(i.multiple)} |`);
    if (o.earningsNeeded.length) L.push('', `${o.measure} needed to justify the asking price: ${o.earningsNeeded.map((e) => `${$(e.earnings)} at ${mx(e.multiple)}`).join('; ')}.`);
    if (o.gap) L.push('', `Gap: asking is ${$(o.gap.amount)} (${(o.gap.pct * 100).toFixed(1)}%) ${o.gap.amount >= 0 ? 'above' : 'below'} ${o.gap.basis} = ${$(o.gap.price)}.`);
  }
  if (o.sensitivity) {
    L.push('', `Sensitivity (${o.grid[0].label} earnings):`, '', `| Earnings change | ${o.multiples.map(mx).join(' | ')} |`, `|---|${o.multiples.map(() => '---').join('|')}|`);
    for (const s of o.sensitivity) L.push(`| ${s.change === 0 ? 'as is' : (s.change * 100).toFixed(0) + '%'} | ${s.prices.map((p) => $(p.price)).join(' | ')} |`);
  }
  if (o.revenueGrid) L.push('', `Revenue-based check: ${o.revenueGrid.map((r) => `${$(r.price)} at ${r.multiple}× revenue`).join('; ')}.`);
  if (o.assets !== undefined) L.push('', `Tangible asset value entered by the user: ${$(o.assets)} (a rough floor if the business stopped earning; not a liquidation appraisal).`);
  if (o.financeableMax !== undefined) L.push('', `Highest price the debt coverage scenario supports: ${$(o.financeableMax)}.`);
  if (o.warnings.length) { L.push('', 'Flags:'); for (const w of o.warnings) L.push(`- ${w}`); }
  return L.join('\n');
}

const FLAGS = { '--measure': 'measure', '--earnings': 'earnings', '--multiples': 'multiples', '--multiple-source': 'multipleSource', '--asking': 'asking', '--revenue': 'revenue', '--revenue-multiples': 'revenueMultiples', '--assets': 'assets', '--financeable-max': 'financeableMax' };

export function parseArgs(argv) {
  const o = {};
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === '--json') { o.json = true; continue; }
    const f = FLAGS[argv[k]];
    if (!f || argv[k + 1] === undefined) throw new Error(`unknown or incomplete argument ${argv[k]}`);
    o[f] = argv[++k];
  }
  return o;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const a = parseArgs(process.argv.slice(2));
    const o = value(a);
    console.log(a.json ? JSON.stringify(o, null, 2) : toMarkdown(o));
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(1);
  }
}
