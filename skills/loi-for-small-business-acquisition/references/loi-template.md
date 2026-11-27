# loi-draft.md template

Copy into `deals/<slug>/loi-draft.md` and fill. Brackets mark anything still open. In an SBA 7(a) initial acquisition, use the consultant wording in the Transition paragraph: the seller may not stay as an officer, director, owner or employee, but the business may hire the seller as a consultant for up to 24 months in total (source `sba-sop-50-10-8-1-seller-consultant`; check its `review_by` date and confirm with the lender). This is a business-terms draft in plain language for the parties and their lawyers; it is not legal drafting. A lawyer should review before signature.

```markdown
# LOI: <business name>

- Version: v1 · Date: YYYY-MM-DD · Status: draft | sent YYYY-MM-DD | signed YYYY-MM-DD
- Exclusivity: <N> days from signature → ends YYYY-MM-DD (diligence calendars count back from this)
- Offer expires: YYYY-MM-DD

## Consideration (from scripts/loi-math.mjs)

<paste the markdown table and lines the script prints>

## Letter

[Date]

[Seller name(s)], [Business legal name]

Re: Non-binding letter of intent to acquire [Business]

This letter sets out the main terms on which [Buyer name] or an entity Buyer forms ("Buyer") proposes to acquire [the assets of / all of the equity of] [Business legal name] (the "Business") from [Seller] ("Seller"). Except for the sections marked **Binding** below, this letter is a statement of intent only and does not create an obligation to complete the transaction; that obligation will arise only under a signed purchase agreement.

1. **Purchase price.** $[X], based on seller's discretionary earnings of $[Y] for the twelve months ending [date], as presented by Seller in [document]. *(Non-binding)*
2. **Structure.** [Asset purchase of substantially all assets used in the Business, including equipment, vehicles, inventory, customer lists, phone numbers, domains, websites, social media accounts, software licenses, trade names and goodwill / Purchase of all equity]. Excluded: [cash, ..., listed personal items]. *(Non-binding)*
3. **Payment.** At closing, $[A] in cash from Buyer's equity and senior financing. $[B] by a promissory note from Buyer to Seller, [rate]% interest, [term] years, [payments], subordinated to Buyer's senior lender on the terms that lender requires[, with no payments for the first [N] months]. [Earnout of up to $[C] based on [metric] for [period], measured as [method].] *(Non-binding)*
4. **Cash-free, debt-free.** Seller keeps cash and pays off all debt, liens and debt-like obligations at closing. *(Non-binding)*
5. **Working capital.** The Business will be delivered with a normal level of net working capital, set as [the trailing twelve-month average of month-end net working capital], with the definition and peg to be agreed in diligence and an adjustment at closing. [Inventory included in the price / added at the lower of cost or value based on a physical count within [N] days of closing, excluding obsolete or damaged stock, not to exceed $[cap].] *(Non-binding)*
6. **Real estate.** [Buyer will lease the premises from [landlord / Seller] on terms acceptable to Buyer, for an initial term of [N] years with [N] renewals / Buyer will purchase the real estate for $[X] / Seller will assign the existing lease with landlord consent]. *(Non-binding)*
7. **Transition.** Seller will work in the Business full-time for [N] weeks and part-time for [N] months after closing, [included in the price / at $[X] per [period] under a consulting agreement]. [If SBA 7(a)-financed: as a consultant to the Business under a written consulting agreement, not as an officer, director, owner or employee, for no more than 24 months in total.] *(Non-binding)*
8. **Non-compete and non-solicit.** Seller will not compete with the Business or solicit its customers or employees within [area] for [N] years. *(Non-binding)*
9. **Employees.** Buyer intends to offer employment to [all / named] employees. Seller will pay all wages, bonuses and other amounts owed to employees through closing. *(Non-binding)*
10. **Conditions.** Closing depends on: Buyer's satisfaction with due diligence in its sole judgment; financing on terms acceptable to Buyer; a purchase agreement acceptable to both parties; [landlord consent or new lease]; [consents for named contracts, licenses and permits]; no material adverse change. *(Non-binding)*
11. **Due diligence and access.** Seller will give Buyer and its advisors and lender reasonable access to books, records, premises, systems and, with Seller's consent at an agreed time, key customers, suppliers, employees and the landlord. *(Non-binding)*
12. **Target closing.** On or about [date]. *(Non-binding)*
13. **Exclusivity.** For [N] days from signature, [extended automatically by [N] days if Buyer is proceeding in good faith and lender approval is pending], Seller will not solicit, encourage or discuss any other sale, financing or investment involving the Business. *(Binding)*
14. **Confidentiality.** The parties will keep this letter and its terms confidential [as provided in the NDA dated [date]]. *(Binding)*
15. **Expenses.** Each party pays its own costs, including any broker fees it owes. *(Binding)*
16. **Governing law.** [State]. *(Binding)*
17. **Termination.** This letter ends on the earlier of a signed purchase agreement, written notice by either party, or the end of exclusivity; the binding sections survive as stated. *(Binding)*

This offer expires if not signed by [date].

[Buyer signature block] [Seller signature block]

## Open terms
- [term]: [what's missing, who decides, recommended answer]

## Questions for counsel
- [section]: [the factual concern, e.g. "Template section 9 says the deposit becomes nonrefundable on day 15; is that what this language does?"]

## Changes we'd ask for (review mode only)
| # | Their text says (quoted) | We'd propose | Why (one line) |
|---|---|---|---|
```

## Term table for review mode

When reviewing someone else's LOI, first extract each term into this table, quoting their words exactly, then compare it against `loi-term-checklist.md`:

| Term | Their text (quoted, with section) | Missing / vague / one-sided? | Note |
|---|---|---|---|
