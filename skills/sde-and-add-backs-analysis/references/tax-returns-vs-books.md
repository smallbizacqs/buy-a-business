# Why the tax returns don't match the P&L, and what to do about it

Small-business tax returns and internal profit-and-loss statements (P&Ls) often disagree. Some reasons are normal; some are warnings. The job is to explain each difference, not to pick the friendlier number.

## Which one counts

- The tax return is filed under penalty of perjury and is what many lenders start from; ask the user's lender which they use and whether they will accept internal statements for a partial year.
- The books show monthly detail, seasonality and the current year.
- A buyer should reconcile the two for every year and price on the figure that survives the reconciliation. If the books show more profit than the return and the difference can't be explained, use the return.
- Request IRS tax return transcripts to confirm the returns the seller hands over match what was filed (see `verify-seller-financials`).

## Normal reasons for a difference

| Reason | Effect | How to confirm |
|---|---|---|
| Cash vs accrual basis (books on one, return on the other) | Revenue and expenses land in different years | Compare receivables and payables at year-end |
| Accelerated tax depreciation (expensing equipment in year one) | Return shows lower profit than books | Depreciation schedule in the return vs book depreciation |
| Year-end adjustments the CPA made after the books closed | Return differs from the December P&L | Ask for the CPA's adjusting entries; the books may never have been updated |
| Owner's personal expenses reclassified | Expense lines move | General ledger detail |
| Inventory counted differently | Cost of goods sold differs | Year-end inventory count and method |
| Sales tax collected recorded as revenue in one, not the other | Revenue differs by roughly the sales tax rate | Sales tax returns |
| Different fiscal year-ends | Partial overlaps | Check the period on each document |

## Warning signs

- Books show materially more revenue than the return with no timing explanation.
- The P&L was prepared for the sale (no history, round numbers, no general ledger behind it).
- Revenue on the return doesn't match the bank deposits (run `verify-seller-financials`).
- The seller can't or won't provide the general ledger or the accountant's adjusting entries.
- Returns for the most recent year haven't been filed, or were amended shortly before the sale.

## Reconciliation template (one per year, put it in evaluation.md)

| Line | Tax return (form, line) | P&L | Difference | Explanation | Evidence | Status |
|---|---|---|---|---|---|---|
| Gross revenue | | | | | | |
| Cost of goods sold | | | | | | |
| Gross profit | | | | | | |
| Owner pay (all forms) | | | | | | |
| Depreciation and amortization | | | | | | |
| Interest | | | | | | |
| Net income | | | | | | |

Status: explained (with evidence) / explained (seller's word only) / unexplained. Every "unexplained" line becomes a numbered open question and a diligence tracker row.

## What to request

1. Federal returns, all schedules, last three years (and the most recent extension if the year isn't filed).
2. Year-end P&L and balance sheet for the same years, plus year-to-date monthly P&L.
3. General ledger export for each year.
4. The CPA's adjusting journal entries, or the trial balance before and after.
5. Depreciation and fixed-asset schedule.
6. Sales tax returns (if applicable) and payroll tax filings.
