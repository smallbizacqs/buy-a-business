# Work in progress, backlog and over/under billings (contractors)

Construction, HVAC installation, roofing, remodeling, engineering and other project businesses bill on milestones, so at any month-end some jobs are billed ahead of the work and some behind. Ignoring this is a common way a buyer overpays.

## Terms

- **WIP schedule.** One row per open job: contract value, estimated total cost, cost to date, percent complete, revenue earned to date, billed to date.
- **Overbilling (billings in excess of costs and estimated earnings).** Billed more than earned. The customer has paid for work the buyer will have to do. Liability.
- **Underbilling (costs in excess of billings).** Earned more than billed. The buyer will be able to bill it. Asset, but only if collectible; persistent underbillings can mean cost overruns.
- **Backlog.** Signed work not yet started. Not on the balance sheet; it supports value, but only if it's profitable.
- **Retainage.** Amounts customers hold back until a job completes (receivable), or that the business holds back from subcontractors (payable).

## What to request

- WIP schedule at each month-end for 12 months, and at the expected closing date.
- Closed-job report for the last two years: estimated vs actual margin by job (shows estimating accuracy).
- Backlog list: customer, contract value, expected margin, start date, whether signed.
- Retainage receivable and payable schedule.

## How to treat it at closing

1. Include underbillings and overbillings in NWC (as asset and liability), and check that the peg's months include them; or
2. Treat net overbillings as debt-like: the buyer receives cash or a price reduction for work already paid for.

Either way, pick one and write it down, and have the CPA or QoE provider test the WIP schedule against job cost records.

## Red flags

- Overbillings growing just before the sale (seller collecting cash early).
- Underbillings that never convert to invoices.
- Estimated margins on open jobs much higher than closed jobs' actual margins.
- Backlog with no signed contracts, or signed below cost.
- No WIP schedule at all, with revenue recognized when billed: ask the CPA how to rebuild earned revenue.

## Script columns

Use `costs_in_excess_of_billings`, `billings_in_excess_of_costs`, `retainage_receivable`, `retainage_payable` in the monthly CSV; the script classifies them by default. To treat overbillings as debt-like: `--debt-like billings_in_excess_of_costs`.
