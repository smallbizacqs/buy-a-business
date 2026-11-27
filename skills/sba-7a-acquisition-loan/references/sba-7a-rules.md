# SBA 7(a) acquisition rules, equity worksheet, checklist and lender questions

All rules below are from SOP 50 10 8.1, which applies to loans given an SBA loan number on or after 2026-10-01 (`sba-information-notice-5000-880695`). Quote them with the source id. Before using one, open `data/sources/<id>.yaml` and check `review_by`; if it has passed, say the rule may have changed. Always tell the user to confirm the current SOP and the lender's reading. Anything not in this table is not sourced here: make it a lender question.

## Rules table

| Topic | Rule (quoted or closely paraphrased) | Source id |
|---|---|---|
| Who lends | "SBA does not provide 7(a) loans directly to borrowers"; lenders make them and SBA guarantees part | `sba-7a-loans-page` |
| Use | "Changes of ownership (complete or partial)" is a listed use | `sba-7a-loans-page-uses` |
| Guaranty share | Max guaranty $3,750,000; 85% for loans of $150,000 or less, 75% above | `sba-sop-50-10-8-1-guaranty-percentage` |
| Loan cap | "The maximum loan amount for any one Standard 7(a) loan is $5,000,000." | `sba-sop-50-10-8-1-max-loan` |
| Term | Acquisition loans "must not have an amortization that exceeds 10 years" (special purpose property aside) and "may not have a balloon" | `sba-sop-50-10-8-1-change-of-ownership-term` |
| Real estate in the deal | Only the real estate portion may amortize beyond 10 years, up to 25; everything else 10 years | `sba-sop-50-10-8-1-real-estate-structure` |
| Purchase price definition | "Business Purchase Price" excludes owner-occupied commercial real estate bought in the deal | `sba-sop-50-10-8-1-business-purchase-price` |
| Bigger deals | A non-SBA loan sharing the lien equally (pari passu) isn't a piggyback structure if its maturity isn't shorter than the 7(a) loan's | `sba-sop-50-10-8-1-pari-passu` |
| Equity minimum | "Initial Acquisition: 10%. For Initial Acquisitions, the required equity injection cannot be reduced or eliminated." | `sba-sop-50-10-8-1-equity-minimum` |
| Equity base | Based on "total project cost (all costs required to become operational, regardless of the source of funds, except for lines of credit and 504 loans)" | `sba-sop-50-10-8-1-equity-project-cost` |
| Unlimited equity sources | Unborrowed cash (including a gift); a personal loan to a guarantor repaid from a source other than the business's cash flow (owner salary doesn't qualify) | `sba-sop-50-10-8-1-equity-unlimited-sources` |
| Limited equity sources | Standby debt, standby seller debt, minority equity investments: together "no more than half of the required Equity Injection" | `sba-sop-50-10-8-1-equity-limited-sources` |
| Seller note as equity | Only if "subordinated to the Lender and on full standby (no payments of principal or interest for the term of the 7(a) loan)" | `sba-sop-50-10-8-1-seller-debt-equity` |
| Standby terms | Standby debt may accrue interest, paid after the 7(a) loan is repaid; the standby creditor subordinates liens and takes no action without lender consent | `sba-sop-50-10-8-1-standby-terms` |
| Not equity | Education, advisory and agent fees | `sba-sop-50-10-8-1-prepaid-not-equity` |
| Diligence costs | What the buyer spends on the financial due diligence reports "can count toward the equity injection" | `sba-sop-50-10-8-1-diligence-costs` |
| Valuation | Must support the price; "If the amount paid for the business exceeds the business valuation, the difference must be made up by equity." | `sba-sop-50-10-8-1-valuation-gap-equity` |
| Who values | Requested by and prepared for the lender, not for buyer or seller | `sba-sop-50-10-8-1-valuation-for-lender` |
| Valuer | An accredited, independent "Qualified Source" | `sba-sop-50-10-8-1-qualified-source` |
| Small deals | At a business purchase price of $350,000 or less the lender may value it itself, unless buyer and seller are closely related | `sba-sop-50-10-8-1-valuation-350k` |
| Quality of earnings | Required for initial acquisitions and expansions at a purchase price of $3 million or more, measured before financing | `sba-sop-50-10-8-1-qoe-threshold` |
| QoE drives coverage | When a QoE is required, coverage is computed from its findings; the loan shrinks if coverage doesn't support it | `sba-sop-50-10-8-1-qoe-dsc` |
| Buyer's own QoE | The lender may have a buyer-commissioned QoE reviewed by an approved vendor | `sba-sop-50-10-8-1-qoe-buyer-commissioned` |
| Total debt cap | All debt, including seller debt not on full standby, "is limited to the business valuation amount" and must be covered by cash flow | `sba-sop-50-10-8-1-total-debt-cap` |
| Coverage | 1.25:1 for initial acquisitions, on the last fiscal year-end or the average of the last two, historical or adjusted basis | `sba-sop-50-10-8-1-dsc-ratio` |
| Coverage definition | EBITDA ÷ combined post-transaction debt service | `sba-sop-50-10-8-1-dsc-definition` |
| Projections | The lender evaluates them but "may not rely on them" for coverage, except owner-occupied special purpose property | `sba-sop-50-10-8-1-projections` |
| Adjustments | Prudent adjustments for savings realized through the transaction; each must be justified | `sba-sop-50-10-8-1-adjustments`, `sba-sop-50-10-8-1-adjustment-justification` |
| Interest-only debt | For coverage, interest-only acquisition debt not on full standby is amortized over no more than 10 years | `sba-sop-50-10-8-1-interest-only-debt` |
| Global cash flow | Including affiliates, must meet 1:1 | `sba-sop-50-10-8-1-global-cash-flow` |
| Owner pay | Must "support their current obligations and living expenses" | `sba-sop-50-10-8-1-owner-compensation` |
| History | Three most recent year-ends of the acquired business | `sba-sop-50-10-8-1-three-years` |
| Working capital | Adequacy analyzed over at least the next 12 months; working assets may be financed on a line of credit | `sba-sop-50-10-8-1-working-capital-adequacy`, `sba-sop-50-10-8-1-working-assets-line` |
| Lease | Lease term with the borrower's renewal options "should equal or exceed the term of the loan" | `sba-sop-50-10-8-1-lease-term` |
| Guaranties | 20%+ owners: unlimited full guaranty; spouse rule; lender may require others | `sba-sop-50-10-8-1-personal-guaranty`, `sba-sop-50-10-8-1-spouse-guaranty`, `sba-sop-50-10-8-1-other-guarantors` |
| Collateral | Personal real estate equity when business assets fall short; lien limits | `sba-sop-50-10-8-1-personal-real-estate`, `sba-sop-50-10-8-1-lien-limit` |
| Management | Credit memo covers industry experience and who runs daily operations | `sba-sop-50-10-8-1-management-experience` |
| Seller staying | Initial acquisition: seller may only stay as a consultant, up to 24 months total | `sba-sop-50-10-8-1-seller-consultant` |
| Earnouts | "Seller earnouts are prohibited"; buyer rebates tied to performance are allowed | `sba-sop-50-10-8-1-earnouts` |
| Stock purchase | Buyer and business are co-borrowers when a new owner buys 100% of the stock | `sba-sop-50-10-8-1-borrower-structure` |
| Ineligible types | The lender must check the business against the ineligible list (13 CFR 120.110) | `sba-sop-50-10-8-1-ineligible-businesses` |
| Credit elsewhere | The lender certifies the borrower can't get the credit on reasonable terms without SBA help | `sba-sop-50-10-8-1-credit-elsewhere` |

