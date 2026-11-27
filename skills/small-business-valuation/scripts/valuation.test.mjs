import { test } from 'node:test';
import assert from 'node:assert/strict';
import { value, parseCases, parseList, toMarkdown, parseArgs } from './valuation.mjs';

const base = { measure: 'SDE', earnings: 'supported=300000,claimed=360000', multiples: '3.5,2.5,3', multipleSource: 'test comps', asking: '1200000' };

test('parses cases and sorts multiples', () => {
  assert.deepEqual(parseCases('supported=1,claimed=2').map((c) => c.label), ['supported', 'claimed']);
  assert.deepEqual(parseCases('250000')[0], { label: 'earnings', earnings: 250000 });
  assert.deepEqual(parseList('3.5,2.5,3', 'm'), [2.5, 3, 3.5]);
  assert.throws(() => parseList('0,2', 'm'), /positive/);
});

test('price grid, implied multiples, earnings needed and the gap', () => {
  const o = value(base);
  assert.deepEqual(o.grid[0].prices.map((p) => p.price), [750000, 900000, 1050000]);
  assert.equal(o.mid, 3);
  assert.equal(o.implied[0].multiple, 4);
  assert.equal(o.implied[1].multiple, 1200000 / 360000);
  assert.equal(o.earningsNeeded[1].earnings, 400000);
  assert.equal(o.gap.amount, 300000);
  assert.ok(Math.abs(o.gap.pct - 1 / 3) < 1e-12);
  assert.ok(o.warnings.some((w) => /above the top of the range/.test(w)));
});

test('sensitivity scales the first case', () => {
  const o = value(base);
  const minus20 = o.sensitivity.find((s) => s.change === -0.2);
  assert.equal(minus20.prices[1].price, 300000 * 0.8 * 3);
});

test('revenue-based check, assets and financeable max', () => {
  const o = value({ ...base, revenue: '1000000', revenueMultiples: '0.8,1', assets: '150000', financeableMax: '1000000' });
  assert.deepEqual(o.revenueGrid.map((r) => r.price), [800000, 1000000]);
  assert.equal(o.assets, 150000);
  assert.ok(o.warnings.some((w) => /debt coverage scenario/.test(w)));
  assert.equal(o.financeableCase, 'supported');
});

test('financeable max must use the same earnings case as the range, and the output names it', () => {
  const o = value({ ...base, financeableMax: '1000000', financeableCase: 'supported' });
  assert.match(toMarkdown(o), /from sba-dscr-and-affordability, on supported earnings, the same case as the range\): \$1,000,000/);
  assert.throws(() => value({ ...base, financeableMax: '1000000', financeableCase: 'claimed' }), /computed on the "claimed" case, but the range is built on "supported"/);
  assert.equal(parseArgs(['--financeable-case', 'supported']).financeableCase, 'supported');
});

test('refuses to run without user-sourced multiples or a measure', () => {
  assert.throws(() => value({ ...base, multiples: undefined }), /no default multiples/);
  assert.throws(() => value({ ...base, multipleSource: undefined }), /multiple-source/);
  assert.throws(() => value({ ...base, measure: 'revenue' }), /SDE or EBITDA/);
  assert.throws(() => value({ ...base, earnings: '' }), /--earnings/);
  assert.throws(() => value({ ...base, revenueMultiples: '1' }), /needs --revenue/);
  assert.throws(() => parseArgs(['--nope', '1']), /unknown/);
});

test('negative earnings are flagged', () => {
  const o = value({ ...base, earnings: 'supported=-10000' });
  assert.ok(o.warnings.some((w) => /zero or negative/.test(w)));
});

test('markdown labels the result as a range, not an appraisal, and shows the source', () => {
  const md = toMarkdown(value(base));
  assert.match(md, /not an appraisal/);
  assert.match(md, /source: test comps/);
  assert.match(md, /Gap: asking is \$300,000 \(33\.3%\) above supported × 3/);
});
