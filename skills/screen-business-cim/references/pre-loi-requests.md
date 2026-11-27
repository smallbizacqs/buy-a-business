# The pre-offer document request

Before an LOI (letter of intent), ask for enough to make a serious, informed offer, not a full
diligence list. Sellers and brokers often resist long lists before an offer, and full due diligence
comes after the LOI. A short, specific request shows the user knows what matters.

Some sellers share these only after an initial indication of interest; that is common. The user
decides what to ask for and when.

## Core list (most deals)

| id | area | request | why |
|---|---|---|---|
| P01 | financial | Business federal tax returns, last 3 years | The numbers the owner reported to the IRS; baseline for earnings. |
| P02 | financial | Profit and loss statements, last 3 years and year to date (monthly if available) | Trend, seasonality, comparison with the returns. |
| P03 | financial | Balance sheets, last 3 year-ends and current | Debts, working capital, assets. |
| P04 | financial | Add-back schedule with support for each item | Tests stated SDE or EBITDA. |
| P05 | financial | Revenue by customer for the last full year (names can be coded) | Concentration. |
| P06 | operational | Organization chart with roles, tenure and pay ranges; owner's duties and hours | Owner replacement cost, key-person risk. |
| P07 | legal | Lease (or summary of term, rent and renewal options) | Location risk and lender needs. |
| P08 | operational | List of major equipment and vehicles with age and condition | Future capital spending. |

## Add when relevant

| area | request | when |
|---|---|---|
| financial | Bank statements, last 12 to 24 months | Before the offer if the seller agrees; otherwise early in diligence. Used for proof of cash with `verify-seller-financials`. |
| financial | Accounts receivable and payable aging | Businesses with invoicing terms. |
| financial | Inventory summary | Distribution, retail, manufacturing. |
| operational | Top contracts summary (customer, term, renewal) | Contract revenue. |
| legal | List of licenses and permits and who holds them | Licensed trades, healthcare, childcare. |
| financial | Debt schedule | If the business carries loans or equipment financing. |
| operational | Backlog or pipeline | Project businesses (construction, contractors). |

## Writing the tracker rows

Each row in `deals/<slug>/diligence-tracker.csv`:

```csv
id,area,request,why,owner,requested_on,due,status,received_on,file,finding,follow_up
P01,financial,"Business federal tax returns, last 3 years","Baseline earnings as reported",seller,,,open,,,,
```

Fill `requested_on` and set `status` to `requested` only after the user says the request was sent.
When a file arrives, the user saves it under `deals/<slug>/financials/`; record `received_on`, `file`
and set `status` to `received`. Later diligence skills add rows with their own ids.

## Draft request message (for the user to send)

> Hi [broker or owner name],
>
> Thank you for the CIM. I'm interested and would like to make a serious offer. To do that, could you
> share the following?
>
> 1. Business tax returns for [years]
> 2. P&Ls for [years] and year to date, monthly if available
> 3. Balance sheets for the same periods
> 4. The add-back schedule with support for each item
> 5. Revenue by customer for [last year] (names can be coded)
> 6. A summary of staff roles and tenure, and what the owner does day to day
> 7. The lease or a summary of its terms
> 8. A list of major equipment and vehicles
>
> I'm happy to go through these on a call. Once I've reviewed them I can give you an indication of
> value within [two weeks].
>
> Thanks,
> [Name]

After documents arrive: `sde-and-add-backs-analysis` for earnings, `verify-seller-financials` for
proof of cash, `small-business-valuation` for price, `sba-dscr-and-affordability` for borrowing, then
`loi-for-small-business-acquisition`.
