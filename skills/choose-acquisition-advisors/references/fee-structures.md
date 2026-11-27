# Fee structures, comparing quotes and engagement letters

No fee figures here: ranges move and vary by region and deal. Collect quotes on the same scope and let the numbers come from them.

## Common fee structures

| Structure | How it works | Good for the buyer when | Watch |
|---|---|---|---|
| Fixed fee | One price for a defined scope | Scope is clear; you want certainty | What's excluded; what triggers a change order |
| Fixed fee by phase | A price per phase (LOI review, diligence, purchase agreement, closing) | Deal might die; you pay only for phases reached | Phases defined clearly |
| Hourly with a cap | Hourly rates up to a ceiling | Scope uncertain | Whether the cap is firm; who decides when to exceed it |
| Hourly, no cap | Pay for time spent | Rarely, for small deals | Open-ended cost |
| Success-based / contingent | Paid only at closing, often a percentage | You want less at risk if the deal dies | Advisor's incentive is that the deal closes |
| Percentage of loan | Common for loan packagers and brokers | Placing a hard loan | Who pays; whether the lender also charges |
| Retainer | Paid up front, drawn against | Firm's policy | Whether unused retainer is refunded |

## Comparing quotes

1. Write one scope per role (for example, for the lawyer: LOI review; legal diligence on contracts, lease, licenses, litigation and lien searches; purchase agreement, seller note, non-compete, consulting agreement, closing documents; coordination with the lender's counsel).
2. Send the same scope to every candidate (the user sends).
3. Ask each to state: fee and basis; what's excluded; who does the work; timeline; what's owed if the deal dies at each phase.
4. Put each quote into `advisor-budget.mjs`:

```json
[
  { "role": "lawyer", "basis": "fixed", "amount": 0, "whenPaid": "split", "beforeClosePct": 0.5 },
  { "role": "qoe", "basis": "fixed", "amount": 0, "whenPaid": "before-close" },
  { "role": "cpa", "basis": "hourly", "rate": 0, "hoursLow": 0, "hoursHigh": 0, "cap": 0, "whenPaid": "before-close" },
  { "role": "insurance broker", "basis": "fixed", "amount": 0, "whenPaid": "at-close" }
]
```

5. Read the output: total low/high, percentage of price, and **at risk if the deal dies** (what's paid before closing). That last number is what phased diligence protects (see `small-business-financial-due-diligence`).

## What drives cost

- Deal complexity: stock purchase, real estate, many contracts or licenses, many employees, inventory, earnouts.
- Quality of the seller's records: messy books make QoE and CPA work longer.
- How much the other side fights.
- Speed: rush timelines cost more.
- Whether you send organized documents and decisions on time.

## Engagement letter checklist

Before the user signs, check that the letter states:

- [ ] Who the client is (the buyer personally, or the buyer's entity).
- [ ] Scope, in the same words as the quote.
- [ ] Exclusions, and how extra work is approved and priced.
- [ ] Fee, basis, cap, and payment timing.
- [ ] What's owed if the deal dies at each stage.
- [ ] Who does the work.
- [ ] Timeline commitments.
- [ ] Conflicts checked and disclosed (relationship with seller, broker, lender).
- [ ] For a QoE: who may rely on the report (buyer, lender) and any reliance letter.
- [ ] How to end the engagement.

Flag gaps to the user. Questions about what the engagement letter's terms mean legally go to the user's own lawyer, not to this skill.
