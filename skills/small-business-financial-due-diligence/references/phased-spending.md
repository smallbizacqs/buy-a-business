# Phasing diligence so a dead deal costs less

Most deals that die in diligence die on something cheap to find: the bank deposits don't match, the seller won't produce records, a key customer is leaving. Do the cheap checks first and spend on paid work only after they pass.

## Phase 0: before the LOI (free)

Done in evaluation, not here: listing and CIM screen (`screen-business-cim`), SDE and add-backs from what the seller provided (`sde-and-add-backs-analysis`), owner meetings, coverage scenario (`sba-dscr-and-affordability`).

## Phase 1: start of exclusivity to the phase-1 gate (low cost, mostly the buyer's time)

- Send the financial request list (and the legal and operational lists from their skills).
- Get the core documents: tax returns, monthly P&Ls and balance sheets, bank statements, GL detail, add-back support, revenue by customer, AR aging, payroll, debt schedule.
- Proof of cash with `verify-seller-financials`.
- Re-test add-backs with `sde-and-add-backs-analysis`.
- Customer concentration, trends, last-months spike check.
- Public record searches the buyer can run (`small-business-legal-due-diligence`).
- Lender: send the package and get a term sheet (`sba-lender-package`).
- Insurance broker: start the review.

## The phase-1 gate (date from `diligence-calendar.mjs`)

Ask, and record the answers in `decisions.md`:

1. Did the seller produce the core documents on time? If not, why?
2. Does revenue tie to bank deposits and tax returns within a reasonable difference, explained in writing?
3. Do the add-backs hold up well enough that SDE is still near the LOI basis?
4. Has anything crossed a walk-away line set in advance (`acquisition-go-no-go-review`)?
5. Is the lender still on board after seeing the numbers?

All yes → start phase 2. Any no → resolve it, reprice (`small-business-acquisition-negotiation`), or walk before spending more.

## Phase 2: paid work (gate to findings due)

- QoE or a lighter financial review (scope in `qoe-scoping.md`).
- Lawyer's legal diligence and first purchase agreement draft.
- Customer calls, employee meetings and time in the business, with the seller's consent (`small-business-operational-due-diligence`).
- Specialists: environmental, technical, IT if needed.
- Third-party reports the lender orders.

## Decision (from the calendar)

All findings in; go, reprice or walk with `acquisition-go-no-go-review`, a week before exclusivity ends so there is time to negotiate or extend.

## Phase 3: to closing

Bring-down checks: latest monthly numbers, AR and inventory near closing, working capital estimate, payoff letters, final lien searches (`small-business-closing-checklist`).

## Money at risk

Use `choose-acquisition-advisors` → `advisor-budget.mjs` to show what is spent before each gate. Many advisors will phase their fees if asked; ask.
