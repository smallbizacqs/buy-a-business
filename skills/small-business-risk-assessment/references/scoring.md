# Scoring the register

The scores are the agent's analysis, written so the user can disagree with any one of them by looking at the evidence next to it.

## Scale

**Likelihood (L), 1–5: how likely the risk shows up in the first two to three years of ownership.**

| L | Meaning | Typical evidence |
|---|---|---|
| 1 | Remote | Documents show the opposite (e.g. 200 customers, none over 3%) |
| 2 | Unlikely | Some exposure, with protections in place (written contract, staff-held relationship) |
| 3 | Possible | Exposure and no protection, but no sign of trouble |
| 4 | Likely | Exposure plus a warning sign (owner-held relationship, a customer rebidding, a license only the owner holds) |
| 5 | Expected | It is already happening (falling revenue from that customer, notice given, staff already leaving) |

**Impact (I), 1–5: how much it would hurt if it happened.**

| I | Meaning | Test |
|---|---|---|
| 1 | Minor | Under a few percent of earnings; absorbed without changes |
| 2 | Noticeable | Earnings dip, debt still covered comfortably |
| 3 | Serious | Earnings fall enough that coverage gets thin or the user's pay is cut |
| 4 | Severe | Debt coverage falls below the lender's required ratio, or a core service stops for months |
| 5 | Existential | The business can't operate (license lost) or can't pay its debt |

Where you can, tie impact to numbers: recompute earnings and the debt service coverage ratio (DSCR, earnings divided by total annual debt payments) with the risk applied, using `sba-dscr-and-affordability`. If you didn't compute it, say the impact is a judgment.

**Score = L × I (1–25).** Bands, for sorting only:

- 1–5 low: note it.
- 6–11 medium: a diligence request.
- 12–19 high: a diligence request plus a mitigation in the offer or transition plan.
- 20–25 critical: a condition the deal can't go ahead without fixing, a price or structure change, or a reason to pass.

## Evidence rules

1. Every score has one line of evidence with its source. "Top customer 34% of 2025 revenue (CIM p. 12, unverified)".
2. No evidence, no number. Write "no evidence yet" in the score column and the document request that would settle it. Don't average it in, don't guess.
3. Seller claims count as weak evidence: score them, but mark "unverified". When a document confirms or contradicts the claim, update the score and the date.
4. Your own benchmarks (what's common in the industry) go in a separate "benchmark" line and need a source in `references/sources.md`. Without one, leave them out.
5. Rescore when new documents arrive. Keep the old row in a dated note if the score moved by 5 or more, so the user can see what changed.

## Ranking and summary

- Sort by score, highest first; "no evidence yet" rows on factors that could be large (customer concentration, licenses, owner dependence) go right after the high rows, because they're the biggest unknowns.
- "Biggest three": the three highest scores or largest unknowns, one sentence each on why and what would settle it.
- Don't add the scores into one deal score. Two 4s and a 25 is not the same as eleven 3s.

## Worked example (illustrative, not data)

An HVAC service company, CIM says top customer is a property manager at 34% of revenue, owner does all commercial sales, two industry-certified technicians out of eight, contractor license in owner's name.

| Factor | Evidence | L | I | Score |
|---|---|---|---|---|
| Customer concentration | 34% from one property manager (CIM p. 12, unverified); owner-held relationship (owner, call 2026-11-20) | 4 | 4 | 16 high |
| Licenses | Contractor license in owner's name (CIM p. 4); transfer route unknown | 4 | 5 | 20 critical |
| Key employees | 2 of 8 techs certified (CIM p. 6); tenure, pay and who holds customer relationships unknown, too thin to score | – | – | no evidence yet |

Mitigations raised: a call with the property manager before closing (with the seller's permission), part of the price as a seller note or earnout tied to that account; license transfer route confirmed with a lawyer and the licensing board before the LOI is signed, and the owner staying as qualifier until a replacement qualifies.
