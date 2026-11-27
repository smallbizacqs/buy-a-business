# Add-back rules: what counts, what doesn't, and what proves it

## SDE vs EBITDA in one table

| | SDE (seller's discretionary earnings) | EBITDA (as used in small deals) |
|---|---|---|
| Starts from | Pre-tax profit | Pre-tax profit |
| Adds back | Interest, depreciation, amortization, one owner's total pay and perks, genuine one-time and personal costs | The same, then subtracts the market cost of the work the owner does |
| Answers | What one full-time owner-operator has to pay debt, reinvest and live on | What the business earns if everyone, including the person running it, is paid market wages |
| Used by | Brokers listing owner-operated businesses | Lenders' coverage test (see `sba-dscr-and-affordability`), larger deals, buyers who hire a manager |

Bridge: **EBITDA = SDE − owner replacement cost.** The same business can look very different on each measure: a business with $300K SDE and a $120K replacement cost has $180K EBITDA.

## Owner replacement cost: how to price it

1. List every job the owner does in a week: selling, estimating, scheduling, supervising, bookkeeping, licensed work, key customer relationships. Ask the owner for a typical week, hour by hour.
2. Decide who does each job after closing: the buyer, an existing employee (promotion costs extra pay), or a new hire.
3. Price each role from at least two current sources (local job postings, a salary survey, a recruiter quote). Record the sources.
4. Add employer payroll taxes and benefits. Ask a CPA or payroll provider for the burden rate in the user's state rather than guessing.
5. If the owner holds a license the business needs, price a licensed hire, not a general manager.
6. If the buyer will run the business: still compute EBITDA with a market salary. The buyer's own pay comes out of it; a deal that only works if the buyer works for free is a job with debt.

## Status definitions (use exactly these)

- **supported**: a document in the workspace shows the amount, and the reason it won't recur under a new owner is documented. Cite file and page.
- **assumed**: plausible, not yet documented. Carries a request to get the document.
- **unsupported**: no document, contradicted by a document, or a real operating cost.

## Common add-backs: test and evidence

| Add-back | Usually legitimate when | Usually inflated when | Evidence to request |
|---|---|---|---|
| Owner's salary and payroll taxes | It's one owner, paid through payroll | Two working owners both added back; or the owner was paid via distributions and the salary line is also added | W-2s, payroll registers, K-1s |
| Owner's health insurance, retirement contributions | Paid for the owner only | Family members who work in the business are included | Plan statements, payroll |
| Depreciation and amortization | Always added back for EBITDA/SDE | When equipment must be replaced on a schedule, the cash cost is real; subtract maintenance capital spending separately | Depreciation schedule (in the return), fixed-asset purchases |
| Interest | The buyer won't assume the debt | The "interest" is actually equipment lease payments that will continue | Loan statements, lease agreements |
| Owner's vehicle | A personal vehicle unrelated to the work | The vehicle is used for service calls, sales visits or hauling | Mileage logs, title, insurance |
| Travel, meals | Clearly personal (family trip) | Customer entertainment or supplier visits that drive sales | Receipts, calendar, who attended |
| One-time legal, consulting, repair | A single event with a reason (lawsuit settled, roof replaced) | It shows up in most years under a new name | General ledger for all years |
| Family members on payroll | They don't work there and won't be paid | They do real work that someone must be paid for | Payroll, job duties, hours |
| Rent | The rent will continue unchanged | The owner owns the building and charges below market: deduct the gap (negative adjustment) | Lease, market rent quote |
| Charitable donations, personal subscriptions | Personal, no business benefit | Sponsorships that generate leads | Receipts, marketing records |
| "Lost" revenue from a bad year | Rarely an add-back: earnings are what they were | Seller wants credit for growth that hasn't happened | (Not an add-back; a projection) |
| PPP loan forgiveness, grants, ERC | Remove as income: non-recurring (a deduction, not an add-back) | Left in revenue or other income | Loan forgiveness letter, return's other-income lines |

## Adjustments that lower earnings (sellers rarely list these)

- Related-party rent below market (deduct the gap).
- Owner's salary below market (if the add-back uses the actual low salary, the replacement cost corrects for it; make sure it isn't counted twice).
- Unpaid family labor (price it).
- Deferred maintenance or deferred hiring (a one-time cost now, or an ongoing one).
- Owner does a second role for free (bookkeeping, dispatch): price it.
- Warranty reserves, customer deposits or bad debts not booked.
- Expiring contracts or price increases already lost.

## Questions to ask about every add-back

1. Where does it appear in the ledger and on the return? (Same amount?)
2. Will it disappear the day the buyer takes over, with nothing replacing it?
3. Did it occur in prior years too? (Recurring "one-time" items are operating costs.)
4. Would revenue change if it stopped? (Marketing, sponsorships, owner relationships.)
5. Who decided it was an add-back: the owner, the broker, or their CPA?

## Cash income that isn't reported

If a seller says the business makes more than the returns show because of unreported cash, give it no value. It can't be verified, lenders won't count it, the seller is describing a tax problem of their own, and the claim says something about how the books were kept. Record it as a red flag and an open question, not an add-back. Don't speculate about the legal consequences; that's a lawyer's or CPA's question.

## Trends and the trailing twelve months (TTM)

- Show each fiscal year and the TTM side by side on the supported case.
- If earnings are falling, price on the most recent full year or TTM, not the average, and ask why.
- If the TTM spikes, check for a one-off contract, a price increase not yet tested, or pulled-forward revenue (prepayments).
- Seasonal businesses: compare the same months year over year.

## What an SBA lender's process looks at (SOP 50 10 8.1)

If the deal will use a 7(a) loan, the schedule should anticipate these. Check each source's `review_by` date in `references/sources.md`; SBA rules change.

- The lender's analysis uses the three most recent year-ends of the acquired business (`sba-sop-50-10-8-1-three-years`) and compares the latest interim statement with the same period a year earlier (`sba-sop-50-10-8-1-interim-statements`).
- Adjustments the lender may justify include unfunded capital expenditures, non-recurring income, distributions, S-corp tax distributions, seller discretionary expenses and owner compensation (`sba-sop-50-10-8-1-adjustment-items`); each must be prudent, necessary and supported by ongoing operations (`sba-sop-50-10-8-1-adjustment-justification`).
- When a QoE is required, it must document all add-backs and adjustments, including non-recurring items, above- or below-market owner compensation, related-party transactions, deferred maintenance and cash-versus-accrual differences, and assess revenue quality (`sba-sop-50-10-8-1-qoe-revenue-quality`). Initial acquisitions and business expansions with a purchase price of $3 million or more require one (`sba-sop-50-10-8-1-qoe-threshold`), and the lender then computes coverage from its findings (`sba-sop-50-10-8-1-qoe-dsc`).

A buyer's schedule that already separates these items, with evidence, makes the lender's and QoE provider's work faster and surfaces disagreements before the LOI is signed.

## Capital spending

Depreciation is added back, but trucks and equipment still wear out. Estimate maintenance capital spending (the cash needed each year just to keep the current fleet and gear working) from three to five years of fixed-asset purchases, the age of the major assets, and replacement quotes. Report EBITDA minus maintenance capital spending as the cash the business really throws off.
