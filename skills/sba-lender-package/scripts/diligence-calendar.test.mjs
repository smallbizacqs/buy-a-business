import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addDays, daysBetween, previousBusinessDay, buildCalendar, parseCsv, toCsv, readTracker, selectRequests, trackerRows, main, COLUMNS } from './diligence-calendar.mjs';

test('date arithmetic crosses months, years and leap days', () => {
  assert.equal(addDays('2026-12-25', 10), '2027-01-04');
  assert.equal(addDays('2028-03-01', -1), '2028-02-29');
  assert.equal(addDays('2027-03-01', -1), '2027-02-28');
  assert.equal(daysBetween('2026-12-01', '2027-01-30'), 60);
  assert.throws(() => addDays('2026-02-30', 1));
});

test('calendar counts back from the exclusivity end', () => {
  const c = buildCalendar({ start: '2026-12-01', exclusivityEnd: '2027-01-30' });
  assert.equal(c.windowDays, 60);
  // 2027-01-23 is a Saturday: the decision moves back to Friday 2027-01-22
  assert.equal(c.due.decision, '2027-01-22');
  assert.equal(c.due.findings, '2027-01-20');
  assert.equal(c.due.phase2, c.due.findings);
  // 50 working days * 0.35 = 17.5 -> 18 -> 2026-12-19, a Saturday -> Friday 2026-12-18
  assert.equal(c.due.phase1, '2026-12-18');
  assert.deepEqual(c.movedForWeekend.map((m) => m.key), ['phase1', 'decision']);
  assert.deepEqual(c.warnings, []);
  const dates = c.milestones.map((m) => m.date);
  assert.deepEqual(dates, [...dates].sort());
});

test('short windows and late closings warn', () => {
  const c = buildCalendar({ start: '2026-12-01', exclusivityEnd: '2026-12-23', closingTarget: '2027-01-15' });
  assert.equal(c.warnings.length, 3);
  assert.match(c.warnings[0], /22 days/);
  assert.match(c.warnings[2], /after exclusivity ends/);
});

test('weekend due dates move to the previous business day', () => {
  assert.equal(previousBusinessDay('2027-01-23'), '2027-01-22'); // Saturday
  assert.equal(previousBusinessDay('2027-01-24'), '2027-01-22'); // Sunday
  assert.equal(previousBusinessDay('2027-01-25'), '2027-01-25'); // Monday
  const c = buildCalendar({ start: '2027-01-04', exclusivityEnd: '2027-03-07' });
  for (const d of [c.due.phase1, c.due.findings, c.due.decision]) assert.ok(![0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay()), `${d} is a weekend`);
});

test('closing within 7 days of exclusivity end warns; earlier closing does not', () => {
  const near = buildCalendar({ start: '2026-12-01', exclusivityEnd: '2027-01-30', closingTarget: '2027-01-25' });
  assert.ok(near.warnings.some((w) => /within 7 days of exclusivity/.test(w)));
  const edge = buildCalendar({ start: '2026-12-01', exclusivityEnd: '2027-01-30', closingTarget: '2027-01-23' });
  assert.ok(edge.warnings.some((w) => /within 7 days/.test(w)));
  const early = buildCalendar({ start: '2026-12-01', exclusivityEnd: '2027-01-30', closingTarget: '2027-01-22' });
  assert.deepEqual(early.warnings, []);
  const late = buildCalendar({ start: '2026-12-01', exclusivityEnd: '2027-01-30', closingTarget: '2027-02-05' });
  assert.ok(late.warnings.some((w) => /after exclusivity ends/.test(w)) && !late.warnings.some((w) => /within 7 days/.test(w)));
});

test('impossible windows throw', () => {
  assert.throws(() => buildCalendar({ start: '2027-01-30', exclusivityEnd: '2027-01-01' }), /after the start/);
  assert.throws(() => buildCalendar({ start: '2027-01-01', exclusivityEnd: '2027-01-08' }), /too short/);
});

