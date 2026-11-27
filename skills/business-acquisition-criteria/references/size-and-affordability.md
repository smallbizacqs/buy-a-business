# Setting the size band from the user's money

The size band should come from what the user can finance and what they need to live on, not from what sounds impressive. Work it out in this order and write the numbers and their basis into `buy-box.yaml`.

## Step 1: Equity available

From `profile.yaml`: `max_equity_in_deal`. Subtract what the user wants held back for closing costs, working capital the buyer may need to fund, and a personal reserve. Ask; don't assume a percentage.

## Step 2: Financing structure the user expects

Ask which applies:

- **Bank or SBA 7(a) loan plus equity, maybe a seller note.** Hand off to `sba-dscr-and-affordability`. It estimates the largest price a given EBITDA supports at the coverage ratio the lender tests, from the user's own rate, term, seller note and equity inputs, and cites the SBA rule and its effective date. Run it in buy-box mode for two or three earnings levels to see the band: `--sde-levels a,b,c --owner-comp <owner_market_pay>` (it writes nothing to `deals/`). Coverage is tested on EBITDA, and the buy box is usually in SDE; `owner_market_pay` is the bridge (EBITDA = SDE − owner_market_pay).
- **All cash or investor equity.** Price ceiling is the equity available plus anything investors commit.
- **Seller financing heavy.** Treat as a scenario; most sellers won't carry most of the price. See `seller-note-structuring`.

## Step 3: Earnings floor (what's left for the user)

For an owner-operator, a rough check per earnings level (all inputs are the user's):

```
SDE
- annual debt service (from sba-dscr-and-affordability, all debt incl. any seller note)
- capital spending reserve (equipment, vehicles)
- taxes on the user's income (ask a CPA; don't estimate here)
= what the user can live on before taxes
```

If that number is below the user's living costs plus a cushion, the floor is too low. For an absentee buyer, subtract a market salary for a general manager first (ask the user for local salary data or have them check job postings).

The lender's coverage ratio is not the same as the user's comfort. A deal can pass a lender's test and still leave the owner little to live on in a bad year; `grill-my-deal` stress-tests that.

## Step 4: Write it down

```yaml
size:
  measure: sde
  earnings_min: <floor from step 3, in SDE>
  owner_market_pay: <market cost to replace the owner; EBITDA = SDE − this>
  earnings_max: <the earnings level whose supported price equals the price ceiling>
  price_min: <optional; below this, often the owner's job>
  price_max: <ceiling from step 2>
  basis: "<which skill run, which date, which inputs>"
```

## Pitfalls

- Using revenue as the size criterion. Two businesses with the same revenue can have very different earnings.
- Using the seller's asking-price multiple to back into a size band. The band is about the buyer; price is negotiated per deal (`small-business-valuation`).
- Forgetting working capital and closing costs in the equity math.
- Counting a seller note as equity. Lenders have rules on when a seller note can count toward the buyer's injection; that question goes to the lender (see `sba-7a-acquisition-loan`).
