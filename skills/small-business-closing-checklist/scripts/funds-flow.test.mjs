import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fundsFlow, report } from './funds-flow.mjs';

const deal = {
  sources: [
    { label: 'Senior loan', kind: 'loan', amount: 1080000 },
    { label: 'Seller note', kind: 'seller-note', amount: 135000 },
    { label: 'Buyer equity', kind: 'buyer-cash', amount: 185000 },
  ],
  uses: [
    { label: 'Price paid at close', amount: 1215000 },
    { label: 'Seller note portion of price', amount: 135000 },
    { label: 'Closing costs', amount: 30000 },
    { label: 'Working-capital reserve', amount: 20000 },
  ],
};

test('balanced deal', () => {
  const r = fundsFlow(deal);
  assert.equal(r.totalSources, 1400000);
  assert.equal(r.totalUses, 1400000);
  assert.equal(r.balanced, true);
  assert.equal(r.difference, 0);
  assert.equal(r.buyerSideWire, 185000);
  assert.equal(r.byKind['seller-note'], 135000);
  assert.match(report(r), /Balanced: yes/);
});

test('unbalanced deal reports the gap without fixing it', () => {
  const r = fundsFlow({ ...deal, uses: [...deal.uses, { label: 'Lease deposit', amount: 8500.5 }] });
  assert.equal(r.balanced, false);
  assert.equal(r.difference, -8500.5);
  assert.match(report(r), /Balanced: NO/);
});

test('cents add up exactly', () => {
  const r = fundsFlow({
    sources: [{ label: 'a', kind: 'buyer-cash', amount: 0.1 }, { label: 'b', kind: 'investor', amount: 0.2 }],
    uses: [{ label: 'c', amount: 0.3 }],
  });
  assert.equal(r.balanced, true);
  assert.equal(r.buyerSideWire, 0.3);
});

test('rejects bad input', () => {
  assert.throws(() => fundsFlow({ sources: [], uses: [] }), /at least one/);
  assert.throws(() => fundsFlow({ sources: [{ label: 'x', kind: 'gift', amount: 1 }], uses: [{ label: 'y', amount: 1 }] }), /kind/);
  assert.throws(() => fundsFlow({ sources: [{ label: 'x', kind: 'loan', amount: -1 }], uses: [{ label: 'y', amount: 1 }] }), /negative/);
  assert.throws(() => fundsFlow({ sources: [{ label: 'x', kind: 'loan', amount: 1.001 }], uses: [{ label: 'y', amount: 1 }] }), /decimals/);
});
