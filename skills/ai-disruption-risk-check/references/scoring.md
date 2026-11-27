# Scoring AI exposure

## The 0–3 scale (per service, per channel)

| Score | Replace / Commoditize meaning | Cost-lever meaning |
|---|---|---|
| 0 | No realistic path: the job is physical, regulated or relationship-bound, and evidence shows no pressure | No meaningful hours in tasks AI helps with |
| 1 | Possible at the edges: some tasks exposed, little or no sign in customer or price data | A few back-office hours could be saved |
| 2 | Real exposure: core tasks are exposed and there's at least one concrete signal (a test that worked, a low-price competitor, slipping prices or scope) | Material hours in exposed tasks; savings plausible but unproven |
| 3 | Already happening: customer behavior or price data in the records shows it | Large share of delivery hours in exposed tasks, with evidence |

A score of 2 or 3 needs at least one piece of evidence of type 1–4 from `evidence.md`. Without it, cap the score at 1 and mark the open question. A score of 0 also needs a reason grounded in the task inventory, not just "it's a trade".

## Revenue-weighted exposure

For each service, take the higher of its Replace and Commoditize scores. Weight by the service's share of revenue and add up:

exposure = Σ (share of revenue × max(Replace, Commoditize))

Result from 0 to 3:

- under 1.0: low exposure.
- 1.0 to under 2.0: moderate; worth specific diligence and a stress case in the model.
- 2.0 and above: high; affects price and structure, and possibly whether to proceed.

If shares are assumed, say so next to the result. Keep the cost lever separate: it is upside the new owner must earn, and adding it to exposure would hide real risk.

## Worked example (illustrative, not data)

A bookkeeping and payroll firm, 300 small-business clients.

| Service (share) | Replace | Commoditize | Max | Weighted |
|---|---|---|---|---|
| Monthly bookkeeping (60%, assumed from CIM) | 2 (agent's test drafted a reconciliation summary that needed fixes; not a full close) | 2 (two local competitors advertise lower monthly fees; user's research) | 2 | 1.2 |
| Payroll (25%) | 1 (clients use payroll software already; firm sells service on top) | 1 | 1 | 0.25 |
| Year-end tax prep (15%) | 1 (signed returns need a preparer) | 2 (price pressure: owner said, unverified) | 2 | 0.3 |
| **Total** | | | | **1.75 moderate** |

Cost lever: 2 (data entry and reconciliation are a large share of staff hours, per the owner; unverified).

Strongest case against: client churn has been flat for three years (2023–2025 customer list), and clients buy accountability more than data entry.

What would change it: churn or average fee per client falling in the TTM; a test of a full month-end close succeeding with little rework.

## Avoiding hype both ways

- Don't say "AI will replace X" or "X is AI-proof". Say which tasks, what evidence, and what would change the rating.
- Don't treat the cost lever as a reason to pay more. Savings count only once achieved.
- Date the analysis. Rescore before signing the LOI and before closing if months pass.
