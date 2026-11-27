# Repricing after diligence: when it's fair and how to raise it

A **retrade** is changing the price or terms after the LOI. Done without a factual reason, it damages trust and can kill the deal; brokers warn sellers about buyers who retrade. Done with documented findings, it is the point of diligence.

## Fair or not: the test

A reprice is fair when all four are true:

1. **New.** The fact wasn't disclosed or knowable from what the seller provided before the LOI.
2. **Material.** It changes earnings, assets or liabilities by enough to matter to value or financing (agree a threshold in `decisions.md` before diligence, for example a share of SDE).
3. **Documented.** It rests on records (bank statements, tax returns, a QoE finding, a lost customer's notice), not a hunch.
4. **Tied to the LOI's basis.** The LOI price rested on stated earnings; the finding shows those earnings were different.

Usually fair: SDE lower than presented after proof of cash or QoE; an add-back that doesn't hold up; a key customer leaving or cutting volume; undisclosed debt, taxes or liens; a working capital shortfall versus the peg; deferred maintenance or capex the seller didn't disclose; a license or contract that can't transfer and costs money to replace.

Usually not fair: buyer's second thoughts; interest rates rising (the buyer's risk unless the LOI said otherwise); facts the seller disclosed before the LOI; normal seasonality the buyer could have seen in the monthly numbers; the buyer finding a cheaper comparable.

## Sizing it

Keep the multiple implied at the LOI and apply it to the verified earnings; take one-time costs off dollar for dollar:

```json
{ "reprice": { "price": 1500000, "sdeAtLoi": 500000, "sdeVerified": 440000, "oneTimeCosts": 25000 } }
```

`node scripts/offer-compare.mjs reprice.json` → multiple 3.0x, price at same multiple $1,320,000, less $25,000 = proposed $1,295,000 (13.67% lower).

Check the result with `acquisition-go-no-go-review` (does it cross a walk-away line?) and `sba-dscr-and-affordability` (does coverage still work at the verified numbers?).

## Ways to bridge (give the seller choices)

| Option | When it fits |
|---|---|
| Lower price | Recurring earnings shortfall, clearly documented |
| Same price, more seller note | Seller wants the headline; buyer needs less cash at close |
| Earnout for the disputed amount | The disagreement is about whether the shortfall is permanent; not with SBA 7(a) financing (source `sba-sop-50-10-8-1-earnouts`) |
| Holdback or escrow | Specific risk that may or may not materialize (a pending claim) |
| Seller fixes it before closing | Unpaid taxes, liens, a repair, a license renewal |
| Specific indemnity | A known liability; lawyer drafts |
| Walk | The finding crosses a walk-away line |

## How to raise it

- **Early.** As soon as the finding is confirmed, not at the closing table.
- **In person or by phone first,** then in writing.
- **Evidence first, number second.** Show the finding and the records before the new price.
- **Same method as the LOI.** Use the multiple and basis the LOI stated, so the conversation is about the facts, not about the buyer.
- **Options, not an ultimatum.** Two or three ways to bridge.
- **A date.** When the buyer needs an answer, tied to the exclusivity calendar.

## Draft message (for the user to edit and send themselves)

> Subject: [Business]: diligence finding on [topic]
>
> [Seller name], thank you for the work you and [bookkeeper] have put into the document requests. I want to raise one finding now rather than later.
>
> Our LOI price of $[price] was based on SDE of $[sde_loi] for [period]. In [document / QoE work], we found [plain description of the finding], which brings SDE to $[sde_verified]. The supporting records are [list].
>
> At the same multiple we used in the LOI, that would put the price at $[proposed]. I'd like to find a way through this with you. A few options: [option 1], [option 2], [option 3].
>
> Could we talk by [date]? I'm still keen to buy the business and keep [what matters to the seller].

Mark it DRAFT in `notes.md`. Never send it for the user.
