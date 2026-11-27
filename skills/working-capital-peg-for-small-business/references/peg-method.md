# Setting the peg, step by step

## 1. Get the right data

- Month-end balance sheets on an accrual basis for the last 12 months at minimum, 24 if the business is seasonal or growing fast.
- AR aging and AP aging at several month-ends, to test the balance-sheet figures.
- Inventory reports at month-end, or at least the last physical count and how book inventory was adjusted.
- For contractors, the WIP schedule at month-ends (see `wip-and-contractors.md`).
- If the books are cash basis, receivables and payables may be off the balance sheet; rebuild month-end figures from agings and ask the CPA how reliable that is.

Add any missing item to `diligence-tracker.csv` through `small-business-financial-due-diligence`.

## 2. Normalize

Before averaging, adjust each month for:

- Owner items in current assets or liabilities (personal expenses prepaid, loans to family).
- One-time items: a large prepayment from one customer, a bulk inventory purchase ahead of a price increase, an insurance claim receivable.
- Year-end accounting entries that only appear in December (accruals booked once a year): spread them or use the CPA's adjusted figures.
- Lines that will be treated as debt-like (move them out with `--debt-like`).

Write each adjustment into the classification table with a reason.

## 3. Compute

`node scripts/nwc-peg.mjs balances.csv --trailing 12`

The script reports average, median, min, max, range, last-3-month average and warnings. Read the warnings:

| Warning | What it may mean | Ask |
|---|---|---|
| Seasonal swing over 25% of average | A single average won't fit the closing month | Which month is closing likely? What does NWC look like that month in prior years? |
| Last 3 months more than 15% from peg | Collections pushed, payables stretched, inventory run down, or the business is growing | Why? Show AR and AP agings for those months |
| Negative months | Customers prepay or bills are stretched | Schedule of deposits and deferred revenue; AP aging |
| Gaps or duplicates | Missing statements | Request the missing months |
| Fewer months than asked | Short history | Request more; use median |

## 4. Choose the method

- **Trailing 12-month average.** The usual starting point. Smooths seasons in a business with mild swings.
- **Median.** Less sensitive to one odd month.
- **Seasonal or month-specific peg.** For strongly seasonal businesses: the average of the same month in prior years, or a schedule of pegs by closing month.
- **Growth-adjusted.** For a growing business, a trailing average understates what is needed now; some buyers use a ratio (NWC as a percentage of trailing revenue) applied to current revenue. Discuss with the CPA.

## 5. The true-up

- **Estimated closing statement.** A few days before closing, the seller estimates closing NWC; the price at closing is adjusted by the estimate versus the peg.
- **Final statement.** After closing (often 60 to 120 days), the buyer prepares the actual closing NWC; the difference from the estimate is paid one way or the other.
- **Collar.** A band around the peg inside which nothing is paid. A deductible collar pays only the excess beyond the band; a tipping collar pays the whole difference once the band is exceeded. Zero collar is dollar-for-dollar.
- **Disputes.** Objection window, a meeting, then an independent accountant decides the number only.
- **Security.** A holdback or escrow, or the right to offset against a seller note (lawyer), covers a shortfall.
- **SBA 7(a) deals.** Under SBA rules a working-capital true-up in the purchase agreement is not a rebate, and cash paid to the buyer under it can stay in the business (source `sba-sop-50-10-8-1-working-capital-true-up`). Separately, the lender analyzes whether working capital is adequate for at least the next 12 months (source `sba-sop-50-10-8-1-working-capital-adequacy`) and may finance the part of the purchase that relates to working assets such as receivables and inventory on a line of credit (source `sba-sop-50-10-8-1-working-assets-line`). SOP 50 10 8.1; check each source's `review_by` date.

Show the user what each choice does: `--closing 92000 --collar 5000 --collar-type deductible` and again with `tipping`.

## 6. LOI wording (plain-language business term)

> The purchase price assumes the Business is delivered with a normal level of net working capital, defined as [accounts receivable, inventory and prepaid expenses, less accounts payable, accrued expenses and [customer deposits / deferred revenue]], excluding cash, debt and income taxes, and set at the trailing twelve-month average of month-end balances (currently estimated at $[peg]). The definition and peg will be confirmed in diligence and the purchase price adjusted, up or down, for any difference at closing.

If inventory is separate:

> Inventory is included in [the price / addition to the price at the lower of cost or value], based on a physical count within [3] days before closing, excluding obsolete, damaged or slow-moving items, not to exceed $[cap].

The lawyer turns this into the purchase agreement definition.
