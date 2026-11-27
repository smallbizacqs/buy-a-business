# Take-home method and the J-curve

## Input file (`take-home-input.json`)

```json
{
  "sde": 450000,
  "years": 5,
  "year1DipPct": 10,
  "growthPct": 3,
  "managerSalary": 0,
  "capexReserve": 25000,
  "taxSetAsidePct": 0,
  "minPay": 108000,
  "targetPay": 200000,
  "loans": [
    { "name": "Bank loan", "principal": 1350000, "ratePct": 10.5, "years": 10 },
    { "name": "Seller note", "principal": 225000, "ratePct": 6, "years": 5, "standbyMonths": 24, "accrueDuringStandby": true }
  ]
}
```

| Field | Meaning |
|---|---|
| `sde` | Year-one base SDE before the dip. Use the evaluated figure |
| `sdeByYear` | Optional array that replaces `sde`, `growthPct` and `year1DipPct` with explicit yearly figures |
| `year1DipPct` | Percentage cut to year one only (transition dip) |
| `growthPct` | Yearly change from year two on |
| `managerSalary` | Full yearly cost of a manager who replaces the owner's labor (0 if the owner operates) |
| `capexReserve` | Yearly cash set aside for equipment and replacements |
| `taxSetAsidePct` | Placeholder percentage of (cash before debt − interest paid). 0 shows pre-tax figures |
| `minPay` / `targetPay` | Household minimum and the salary the user wants to match |
| `loans[]` | `principal`, `ratePct`, `years` (amortization after any standby or interest-only period), `standbyMonths`, `interestOnlyMonths`, `accrueDuringStandby` (true adds unpaid interest to the balance), `balloonMonth` |

The script prints a markdown table; `--json` returns each year's figures, including payments by loan and principal repaid.

## Why the curve dips (explain with the user's numbers)

1. **Transition dip.** Customers and staff test the new owner; the buyer is still learning pricing and scheduling. Model it explicitly (`year1DipPct`) rather than hoping it away.
2. **Debt comes first.** The bank loan payment is fixed from month one. SDE that used to be the seller's income now pays the bank.
3. **The seller note wakes up.** If the note is on standby, payments start later, often stepping take-home down just as the buyer settles in. The script shows the step.
4. **Catch-up spending.** Sellers near retirement often defer equipment, software and pay raises. The capex reserve and a one-time catch-up line cover it; ask for three years of equipment spending and a walk-through of the equipment.
5. **Working capital.** A growing business ties up cash in receivables and inventory. If closing doesn't fund enough working capital, the owner funds it from take-home (see `working-capital-peg-for-small-business`, later).
6. **Taxes on cash you don't keep.** Loan principal repayment isn't an expense on the income statement, so taxable profit can exceed the cash left for the owner. The CPA works out what applies to the user's structure; the script only offers a placeholder set-aside.

## Reading the result

- **First year at target:** the year take-home first reaches the user's target. If it never does within five years, say so plainly and show what would have to change (lower price, longer loan term, more equity, less seller note in the early years, higher SDE that's real).
- **Below household minimum:** count those years and the cumulative shortfall; compare with the post-closing cash reserve in `profile.yaml`.
- **Coverage column:** cash before debt ÷ debt service. Under about 1.5, a modest bad year leaves little for the owner (a personal-cushion rule of thumb, not a lending rule). The lender's test is separate: EBITDA ÷ combined post-transaction debt service, 1.25:1 for an initial acquisition under SOP 50 10 8.1 (effective 2026-10-01; `data/sources/sba-sop-50-10-8-1-dsc-ratio.yaml` and `sba-sop-50-10-8-1-dsc-definition.yaml`).

## Wealth building, honestly

- Each year's principal repayment reduces debt; if the business holds its value, the owner's equity grows by that amount.
- Value can also change with earnings and with what buyers pay for similar businesses at exit. Never project an exit multiple as a promise; if the user wants a scenario, label it as one and show a flat and a lower case alongside it.
- The silver tsunami (many owners near retirement) may mean more businesses for sale; it doesn't guarantee better prices or quality. Treat it as context, not a reason to buy.

## What to verify first

1. SDE: add-backs, owner pay, one-time items (`sde-and-add-backs-analysis`, `verify-seller-financials`).
2. Debt terms: rate, term, fees and the seller note's standby terms (lender term sheet; `seller-note-structuring`).
3. Capex and catch-up spending: equipment age and condition.
