# Personal guarantee explainer and question lists

## Terms, in plain words

| Term | What it means for the user | Where it's decided |
|---|---|---|
| Personal guarantee | A promise to repay the business's loan personally if the business doesn't | The loan documents; who must sign an SBA loan is set by the current SOP and the lender |
| Unlimited guarantee | Covers the whole debt plus costs, not capped at a dollar amount | The guarantee document |
| Limited guarantee | Capped by amount, percentage or specific collateral | The guarantee document and lender policy |
| Joint and several | Each guarantor can be pursued for the full amount, not just a share | The guarantee document |
| Collateral | Specific assets pledged; the lender may take and sell them on default | The loan documents; SBA collateral policy is in the current SOP |
| Lien | The lender's recorded claim on an asset (for example a mortgage or deed of trust on a home) | Recorded with the county or state |
| Blanket lien | A claim on all of the business's assets, commonly recorded by a public filing | The security agreement |
| Spouse signature | A lender may ask a spouse to sign, for example to give a lien on jointly owned property | Lender policy and state property law (a lawyer explains) |
| Life insurance assignment | The lender is named to receive insurance proceeds up to the loan balance if the borrower dies | Lender requirement |
| Default | Missing payments or breaking other loan promises (covenants), which lets the lender act | The loan documents |
| Deficiency | What's still owed after collateral is sold | Arithmetic, plus negotiation and state law |

## SBA rules (SOP 50 10 8.1, effective for loans numbered on or after 2026-10-01)

Quote these with the source id. Check each file's `review_by` date in `references/sources.md`; if it has passed, say the rule may have changed. The lender's reading of the current SOP governs.

