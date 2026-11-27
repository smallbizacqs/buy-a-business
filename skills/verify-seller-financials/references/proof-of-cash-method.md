# Proof of cash: the method

A proof of cash checks that the revenue a seller reports actually arrived in the bank. It compares three independent records:

1. **Bank deposits**, from statements for every business account.
2. **Booked revenue**, from the monthly P&L or general ledger.
3. **Gross receipts on the tax return**, the revenue the business reported when it filed.

If all three agree within explained differences, the revenue is more likely real. If they don't, the gaps are the questions to ask.

## How this relates to an SBA-required QoE

Under SOP 50 10 8.1, a QoE the SBA requires must include a cash proof that reconciles bank statement data to the income statement and tax return for each period, on a trailing 12-month basis and for the last two fiscal years (`sba-sop-50-10-8-1-qoe-cash-proof`). It must be independent, done for the lender, and not prepared by or for the seller (`sba-sop-50-10-8-1-qoe-not-for-seller`). A buyer's own proof of cash doesn't replace it; it finds the problems early, before the buyer spends on a QoE and legal fees. Check each source's `review_by` date.

## Step 1: get every account

Missing accounts are the most common reason a proof of cash fails, innocently or not.

- Ask the seller for a list of every bank account, credit line, and payment processor or platform that pays the business, opened or closed during the period.
- Cross-check that list against: cash accounts on the balance sheet; transfers on one statement that name another account; processor names in deposit descriptions; the interest income line on the return (an account earning interest that you haven't seen).
- Ask for complete statements (every page) as downloaded from the bank, not spreadsheets or re-typed summaries.
- For businesses that take cards: request processor statements showing gross sales, fees, refunds and chargebacks, so net deposits can be tied to gross revenue.

## Step 2: classify deposits

Not every deposit is a sale. Mark each one:

| Category (script code) | Examples | Why it matters |
|---|---|---|
| revenue | Card batches, customer checks, ACH from customers, cash deposits of sales | Should match booked revenue |
| transfer | Moves between the business's own accounts | Counted twice if not removed |
| loan | Line-of-credit draws, new loans, merchant cash advances | Inflate deposits; also a debt to find |
| owner | Owner putting personal money in | Can be used to make revenue look higher |
| refund | Vendor refunds, tax refunds, insurance claims | Not revenue from customers |
| other_nonrevenue | PPP or grant money, sale of equipment, legal settlements | One-time; exclude |
| unknown | Anything not yet explained | Counted as revenue by the script until explained; becomes a question |

Large round-number deposits, deposits from the owner's name, and deposits at month-end or year-end just before a sale are worth asking about.

## Step 3: adjust booked revenue to expected cash

Booked revenue and cash received differ for ordinary reasons. Put these in `books.csv`:

- **Sales tax collected**: deposits include it; revenue usually excludes it.
- **Change in receivables (ar_change)**: on accrual books, revenue billed but not yet collected doesn't hit the bank until later. An increase in receivables lowers expected cash that month.
- **Processor fees**: card processors usually deposit sales net of fees.
- Customer deposits and prepayments (deferred revenue) move the other way: cash arrives before revenue is booked. If material, enter a negative `ar_change` for the month the cash came in and note it.

## Step 4: compare

- **Monthly**: revenue deposits vs expected receipts. Timing differences should reverse in the next month or two. Persistent one-way differences matter more than a single month.
- **Annually**: sum the fiscal year and compare booked revenue and revenue deposits with gross receipts on the return.

## Step 5: read the gaps

| Pattern | Innocent explanations | Concerning explanations | Ask for |
|---|---|---|---|
| Deposits above booked revenue | Unclassified transfers or loans; sales tax; customer deposits | Unbooked sales (then the books are unreliable); owner money cycled in | Deposit detail for the month; loan statements |
| Deposits below booked revenue | Missing account; receivables growing; processor holds | Revenue booked that never existed; cash kept out of the bank | All accounts; aged receivables; processor statements |
| Books above the return | Year-end CPA adjustments; cash vs accrual | Books prepared for the sale | CPA adjusting entries; general ledger |
| Return above the books | Books never updated after the CPA's entries | Books are incomplete | Same |
| Missing months | Statement not sent | Something on that statement | The missing statements, every page |

## Step 6: what this can't do, and what raises confidence

The script compares numbers. It cannot tell whether a PDF statement was edited or fabricated, whether cash sales were deposited at all, or whether a customer is real. Ways buyers raise confidence (ask the seller and the user's advisors which fit):

- IRS tax return transcripts, to confirm the returns match what was filed. In an SBA 7(a) deal the lender must verify the seller's financial data against IRS records (`sba-sop-50-10-8-1-seller-tax-verification`), requesting transcripts with IRS Form 4506-C or Form 8821 (`sba-sop-50-10-8-1-transcript-follow-up`). Outside an SBA deal, the seller can authorize a transcript request or request their own from the IRS. Follow the IRS's current instructions.
- Statements downloaded by the seller from the bank's website while the buyer watches on a screen share, or direct confirmation from the bank arranged by a CPA or QoE provider with the seller's consent.
- Testing a sample of large deposits back to invoices and customer records.
- A CPA or quality of earnings (QoE) provider for a professional view.

## Request draft (save in notes; the user sends it)

> To complete our review of revenue, could you share: (1) a list of every bank account, credit line and payment processor the business has used since <start>; (2) complete statements for each, every page, for <months>, downloaded from the bank; (3) processor statements for the same months showing gross sales, fees and refunds; (4) the monthly P&L and the general ledger for the same period. Thank you.
