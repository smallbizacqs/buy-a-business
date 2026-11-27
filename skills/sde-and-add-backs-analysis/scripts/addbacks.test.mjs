import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, money, analyze, toMarkdown } from './addbacks.mjs';

const CSV = `year,item,category,amount,status,evidence
2024,Net income per 1120-S,net_income,"$150,000",,2024 Form 1120-S page 1
2024,Owner salary,owner_comp,90000,supported,2024 W-2 and payroll register
2024,Depreciation,depreciation,25000,supported,2024 Form 1120-S
2024,Owner's truck lease,discretionary,12000,assumed,Seller says personal use
2024,Family trip,discretionary,8000,unsupported,
2025,Net income per 1120-S,net_income,170000,,2025 Form 1120-S page 1
2025,Owner salary,owner_comp,90000,supported,2025 W-2
2025,Interest,interest,6000,supported,
2025,"Rent to market (related-party landlord)",other,(18000),supported,Lease vs. broker rent survey
`;

test('money parses $, commas and parentheses', () => {
  assert.equal(money('$1,234'), 1234);
  assert.equal(money('(1,234)'), -1234);
  assert.equal(money('-50.5'), -50.5);
  assert.ok(Number.isNaN(money('')));
});

test('csv parser handles quotes and embedded commas', () => {
  const rows = parseCsv(CSV);
  assert.equal(rows.length, 9);
  assert.equal(rows[0].amount, '$150,000');
  assert.equal(rows[8].item, 'Rent to market (related-party landlord)');
});

test('three evidence cases and EBITDA after owner replacement', () => {
  const out = analyze(parseCsv(CSV), { replacementCost: 95000, capex: 20000 });
  const [y24, y25] = out.results;
  assert.equal(y24.sde.supported, 150000 + 90000 + 25000);
  assert.equal(y24.sde.withAssumed, 265000 + 12000);
  assert.equal(y24.sde.asClaimed, 277000 + 8000);
  assert.equal(y24.ebitda.supported, 265000 - 95000);
  assert.equal(y24.afterCapex.supported, 170000 - 20000);
  // 2025 interest has no evidence -> counted as assumed; negative normalization stays supported
  assert.equal(y25.supported, 90000 - 18000);
  assert.equal(y25.assumed, 6000);
  assert.ok(out.warnings.some((w) => /Interest.*counted as assumed/.test(w)));
});

test('flags missing owner pay, two owners, and a falling trend', () => {
  const csv = `year,item,category,amount,status,evidence
2024,NI,net_income,300000,,return
2024,Owner A salary,owner_comp,80000,supported,W-2
2024,Owner B salary,owner_comp,80000,supported,W-2
2025,NI,net_income,200000,,return
`;
  const out = analyze(parseCsv(csv), { replacementCost: 90000 });
  assert.ok(out.warnings.some((w) => /more than one person/.test(w)));
  assert.ok(out.warnings.some((w) => /2025: no owner_comp row/.test(w)));
  assert.ok(out.warnings.some((w) => /fell/.test(w)));
});

test('rejects bad rows and a missing replacement cost', () => {
  assert.throws(() => analyze(parseCsv(CSV), {}), /replacement-cost/);
  const bad = `year,item,category,amount,status,evidence
2024,NI,net_income,100,,x
2024,Thing,perks,10,supported,x
2024,Other,other,abc,supported,x
2024,More,other,5,maybe,x
2025,Owner,owner_comp,5,supported,x
`;
  try { analyze(parseCsv(bad), { replacementCost: 1 }); assert.fail('should throw'); }
  catch (e) {
    assert.match(e.message, /unknown category "perks"/);
    assert.match(e.message, /not a number/);
    assert.match(e.message, /status must be/);
    assert.match(e.message, /2025: no net_income row/);
  }
});

test('markdown shows each case and the schedule', () => {
  const md = toMarkdown(analyze(parseCsv(CSV), { replacementCost: 95000 }));
  assert.match(md, /SDE, supported only/);
  assert.match(md, /EBITDA as claimed/);
  assert.match(md, /Family trip \| discretionary \| \$8,000 \| unsupported/);
  assert.match(md, /-\$18,000/);
});
