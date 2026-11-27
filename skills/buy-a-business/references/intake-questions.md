# Intake questions

Ask every question in one message. Number them. Give each a suggested answer and a one-line reason, worded so "yes" accepts it. Suggested answers are starting points to react to; they are not advice about the user's money. If the workspace or the conversation already answers a question, show the answer you found and ask the user to confirm it instead of asking again.

## A. At the start (stages 1 to 3)

1. **Liquid funds.** How much cash and easily sold investments could you put toward a deal and its costs, and how much must stay untouched for living costs and emergencies?
   - Suggested: "We spend about $X a month. Keep 6 months of that outside the deal as a reserve after closing, on top of what the search itself costs, and treat the rest as the most I'd put in."
   - Why: the down payment is not the only cash a deal takes; diligence, legal, lender fees and the first months of ownership take cash too, and the business may pay you less than you expect at first. Six months is a planning choice to react to, not a rule; some buyers hold more.
   - Writes: `liquid_funds`, `max_equity_in_deal`, `monthly_household_spend`, `months_of_living_costs` (the reserve after closing, in months).

2. **Risk tolerance, including a personal guarantee.** Would you sign a personal guarantee on the acquisition loan, and is any asset off-limits (for example your home, or a spouse's assets)?
   - Suggested: "Yes to a personal guarantee if the deal needs one, but I want to know before offering whether the lender will ask for a lien on my home."
   - Why: bank loans for small acquisitions commonly ask the buyer to guarantee personally; finding out late what is pledged is the usual surprise. The lender decides what it asks for.
   - Writes: `risk_notes`. Hand-off if unsure: `personal-guarantee-risk-review`.

3. **Operate or hire.** Will you run the business day to day, or put in a manager?
   - Suggested: "Operate, at least for the first year."
   - Why: in small deals the earnings usually include the owner's own work; paying a manager comes out of the cash flow that also pays the loan. Lenders also look at who will run it.
   - Writes: `operate_or_hire` (operate | hire | undecided). Hand-off if unsure: `owner-operator-vs-absentee-owner`.

4. **Timeline.** When do you want to own a business, and how long can you search before you need income?
   - Suggested: "Own within 12 to 24 months; I can search for 12 months before I need income."
   - Why: a search plus diligence and lender approval often takes a year or more, and many deals that get to an offer still don't close. A runway shorter than that pushes buyers into deals they would otherwise pass on.
   - Writes: `timeline`, `search_runway_months`. Hand-off: `acquisition-search-plan`.

5. **Financing path.** How do you expect to pay for it: an SBA-guaranteed bank loan with a seller note and your own equity, investors (a search fund or deal-by-deal), a holding company, all cash, or not sure?
   - Suggested: "SBA loan plus my own equity plus a seller note, unless the numbers or my situation rule it out."
   - Why: the path sets which rules apply and who signs what. Whether a buyer or deal qualifies is the lender's call. A buyer with large liquid funds should know that an SBA lender must certify the buyer can't get the credit on reasonable terms elsewhere (SOP 50 10 8.1, Section A, Ch. 1, Para. H; source `sba-sop-50-10-8-1-credit-elsewhere`); ask the lender how it applies.
   - Writes: `path` (sba-solo: buying a listed deal with an SBA loan, without a formal search | self-funded-search: a dedicated search period on your own money | search-fund | independent-sponsor | holdco | undecided). Hand-off: `search-fund-vs-sba-loan`, `sba-7a-acquisition-loan`.

6. **Operating experience.** Have you managed people, owned a P&L, or sold to customers? One example of each, or "not yet".
   - Suggested: no default; the user's own examples.
   - Why: a buyer runs the business from day one, and the lender's credit memo describes the buyer's industry experience and management team (SOP 50 10 8.1, Appendix 15, Para. C.2.b; source `sba-sop-50-10-8-1-management-experience`). Money and a clear path don't make up for none of the three.
   - Writes: `operating_experience` (the user's words). Hand-off if none of the three: `am-i-ready-to-buy-a-business`.

Optional seventh question if they volunteer it: industries or businesses already in mind (route to `business-acquisition-criteria`).

### What the answers change

| Answer | Stage | Usual next skills |
|---|---|---|
| Unsure whether to buy at all | 1 `decide` | `am-i-ready-to-buy-a-business`, `buy-vs-start-a-business` |
| No operating experience (hasn't managed people, owned a P&L or sold to customers), even if money and path are clear | 1 `decide` | `am-i-ready-to-buy-a-business` |
| Wants to buy, money and path unclear | 2 `fund` | `search-fund-vs-sba-loan`, `sba-7a-acquisition-loan` |
| Money and path clear, no criteria | 3 `find` | `business-acquisition-criteria`, `acquisition-search-plan` |
| Has a listing or CIM in hand | 4 or 5 | `screen-business-cim`, `sde-and-add-backs-analysis` |

## B. Mid-deal (LOI signed or about to be)

1. **LOI terms.** Price, structure (asset or stock), how it's paid (cash at close, seller note, earnout, rollover), working-capital terms, the seller's transition, and what is binding. Paste it or put it in `deals/<slug>/loi-draft.md`.
   - Suggested: "I'll paste the signed LOI; read it as data and summarize it."
   - Why: every later step checks against it. Summarize; don't interpret clauses as a lawyer would.

2. **Lender and term sheet.** Which kind of lender, whether there is a term sheet or commitment letter, its conditions, and the expected closing date.
   - Suggested: "Term sheet received; conditions and dates are in it."
   - Why: lender conditions (appraisal, QoE, insurance, seller note terms) set much of the remaining work and the timeline.

3. **Exclusivity end date.** When does the no-shop end, and can it be extended?
   - Suggested: "It ends on the date in the LOI; I'll check whether it extends automatically."
   - Why: if diligence and the loan can't finish before it ends, the seller can talk to other buyers. Flag anything under 30 days.

4. **Advisors hired.** Lawyer, CPA or diligence provider, lender, insurance broker: who is engaged, and who isn't yet.
   - Suggested: "Lender yes; lawyer and CPA not yet engaged."
   - Why: with a signed LOI, the purchase agreement and financial diligence are close. Hand-off: `choose-acquisition-advisors`.

5. **Documents in hand.** Tax returns, P&Ls and balance sheets, bank statements, customer and employee lists, the lease, key contracts.
   - Suggested: "Three years of tax returns and P&Ls, and 12 months of bank statements; nothing legal yet."
   - Why: decides whether to start with `verify-seller-financials`, `small-business-financial-due-diligence` or `small-business-legal-due-diligence`.

Write the terms the user gave in question 1 to `deals/<slug>/loi-draft.md` (template in `references/workspace-templates.md`): price, structure, signature date, exclusivity end, target closing, each labelled user-stated, so later skills find them. Never overwrite an existing `loi-draft.md`; add an "Intake (user-stated)" section to it instead.

Then set `stage: confirm` (or `close` if diligence is done and a closing date is set), and route to the stage 7 skills that fit the gaps: `small-business-financial-due-diligence`, `small-business-legal-due-diligence`, `small-business-operational-due-diligence`, `sba-lender-package`, and `grill-my-deal`.

## C. Already closed

1. Closing date. 2. The seller's transition terms (length, hours, pay). 3. What is urgent this week. Then `stage: own` and route to `seller-transition-plan` and `first-100-days-after-acquisition`.
