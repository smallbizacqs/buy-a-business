# Seller note terms, talking points and question lists

## Script input (`seller-note-input.json`)

```json
[
  { "label": "A. Seller's ask", "principal": 300000, "ratePct": 7, "years": 5, "discountPct": 10 },
  { "label": "B. Full standby, 10-yr SBA term", "principal": 300000, "ratePct": 6, "years": 5, "standbyMonths": 120, "accrueDuringStandby": true, "discountPct": 10 },
  { "label": "C. 2-yr standby then 5-yr amortization", "principal": 300000, "ratePct": 6, "years": 5, "standbyMonths": 24, "discountPct": 10 },
  { "label": "D. Interest-only 3 yrs, balloon", "principal": 300000, "ratePct": 6, "years": 10, "interestOnlyMonths": 36, "balloonMonth": 36, "discountPct": 10 }
]
```

Fields: `principal`, `ratePct`, `years` (amortization after any standby or interest-only period), `standbyMonths`, `accrueDuringStandby` (true adds unpaid interest to the balance; false means none accrues), `interestOnlyMonths`, `balloonMonth`, `discountPct` (to value the payments to the seller today). The script prints a summary and a year-by-year payment table.

Notes on reading it:
- Full standby for the SBA loan's term with accrual (structure B) means the balance grows for years; show the balance after standby and the payment that follows. That later payment is real money the business must find after the bank loan is repaid.
- A balloon has to be paid or refinanced on a date. If an SBA refinance is the plan, the SOP 50 10 8.1 conditions (36 months in place and current, not on standby, 10% payment improvement; `sba-sop-50-10-8-1-seller-note-refi-terms`) must fit the timeline.

## Term checklist (for the LOI and, later, the lawyer)

| Term | Decide | Note |
|---|---|---|
| Principal | $ | Share of price; test the effect on coverage |
| Interest rate | % | Fixed; whether interest accrues during any standby |
| Amortization | years | After standby / interest-only |
| Standby | none / months / full term of the SBA loan | Full standby for the 7(a) term is required for equity treatment |
| Interest-only period | months | Lender applies ≤10-year amortization for coverage if not on full standby |
| Balloon | month and amount | Plan for how it gets paid |
| Prepayment | allowed without penalty? | Buyers usually want this |
| Security | unsecured / second lien / pledge | Subordinate to the senior lender; the lender's form may control |
| Subordination | the senior lender's form | The lender typically supplies it; a lawyer reviews |
| Personal guarantee of the note | yes / no | Adds to the buyer's exposure; see `personal-guarantee-risk-review` |
| Set-off | can the buyer reduce payments by indemnity claims? | Interacts with standby and subordination; a lawyer drafts |
| Default and cure | notice, cure period, acceleration | Who can act, and when, given subordination |
| Seller's death or incapacity | payments to the estate | Keep payments simple |
| Transfer of the note | can the seller sell it? | Buyers usually want consent |
| Tie to a consulting agreement | separate, not linked | Under SOP 50 10 8.1, consulting is up to 24 months total in an initial acquisition (`sba-sop-50-10-8-1-seller-consultant`) |
| Earnout | none with an SBA loan | Prohibited (`sba-sop-50-10-8-1-earnouts`); buyer rebates allowed |

## Why sellers carry a note (talking points to pick from)

Use only those that fit what this seller has said; the user decides what to send.

- **A higher price is possible.** The buyer can pay more in total if part is paid over time out of the business's cash flow.
- **It signals confidence.** A seller who finances part of the price shows the buyer and the lender they believe the earnings will continue.
- **The lender may need it.** Where the buyer's cash and the bank loan don't reach the price, a note closes the gap.
- **Income over time.** Monthly payments with interest, for a seller who wants retirement income.
- **Tax timing.** Receiving the price over several years can change when the seller pays tax; the seller's CPA tells them whether and how that applies.
- **Shared transition.** The seller stays invested in a smooth handover.

If the seller refuses any note: test whether a smaller note, a shorter term, a higher rate, a personal guarantee or security would change their mind; or whether a consulting agreement (within the 24-month SBA limit where it applies) or a lower price is the trade.

## Questions for the lender (the user asks)

1. Will you count a seller note toward the equity injection, and on what standby terms exactly?
2. If the note isn't on full standby, how do you include it in coverage and in total debt?
3. Do you have a standard standby and subordination agreement? Can we see it before the LOI is signed?
4. Can the seller take a security interest behind you? A personal guarantee from me?
5. Will you allow interest to accrue during standby, and payment after your loan?
6. Will you consent to set-off for indemnity claims against the note?

## Questions for a lawyer

1. Draft the note, security and guarantee (if any) to match the term sheet and the lender's subordination form.
2. How do set-off rights interact with standby and subordination?
3. What are my remedies if the seller's representations turn out wrong, and can I stop note payments?
4. What happens on default: notice, cure, acceleration, and what the seller can do while the senior loan is outstanding?
5. Is anything in the note inconsistent with the purchase agreement or the lender's commitment?

## Common mistakes to flag

- Counting a note as equity when it has payments during the SBA loan term.
- Forgetting that accrued interest on a full-standby note grows the balance.
- A balloon with no plan to pay it.
- Linking the note to a consulting agreement or performance so that it looks like an earnout.
- Agreeing to note terms in the LOI before seeing the lender's subordination form.
