# DSCR method: how coverage is calculated and how to back into a price

Debt service coverage ratio (DSCR) = cash flow available to pay debt ÷ the debt payments due in a year. A ratio of 1.25 means the business earns $1.25 for every $1.00 of loan payments.

## The rule (SBA 7(a) changes of ownership, SOP 50 10 8.1)

SOP 50 10 8.1 applies to applications given an SBA loan number on or after 2026-10-01 (`data/sources/sba-information-notice-5000-880695.yaml`). All of the following come from Appendix 15, Para. C.2. Check each source file's `review_by` date before relying on it; SBA rules change often.

| Point | What the SOP says | Source id |
|---|---|---|
| Which years | The last fiscal year-end, or an average of the last two fiscal year-end statements | `sba-sop-50-10-8-1-dsc-ratio` |
| Basis | Historical or adjusted, based on the transaction type | `sba-sop-50-10-8-1-dsc-ratio` |
| Minimum ratio | Initial acquisition 1.25:1; business expansion 1.15:1; owner buyout 1.25:1; ESOP and cooperative 1.25:1 | `sba-sop-50-10-8-1-dsc-ratio` |
| Numerator and denominator | Historical DSC = EBITDA ÷ combined debt service post-transaction | `sba-sop-50-10-8-1-dsc-definition` |
| Adjusted basis | The lender may make prudent adjustments for savings that can be realized through the transaction | `sba-sop-50-10-8-1-adjustments` |
| Projections | The lender must evaluate projections but may not rely on them to meet the coverage requirement; this does not apply to the acquisition of an owner-occupied special purpose property, which may be underwritten on projections | `sba-sop-50-10-8-1-projections` |
| Adjustment items | Additions and subtractions the lender may justify include unfunded capital expenditures, non-recurring income, distributions, S-corp tax distributions, seller discretionary expenses and owner compensation | `sba-sop-50-10-8-1-adjustment-items` |
| Adjustment test | The lender must outline why each adjustment is prudent, necessary and supported by ongoing operations | `sba-sop-50-10-8-1-adjustment-justification` |
| Interest-only debt | Acquisition debt not on full standby with interest-only payments is amortized over no more than 10 years for the test | `sba-sop-50-10-8-1-interest-only-debt` |
| Full standby | Seller debt subordinated with no principal or interest payments for the term of the 7(a) loan; interest may accrue and be paid after the 7(a) loan is repaid | `sba-sop-50-10-8-1-seller-debt-equity`, `sba-sop-50-10-8-1-standby-terms` |
| Total debt cap | Total debt, including seller debt not on full standby, is limited to the business valuation and must be supported by coverage | `sba-sop-50-10-8-1-total-debt-cap` |
| Valuation gap | If the price exceeds the business valuation, the difference must be equity | `sba-sop-50-10-8-1-valuation-gap-equity` |
| Global cash flow | A global cash flow analysis, including affiliates, must meet 1:1 | `sba-sop-50-10-8-1-global-cash-flow` |
| Owner's pay | The buyer's compensation must support their obligations and living expenses | `sba-sop-50-10-8-1-owner-compensation` |
| QoE threshold | Initial acquisitions and business expansions with a purchase price of $3 million or more need a QoE as well as the valuation | `sba-sop-50-10-8-1-qoe-threshold` |
| QoE drives coverage | When a QoE is required, the lender calculates coverage from its findings and reduces the loan if coverage doesn't support the deal | `sba-sop-50-10-8-1-qoe-dsc` |

What these mean in practice for a buyer's scenario:

- **Combined debt service** means all payments after closing: the 7(a) loan, the seller note if it is paying, any equipment loans or lines that stay with the business, and any other acquisition debt. Testing the SBA payment alone overstates coverage.
- **"Business expansion" at 1.15:1** is a different transaction type from a first acquisition. Don't use 1.15 for a first-time buyer's purchase because it makes the numbers look better; ask the lender which type the deal is.
- **Adjusted basis**: savings the transaction realizes (for example, a seller's family member on payroll who leaves at closing, or rent that drops under a new lease) can be added if the lender accepts them as prudent. List each one with its evidence; the lender decides.
- **Projections**: a buyer's growth plan doesn't count toward the test, except for the owner-occupied special purpose property case. If a buyer needs projected growth to reach coverage, the deal as priced likely does not meet the test on history.
- **Seller notes**: a note on full standby pays nothing during the 7(a) loan's term, so it adds no debt service; an interest-only note is still tested as amortizing over 10 years or less. A paying note counts toward the total debt cap.
- **Valuation**: once the lender's valuation exists, a price above it must be covered by equity, and paying debt can't exceed it. Run the script with `--valuation`.
- **Global cash flow** at 1:1 is a separate test that includes the buyer's other businesses and personal obligations; the buyer's pay must cover their living costs.
- Lenders can set floors above the SOP minimum and make their own subtractions (for example, taxes, distributions or capital spending, which appear in the SOP's list of possible adjustments). Ask.

## From SDE to EBITDA

Small-business listings usually quote seller's discretionary earnings (SDE): profit before one owner's total pay and perks. The coverage definition uses EBITDA. To bridge them:

EBITDA = SDE − the market cost to replace the owner's work (salary, payroll taxes, benefits for a manager or for the buyer at a market salary).

If the buyer will run the business and live off it, their own living costs must also come out of cash flow after debt service. A deal that passes 1.25x on EBITDA that already deducts a market salary is in better shape than one that passes only because no salary was deducted.

## Backing into the maximum price

1. Max total debt service = EBITDA ÷ target ratio.
2. Subtract fixed payments that don't scale with price (debt that stays, financed costs' share).
3. What's left covers the senior loan and the seller note. Each dollar of principal costs a fixed amount per year at a given rate and term (the "service factor"; for example, about $0.159 a year per dollar at 10% over 10 years with monthly payments).
4. Price × (share financed by the senior loan × its factor + share financed by the note × its factor) = what's left. Solve for price.

The script does this exactly, including fixed-dollar equity and notes and costs added to the loan.

### Worked example (illustration, all inputs are assumptions)

- EBITDA last fiscal year $420,000; prior year $380,000.
- Senior loan 10.5%, 10 years, monthly. Seller note 10% of price, 6%, 10 years, paying. Equity 10% of price. $60,000 of costs financed.
- Max total debt service at 1.25:1 on the last year: $420,000 ÷ 1.25 = $336,000.
- Script result: max price about $2.28M on the last year, about $2.17M on the two-year average ($400,000). At an asking price of $1.5M, DSCR is about 1.87x on the last year; EBITDA could fall about 33% before coverage reaches 1.25x.

Change one input at a time and watch which one moves the price most. Usually it is the rate, the note's payments, and which year the lender uses.

## Questions to ask the lender (copy into evaluation.md)

1. Which fiscal years and which basis (historical or adjusted) will you test, and do you use tax returns or the internal statements?
2. What coverage do you require for this transaction type, and do you test anything beyond the SOP minimum (global cash flow, a minimum owner salary, capital spending)?
3. Which adjustments would you accept for this deal, and what evidence do you need for each?
4. Given the proposed seller note terms, will it be on full standby, and how will its payments enter the coverage test and the total debt cap?
5. Is the rate fixed or variable, what is it indexed to, and what rate do you underwrite at?
6. What equity injection, fees and working capital do you expect to be in the structure?
7. Will you order a business valuation and a QoE for this deal, and when?
