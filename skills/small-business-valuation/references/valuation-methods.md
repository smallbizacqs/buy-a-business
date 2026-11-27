# Valuation methods for small businesses

## Earnings multiple (the common method)

**Price = earnings × multiple.** The multiple is how many years of today's earnings a buyer pays up front. A higher multiple means buyers expect the earnings to last or grow and see less risk; a lower one means more risk or decline.

Rules that keep the math honest:

- **Match the measure.** SDE still includes the owner's pay, so it is larger than EBITDA for the same business, and the same price is a lower multiple of SDE than of EBITDA. Never apply an EBITDA multiple to SDE or the reverse.
- **Match what's included.** Comparable sales may or may not include inventory, receivables, working capital, real estate or vehicles. Adjust or exclude.
- **Use verified earnings.** Apply the multiple to the supported case from `sde-and-add-backs-analysis`. Paying a multiple on unsupported add-backs pays several times over for each unproven dollar.
- **Know where multiples come from.** Sources, roughly from strongest to weakest:
  1. Closed sales of similar businesses (same industry, size, region, year), with what was included.
  2. An independent valuation (a lender may order one; see the `business-appraisal` leaf).
  3. The broker's opinion of value, with its comparables.
  4. Asking prices on listings: these show what sellers want. Many listings never sell (see the `why-listings-dont-sell` leaf); don't treat them as market prices.
- **Size matters.** A larger business in the same industry is often less dependent on one person, and buyers may pay a different multiple for it. Compare like with like.

## The lender's valuation in an SBA 7(a) deal (SOP 50 10 8.1)

Check each source's `review_by` date in `data/sources/`; SBA rules change.

- The business valuation must be requested by and prepared for the lender; the lender can't use one prepared for the buyer or the seller (`sba-sop-50-10-8-1-valuation-for-lender`). A buyer's own range (this skill) is for the buyer's decisions only.
- If the business purchase price is $350,000 or less, the lender may do its own valuation, unless buyer and seller are closely related (`sba-sop-50-10-8-1-valuation-350k`).
- The valuation must support the purchase price however the debt is structured; if the price exceeds it, the difference must be equity (`sba-sop-50-10-8-1-valuation-gap-equity`).
- Total debt, including seller debt not on full standby, is limited to the valuation and must be covered by cash flow (`sba-sop-50-10-8-1-total-debt-cap`).
- The lender checks the financial information behind the valuation against the seller's IRS transcripts (`sba-sop-50-10-8-1-valuation-verified`).

Practical effect: if the buyer agrees a price above what an independent valuation will support, the buyer may have to find more cash late in the process. Put a valuation contingency in the LOI (`loi-for-small-business-acquisition`) and ask the lender early when they order the valuation.

## Cash flow and return checks (does the price work for this buyer?)

A multiple says what others paid; the buyer still has to make the debt and live:

- **Debt coverage**: the highest price the earnings support at the lender's coverage ratio (`sba-dscr-and-affordability`). If the "market" price is above the financeable price, the gap comes from more equity, a seller note, or a lower price.
- **Cash after debt and the buyer's pay**: EBITDA minus debt service minus maintenance capital spending minus taxes. If that's thin, the price is high for this buyer, whatever the comps say.
- **Payback on equity**: years for the buyer's cash in the deal to come back from cash after debt service. A useful check, not a valuation method on its own.

## Revenue-based valuation (some practices and agencies)

Certain businesses (for example, accounting and insurance books of business, some agencies and professional practices) are often quoted as a share of annual revenue, because buyers see the client relationships as the asset and margins vary with how the buyer runs them. When using it:

- Get the revenue basis right: recurring vs one-time, and how retention is measured.
- Expect price adjustments tied to client retention in many of these deals; ask how the comparables were structured.
- Always cross-check with an earnings view: a revenue price that implies a high earnings multiple at the buyer's own margins is a warning.

## Asset-based value (floor or primary)

- **As a floor**: what the tangible assets (equipment, vehicles, inventory) would bring if the business stopped earning. Useful for downside, not a price.
- **As the primary method**: for a business with little or no reliable earnings, or where the assets are the point (some equipment-heavy or real-estate-heavy businesses). A money-losing business bought "for the assets" is a turnaround; see the `distressed-turnaround` leaf.
- Asset values need a source: a recent equipment appraisal, dealer quotes, or auction results. Book value on the balance sheet reflects tax depreciation, not market value.

## Worked example (all inputs are illustrations)

- Supported SDE $300,000; claimed SDE $360,000. Three closed sales the user found: 2.6×, 3.0×, 3.3× SDE, all including equipment, excluding real estate.
- Range on supported SDE: $780,000 to $990,000; middle $900,000.
- Asking price $1,200,000 implies 4.0× supported SDE and 3.3× claimed SDE. To justify $1.2M at 3.0×, supported SDE would need to be $400,000.
- Debt coverage scenario supports up to $1,000,000.
- Reading: the seller's price relies on the unsupported add-backs and a top-of-range multiple. The buyer's options are in `asking-price-gap.md`.
