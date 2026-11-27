# Search budget and runway

## Costs to list (the user fills in amounts)

| Category | Examples |
|---|---|
| Living costs | Housing, food, insurance (health insurance if leaving a job), debt payments, childcare |
| Search operating costs | Data or list subscriptions, mailing and printing, phone and email tools, travel to meet owners, marketplace memberships, a virtual assistant or interns |
| Deal costs before close (often lost if a deal dies) | Quality of earnings or accounting review, legal fees on an LOI or purchase agreement, lender fees, appraisals, environmental reports, travel for diligence |
| Learning | Courses, conferences, communities (optional) |

Deal costs on a deal that falls through come out of the search budget. Ask the user how many failed deals the budget can absorb, and plan for at least one.

## Runway

```
available = liquid funds − money reserved for the deal (equity, closing costs, working capital, personal reserve)
monthly burn = living + search costs − income during the search
months of runway = available ÷ monthly burn
```

`scripts/search-math.mjs` does this from `search-plan-inputs.json` and flags whether runway covers the planned timeline. Keep the reserve for the deal separate; spending it on the search means the user can't close when they find the deal.

## Ways buyers fund living costs during a search (describe; don't recommend)

- **Keep a job and search part-time.** Lower burn, slower outreach, harder to take owner calls. Ask: can you take calls during work hours, and does your employment agreement restrict outside business activity?
- **Savings.** Full-time focus; runway sets a hard limit.
- **Spouse or partner income.** Discuss the risk together (see `am-i-ready-to-buy-a-business`).
- **Consulting or part-time work** in the target industry, which can double as learning and sourcing.
- **Investor-backed search fund.** Investors pay a salary and search costs in exchange for terms on the eventual deal; see `search-fund-vs-sba-loan`.
- **Fund a search inside an existing company or holding company.**

## When the search runs out of time or money

Set two dates in advance and write them in `decisions.md`:

1. **Review checkpoint**: when remaining runway equals the expected LOI-to-close time plus a cushion. At this point decide whether to continue unchanged, change channels or the buy box, add income, or stop.
2. **Stop date**: after which the user stops spending on the search.

Options at the checkpoint (lay out; let the user choose):

- Widen the buy box (industry, geography, size) with `business-acquisition-criteria`.
- Shift channel mix toward what the actuals show is working.
- Reduce burn or add income.
- Partner with another buyer or an investor.
- Pause and keep relationships warm (owners not ready now may be later).
- Stop. A search that ends without a deal is a legitimate outcome; buying a poor business to avoid it is usually worse. `grill-my-deal` stress-tests any deal found under time pressure.

## Questions for a CPA or financial planner

- How should I treat search costs for tax purposes if I do or don't close?
- How much of my liquid money should be at risk in the deal versus kept as reserve?
- What happens to my retirement accounts or health coverage if I leave my job?
