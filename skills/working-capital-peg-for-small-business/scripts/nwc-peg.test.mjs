import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseCsv, computeNwc, pegFromMonthly, trueUp, main } from './nwc-peg.mjs';

// 12 months, AR 100..210 (step 10), inventory 50, AP 40, cash 999 (excluded), LOC 500 (excluded).
const csv = ['month,cash,accounts_receivable,inventory,accounts_payable,line_of_credit',
  ...Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, '0')},999,${100 + i * 10},50,40,500`)].join('\n');

test('parses CSV with $, parentheses and blanks', () => {
  const rows = parseCsv('month,accounts_receivable,accounts_payable\n2026-01,"$1000",(200)\n2026-02,,300\n'.replace(/"/g, ''));
  assert.deepEqual(rows[0], { month: '2026-01', items: { accounts_receivable: 1000, accounts_payable: -200 } });
  assert.equal(rows[1].items.accounts_receivable, 0);
  assert.throws(() => parseCsv('date,ar\n2026-01,1'), /month/);
  assert.throws(() => parseCsv('month,ar\n2026-01,abc'), /not a number/);
});

test('NWC excludes cash and debt by default', () => {
  const s = computeNwc(parseCsv(csv));
  assert.deepEqual(s[0], { month: '2026-01', assets: 150, liabilities: 40, nwc: 110, debtLike: 0 });
  assert.equal(s[11].nwc, 220);
});

test('unknown columns must be classified', () => {
  const rows = parseCsv('month,accounts_receivable,equipment_deposit\n2026-01,100,20');
  assert.throws(() => computeNwc(rows), /equipment_deposit/);
  assert.equal(computeNwc(rows, { overrides: { equipment_deposit: 'asset' } })[0].nwc, 120);
  assert.throws(() => computeNwc(rows, { overrides: { equipment_deposit: 'maybe' } }), /classify/);
});

test('debt-like items leave NWC and are reported', () => {
  const rows = parseCsv('month,accounts_receivable,customer_deposits\n2026-01,100,30');
  assert.equal(computeNwc(rows)[0].nwc, 70);
  const s = computeNwc(rows, { debtLike: ['customer_deposits'] });
  assert.deepEqual([s[0].nwc, s[0].debtLike], [100, 30]);
});

test('peg is the trailing average or median', () => {
  const p = pegFromMonthly(computeNwc(parseCsv(csv)));
  // NWC runs 110..220 by 10: average 165
  assert.equal(p.peg, 165);
  assert.equal(p.median, 165);
  assert.equal(p.range, 110);
  assert.equal(p.last3Average, 210);
  assert.ok(p.warnings.some((w) => /seasonal/.test(w)));
  assert.ok(p.warnings.some((w) => /last three months/.test(w)));
  const p6 = pegFromMonthly(computeNwc(parseCsv(csv)), { trailing: 6, method: 'median' });
  assert.deepEqual(p6.monthsUsed, ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12']);
  assert.equal(p6.peg, 195);
});

test('flat series has no warnings; gaps and short history warn', () => {
  const flat = Array.from({ length: 12 }, (_, i) => ({ month: `2025-${String(i + 1).padStart(2, '0')}`, nwc: 100 }));
  assert.deepEqual(pegFromMonthly(flat).warnings, []);
  const gappy = [{ month: '2025-01', nwc: 100 }, { month: '2025-03', nwc: 100 }];
  const w = pegFromMonthly(gappy).warnings;
  assert.ok(w.some((x) => /Only 2 months/.test(x)));
  assert.ok(w.some((x) => /Gap/.test(x)));
  const neg = pegFromMonthly([{ month: '2025-01', nwc: -10 }, { month: '2025-02', nwc: -12 }], { trailing: 2 });
  assert.ok(neg.warnings.some((x) => /negative/.test(x)));
});

test('true-up: dollar-for-dollar, deductible and tipping collars', () => {
  assert.equal(trueUp({ peg: 100000, closingNwc: 92000 }).adjustment, -8000);
  assert.equal(trueUp({ peg: 100000, closingNwc: 92000, collar: 5000 }).adjustment, -3000);
  assert.equal(trueUp({ peg: 100000, closingNwc: 92000, collar: 5000, collarType: 'tipping' }).adjustment, -8000);
  assert.equal(trueUp({ peg: 100000, closingNwc: 104000, collar: 5000 }).adjustment, 0);
  assert.equal(trueUp({ peg: 100000, closingNwc: 110000, collar: 5000 }).direction, 'buyer pays seller more');
  assert.throws(() => trueUp({ peg: 1, closingNwc: 1, collarType: 'band' }));
});

test('CLI end to end', () => {
  const dir = mkdtempSync(join(tmpdir(), 'nwc-'));
  const f = join(dir, 'balances.csv');
  writeFileSync(f, csv);
  const r = JSON.parse(main([f, '--closing', '150', '--collar', '5']));
  assert.equal(r.peg, 165);
  assert.equal(r.trueUp.adjustment, -10);
});
