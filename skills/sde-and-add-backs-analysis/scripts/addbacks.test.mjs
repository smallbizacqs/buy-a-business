import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, money, analyze, toMarkdown, parseClaimed } from './addbacks.mjs';

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
  // 2025 interest has no evidence -> counted as assumed
  assert.equal(y25.supported, 90000);
  assert.equal(y25.assumed, 6000);
  assert.ok(out.warnings.some((w) => /Interest.*counted as assumed/.test(w)));
});

test('as claimed reproduces the seller\'s SDE; buyer normalizations are a separate step', () => {
  const out = analyze(parseCsv(CSV), { replacementCost: 95000, claimedSde: '2025=266000' });
  const y25 = out.results[1];
  // The rent-to-market row is negative with no "by" value, so it is the buyer's adjustment, not the seller's claim.
  assert.equal(y25.sde.asClaimed, 170000 + 90000 + 6000);
  assert.equal(y25.claimedDiff, 0);
  assert.equal(y25.buyerAdjustments, -18000);
  assert.equal(y25.sde.asClaimedAfterBuyer, 266000 - 18000);
  assert.equal(y25.sde.supported, 170000 + 90000 - 18000);
  assert.equal(y25.sde.withAssumed, 170000 + 90000 + 6000 - 18000);
  assert.ok(!out.warnings.some((w) => /does not reproduce/.test(w)));
  assert.ok(out.warnings.some((w) => /treated as your \(buyer\) adjustments/.test(w)));
  // The discretionary share uses the seller's own rows only.
  assert.equal(y25.discretionary, 0);
});

test('explicit by column, assumed buyer costs, and the stated-SDE check', () => {
  const csv = `year,item,category,amount,status,evidence,by
2025,NI,net_income,200000,,2025 Form 1120-S line 21,
2025,Owner salary,owner_comp,80000,supported,2025 W-2,seller
2025,Seller's own rent adjustment,other,-5000,assumed,CIM p.3,seller
2025,Dispatcher for the job I won't do,other,-45000,assumed,two job postings,buyer
2025,Add-back the seller missed,one_time,3000,assumed,GL,buyer
2025,Wishful buyer item,other,9000,unsupported,,buyer
`;
  const out = analyze(parseCsv(csv), { replacementCost: 90000, claimedSde: 300000, claimedSource: 'listing p.1' });
  const y = out.results[0];
  assert.equal(y.sde.asClaimed, 275000);
  assert.equal(y.claimedDiff, -25000);
  assert.ok(out.warnings.some((w) => /does not reproduce the stated SDE \(\$300,000, listing p\.1\)/.test(w)));
  assert.equal(y.buyerAdjustments, -45000 + 3000);
  // Supported case takes the buyer's expected cost even though assumed, but not the undocumented buyer add-back.
  assert.equal(y.buyerAdjustmentsSupportedCase, -45000);
  assert.equal(y.sde.supported, 200000 + 80000 - 45000);
  assert.equal(y.sde.withAssumed, 200000 + 80000 - 5000 - 42000);
  assert.ok(out.warnings.some((w) => /Wishful buyer item.*left out/.test(w)));
  assert.equal(y.discretionary, -5000);
  assert.throws(() => analyze(parseCsv(csv.replace(',buyer\n2025,Add', ',lender\n2025,Add')), { replacementCost: 1 }), /by must be seller or buyer/);
});

test('parseClaimed takes one amount or year=amount pairs', () => {
  assert.deepEqual(parseClaimed('412,000'), { _last: 412000 });
  assert.deepEqual(parseClaimed('2024=380,000,2025=412,000'), { 2024: 380000, 2025: 412000 });
  assert.equal(parseClaimed(undefined), undefined);
  assert.throws(() => analyze(parseCsv(CSV), { replacementCost: 1, claimedSde: '2019=1' }), /no year "2019"/);
});

test('supported case: undocumented years are flagged as not meaningful; D&A from a return is nudged to supported', () => {
  const csv = `year,item,category,amount,status,evidence
2025,NI,net_income,100000,,2025 Form 1120-S page 1
2025,Owner salary,owner_comp,70000,assumed,seller says
2025,Depreciation,depreciation,30000,assumed,2025 Form 1120-S line 14
`;
  const out = analyze(parseCsv(csv), { replacementCost: 80000 });
  assert.equal(out.results[0].supportedMeaningful, false);
  assert.ok(out.warnings.some((w) => /not meaningful yet/.test(w)));
  assert.ok(out.warnings.some((w) => /Depreciation.*mark it supported/.test(w)));
  assert.match(toMarkdown(out), /\$100,000 \(not meaningful yet\)/);
});

test('pre-document run: supported rows downgraded, title and no pricing basis', () => {
  const out = analyze(parseCsv(CSV), { replacementCost: 95000, preDocument: true });
  assert.ok(out.results.every((y) => y.supported === 0 && !y.supportedMeaningful));
  const md = toMarkdown(out);
  assert.match(md, /seller's claims, pre-document/);
  assert.match(md, /nothing here is a basis for pricing or lending/);
  assert.doesNotMatch(md, /Use for pricing/);
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
  assert.match(md, /Family trip \| discretionary \| \$8,000 \| unsupported \| seller/);
  assert.match(md, /Buyer adjustments/);
  assert.match(md, /-\$18,000/);
});
