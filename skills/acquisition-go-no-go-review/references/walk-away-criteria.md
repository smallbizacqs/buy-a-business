# Walk-away criteria, set before diligence

Write these down when the LOI is signed, before results come in. Each line is measurable, says what kind of line it is, and names the source that will settle it.

- **walk:** crossing it ends the deal unless the user records a reason to override it.
- **reprice:** crossing it triggers a reprice or structure change.
- **watch:** crossing it is noted and priced into the transition plan.

## Template (decisions.md)

```markdown
## YYYY-MM-DD Walk-away criteria: <business> (set before diligence results)

LOI basis: price $<X>, SDE $<Y> for <period>, multiple <X/Y>x, exclusivity ends YYYY-MM-DD.

| id | Line | Metric | Op | Value | Kind | Settled by |
|---|---|---|---|---|---|---|
| W1 | Verified SDE at least | sde | >= | <e.g. 90% of LOI basis> | walk | QoE / proof of cash |
| W2 | Coverage at verified EBITDA and proposed debt at least | dscr | >= | 1.25 (SBA 7(a) initial acquisition, source sba-sop-50-10-8-1-dsc-ratio) or the lender's own | walk | lender |
| W3 | Largest customer share of revenue at most | topCustomerPct | <= | <e.g. 25> | walk | revenue by customer |
| W4 | Landlord consent or new lease in hand | leaseOk | == | 1 | walk | lawyer |
| W5 | Required licenses transferable or reissuable before closing | licensesOk | == | 1 | walk | lawyer / issuer process |
| R1 | Verified SDE at least | sde | >= | <LOI basis> | reprice | QoE |
| R2 | One-time costs found at most | oneTimeCosts | <= | <amount> | reprice | diligence |
| R3 | Working capital shortfall vs peg at most | nwcShortfall | <= | <amount> | reprice | peg analysis |
| V1 | Key employees retained (count) at least | keyStaffStaying | >= | <n> | watch | operational diligence |

Behavior lines (judgment, no script): walk if the seller won't provide bank statements or tax transcripts authorization; walk if the earnings story changes materially under questioning; walk if the seller refuses any customer contact before closing in a concentrated business.

Personal lines: maximum equity at risk $<…>; personal guarantee limits from profile.yaml.
```

## Choosing values

- Base SDE lines on the LOI basis, not the asking price.
- Base coverage on the lender's threshold; the SBA figure applies to SBA 7(a) loans (source `sba-sop-50-10-8-1-dsc-ratio`, SOP 50 10 8.1; check its `review_by` date), and lenders may require more.
- Base concentration on what the buyer could survive losing: if the top customer left, would the business still cover its debt?
- Keep it short: five to ten lines that would actually change the decision.

## Script input

The same lines go into `scripts/go-no-go.mjs` as `criteria` (`metric`, `op`, `value`, `kind`). Facts use the same metric names. Yes/no facts are 1 or 0.