test('CSV round-trips commas, quotes and newlines', () => {
  const row = Object.fromEntries(COLUMNS.map((c) => [c, '']));
  Object.assign(row, { id: 'F01', area: 'financial', request: 'Bank statements, all accounts', why: 'Proof of "cash"\nties deposits', status: 'open' });
  const back = readTracker(toCsv([row]));
  assert.deepEqual(back[0], row);
  assert.deepEqual(parseCsv('a,b\r\n1,"x,y"\r\n'), [['a', 'b'], ['1', 'x,y']]);
});

test('request selection drops excluded tags and inherits the list area', () => {
  const list = { area: 'financial', requests: [
    { request: 'Tax returns', phase: 'phase1' },
    { request: 'Inventory count', phase: 'phase2', when: ['inventory'] },
    { request: 'Insurance loss runs', area: 'insurance', phase: 'phase1' },
  ] };
  const sel = selectRequests(list, { exclude: ['inventory'] });
  assert.deepEqual(sel.map((r) => [r.request, r.area]), [['Tax returns', 'financial'], ['Insurance loss runs', 'insurance']]);
});

test('tracker rows continue ids, skip duplicates and use phase due dates', () => {
  // ids from other skills (P pre-offer, O operational) never collide with ours
  const cal = buildCalendar({ start: '2026-12-01', exclusivityEnd: '2027-01-30' });
  const blank = Object.fromEntries(COLUMNS.map((c) => [c, '']));
  const existing = [{ ...blank, id: 'F04', area: 'financial', request: 'Tax returns, last 3 years', status: 'requested' }, { ...blank, id: 'P03', area: 'financial', request: 'Teaser P&L', status: 'closed' }];
  const { rows, added } = trackerRows([
    { area: 'financial', request: 'tax returns,  last 3 years', phase: 'phase1' },
    { area: 'financial', request: 'AR aging at each month end', phase: 'phase2', why: 'Working capital' },
    { area: 'insurance', request: 'Loss runs, 5 years', phase: 'decision', owner: 'insurance broker' },
  ], cal, { existing });
  assert.equal(added.length, 2);
  assert.equal(rows.length, 4);
  assert.deepEqual(added.map((r) => [r.id, r.due, r.status, r.owner]), [
    ['F05', '2027-01-20', 'open', 'seller'],
    ['I01', '2027-01-22', 'open', 'insurance broker'],
  ]);
  assert.throws(() => trackerRows([{ area: 'tax', request: 'x' }], cal), /area/);
  assert.throws(() => trackerRows([{ area: 'legal', request: 'x', phase: 'later' }], cal), /phase/);
});

test('CLI prints a calendar and writes a tracker', () => {
  const cal = JSON.parse(main(['--start', '2026-12-01', '--exclusivity-end', '2027-01-30']));
  assert.equal(cal.due.decision, '2027-01-22');
  const dir = mkdtempSync(join(tmpdir(), 'dd-'));
  const reqs = join(dir, 'r.json');
  const tracker = join(dir, 'diligence-tracker.csv');
  writeFileSync(reqs, JSON.stringify({ area: 'legal', requests: [{ request: 'Lease and amendments', phase: 'phase1' }, { request: 'Phase I report', phase: 'phase2', when: ['real-estate'] }] }));
  const out = main(['--start', '2026-12-01', '--exclusivity-end', '2027-01-30', '--requests', reqs, '--tracker', tracker, '--exclude', 'real-estate', '--write']);
  assert.match(out, /1 new row/);
  const again = main(['--start', '2026-12-01', '--exclusivity-end', '2027-01-30', '--requests', reqs, '--tracker', tracker, '--write']);
  assert.match(again, /1 new row\(s\), 2 total/);
  const rows = readTracker(readFileSync(tracker, 'utf8'));
  assert.deepEqual(rows.map((r) => r.id), ['L01', 'L02']);
});
