# Buy box criteria checklist

Use this to pressure-test each line of a buy box. For every criterion ask: *Would I really walk away from an otherwise good deal over this?* If not, it is a nice-to-have, not a must-have.

## 1. Size

- [ ] Stated as earnings (SDE or EBITDA) **and** price, not revenue alone. Revenue says little about what the business pays.
- [ ] Measure matches the size of business. SDE (seller's discretionary earnings: profit before one owner's pay, interest, taxes, depreciation and amortization, plus discretionary costs) fits owner-operated businesses where the buyer replaces the owner. EBITDA (earnings before interest, taxes, depreciation and amortization, after paying a market wage for management) fits businesses with a manager in place. Mixing them overstates what's left for a buyer who must hire a manager.
- [ ] Earnings floor covers, at minimum: debt service, a living wage for the user (or a manager's salary if absentee), a capital spending reserve, and a cushion for a bad year. Check with `sba-dscr-and-affordability` rather than guessing.
- [ ] Price ceiling comes from the financing plan (equity on hand, debt the user is willing to guarantee, any seller note), not from a listing.
- [ ] Too small is a risk too: very small businesses are often the owner's job, with little team or system to buy.

## 2. Industry

- [ ] Each included industry has a reason the user can say out loud to a broker or owner (work history, customers, network, a thesis about the work).
- [ ] Licensing checked: does the trade or profession require a license the buyer must hold personally (some states for some trades, most health and professional practices)? If yes, is there a plan (licensed manager who will stay, buyer gets licensed)?
- [ ] Capital intensity understood: trucks, equipment, real estate, inventory. Heavy capital needs reduce cash available for debt.
- [ ] Labor: can the user hire the people the work needs in this area?
- [ ] Exposure to technology change considered; for a deeper look later use `ai-disruption-risk-check`.
- [ ] Excludes: sectors the user won't operate (hours, ethics, physical work, regulatory burden).

## 3. Geography

- [ ] If the user will operate: can they be on site as often as year one demands? A rough test is whether they would make the drive every day for a month.
- [ ] If relocating: is the family on board, and is the move a must-have or only for an exceptional deal? Write that down.
- [ ] State and local rules that differ (licensing, franchise taxes, non-compete enforceability) noted as questions for advisors, not answered here.

## 4. Owner role

- [ ] Operate / GM in place / absentee matches `profile.yaml`.
- [ ] Absentee or semi-absentee requires earnings that pay a manager **and** debt **and** the user. Check the size floor again.
- [ ] If operating, the user's skills fit the owner's current job (sales-heavy, technical, people management).

## 5. Revenue quality

- [ ] Recurring or repeat share: contracts, subscriptions, maintenance agreements, routes, repeat customers. Write a minimum only if the user would truly pass below it.
- [ ] Customer concentration ceiling (largest customer as a share of revenue; top five combined). The number is the user's choice, written with why.
- [ ] Trend: flat or growing for how many years? Is one bad year a deal-breaker or a question?
- [ ] Minimum years operating.

## 6. Team and owner dependence

- [ ] Minimum headcount or a second-in-command.
- [ ] How much the business depends on the owner's personal relationships, license or skill. Deeper scoring later in `small-business-risk-assessment`.

## 7. Deal-breakers (five or fewer)

Examples of real deal-breakers users write (choose your own):

- Owner unwilling to stay for any transition period.
- No financial records the user's lender or CPA could work with.
- Litigation or regulatory action that threatens the license to operate.
- Most revenue from one customer with no contract.

## Contradiction scan

Flag and ask the user to choose when the box contains pairs like:

| Criterion A | Criterion B | Why they clash |
|---|---|---|
| Absentee owner | Low earnings floor | Not enough to pay a manager, debt and the owner |
| Narrow industry list | Short drive radius | Few or no targets exist in that area |
| High recurring share | Low price ceiling | Recurring revenue usually prices higher; check with `small-business-valuation` |
| No industry experience | Lender-financed | Lenders weigh the buyer's relevant experience; ask the lender early |
| Fast timeline | Off-market only | Direct outreach usually takes longer to produce a deal |

## Scoring nice-to-haves

Weight each nice-to-have 1 to 3. For a deal, score each item 0 (absent), 1 (partly), 2 (fully), multiply by weight, and sum. Use the score only to rank deals that already pass every must-have. Record the score in the deal's `evaluation.md` later, not in `pipeline.csv`.
