# Readiness interview, runway math and rubric

## Runway math

Show every line with the user's numbers. Label anything the user didn't give as an assumption.

| Line | How to compute |
|---|---|
| A. Liquid funds available | From the user (exclude retirement accounts unless they plan to use them; see `acquisition-equity-sources`) |
| B. Equity reserved for the deal | Down payment plus closing costs and fees the buyer pays in cash. For an SBA 7(a) initial acquisition, SOP 50 10 8.1 sets a 10% minimum that "cannot be reduced or eliminated" (`sba-sop-50-10-8-1-equity-minimum`), measured on total project cost, not just the price (`sba-sop-50-10-8-1-equity-project-cost`). So B is at least 10% of (price + closing costs + working capital + other project costs). Lenders may ask for more; ask |
| C. Cash reserve after closing | Months of household spending the user wants in the bank after closing. Recommended: 6 months, because the business may pay little in year one |
| D. Search runway needed | Months of search without a salary × (monthly household spending − other household income). If the user keeps their job, this is near zero |
| E. Cushion | A − B − C − D |

- **E negative:** not ready on money for that deal size. Options: a smaller deal, keep the job longer, a partner, a seller note, or investors (see `search-fund-vs-sba-loan`).
- **E positive but under 3 months of spending:** close; any surprise in diligence breaks the plan.
- Also note what counts. Under SOP 50 10 8.1, unborrowed cash (including a gift) can supply all of the required equity, and so can a personal loan to a guarantor repaid from a source other than the business's cash flow (`sba-sop-50-10-8-1-equity-unlimited-sources`); standby debt, standby seller debt and minority equity investments together can supply no more than half (`sba-sop-50-10-8-1-equity-limited-sources`). Education, advisory and agent fees don't count (`sba-sop-50-10-8-1-prepaid-not-equity`). A home equity line or 401(k) plan raises its own questions; see `acquisition-equity-sources` and ask the lender.
- These are SOP 50 10 8.1 rules for loans numbered on or after 2026-10-01. Check each source's `review_by` date in `references/sources.md`; if it has passed, say the rule may have changed and point to the current SOP.

## Rubric

| Area | Ready | Close | Not yet |
|---|---|---|---|
| Money and runway | Cushion (E) positive with room for surprises | E positive but thin, or relies on borrowed equity | E negative |
| Risk and guarantee | Would sign a guarantee; household agrees on what's at stake | Willing in principle; household hasn't seen numbers | Won't sign, or spouse opposed (this rules out most loan-financed deals) |
| Skills and temperament | Has managed people and a budget, or sold to customers; comfortable deciding with incomplete facts | Has one of the two; a plan to cover the other | Has neither and no plan; wants a predictable routine |
| Time and job | A realistic plan for search hours and the switch from job to owner | Plan exists but untested | No time to search, or must quit before having any runway |
| Family and partner | Household aligned on risk, hours, location; partner terms written | Aligned in principle; specifics not discussed | Disagreement on whether to do it at all |
| Credit and background | No issues a lender would ask about | Issues with an explanation; talk to a lender early | Unresolved issues; resolve first |

## Full question bank (ask together, recommended answers in brackets)

Money
- What liquid funds could you use? [the profile figure]
- Monthly household spending, and other household income? [estimate from last 3 months of statements]
- Any debts with large monthly payments (mortgage, student loans)? [list]
- Would you use retirement funds or home equity? [no, savings first]

Risk
- Largest loss you could live with if the business failed? [the equity you invest; nothing more]
- Personal guarantee: yes, no, depends? [depends on the deal]
- Home as collateral: yes, no, last resort? [last resort]

Skills
- Times you managed people (how many, how long)? [one example]
- Times you owned a budget or a P&L? [one example]
- Times you sold something to a customer? [one example]
- How do you handle conflict with an employee or customer? [address it the same week]

Time
- Hours a week you can give the search now? [10 to 15 with a job]
- Willing to relocate? [no, within 1 hour of home]
- When do you want to own? [within 18 months]

People
- Spouse or family: have they seen the numbers and the guarantee? [not yet]
- Partner: who, what each brings, who has the final say? [solo]

## Specific worries

**No industry experience.** Many buyers buy outside their industry. What tends to matter is general management experience, a capable second-in-command who stays, and a seller transition period. Under SOP 50 10 8.1 the lender's credit memo describes "the Applicant's industry experience and management team" and how daily operations will be managed (`sba-sop-50-10-8-1-management-experience`); how much experience a lender wants is its own judgment, so ask each lender directly how it views the user's background for the industries on the shortlist. Mitigations: buy where staff do the technical work, budget for a longer seller transition, hire or retain a licensed or experienced manager where the trade requires it.

**Keeping the day job.** Searching part-time is common; owning part-time usually isn't, for an owner-operator. Check the employment agreement for outside-activity, conflict and intellectual-property clauses (a lawyer reads it). Plan the date you'd resign: usually after a signed LOI and lender commitment, not before.

**Partner or solo.** A partner can add money, skills and morale, and adds a second set of decisions and a split of the upside. Before searching together, write down: who puts in how much money, who works in the business and for what pay, who has the final say on what, how either can exit, and what happens if one wants to stop searching. A lawyer turns that into an agreement.

**Spouse and family.** Bring them in before any LOI. Show: the equity at risk, what the guarantee covers, the year-one pay (from `business-owner-take-home-pay`), the hours, and the walk-away line. Use `personal-guarantee-risk-review` for the question list and the exposure table.

**Career switch (tech, banking, consulting, military).** Name the transferable skills (analysis, leading teams, process, selling) and the gap most switchers have: day-to-day supervision of hourly staff and front-line selling. Close the gap before buying, through shadowing an owner, part-time work in the trade, or choosing a business with an operations manager who stays.

**Not a US citizen.** Two separate questions, neither covered by our sources: whether ownership or a purchase can support a visa (an immigration lawyer answers) and what SBA citizenship and residency rules apply to the loan (confirm the current SOP with the lender). Record both as open questions; don't answer from memory. Paths without SBA debt (see `search-fund-vs-sba-loan`) may matter more for this buyer.

**After an MBA.** The MBA helps with analysis, financing conversations and investor credibility; it doesn't replace operating experience. Investor-backed search funds often recruit from MBA programs; see `search-fund-vs-sba-loan`.
