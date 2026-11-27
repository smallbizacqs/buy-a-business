# The pieces of consideration

How a small-business price is usually paid, what each piece does to risk, and the design questions for each. Use these to build two or three structure options. Each piece is a negotiating lever: more risk carried by the seller usually means a higher headline price.

## Cash at closing

- **What it is.** Senior loan proceeds plus buyer equity, paid on the closing day.
- **Seller view.** Certain money. Most sellers weigh it above headline price.
- **Buyer view.** The most expensive piece to fund, and once paid, can't be clawed back except through indemnity claims.
- **Design questions.** How much does the buyer have, and what does the lender lend? (See `sba-dscr-and-affordability` and `sba-7a-acquisition-loan`.) Is any part held back (escrow or holdback) for a period to cover claims or a working capital true-up?

## Seller note

- **What it is.** Part of the price the seller lends to the buyer, repaid over time with interest.
- **What it does.** Keeps the seller invested in a smooth handover; spreads payments; lowers cash needed at close.
- **Design questions** (hand to `seller-note-structuring`): amount; rate; term; amortization; any standby (no payments for a period); subordination to the senior lender; whether the buyer can offset proven indemnity claims against note payments (lawyer); default terms; personal guarantee.
- **Lender interplay.** Senior lenders set conditions on seller notes. For SBA 7(a) loans under SOP 50 10 8.1 (loans numbered on or after 2026-10-01): seller debt counts as equity only if subordinated and on full standby with no principal or interest payments for the life of the 7(a) loan (source `sba-sop-50-10-8-1-seller-debt-equity`); standby debt may accrue interest to be paid after the 7(a) loan is repaid, and the standby creditor subordinates its liens (source `sba-sop-50-10-8-1-standby-terms`). Check each source's `review_by` date and confirm with the lender.

## Earnout

- **What it is.** Extra price paid later only if the business hits stated targets.
- **When it helps.** Buyer and seller disagree about the future: a recent jump in revenue, a big new contract, a customer that may leave.
- **When it hurts.** The metric depends on the buyer's decisions after closing (expenses, pricing, staffing), so disputes are common. See `earnout-design.md`.
- **Lender interplay.** In an SBA 7(a) change of ownership, seller earnouts are prohibited; buyer rebates tied to business performance are allowed (source `sba-sop-50-10-8-1-earnouts`). Outside SBA financing, ask the lender whether and how it allows one.

## Rollover equity

- **What it is.** The seller keeps a minority stake in the business (or in the buyer's company).
- **When it comes up.** Larger deals, investor-backed buyers, or when the buyer needs the seller's ongoing involvement.
- **Design questions** (lawyer): what class of ownership; distributions; who controls decisions; when and how the seller can sell the stake or be bought out; what happens if the seller leaves; information rights.
- **Lender interplay.** For SBA 7(a) loans: every individual owning 20% or more of the borrower gives an unlimited full personal guaranty (source `sba-sop-50-10-8-1-personal-guaranty`), and in a partial change of ownership a selling owner who keeps less than 20% must guarantee the full loan for at least two years after final disbursement (source `sba-sop-50-10-8-1-partial-change-guaranty`). Ask the lender about its own policy.

## Seller transition and consulting agreement

- **What it is.** The seller stays on to hand over customers, staff, suppliers and know-how. Either included in the price or paid under a separate consulting or employment agreement.
- **Design questions:** full-time weeks then part-time months; named duties (customer introductions, training, licensing hand-off); hours; pay; what happens if the seller stops showing up; who can end it early.
- **Watch.** Moving price into a consulting fee changes taxes for both sides: CPA. In an SBA 7(a) initial acquisition or business expansion the seller can't stay as an officer, director, owner or employee, but the business may hire the seller as a consultant for up to 24 months in total (source `sba-sop-50-10-8-1-seller-consultant`). A practitioner view: Barlow & Williams describe a deal where the seller refused a seller note and the buyer proposed a three-year consulting agreement instead (clip `c453de6` in `data/clips/`).

## Non-compete and non-solicit

- **What it is.** The seller agrees not to compete, and not to solicit customers or employees, for a period in an area.
- **Design questions:** the business's real territory; length; what activities count; whether it ties to the consulting agreement; any separate payment for it (tax: CPA).
- **Watch.** Enforceability varies by state and by whether the seller is also an employee. That is the lawyer's call.

## Deposits, escrows and holdbacks

- **Deposit.** Paid at LOI or signing; keep it small and refundable until diligence and financing are done.
- **Escrow or holdback.** Part of the price held for a period after closing to cover indemnity claims or the working capital true-up. Size and length are negotiated; the lawyer drafts the release terms.

## Worked mix (illustrative, not a recommendation)

Price $1,500,000. Option A: $1,350,000 cash at close, $150,000 seller note. Option B (not for an SBA 7(a) deal, where seller earnouts are prohibited): $1,200,000 cash at close, $150,000 note, up to $150,000 earnout on gross profit. Run:

```json
{ "mix": { "price": 1500000, "cashAtClose": 1200000, "sellerNote": 150000, "earnoutMax": 150000 } }
```

`node scripts/earnout.mjs mix.json` shows 80% at close, 10% deferred, 10% contingent. The table goes into the structure option in `loi-draft.md`.
