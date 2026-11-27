import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readBank, readBooks, readTax, proofOfCash, toMarkdown, fiscalYear, money } from './proof-of-cash.mjs';

// 12 months of a tidy business: $100K booked revenue a month, deposits match, one transfer in March.
const months = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, '0')}`);
const bankSummary = 'month,account,total_deposits,transfers_in,loan_proceeds\n' +
  months.map((m) => `${m},Operating,"${m === '2025-03' ? '$125,000' : '$100,000'}",${m === '2025-03' ? 25000 : 0},0`).join('\n');
const booksCsv = 'month,revenue\n' + months.map((m) => `${m},100000`).join('\n');
const taxCsv = 'year,gross_receipts,source\n2025,1200000,2025 Form 1120-S line 1a';

test('money and fiscal year helpers', () => {
  assert.equal(money('(2,500)'), -2500);
  assert.equal(money(''), 0);
  assert.throws(() => money('abc'));
  assert.equal(fiscalYear('2025-07', 6), 2026);
  assert.equal(fiscalYear('2025-06', 6), 2025);
  assert.equal(fiscalYear('2025-12'), 2025);
});

test('clean year ties out with no monthly or annual flags', () => {
  const out = proofOfCash({ bank: readBank(bankSummary), books: readBooks(booksCsv), tax: readTax(taxCsv) });
  assert.equal(out.monthly.length, 12);
  assert.ok(out.monthly.every((r) => r.diff === 0 && !r.flag));
  assert.equal(out.annual[0].booksVsTax, 0);
  assert.equal(out.annual[0].depositsVsTax, 0);
  const kinds = out.gaps.map((g) => g.kind);
  assert.deepEqual(kinds, ['no-sales-tax']);
});

test('shortfall, missing month and books-vs-return gap are listed', () => {
  const bank = bankSummary.replace('2025-06,Operating,"$100,000"', '2025-06,Operating,"$80,000"').split('\n').filter((l) => !l.startsWith('2025-09')).join('\n');
  const books = booksCsv.replace('2025-11,100000', '2025-11,150000');
  const out = proofOfCash({ bank: readBank(bank), books: readBooks(books), tax: readTax(taxCsv) });
  const g = (k) => out.gaps.filter((x) => x.kind === k);
  assert.equal(g('deposits-under').length, 2); // June short, November booked revenue not collected
  assert.equal(g('missing-bank')[0].month, '2025-09');
  assert.equal(g('statement-gap').length, 1);
  assert.equal(g('partial-year').length, 1, 'only 11 bank months, so the annual check is partial');
});

test('books vs tax flagged on a complete year', () => {
  const out = proofOfCash({ bank: readBank(bankSummary), books: readBooks(booksCsv), tax: readTax('year,gross_receipts\n2025,1100000') });
  const bt = out.gaps.find((x) => x.kind === 'books-vs-tax');
  assert.equal(bt.amount, 100000);
  assert.ok(out.gaps.find((x) => x.kind === 'deposits-vs-tax'));
});

test('transaction format: categories, unknown deposits, withdrawals ignored', () => {
  const txn = `date,account,amount,category,description
