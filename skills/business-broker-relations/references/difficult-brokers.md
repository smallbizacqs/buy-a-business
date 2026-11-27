# When a broker is slow, unresponsive or difficult

Start by assuming the broker is busy, not hostile. Many brokers handle several listings and many
inquiries at once. The steps below escalate gently.

## Step by step

1. **Check the basics.** Was the first note specific? Did the user complete the broker's buyer
   registration or NDA? Is the listing still active? Is the business under LOI with someone else?
2. **Follow up after 3 to 5 business days** with a short note (see `broker-notes.md`), offering a
   signed NDA today.
3. **Try a different channel** after another few days: a short phone call at a reasonable hour, with
   the user's OK. Leave one voicemail, not several.
4. **Ask what the seller needs.** "Is there anything the seller wants to see from a buyer before
   sharing the CIM?" Sometimes the answer is proof of funds, a financing plan, or local experience.
5. **Offer to make it easy.** Suggest a 15-minute call with two specific times.
6. **Move on, politely.** After two or three unanswered attempts over a few weeks, mark the row in
   `pipeline.csv` with `status` "broker unresponsive" and a `next_date` a month or two out to check
   whether the listing is still active.

## Common difficult situations

| Situation | What the user can do |
|---|---|
| Broker won't share the CIM without proof of funds | Offer a redacted statement or a lender letter after the NDA; the user decides. |
| Broker pushes for an offer before financials | Explain what's needed to make a serious offer; offer an indication as a range "subject to review of financials" (draft via `loi-for-small-business-acquisition`). |
| Broker answers questions slowly or vaguely | Batch questions in one numbered list; ask which ones the owner can answer on a call. |
| Broker refuses an owner meeting until an LOI | Common practice for some brokers; ask whether a short call with the owner is possible first. |
| Add-backs look unsupported and the broker defends them | Keep the conversation factual; ask for documents; analyze with `sde-and-add-backs-analysis`. |
| Broker sends a buyer agreement with a fee or non-circumvention terms | A question for the user's lawyer before signing; do not interpret it here. |
| User found the owner's contact details and wants to go direct | Stop. An NDA, buyer agreement or non-circumvention clause may forbid it, and going around the broker usually ends the deal. Take it to the user's lawyer. |

## What not to do

- Don't contact the owner, staff or customers behind the broker's back.
- Don't send many emails in a day or copy the broker's manager without a reason.
- Don't threaten or criticize in writing; deal communities are small.
- Don't make an offer just to get attention.
