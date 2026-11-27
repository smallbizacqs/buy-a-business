# Reviewing what comes back

For each document: what to tie it to, what a problem looks like, and what to ask. Record results in the tracker (`finding` = the fact; `follow_up` = the question). Never write that something ties unless the arithmetic was done and recorded.

## Tax returns vs P&L

- **Tie:** gross receipts on the return to revenue on the P&L for the same year; total expenses; officer compensation; depreciation.
- **Problem:** P&L revenue higher than the return (the seller may be showing buyers a different story than the IRS); large "other" expense lines; big swings between years with no explanation.
- **Ask:** reconcile each year's P&L to the return line by line; explain differences in writing.

## Bank statements (proof of cash)

- Hand off to `verify-seller-financials` for the tie-out: total deposits by month vs revenue, less transfers between accounts, loans, owner contributions and refunds.
- **Problem:** deposits lower than revenue (revenue overstated, or cash kept off the books, which the buyer can't rely on and the lender won't count); deposits much higher with no explanation (unrecorded revenue or non-revenue money).
- **Ask:** list of all accounts, including any personal accounts that receive business money.

## General ledger and add-backs

- Pass each claimed add-back to `sde-and-add-backs-analysis` with its support.
- **Test:** pick the five largest add-backs and trace each to invoices or payroll records. Pick 20 random expense entries and confirm they're business costs.
- **Problem:** add-backs for costs the buyer will still have (a manager's salary the owner "doesn't need", deferred repairs); "one-time" items that recur every year.

## Revenue by customer

- **Compute:** top customer, top 5 and top 10 as a share of revenue each year; customers lost and gained each year; revenue retained from last year's customers.
- **Problem:** one customer over a large share, or the top few growing as a share; key customers tied personally to the owner; contracts ending soon.
- **Ask:** contracts or terms for the top customers; who manages each relationship.
- Concentration and owner dependence also feed `small-business-risk-assessment`.

## Monthly P&L

- **Look at:** revenue and gross margin month by month; a jump in the months before the sale; expenses cut just before the sale (marketing, maintenance, staff).
- **Problem:** last few months unusually strong; margin rising without a price change; costs that drop to zero.

## AR and AP agings

- **AR:** share over 60 and 90 days; any single large old balance; credits.
- **AP:** payables growing older before the sale (seller holding cash).
- Feed both into `working-capital-peg-for-small-business`.

## Payroll

- **Tie:** payroll register totals to P&L wages; quarterly payroll filings to the register.
- **Problem:** wages on the P&L different from filings; workers paid as contractors who look like employees (flag for the lawyer and `small-business-operational-due-diligence`); family members paid but not working, or working but not paid (both change SDE).

## Sales tax

- **Tie:** taxable sales on returns to revenue, allowing for exempt sales.
- **Problem:** returns not filed, or revenue on the P&L well above what returns show. Past-due sales tax can become the buyer's problem in some states even in an asset purchase; flag for the lawyer and CPA.

## Debt schedule

- **Tie:** balances to statements and to the balance sheet; check public lien filings (the lawyer or `small-business-legal-due-diligence` runs UCC searches).
- **Problem:** debts on lien searches not on the schedule; merchant cash advances (often hidden in deposits as large lump sums followed by daily withdrawals).

## Fixed assets and capex

- **Look at:** age and condition of the main equipment and vehicles; what replacing them would cost in the next few years; capex by year.
- **Problem:** capex near zero in recent years (deferred maintenance that the buyer will pay for); leased equipment that isn't on the asset list.

## Deposits and deferred revenue

- **Look at:** schedule vs balance sheet; work remaining; any deposits taken unusually far in advance.
- Feed into the peg or debt-like list.
