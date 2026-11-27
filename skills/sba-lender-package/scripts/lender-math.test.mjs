import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, timeline, monthlyPayment, compareSheets, DEFAULT_STEPS } from './lender-math.mjs';

test('timeline counts back from closing in order', () => {
  const t = timeline({ closing: '2027-03-15' });
  assert.equal(t.rows.length, DEFAULT_STEPS.length);
  assert.equal(t.rows[0].key, 'shortlist');
  assert.equal(t.rows[0].date, '2026-12-15');
  assert.equal(t.rows.at(-1).date, '2027-03-15');
  const dates = t.rows.map((r) => r.date);
  assert.deepEqual(dates, [...dates].sort());
  assert.deepEqual(t.warnings, []);
});

test('late steps and closing after exclusivity warn', () => {
  const t = timeline({ closing: '2027-01-15', today: '2026-12-01', exclusivityEnd: '2027-01-10' });
  assert.equal(t.warnings.length, 2);
  assert.match(t.warnings[0], /shortlist/);
  assert.match(t.warnings[1], /extension/);
});

test('custom steps replace the placeholders', () => {
  const t = timeline({ closing: '2027-03-15', steps: [{ key: 'approval', daysBefore: 20, label: 'x' }, { key: 'closing', daysBefore: 0, label: 'y' }] });
  assert.deepEqual(t.rows.map((r) => r.date), ['2027-02-23', '2027-03-15']);
  assert.throws(() => timeline({ closing: '2027-02-30' }));
  assert.equal(addDays('2027-01-01', -1), '2026-12-31');
});

test('monthly payment', () => {
  assert.equal(Math.round(monthlyPayment(100000, 0.06, 10) * 100) / 100, 1110.21);
  assert.equal(monthlyPayment(1200, 0, 1), 100);
});

test('term sheets compared with combined coverage', () => {
  const r = compareSheets({ ebitda: 300000, otherAnnualDebtService: 24000, threshold: 1.25, sheets: [
    { lender: 'A', principal: 1000000, annualRate: 0.1, years: 10, fees: 10000 },
    { lender: 'B', principal: 1000000, annualRate: 0.09, years: 10 },
  ] });
  assert.equal(r[0].monthlyPayment, 13215.07);
  assert.equal(r[0].annualDebtService, 158580.88);
  assert.equal(r[0].combinedAnnualDebtService, 182580.88);
  assert.equal(r[0].coverage, 1.64);
  assert.equal(r[0].meetsThreshold, true);
  assert.ok(r[1].annualDebtService < r[0].annualDebtService);
  assert.equal(r[1].fees, 0);
});

test('CLI accepts lender-quoted steps', async () => {
  const { mkdtempSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { execFileSync } = await import('node:child_process');
  const dir = mkdtempSync(join(tmpdir(), 'lender-'));
  const f = join(dir, 'steps.json');
  writeFileSync(f, JSON.stringify([{ key: 'approval', daysBefore: 30, label: 'quoted' }, { key: 'closing', daysBefore: 0, label: 'close' }]));
  const script = new URL('./lender-math.mjs', import.meta.url).pathname;
  const out = JSON.parse(execFileSync(process.execPath, [script, 'timeline', '--closing', '2027-03-15', '--steps', f], { encoding: 'utf8' }));
  assert.deepEqual(out.rows.map((r) => r.date), ['2027-02-13', '2027-03-15']);
  const defaults = JSON.parse(execFileSync(process.execPath, [script, 'steps'], { encoding: 'utf8' }));
  assert.equal(defaults.length, DEFAULT_STEPS.length);
});