Not covered by our sources (ask the lender, and point to the current SOP): interest rate caps and spreads, guaranty fees, prepayment penalties, citizenship and residency rules, credit score expectations, 504 program details, specific rules for online or software businesses.

## Equity worksheet (initial acquisition)

| Line | Amount | Note |
|---|---|---|
| A. Purchase price (business) | | Excludes owner-occupied commercial real estate for the purchase-price definition |
| B. Real estate, if any | | |
| C. Closing costs, fees, diligence reports | | |
| D. Working capital funded at close | | |
| E. Other costs to become operational | | |
| F. Total project cost = A+B+C+D+E | | Lines of credit and 504 loans are excluded from the equity base |
| G. Minimum equity = 10% × F | | The lender may require more |
| H. Most from limited sources = 50% × G | | Standby debt, full-standby seller note, minority equity, combined |
| I. Minimum from unlimited sources = G − H | | Unborrowed cash, gift, qualifying personal loan |
| J. Price above the lender's valuation, if any | | Must be added in equity |
| K. Limited sources actually lined up (no more than H) | | For example, a seller note the seller agrees to put on full standby |
| L. Buyer cash needed at minimum = G − K + J | | Unborrowed cash, gift or qualifying personal loan |

Worked example (labeled illustration): price $2,000,000, costs $80,000, working capital $120,000 → F = $2,200,000; G = $220,000; H = up to $110,000 from a full-standby seller note; I = at least $110,000 of the buyer's own unborrowed cash or qualifying loan.

## Document checklist (what lenders ask for)

Sourced items:
- Purchase agreement, business valuation, pro forma balance sheet as of transfer, seller's financial statements for the last 3 complete fiscal years (`sba-sop-50-10-8-1-application-business-purchase`).
- Personal financial statement for 20%+ owners and guarantors, including spouse and minor children's assets, dated within 90 days; business financials within 120 days (`sba-sop-50-10-8-1-owner-financial-statement`).
- SBA Form 1919 for each co-borrower (`sba-sop-50-10-8-1-form-1919`).
- Copy of the lease (`sba-sop-50-10-8-1-lease-term`).

Usually also requested (ask the lender for its list): personal tax returns, résumé, a short business plan and transition plan, sources of equity with statements, the LOI, and the business's tax returns and interim statements.

## Lender comparison questions

| # | Question |
|---|---|
| 1 | How many business acquisition loans did you close in the last year, and any in this industry? |
| 2 | Do you process this on a delegated basis or send it to SBA? (For non-delegated loans SBA itself decides; `sba-sop-50-10-8-1-lgpc-decision`) |
| 3 | Rate (index and spread), fixed or variable, guaranty fee, packaging and other fees, prepayment terms |
| 4 | How you calculate coverage: which year or average, which adjustments, how you treat the seller note |
| 5 | How much equity you require for this deal, and how you treat a gift, a home equity line, a 401(k) plan, investor money |
| 6 | Seller note: full standby required? Term and accrual you accept? |
| 7 | Collateral: will you take a lien on my home, and how would you size it? |
| 8 | Who orders the valuation and QoE, cost, timing; will you review a QoE I commission? |
| 9 | Working capital: in the loan, a separate line, or both? |
| 10 | Typical time from complete package to approval and to closing; who is my contact through closing? |
| 11 | Life and disability insurance requirements |
| 12 | Anything about my background, industry experience or this business type that concerns you? |
