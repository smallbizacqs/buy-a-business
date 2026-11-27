# Model guide

## Input fields (`deal-model.json`: one scenario or an array)

```json
[
  {
    "label": "A. Buyer view (adjusted EBITDA)",
    "price": 2000000,
    "closingCosts": 80000,
    "workingCapital": 120000,
    "otherUses": 0,
    "ebitda": 480000,
    "ownerSalary": 120000,
    "capexReserve": 25000,
    "bank": { "name": "SBA 7(a) loan", "principal": 1700000, "ratePct": 10.5, "years": 10 },
    "sellerNote": { "principal": 200000, "ratePct": 6, "years": 5, "standbyMonths": 24, "accrueDuringStandby": true },
    "otherDebt": [],
    "equity": null,
    "requiredDsc": 1.25,
    "years": 5
  }
]
```

| Field | Meaning |
|---|---|
| `price`, `closingCosts`, `workingCapital`, `otherUses` | Uses of funds |
| `ebitda` | Earnings before interest, taxes, depreciation and amortization, after a market salary for whoever runs the business |
| `sde` + `ownerSalary` | Alternative to `ebitda`: EBITDA = SDE − ownerSalary. The script refuses SDE without a salary |
| `ownerSalary` | Also used for owner pay: owner pay = ownerSalary + EBITDA − debt service − capex reserve |
| `capexReserve` | Yearly equipment and replacement reserve (affects owner pay, not the coverage ratio, which follows the sourced EBITDA definition) |
| `bank`, `sellerNote`, `otherDebt[]` | Each: `principal`, `ratePct`, `years` (amortization after standby or interest-only), `standbyMonths`, `interestOnlyMonths`, `accrueDuringStandby`, `balloonMonth`, optional `name` |
| `equity` | Leave `null` to make equity the plug; give a number to see a gap |
| `requiredDsc` | Screen; 1.25 for an initial acquisition (`sba-sop-50-10-8-1-dsc-ratio`) |
| `years` | Years shown (5 is usually enough to pass any seller note standby) |

How to model common seller note cases:
- **Full standby for the SBA loan's term** (to count as equity): `standbyMonths` = loan term in months (120 for 10 years). No payments appear in the horizon; note the balance grows if interest accrues.
- **Partial standby** (for example, two years): `standbyMonths: 24`; payments start in year 3 and the heaviest year shows it.
- **Interest-only, lender view:** for coverage, SOP 50 10 8.1 has the lender apply an amortization of no more than 10 years to interest-only acquisition debt not on full standby (`sba-sop-50-10-8-1-interest-only-debt`). In lender scenarios, model the note as amortizing with `years` ≤ 10 and no interest-only months.
- **Balloon:** `balloonMonth`. The script reports balloons apart from regular debt service; they still need a payoff plan.

## Scenario set

| Scenario | EBITDA | Structure | Purpose |
|---|---|---|---|
| A. Buyer view | Adjusted (from `evaluation.md`) | As proposed | What the buyer believes |
| B. Lender, last FYE | Last fiscal year-end | As proposed; interest-only notes amortized ≤10 years | One of the two periods the lender may use |
| C. Lender, two-year average | Average of the last two fiscal year-ends | Same as B | The other permitted period |
| D. Downside | A × 0.85 | As proposed | Room for a bad year |
| E. Alternative | A | More standby note, lower price, or more equity | What fixes a weak result |

## Capital stack patterns (trade-offs to explain)

| Pattern | Pros | Cons |
|---|---|---|
| Bank (SBA) debt + buyer equity only | Simple; seller gets cash at close | Highest bank payment; seller has no stake in the handover |
| Bank + seller note on full standby | Note can count toward equity (limited source, up to half of required equity); no note payments during the loan | Seller waits years; balance may grow with accrual; seller may want a higher price |
| Bank + seller note with partial standby | Seller paid sooner | Note payments count in coverage when they start; doesn't count as SBA equity |
| Bank + seller note + investor equity | Less personal cash; bigger deal possible | Ownership and control shared; investors at 20%+ guarantee an SBA loan (`sba-sop-50-10-8-1-personal-guaranty`); securities counsel needed |
| Mostly seller financed | Small bank loan or none | Seller carries the risk and usually wants a higher price or tighter terms |

## Reading the output

- **Heaviest-year DSC** is the number to watch, not year 1. If it is below the screen while year 1 passes, a seller note coming off standby is usually the reason.
- **Max bank loan at the screen** shows how much room there is. If it is below the modeled loan, the lender may cut the loan, which means more equity, more seller note on full standby, or a lower price.
- **EBITDA cushion** to 1.25x and to 1.00x. A small cushion means one lost customer could break coverage; check concentration in `small-business-risk-assessment`.
- **Owner pay** is before income taxes; compare with the household minimum. SOP 50 10 8.1 also expects owner compensation to cover the buyer's obligations and living expenses (`sba-sop-50-10-8-1-owner-compensation`).
- **Sources and uses gap**: if the user's available equity is less than the plug, the gap is the problem to solve before an LOI.

## Price the business can carry (quick back-solve)

With the cushion line, the user can ask "what price works?": lower the price (and the bank loan with it) until the heaviest-year DSC meets the screen with the equity they have. Run two or three prices as scenarios rather than solving algebraically, and present them side by side. This is a financing limit, not a valuation; see `small-business-valuation`.
