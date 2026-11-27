# Net working capital: what's in, what's out

## The frame

- **Cash-free, debt-free.** The seller keeps the cash in the bank and pays off loans, lines of credit, equipment financing and other debt at closing (usually out of the price). The buyer gets the business free of debt and without the seller's cash.
- **Net working capital (NWC).** Current operating assets minus current operating liabilities: what the business has tied up in its day-to-day cycle (receivables, inventory, prepaid costs) less what it owes in that cycle (supplier bills, accrued wages, customer prepayments).
- **The peg.** The level of NWC both sides agree is normal. At closing the price goes up if the seller leaves more, down if less. Without a peg, a seller can collect receivables, run down inventory and stretch payables before closing, and the buyer funds the gap in month one.

In many small Main Street deals sold through brokers, receivables and payables stay with the seller and inventory is sold separately "plus inventory at cost". That can work, but then the buyer needs cash for the first weeks of payroll and supplies before collections come in. Model that in the deal (see `acquisition-deal-model`) and in the lender's working capital line.

## Default classification (what the script assumes)

| Column name | Treatment | Notes |
|---|---|---|
| accounts_receivable | asset | Exclude amounts over 90 days or known uncollectible; ask the CPA |
| unbilled_receivables | asset | Work done, not yet invoiced |
| retainage_receivable | asset | Contractors: held back by customers until a job completes |
| inventory | asset | Usable stock at cost; obsolete and damaged stock out |
| prepaid_expenses | asset | Prepaid insurance, rent, software; check they transfer to the buyer |
| other_current_assets | asset | Look inside: some are owner items |
| costs_in_excess_of_billings | asset | Contractors: underbillings |
| accounts_payable | liability | |
| accrued_expenses | liability | |
| accrued_payroll | liability | Wages earned, not yet paid |
| accrued_pto | liability | Some deals treat it as debt-like; state law matters on payout (lawyer) |
| sales_tax_payable | liability | Some deals treat past-due amounts as debt-like |
| deferred_revenue | liability | Customer paid, work not yet done (memberships, service plans) |
| customer_deposits | liability | Deposits on future jobs |
| billings_in_excess_of_costs | liability | Contractors: overbillings |
| gift_cards | liability | |
| retainage_payable | liability | |
| cash | exclude | Seller keeps |
| line_of_credit, notes_payable, current_portion_long_term_debt, credit_cards | exclude | Debt: paid off at closing |
| shareholder_loans, due_from_owner, due_to_owner | exclude | Owner items: settled or forgiven |
| income_taxes_payable | exclude | Seller's taxes; usually seller's responsibility |

Any other column name must be classified on purpose (`--classify name=asset`). Unusual lines worth a question: deposits on equipment, employee advances, related-party receivables, accrued bonuses, warranty reserves.

## Deferred revenue and customer deposits

When customers pay in advance (memberships, service agreements, deposits on jobs), the buyer will do work the seller already got paid for. Two common treatments:

1. **Inside NWC** as a liability. A business with large prepayments may have low or negative NWC; the peg reflects it, and a closing balance above normal reduces the price.
2. **Debt-like.** The balance at closing is credited to the buyer in cash (or deducted from the price) and left out of NWC (`--debt-like deferred_revenue,customer_deposits`).

Either can be fair; mixing them double-counts. Pick one, write it down, and have the CPA or QoE provider check the balance. Ask the seller for a schedule: customer, amount paid, work remaining, cost to complete.

## Debt-like items to list separately

Items that act like debt and should be paid off, credited or deducted at closing rather than sitting in the peg. Agree the list in diligence:

- Loans, lines of credit, equipment loans, vehicle loans, credit card balances.
- Capital or finance leases on equipment and vehicles.
- Past-due payroll taxes, sales taxes, property taxes.
- Accrued but unpaid bonuses and commissions; deferred compensation.
- Customer deposits and deferred revenue (if treated as debt-like).
- Unpaid amounts on completed equipment purchases.
- Owner or related-party loans.
- Unfunded obligations for work already sold below cost (loss-making contracts): flag for the CPA.
- Any prepayment the seller took from a customer for work after closing.

## Inventory

- Count physically within a few days of closing, with both sides present or an independent counter.
- Value at cost from purchase records; exclude obsolete, damaged, slow-moving (define "slow": for example, no sale in 12 months) and customer-owned items.
- If inventory is "plus at cost" on top of the price: set a cap, the counting method and who pays the counter.
- If inventory sits inside NWC: the peg covers it; check that the trailing average reflects normal stock, not a pre-sale run-down.
