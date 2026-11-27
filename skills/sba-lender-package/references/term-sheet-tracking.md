# lender.md and term-sheet tracking

## Template (deals/<slug>/lender.md)

```markdown
# Lender: <business>

Target closing: YYYY-MM-DD · Exclusivity ends: YYYY-MM-DD · Status: shortlisting | package sent | term sheet signed | approved | closing

## Lenders
| Lender (as the user names it) | Type (bank, non-bank SBA lender, loan broker) | Contact (user-provided) | Delegated authority? (ask) | Status | Last contact |
|---|---|---|---|---|---|

## Timeline (scripts/lender-math.mjs; overrides from lender quotes marked *)
| Step | Date | Done |
|---|---|---|

## Package checklist
(see references/package-checklist.md; status mirrors diligence-tracker.csv B rows)

## Term sheets (quoted terms)
| Term | Lender A | Lender B |
|---|---|---|
| Date received / expires | | |
| Loan amount | | |
| Program (SBA 7(a), conventional, other) | | |
| Rate (fixed / variable, index + spread) | | |
| Term and amortization | | |
| Fees (packaging, guarantee fee, closing, other) | | |
| Prepayment terms | | |
| Equity required and allowed sources | | |
| Seller note treatment (standby, counted as equity?) | | |
| Collateral (business assets, personal real estate) | | |
| Personal guarantees required | | |
| Life / other insurance required | | |
| Third-party reports and who pays | | |
| Working capital or line of credit included | | |
| Key conditions | | |
| Timeline quoted to approval / closing | | |
| Deposit required, refundable? | | |

## Script comparison (scripts/lender-math.mjs compare)
| Lender | Monthly payment | Annual debt service | Fees | Combined debt service | Coverage | Meets threshold (source id) |
|---|---:|---:|---:|---:|---:|---|

## Commitment conditions
| Condition (quoted) | Owner | Due | Status | Tracker id |
|---|---|---|---|---|

## Contact log
- YYYY-MM-DD: <what the user reported>
```

## Comparing term sheets

1. Put each sheet's principal, rate, term and fees into JSON:

```json
{ "ebitda": 420000, "otherAnnualDebtService": 0, "threshold": 1.25,
  "sheets": [ { "lender": "A", "principal": 1100000, "annualRate": 0.0975, "years": 10, "fees": 15000 },
              { "lender": "B", "principal": 1100000, "annualRate": 0.0925, "years": 10, "fees": 28000 } ] }
```

2. `otherAnnualDebtService`: seller note payments if any are paid during the loan (none if on full standby), equipment loans that stay, the buyer's other business debt. Coverage is EBITDA over combined debt service after the transaction (source `sba-sop-50-10-8-1-dsc-definition`).
3. `threshold`: 1.25 for an SBA 7(a) initial acquisition (source `sba-sop-50-10-8-1-dsc-ratio`); use the lender's own if higher.
4. A 7(a) acquisition loan amortizes over no more than 10 years and can't have a balloon (source `sba-sop-50-10-8-1-change-of-ownership-term`); a sheet showing otherwise is a question for the lender.
5. Beyond the numbers: certainty of execution (has this lender closed similar deals recently, who decides, delegated authority), collateral and guarantee terms (`personal-guarantee-risk-review`), conditions that could delay closing.

## Questions for a lender shortlist

1. How many acquisition loans like this did you close last year?
2. Do you have delegated authority, and will this file go through it? (Affects who decides: source `sba-sop-50-10-8-1-lgpc-decision`.)
3. Your full checklist and forms, please.
4. Your timeline from complete package to approval and to closing, and the common causes of delay.
5. Equity, seller note, collateral, guarantee and insurance requirements for this deal.
6. All fees, and who pays any loan broker.
7. Who orders and pays for the valuation and any QoE, and when (sources `sba-sop-50-10-8-1-valuation-for-lender`, `sba-sop-50-10-8-1-diligence-costs`).
