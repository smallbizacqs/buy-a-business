# Stress tests: will the deal still pay its debts in a bad year?

A deal priced to pass coverage on its best year can fail in its first ordinary bad year. Run these before an LOI and again before closing. Every input is the user's assumption unless a document backs it; label which.

## The five tests

| Test | How to run it | What to look for |
|---|---|---|
| Worse year | Rerun with the weaker of the last two years, or the two-year average | Does the price still pass the target? |
| Rate shock | Rerun at +1 and +2 percentage points (the script's sensitivity table does this) | How much coverage a variable rate can lose |
| Revenue drop | Cut EBITDA by the gross profit lost, not the revenue lost: lost revenue × gross margin, minus any costs that truly go away | The EBITDA drop that reaches 1.00x (printed by the script) |
| Largest customer leaves | Lost gross profit from that customer (ask for its revenue and the margin on its work) | Whether one departure breaks coverage |
| Owner's pay | Deduct the buyer's real living needs from cash after debt service | Whether the buyer can live on what's left in year one |

## Reading the break-even numbers

The script prints two declines at the price tested:

- **Drop to reach the target**: how far EBITDA can fall before the deal no longer passes the lender's test on that year's numbers.
- **Drop to reach 1.00x**: how far it can fall before the business can't cover its payments at all. Below this, the buyer funds the gap personally, and under a personal guarantee the buyer is on the hook (see `personal-guarantee-risk-review`).

Compare these with the business's own history: the worst year-over-year drop in the last five to ten years, if the user has the numbers. A margin of safety smaller than a drop the business has already had is a warning to raise, not a verdict.

## Levers if coverage is tight

Present these as options with trade-offs, not recommendations:

- Lower price (`small-business-acquisition-negotiation`).
- More of the price in a seller note with no or deferred payments, if the lender and SOP allow it for this deal (`seller-note-structuring`).
- More equity, which lowers the loan (`acquisition-equity-sources`).
- A longer term where the loan purpose allows it (for example, when real estate is in the deal); ask the lender.
- Contingent pay to the seller (an earn-out): check the `earnout-ban-forgivable-note` leaf and `sba-sop-rule-check` for what the current SOP allows in an SBA deal and what deals use instead.

## Record

Add a "Stress tests" table under the debt capacity section of `evaluation.md` with each test, its inputs, the resulting DSCR, and whether each input is a document fact or an assumption.
