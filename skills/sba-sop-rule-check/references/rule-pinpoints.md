# Rule pinpoints and input fields

Every rule here is quoted in a `references/sources.md<id>.yaml` file from SOP 50 10 8.1 (effective for loans given an SBA loan number on or after 2026-10-01). Open the file before relying on it: check `review_by`, and use the file's quote, not this summary, when the wording matters. If a source file has been removed or its quote differs, trust the file and flag the difference.

## Checks the script runs

| # | Check | Pinpoint | Source id |
|---|---|---|---|
| C1 | Which SOP applies | SBA Information Notice 5000-880695 | `sba-information-notice-5000-880695` |
| C2 | Transaction type | Appendix 15 (four categories) | `sba-sop-50-10-8-1-change-types` |
| C3 | Equity minimum, 10% for an initial acquisition, on total project cost | Appendix 15, Para. C.2.a | `sba-sop-50-10-8-1-equity-minimum`, `sba-sop-50-10-8-1-equity-project-cost` |
| C4 | Limited sources no more than half of required equity | Appendix 15, Para. C.2.a | `sba-sop-50-10-8-1-equity-limited-sources` (unlimited sources: `sba-sop-50-10-8-1-equity-unlimited-sources`) |
| C5 | Education, advisory and agent fees aren't equity | Appendix 15, Para. C.2.a | `sba-sop-50-10-8-1-prepaid-not-equity` (diligence report costs can count: `sba-sop-50-10-8-1-diligence-costs`) |
| C6 | Seller note as equity only on full standby for the 7(a) term | Appendix 15 | `sba-sop-50-10-8-1-seller-debt-equity`, `sba-sop-50-10-8-1-standby-terms` |
| C7 | Interest-only debt amortized over no more than 10 years for coverage | Appendix 15, Para. C.2.b | `sba-sop-50-10-8-1-interest-only-debt` |
| C8 | Price above valuation covered by equity | Appendix 15 | `sba-sop-50-10-8-1-valuation-gap-equity` (valuation for the lender: `sba-sop-50-10-8-1-valuation-for-lender`; qualified source: `sba-sop-50-10-8-1-qualified-source`; $350,000 or less: `sba-sop-50-10-8-1-valuation-350k`) |
| C9 | Total debt, incl. seller debt not on full standby, capped at valuation | Appendix 15 | `sba-sop-50-10-8-1-total-debt-cap` |
| C10 | Quality of earnings at $3 million or more | Appendix 15 | `sba-sop-50-10-8-1-qoe-threshold`, `sba-sop-50-10-8-1-qoe-dsc` |
| C11 | Standard 7(a) maximum $5,000,000 | Section B, Ch. 1 | `sba-sop-50-10-8-1-max-loan` |
| C12 | Amortization no more than 10 years (real estate portion up to 25), no balloon | Appendix 15, Para. B | `sba-sop-50-10-8-1-change-of-ownership-term`, `sba-sop-50-10-8-1-real-estate-structure` |
| C13 | Coverage: 1.25:1 initial acquisition, 1.15:1 expansion, 1.25:1 owner buyout and ESOP/co-op; last FYE or two-year average; EBITDA ÷ combined post-transaction debt service | Appendix 15, Para. C.2 | `sba-sop-50-10-8-1-dsc-ratio`, `sba-sop-50-10-8-1-dsc-definition` |
| C14 | Seller earnouts prohibited | Appendix 15 | `sba-sop-50-10-8-1-earnouts` |
| C15 | Buyer rebate proceeds pay down 7(a) principal | Appendix 15 | `sba-sop-50-10-8-1-seller-rebate-principal` |
| C16–C17 | Seller may stay only as a consultant, up to 24 months (initial acquisition, expansion) | Appendix 15 | `sba-sop-50-10-8-1-seller-consultant` |
| C18 | Lease term with borrower renewals should equal or exceed loan term | Section A, Ch. 3 | `sba-sop-50-10-8-1-lease-term` |
| C19 | Guaranties and personal real estate | Section A, Ch. 5, Para. A; Appendix 15, Para. C.3 | `sba-sop-50-10-8-1-personal-guaranty`, `sba-sop-50-10-8-1-spouse-guaranty`, `sba-sop-50-10-8-1-other-guarantors`, `sba-sop-50-10-8-1-personal-real-estate`, `sba-sop-50-10-8-1-lien-limit` |
| C20 | Ineligible business types (13 CFR 120.110) | Section A, Ch. 1, Para. E | `sba-sop-50-10-8-1-ineligible-businesses` |

