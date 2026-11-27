# Why acquisition loans get declined or delayed, and what to do first

Weak points to find in the buyer's own file before a lender does. Where an SBA rule is involved, the source id is given; the rest are common credit concerns, not rules.

| Weak point | Why it matters | Check first | Options |
|---|---|---|---|
| Coverage below the threshold at historical numbers | The 7(a) test uses the last fiscal year-end or the average of the last two (source `sba-sop-50-10-8-1-dsc-ratio`); projections don't count toward it (source `sba-sop-50-10-8-1-projections`) | Run `sba-dscr-and-affordability` on tax-return EBITDA | Lower price, more equity, more of the price as a seller note on full standby (no payments during the loan, source `sba-sop-50-10-8-1-seller-debt-equity`) |
| Price above the lender's valuation | The gap must come from equity, not more debt (source `sba-sop-50-10-8-1-valuation-gap-equity`) | Compare price to `small-business-valuation` range | Renegotiate price, more equity, structure (see `small-business-acquisition-negotiation`) |
| Equity short or from the wrong sources | 10% minimum for an initial acquisition (source `sba-sop-50-10-8-1-equity-minimum`); limited sources cap (source `sba-sop-50-10-8-1-equity-limited-sources`) | Map every equity dollar to its source and documentation | `acquisition-equity-sources` |
| Seller financials don't match IRS records | Lender must verify against IRS records (source `sba-sop-50-10-8-1-seller-tax-verification`) | Tie returns to P&L in financial diligence | Resolve before submitting; may be a deal-killer (`acquisition-go-no-go-review`) |
| Buyer experience thin for the industry | The credit memo describes the buyer's experience and who runs operations (source `sba-sop-50-10-8-1-management-experience`) | Resume and plan: transferable skills, key employees staying, seller transition | Strengthen the plan; retain a key manager; consulting agreement with seller (up to 24 months, source `sba-sop-50-10-8-1-seller-consultant`) |
| Customer concentration, owner dependence | Revenue may not survive the sale | Revenue by customer; customer calls | Structure, price, transition plan |
| Business type ineligible | The lender must check (source `sba-sop-50-10-8-1-ineligible-businesses`) | Ask the lender early | Conventional financing, seller financing |
| Lease shorter than the loan | Source `sba-sop-50-10-8-1-lease-term` | Lease summary from legal diligence | Extension or new lease before closing |
| Incomplete or slow package | Files go stale; statements age out (90 and 120 days: source `sba-sop-50-10-8-1-owner-financial-statement`) | Tracker B rows all owned and dated | Weekly push; refresh statements |
| Earnout in the structure | Prohibited in a 7(a) change of ownership (source `sba-sop-50-10-8-1-earnouts`) | LOI terms | Restructure as price, seller note or a permitted buyer rebate |
| Personal credit or global cash flow issues | Global cash flow must meet 1:1 (source `sba-sop-50-10-8-1-global-cash-flow`) | Personal budget and debts | Pay down debts; co-borrower; smaller deal |

## If a lender says no

1. Ask, through the user, for the reasons in writing.
2. Sort: fixable (documents, structure), price-related (valuation, coverage), or fundamental (business type, buyer fit).
3. A decline from one lender is not a decline from all; credit policies differ. But re-shopping the same file with the same weakness wastes exclusivity.
4. Update the timeline and tell the user whether exclusivity needs an extension (`small-business-acquisition-negotiation`).
5. Log it in `lender.md` and `decisions.md`.
