# Scoping a quality of earnings (QoE) engagement

A quality of earnings report is an independent accountant's test of a business's earnings: whether reported earnings are supported by cash, which adjustments hold up, and what normal working capital and debt look like. It is not an audit and doesn't give an opinion on price. This skill never produces one; it helps the buyer decide whether they need one and what to ask for.

## Do you need one?

Factors that point toward a QoE (or at least a lighter financial review by a CPA):

- The price, or the loan, is large relative to the buyer's net worth.
- Books are cash-basis, kept by the owner, or don't tie to tax returns.
- Many or large add-backs.
- Cash-heavy business, or revenue that doesn't flow neatly through one bank account.
- Inventory, WIP, deferred revenue or customer deposits that drive working capital.
- Rapid recent growth or a recent spike.
- The lender requires one. Ask the lender; its credit policy may go further than the SBA's.

Factors that point toward a lighter scope: clean accrual books reviewed by an outside CPA, simple business, few add-backs, buyer's own proof of cash already ties.

## What SOP 50 10 8.1 says about QoE (SBA 7(a) loans)

These facts come from `references/sources.md` and apply to loans given an SBA loan number on or after 2026-10-01 (source `sba-information-notice-5000-880695`). Check each source's `review_by` date; SBA rules change, so say the rule may have changed and point to the current SOP (or `sba-sop-rule-check`) if a date has passed.

| Rule | Source id |
|---|---|
| For 7(a) initial acquisitions and business expansions with a business purchase price of $3 million or more, the lender must obtain a QoE as well as the business valuation, measured before equity, seller debt or other financing. | `sba-sop-50-10-8-1-qoe-threshold` |
| The requirement doesn't apply to owner buyouts or ESOP and cooperative transactions. | `sba-sop-50-10-8-1-qoe-owner-buyout-exempt` |
| No QoE is required when the acquisition involves an owner-occupied special purpose property. | `sba-sop-50-10-8-1-qoe-special-purpose` |
| A required QoE must be independent, done for the lender, and not prepared by or for the seller. | `sba-sop-50-10-8-1-qoe-not-for-seller` |
| A lender may have a QoE the buyer commissioned reviewed by one of its approved vendors instead of ordering a new one. | `sba-sop-50-10-8-1-qoe-buyer-commissioned` |
| A required QoE must include a cash proof reconciling bank statements to the income statement and tax returns, for the trailing 12 months and the last two fiscal years. | `sba-sop-50-10-8-1-qoe-cash-proof` |
| It must document every add-back and assess revenue quality, including customer concentration and contract continuity. | `sba-sop-50-10-8-1-qoe-revenue-quality` |
| The lender calculates coverage from its findings and must reduce the loan if coverage doesn't support the deal. | `sba-sop-50-10-8-1-qoe-dsc` |

What this means for planning, not a ruling on any deal: below the threshold the SBA doesn't require one, but the lender may, and the buyer may want one anyway. If the buyer commissions a QoE on an SBA deal, ask the lender before engaging whether it will accept that report through its vendor review, so the buyer doesn't pay twice. A seller-provided QoE can't serve as the SBA-required report.

## Depth options

| Option | Typically covers | When |
|---|---|---|
| Proof of cash only | Bank deposits vs revenue, by month | Small, simple deals; first step before deciding more |
| Lighter financial review (CPA) | Proof of cash, tax return to P&L tie, add-back testing | Clean books, modest size |
| Full QoE | Above, plus adjusted EBITDA/SDE bridge, revenue and customer analysis, working capital analysis and peg support, debt-like items, payroll and tax review, management interviews | Larger or messier deals; lender requirement |
| Seller-provided QoE | Report the seller commissioned | Useful information, but written for the seller; it can't be the SBA-required QoE (`sba-sop-50-10-8-1-qoe-not-for-seller`); consider a buyer-side review of it |

## Scope document (send the same one to every provider)

```markdown
# QoE scope: <business> (draft for provider quotes)

Deal: <asset/stock> purchase, price $<X>, SDE basis $<Y> for <period>. Lender: <type>, <requires QoE? yes/no/unknown>.
Timeline: documents available from <date>; findings needed by <findings-due date from the calendar>.

Periods: last <2/3> fiscal years and trailing twelve months to <month>.

In scope:
1. Proof of cash: bank statements reconciled to the income statement and tax returns, monthly, for the trailing twelve months and the last two fiscal years.
2. Tax returns vs financial statements, each year.
3. SDE/EBITDA bridge: test each seller add-back; identify further adjustments (owner compensation at market, non-recurring items, related-party rent at market).
4. Revenue: by customer (concentration, churn), by line, monthly trend, last-months spike.
5. Gross margin: by line where possible; job costing for contractors.
6. Net working capital: monthly NWC, proposed peg support, AR/AP aging, inventory, deferred revenue and deposits.
7. Debt and debt-like items.
8. Payroll: register vs P&L vs filings; contractor use.
9. Sales tax: returns vs revenue.
10. Capex history and deferred maintenance indicators.

Out of scope (unless quoted separately): audit, tax structuring, legal review, valuation, IT review.

Deliverables: early-warning call if a potential deal-breaker appears; draft report; final report; databook (spreadsheets).
Reliance: buyer and buyer's lender.
Please quote: fixed fee, timeline, staffing (names), document request list, what you need from the seller.
```

## Questions to ask providers

See `choose-acquisition-advisors` (interview questions, QoE section). Key ones: small-deal experience, fixed fee for this scope, who does the work, whether the lender has accepted their reports, and whether they'll phase (proof of cash first).

## After the report

- Put the adjusted SDE into `evaluation.md` and the tracker.
- Compare to the LOI basis; anything material goes to `acquisition-go-no-go-review`.
- Working capital findings go to `working-capital-peg-for-small-business`.
- Send the report to the lender only with the user's OK.