## Qualitative rows (mark by hand)

| Row | Pinpoint | Source id |
|---|---|---|
| Projections evaluated but not relied on for coverage (except owner-occupied special purpose property) | Appendix 15, Para. C.2 | `sba-sop-50-10-8-1-projections` |
| Adjustments: prudent, for savings realized through the transaction, each justified | Appendix 15, Para. C.2 / C.2.b | `sba-sop-50-10-8-1-adjustments`, `sba-sop-50-10-8-1-adjustment-items`, `sba-sop-50-10-8-1-adjustment-justification` |
| Global cash flow at 1:1, including affiliates | Appendix 15, Para. C.2.b | `sba-sop-50-10-8-1-global-cash-flow` |
| Owner compensation covers obligations and living expenses | Appendix 15, Para. C.2.b | `sba-sop-50-10-8-1-owner-compensation` |
| Three most recent year-ends analyzed | Appendix 15, Para. C.2.b | `sba-sop-50-10-8-1-three-years` |
| Working capital adequate for at least 12 months; working assets may go on a line | Appendix 15 | `sba-sop-50-10-8-1-working-capital-adequacy`, `sba-sop-50-10-8-1-working-assets-line` |
| Stock or asset purchase allowed under Appendix 15; 100% stock buyer and business are co-borrowers | Appendix 15 | `sba-sop-50-10-8-1-asset-or-stock`, `sba-sop-50-10-8-1-borrower-structure` |
| Paying off the seller's business debt is part of the change of ownership, not a refinancing | Appendix 15 | `sba-sop-50-10-8-1-debt-payoff` |
| Transferable licenses taken as collateral | Appendix 15 | `sba-sop-50-10-8-1-transferable-licenses` |
| Partial change: selling owner keeping under 20% guarantees the full loan for at least two years | Appendix 15 | `sba-sop-50-10-8-1-partial-change-guaranty` |
| Bigger deals: pari passu non-SBA loan with maturity not shorter than the 7(a) | Appendix 15, Para. C.3 | `sba-sop-50-10-8-1-pari-passu` |
| Seller note refinanced with SBA financing only after 36 months in place and current, with a 10% payment improvement | Appendix 15 | `sba-sop-50-10-8-1-seller-note-refi-terms` |

## Not covered by our sources

Say so and make each a lender question: citizenship and residency, rates and spreads, guaranty fees, prepayment, credit score expectations, industry-specific rules (online, software, franchise), 504 details, and any rule for which no `references/sources.md` file exists.

## Earnout alternatives (for the lender and a lawyer to weigh)

Since seller earnouts are prohibited in a 7(a) change of ownership (`sba-sop-50-10-8-1-earnouts`), list options to discuss, without judging which a lender will accept: a lower fixed price; a larger seller note, on full standby if it is to count as equity; a buyer rebate tied to performance (allowed, with proceeds applied to 7(a) principal); a seller consulting agreement within the 24-month limit. A lawyer drafts any of them.

## Input fields (`sop-check-input.json`)

```json
{
  "transactionType": "initial-acquisition",
  "loanNumberDate": null,
  "industry": "commercial cleaning",
  "businessPurchasePrice": 2000000,
  "realEstate": 0,
  "closingCosts": 80000,
  "workingCapital": 120000,
  "otherCosts": 0,
  "valuation": null,
  "equity": { "unborrowedCash": 120000, "gift": 0, "qualifyingPersonalLoan": 0, "standbySellerNote": 100000, "otherStandbyDebt": 0, "minorityEquity": 0, "diligenceCostsPaid": 0, "advisoryFeesClaimed": 0 },
  "sba": { "principal": 1980000, "ratePct": 10.5, "amortYears": 10, "balloon": false, "realEstatePortion": false },
  "sellerNote": { "principal": 100000, "ratePct": 6, "years": 10, "fullStandbyForLoanTerm": true, "interestOnly": false },
  "otherDebt": [],
  "combinedAnnualDebtService": null,
  "ebitdaLastFye": 420000,
  "ebitdaPriorFye": 380000,
  "earnout": false,
  "buyerRebate": false,
  "sellerStaysAsEmployeeOrOwner": false,
  "sellerConsultingMonths": 12,
  "leaseTermYearsInclRenewals": 15
}
```

Leave unknowns as `null`; the script reports them as missing facts. If `combinedAnnualDebtService` is null, the script computes it from the SBA loan and any seller note not on full standby (interest-only notes at a 10-year amortization) plus `otherDebt[].annualDebtService`.