2025-01-03,Operating,60000,revenue,card batch
2025-01-15,Operating,40000,,check deposit
2025-01-20,Operating,30000,loan,line of credit draw
2025-01-21,Operating,-5000,,rent
2025-01-28,Savings,10000,transfer,from operating`;
  const out = proofOfCash({ bank: readBank(txn), books: readBooks('month,revenue\n2025-01,100000') });
  const r = out.monthly[0];
  assert.equal(r.deposits, 140000);
  assert.equal(r.nonrev, 40000);
  assert.equal(r.revenueDeposits, 100000);
  assert.equal(r.diff, 0);
  assert.ok(out.gaps.some((g) => g.kind === 'unknown-deposits' && g.amount === 40000));
});

test('sales tax and receivables change move expected receipts', () => {
  const out = proofOfCash({
    bank: readBank('month,account,total_deposits,transfers_in\n2025-01,Op,108000,0'),
    books: readBooks('month,revenue,sales_tax_collected,ar_change\n2025-01,100000,8000,0'),
  });
  assert.equal(out.monthly[0].expected, 108000);
  assert.equal(out.monthly[0].diff, 0);
  const out2 = proofOfCash({
    bank: readBank('month,account,total_deposits,transfers_in\n2025-01,Op,90000,0'),
    books: readBooks('month,revenue,ar_change\n2025-01,100000,10000'),
  });
  assert.equal(out2.monthly[0].expected, 90000);
  const out3 = proofOfCash({
    bank: readBank('month,account,total_deposits,transfers_in\n2025-01,Op,97000,0'),
    books: readBooks('month,revenue,processor_fees\n2025-01,100000,3000'),
  });
  assert.equal(out3.monthly[0].diff, 0, 'card fees netted before deposit are not a gap');
});

test('summary file with no non-revenue columns is flagged', () => {
  const out = proofOfCash({ bank: readBank('month,account,total_deposits\n2025-01,Op,100000'), books: readBooks('month,revenue\n2025-01,100000') });
  assert.ok(out.gaps.some((g) => g.kind === 'no-nonrev'));
});

test('bad input is rejected with line numbers', () => {
  assert.throws(() => readBank('foo,bar\n1,2'), /bank CSV needs/);
  const bank = readBank('month,account,total_deposits\n2025-13,Op,1\n2025-01,Op,abc');
  assert.equal(bank.errors.length, 2);
  assert.throws(() => proofOfCash({ bank, books: readBooks('month,revenue\n2025-01,1') }), /bank line 2/);
  assert.match(readBooks('month,revenue\n2025-01,1\n2025-01,2').errors[0], /twice/);
});

test('markdown states it is not a QoE and lists gaps', () => {
  const md = toMarkdown(proofOfCash({ bank: readBank(bankSummary), books: readBooks(booksCsv), tax: readTax(taxCsv) }));
  assert.match(md, /Not a quality of earnings report/);
  assert.match(md, /does not authenticate/);
  assert.match(md, /### Gaps to explain/);
});

test('partial year prints — for books and deposits minus return', () => {
  const bank = bankSummary.split('\n').filter((l) => !l.startsWith('2025-12')).join('\n');
  const books = booksCsv.split('\n').filter((l) => !l.startsWith('2025-12')).join('\n');
  const out = proofOfCash({ bank: readBank(bank), books: readBooks(books), tax: readTax(taxCsv) });
  assert.equal(out.annual[0].complete, false);
  assert.equal(out.annual[0].booksVsTax, undefined);
  const md = toMarkdown(out);
  assert.match(md, /\| 2025 \| 11\/11 \(partial\) \| \$1,100,000 \| \$1,100,000 \| \$1,200,000 \| — \| — \|/);
  assert.match(md, /needs all 12 months/);
});

test('a return with no monthly data for its year is flagged', () => {
  const out = proofOfCash({ bank: readBank(bankSummary), books: readBooks(booksCsv), tax: readTax(taxCsv + '\n2023,1000000,2023 return') });
  const g = out.gaps.find((x) => x.kind === 'return-no-data');
  assert.equal(g.year, 2023);
  assert.match(g.text, /no monthly bank or books data/);
});

test('trailing-twelve-month drift is flagged even when every month is under the monthly trigger', () => {
  // deposits 4% short every month: no month passes 5%, but the year is 4% short (> 2%)
  const bank = 'month,account,total_deposits\n' + months.map((m) => `${m},Operating,96000`).join('\n');
  const out = proofOfCash({ bank: readBank(bank), books: readBooks(booksCsv), tax: readTax(taxCsv) }, { threshold: 5, annualThreshold: 2 });
  assert.ok(out.monthly.every((r) => !r.flag));
  const g = out.gaps.find((x) => x.kind === 'ttm-drift');
  assert.equal(g.amount, -48000);
  assert.match(g.text, /Trailing twelve months \(2025-01 to 2025-12\)/);
  assert.match(g.text, /12 of 12 months run the same way, though no single month passed/);
  // a clean year has no drift gap
  assert.ok(!proofOfCash({ bank: readBank(bankSummary), books: readBooks(booksCsv) }).gaps.some((x) => x.kind === 'ttm-drift'));
});

test('months of the requested period with no data become one gap', () => {
  const out = proofOfCash({ bank: readBank(bankSummary), books: readBooks(booksCsv) }, { periodStart: '2024-01', periodEnd: '2025-12' });
  const g = out.gaps.filter((x) => x.kind === 'period-not-provided');
  assert.equal(g.length, 1);
  assert.equal(g[0].months.length, 12);
  assert.match(g[0].text, /2024-01 to 2024-12/);
  assert.throws(() => proofOfCash({ bank: readBank(bankSummary), books: readBooks(booksCsv) }, { periodStart: '2024' }), /YYYY-MM/);
});
