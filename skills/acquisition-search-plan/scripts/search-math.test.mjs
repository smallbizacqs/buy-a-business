import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { funnelForward, funnelBackward, runway, plan, checkRates } from './search-math.mjs';

const R = { contact_to_conversation: 0.05, conversation_to_cim: 0.5, cim_to_loi: 0.2, loi_to_close: 0.5 };
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('forward funnel multiplies each stage', () => {
  const f = funnelForward(1000, R);
  close(f.conversations, 50); close(f.cims, 25); close(f.lois, 5); close(f.closes, 2.5);
});

test('backward funnel inverts forward', () => {
  const b = funnelBackward(1, R);
  close(b.lois, 2); close(b.cims, 10); close(b.conversations, 20); close(b.contacts, 400);
  close(funnelForward(b.contacts, R).closes, 1);
});

test('rates are required, no defaults', () => {
  assert.throws(() => funnelForward(100, { contact_to_conversation: 0.1 }), /missing/);
  assert.throws(() => checkRates(undefined), /required/);
  assert.throws(() => funnelForward(100, { ...R, cim_to_loi: 1.5 }), /\(0, 1\]/);
  assert.throws(() => funnelForward(100, { ...R, cim_to_loi: 0 }), /\(0, 1\]/);
});

test('runway: available over net burn', () => {
  const r = runway({ liquid_funds: 300000, reserved_for_deal: 180000, monthly_living: 7000, monthly_search_costs: 1000, monthly_income: 2000 });
  assert.equal(r.available, 120000); assert.equal(r.burn, 6000); close(r.months, 20);
});

test('runway edge cases', () => {
  assert.equal(runway({ liquid_funds: 100, reserved_for_deal: 200, monthly_living: 10 }).months, 0);
  assert.equal(runway({ liquid_funds: 100, monthly_living: 10, monthly_income: 20 }).months, Infinity);
  assert.throws(() => runway({ liquid_funds: -1, monthly_living: 10 }), />= 0/);
});

test('plan combines channels and compares to runway', () => {
  const p = plan({
    channels: [
      { name: 'letters', contacts_per_week: 40, rates: R },        // 0.1 closes/week
      { name: 'brokers', contacts_per_week: 10, rates: { ...R, contact_to_conversation: 0.5 } }, // 0.25 closes/week
    ],
    closes_wanted: 1, lag_weeks_after_loi: 10,
    runway: { liquid_funds: 100000, monthly_living: 5000 },
  });
  close(p.expected_closes_per_week, 0.35);
  close(p.outreach_weeks_for_closes_wanted, 1 / 0.35);
  close(p.total_weeks_incl_lag, 1 / 0.35 + 10);
  close(p.runway.months, 20);
  assert.equal(p.runway_covers_plan, true);
});

test('plan rejects missing channels or rates', () => {
  assert.throws(() => plan({ channels: [] }), /at least one channel/);
  assert.throws(() => plan({ channels: [{ name: 'x', contacts_per_week: 5 }] }), /x\.rates/);
});

test('CLI prints JSON and fails clearly on bad input', () => {
  const dir = mkdtempSync(join(tmpdir(), 'search-math-'));
  const script = join(dirname(fileURLToPath(import.meta.url)), 'search-math.mjs');
  const good = join(dir, 'good.json');
  writeFileSync(good, JSON.stringify({ channels: [{ name: 'letters', contacts_per_week: 40, rates: R }] }));
  const out = JSON.parse(execFileSync(process.execPath, [script, good], { encoding: 'utf8' }));
  assert.equal(out.expected_closes_per_week, 0.1);
  assert.equal(out.outreach_weeks_for_closes_wanted, 10);
  const bad = join(dir, 'bad.json');
  writeFileSync(bad, JSON.stringify({ channels: [{ name: 'letters', contacts_per_week: 40 }] }));
  assert.throws(() => execFileSync(process.execPath, [script, bad], { stdio: 'pipe' }));
});