| Rule | What the SOP says | Source |
|---|---|---|
| Who guarantees | "Any individual who has direct and/or indirect ownership of 20% or more of an Applicant must provide an unlimited full guaranty." | `sba-sop-50-10-8-1-personal-guaranty` |
| Spouses | "Each spouse owning less than 20% of an Applicant must personally guarantee the loan in full when the combined ownership interest of both spouses and minor children is 20% or more." | `sba-sop-50-10-8-1-spouse-guaranty` |
| Others | The lender "may require other appropriate individuals or entities to provide full or limited guaranties of the loan without regard to the percentage of their ownership interests." | `sba-sop-50-10-8-1-other-guarantors` |
| Fully secured | A loan is "fully secured" when liens on the business's fixed assets (real estate, machinery, equipment), at adjusted values, reach the loan amount. | `sba-sop-50-10-8-1-fully-secured` |
| Personal real estate | If the loan isn't fully secured, the lender "Must take available equity in the personal real estate … solely owned by" co-borrowers, 20%+ owners and guarantors (supplemental guarantors excepted). | `sba-sop-50-10-8-1-personal-real-estate` |
| Low-equity property | Real estate with equity under 25% of fair market value need not be taken to meet the fully secured test. | `sba-sop-50-10-8-1-real-estate-equity-threshold` |
| Lien limits | "Liens on personal real estate may be limited to the amount of the collateral shortfall … may be limited to 150% of the equity in the collateral." | `sba-sop-50-10-8-1-lien-limit` |
| Life insurance | The credit memo addresses "Life Insurance – on whom and how much. If life insurance is not required, provide justification." | `sba-sop-50-10-8-1-insurance-credit-memo` |
| Personal financial statement | Owners of 20% or more and proposed guarantors give one (SBA Form 413 or the lender's equivalent), "including the assets of the owner's spouse and minor children," dated within 90 days. | `sba-sop-50-10-8-1-owner-financial-statement` |
| Seller staying on | In a partial change of ownership, a selling owner who keeps under 20% "must provide a full guaranty for the full loan amount," for at least two years after final disbursement. | `sba-sop-50-10-8-1-partial-change-guaranty` |

What these mean for the household conversation: owning 20% or more means an unlimited guaranty; "solely owned" in the real estate rule and how jointly owned property is treated are questions for the lender and a lawyer; whether the home is taken depends on whether business assets fully secure the loan, which the lender calculates. Never tell the user the house is safe or will be taken; show the rule and the questions.

## How the downside usually unfolds (general pattern)

Explain without predicting: a struggling business misses payments; the lender may work out new terms, or call the loan; business assets are sold, often for less than book value; the guarantor is asked for the shortfall; settlement, a payment plan, sale of pledged assets, or in hard cases bankruptcy may follow. A lawyer explains the user's options at each step. The exposure script models only the arithmetic of the shortfall.

## Why acquisitions fail (for the risk conversation)

Common reasons practitioners describe; use them as a checklist for diligence, not statistics:

- Earnings were overstated, or depended on the seller personally.
- A top customer, key employee or supplier left after closing.
- Too much debt for the cash flow, leaving no room for a bad year.
- Deferred equipment or software spending came due.
- The buyer changed too much too fast.
- An industry shift (regulation, technology, a new competitor). See `ai-disruption-risk-check`.

Each maps to a later skill: earnings (`sde-and-add-backs-analysis`), concentration (`small-business-risk-assessment`), leverage (`acquisition-deal-model`).

## Exposure input (`pg-exposure-input.json`)

```json
{
  "guaranteedLoans": [
    { "name": "Bank loan", "principal": 1350000, "ratePct": 10.5, "years": 10 },
    { "name": "Seller note (if guaranteed)", "principal": 225000, "ratePct": 6, "years": 5, "standbyMonths": 24 }
  ],
  "failureYears": [1, 2, 3, 5],
  "businessLiquidationValue": 150000,
  "collectionCostsPct": 10,
  "equityInvested": 175000,
  "pledgedCollateral": [{ "name": "Home equity (lien)", "netValue": 300000 }],
  "otherPersonalAssets": 200000
}
```

Run with collection costs at 0 and 10 (both labeled assumptions), and the liquidation value at a cautious and a very cautious figure.

## Questions for the household

1. What is the most we could lose and still be all right? (Write the number.)
2. Are we willing to put a lien on the house? If not, is that a walk-away line?
3. How many months could we live on savings if the business paid nothing?
4. Who in the household would sign what, and do both understand it?
5. What would make us stop: a missed payment, a dollar loss, a date?
6. Are life and disability insurance in place, and for how much?
7. Are there other obligations (children's school, elder care) that change the answer?

## Questions for the lender (the user asks)

1. Who must sign a personal guarantee, and is it unlimited or limited?
2. What collateral will you take: business assets, real estate, my home? Under what conditions would you take a lien on the home?
3. Does my spouse need to sign anything, and why?
4. What life and disability insurance do you require, and for how much?
5. Does the seller note need a guarantee from me, and how is it subordinated to your loan?
6. What happens if the business misses a payment: notice, cure period, workout options?
7. Are there covenants (financial tests) whose breach is a default?
8. Is the guarantee released at any point, for example after the loan is paid down?

## Questions for a lawyer

1. Read the guarantee and the security documents before I sign: what do I owe, when, and who can enforce it?
2. In my state, which personal assets can a creditor reach, and how does home ownership (for example, joint ownership with a spouse) affect that?
3. Is there legitimate planning to do before signing, and what planning would be unwise or undone later?
4. Does the purchase agreement's indemnity or the seller note's set-off right help me if the business was misrepresented?
5. What entity should own the business, and does it change my personal exposure beyond the guarantee?

Some buyers hire counsel for these questions; buyers who do can look for AI-using law firms with fixed fees that are lean and run by an attorney with big-law experience.

## Guarantee insurance (if the user asks)

Insurance products that cover part of a personal guarantee are offered in some markets. Questions to ask any provider: what percentage of the loss is covered, the waiting period before coverage starts, exclusions (fraud, covenant breaches, specific causes), the premium and whether it rises, how a claim is paid and when, and whether the lender must agree. Treat it as one input; it doesn't remove the guarantee.
