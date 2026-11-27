# Designing an earnout that doesn't end in a dispute

An earnout pays part of the price later if the business performs. It bridges a valuation gap, but it puts the seller's money in the buyer's hands after closing, which is where disputes start. Use this list to design one, or to decide not to.

## Decide first: does this deal need one?

If the deal is financed with an SBA 7(a) loan, stop here: seller earnouts are prohibited in a 7(a) change of ownership (source `sba-sop-50-10-8-1-earnouts`). Ask the lender and CPA whether a buyer rebate tied to performance (allowed under the same rule) or a seller note fits instead.

Use an earnout when the disagreement is about a specific, measurable future fact: "revenue jumped 30% last year; will it hold?", "will the largest customer renew?". Don't use one to paper over a general price gap; a seller note or a lower price is simpler.

## Design checklist

1. **Metric.** Prefer metrics the seller can verify and the buyer can't easily move by its own spending decisions:
   - Revenue: simplest to measure; ignores margin.
   - Gross profit: captures pricing and job cost; needs a defined cost of goods.
   - Retention of named customers or contract renewals: binary and clear.
   - EBITDA or net income: most disputed, because the buyer controls overhead, owner pay, allocations and accounting choices.
2. **Definitions.** Write down the accounting basis (accrual or cash), which policies stay the same as before closing, what's excluded (acquisitions, new product lines, one-time items), and how returns and bad debts count.
3. **Baseline and targets.** A baseline the parties agree on from verified numbers. Targets as thresholds (tiers) or a percentage of the amount above baseline.
4. **Period.** Usually one to three measurement periods; shorter means less to argue about.
5. **Cap and floor.** A maximum total; per-period caps if using a percentage.
6. **Catch-up.** Whether a strong later period pays amounts missed earlier.
7. **Payment timing.** How soon after each period ends, and from which statements.
8. **Reporting.** What the buyer sends the seller and when; seller's right to review the books for the metric.
9. **Buyer's conduct.** What the buyer promises (or explicitly doesn't promise) about running the business. Sellers ask for covenants; buyers resist operating restrictions. Lawyer.
10. **Sale or change.** What happens to the earnout if the buyer sells, merges or closes a location.
11. **Disputes.** A short process: statement, objection window, a meeting, then an independent accountant decides the number only.
12. **Offset.** Whether proven indemnity claims can be set against earnout payments. Lawyer.
13. **Lender.** In an SBA 7(a) change of ownership, seller earnouts are prohibited, while buyer rebates tied to business performance are allowed (source `sba-sop-50-10-8-1-earnouts`, SOP 50 10 8.1; check its `review_by` date). With other financing, ask the lender whether it allows one and on what terms.

## Common ways earnouts go wrong

- The metric is net income and the buyer adds overhead, a manager's salary or interest.
- No definition of how revenue is recognized; a big job straddles a period end.
- The buyer changes pricing, merges the business into another one, or drops a product line.
- No reporting promised, so the seller suspects the worst.
- Payment due when the senior lender's terms block it.
- Targets set on unverified numbers that diligence later contradicts.

## Showing what it pays

Run three scenarios through `scripts/earnout.mjs` and put the table in the structure memo, so both sides see the real range:

```json
{ "design": { "type": "percent-over-baseline", "baseline": 1000000, "percent": 0.10, "periodCap": 50000, "totalCap": 150000 },
  "results": [ { "label": "Year 1", "actual": 950000 }, { "label": "Year 2", "actual": 1150000 }, { "label": "Year 3", "actual": 1400000 } ] }
```

Or tiers:

```json
{ "design": { "type": "tiers", "tiers": [ { "threshold": 1100000, "payout": 25000 }, { "threshold": 1250000, "payout": 50000 } ], "totalCap": 150000, "catchUp": true },
  "results": [ ... ] }
```
