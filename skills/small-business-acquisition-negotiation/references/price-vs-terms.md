# Trading price against terms

The headline price is one number among many. Most sellers care about some terms more than the price; most buyers care about risk and cash at close more than headline. A good package gives each side more of what it values.

## The levers

| Lever | Buyer gives | Buyer gets | Usually valued by the seller because |
|---|---|---|---|
| Higher headline price | More money overall | Room to ask for deferral, an earnout or a longer transition | Bragging rights; a number they had in mind |
| More cash at close | Higher equity or loan; more risk up front | Lower headline, or a shorter or cheaper transition | Certainty; paying off debts; retirement |
| Seller note | Less cash at close | Seller invested in a smooth handover; spread payments | Interest income; sometimes tax timing (their CPA) |
| Standby on the note | For SBA 7(a), full standby for the life of the loan if the note counts as equity (source `sba-sop-50-10-8-1-seller-debt-equity`) | Coverage headroom | Seller usually dislikes it; trade it against rate or price |
| Earnout | Contingent payments if targets are hit | Pay for growth only if it shows up | Upside on growth they believe in. Not available with an SBA 7(a) loan: seller earnouts are prohibited in a 7(a) change of ownership (source `sba-sop-50-10-8-1-earnouts`) |
| Transition length and pay | Paid consulting, or included in price | Customer and staff handover | Some want out fast; some want a role |
| Timing of closing | Speed or flexibility | Seller cooperation on documents | Year-end, tax timing, health, a move |
| Employees kept | Commitments on staff and pay | Workforce stability (usually in buyer's interest anyway) | Legacy; loyalty to staff |
| Name, location, legacy | Keep the name, keep the location | Goodwill | Pride; community standing |
| Real estate | Lease at market, or buy | Location control | Rent income or cash out |
| Working capital | A lower peg | A higher price | Seller may care only about net proceeds |
| Exclusivity length | Less time | — | Seller wants certainty fast |
| Deposit | Money at risk | Signal of commitment | Proof the buyer is serious |

## How to build packages

1. List the seller's top three priorities from `notes.md`, in their words.
2. List the buyer's top three (usually: cash at close within budget, coverage, transition).
3. Build two or three packages that differ in a way the seller cares about. For example:
   - **A. Certainty:** lower price, more cash at close, quick close, short transition.
   - **B. Headline:** higher price, seller note with standby, longer paid transition.
   - **C. Growth:** base price plus an earnout on the growth the seller believes in (not with SBA 7(a) financing; see the earnout row).
4. Run all three through `scripts/offer-compare.mjs` with the user's discount rate and earnout probability so they can see expected value to the seller, and the buyer's cash at close and coverage for each.
5. Present them together. Offering a choice tells the buyer what the seller values, and lets the seller say yes to something rather than no to everything.

## Rules of thumb practitioners commonly use

- Trade, don't give: every concession comes with an ask.
- Concede in shrinking steps; a big late concession signals more to come.
- Put the reason next to the number ("based on SDE of $X at 3.0x"), so a later change has a basis.
- Don't negotiate against yourself: wait for a counter before moving again.
- Know what the lender will and won't finance before offering a structure; an offer the lender later rejects costs credibility.
