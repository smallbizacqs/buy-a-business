# Path comparison

General patterns, to be overwritten by the user's facts and any terms they've been offered. Where a figure depends on negotiated terms, write "depends on terms; ask" rather than a typical number.

## The four paths in one line each

- **Self-funded search with an SBA 7(a) loan** (`sba-solo` or `self-funded-search`): the buyer pays for the search, buys with their own equity plus a bank loan (often with a seller note), owns most or all of the business, and personally guarantees the loan. The two ids differ in how the deal is found: `sba-solo` is buying a listed deal without a formal search (often while keeping a job); `self-funded-search` is a dedicated search period, full or part time, on the buyer's own money.
- **Traditional search fund** (`search-fund`): investors pay the searcher's salary and search costs up front in exchange for the right to invest in the deal; the searcher earns a share of the equity over time and doesn't usually put in much of their own money.
- **Independent sponsor** (`independent-sponsor`): the buyer finds a deal first, then raises equity for that one deal from investors, earning fees and a share of the profits (often called carry or promote) on terms negotiated per deal.
- **Holding company** (`holdco`): an entity built to buy and keep several businesses over time, funded by the founder, investors with long horizons (permanent capital), or both.

## Comparison table

| Dimension | Self-funded + SBA | Traditional search fund | Independent sponsor | Holdco |
|---|---|---|---|---|
| Who pays for the search | You | Investors (search capital) | You, until a deal is found | You or your backers |
| Your income while searching | None unless you keep a job | A salary from search capital | None unless you keep a job | Depends on how it's funded |
| Your cash in the deal | The equity injection and costs; see `sba-7a-acquisition-loan` | Usually little | Often some, to show commitment; investors may ask | Founder capital plus investors |
| What you own after closing | Most or all | A share earned over time; terms set by investors | A share via carry and any co-investment; terms per deal | Depends on founder vs investor capital |
| Personal guarantee | Yes, on an SBA loan (20%+ owners give an unlimited guaranty under SOP 50 10 8.1) | Depends on the debt chosen and who owns 20% or more; check each deal | Depends on the debt chosen | Depends on the debt chosen |
| Control | Full | Shared with an investor board | Shared with deal investors | Founder-led, with investor rights |
| Deal size it suits | Limited by your equity, coverage and the 7(a) loan cap | Larger deals, investor equity plus debt | Whatever investors back | Starts with one, adds more |
| Speed to start | Fast: no fundraise | Slower: raise search capital first | Fast to search; raise when you have a deal | Depends |
| Worst case if no deal closes | You lose savings spent and time | Investors lose search capital; you lose time and income opportunity | You lose your costs on dead deals | You lose costs and time |
| Worst case if the deal fails | Equity lost plus the guarantee shortfall (`personal-guarantee-risk-review`) | Investors lose their equity; your share is worthless; guarantee only if you signed one | Investors lose equity; reputation with them | Depends on structure and guarantees |
| Main skill beyond operating | Handling a lender and a seller | Managing an investor board | Raising money deal by deal | Raising long-term capital and capital allocation |
| Securities law | Usually none (your own money) | Yes: raising from investors | Yes | Yes if outside investors |

Sourced SBA rules referenced above (SOP 50 10 8.1, effective for loans numbered on or after 2026-10-01; check `review_by` in `references/sources.md`):

- `sba-sop-50-10-8-1-personal-guaranty`: "Any individual who has direct and/or indirect ownership of 20% or more of an Applicant must provide an unlimited full guaranty."
- `sba-sop-50-10-8-1-equity-limited-sources`: limited sources (standby debt, standby seller debt, minority equity investments) "may provide no more than half of the required Equity Injection."
- `sba-sop-50-10-8-1-max-loan`: "The maximum loan amount for any one Standard 7(a) loan is $5,000,000."
- `sba-sop-50-10-8-1-credit-elsewhere`: the lender "must certify and indicate that the Applicant does not have the ability to obtain some or all of the requested loan funds on reasonable terms" without SBA assistance (Section A, Ch. 1, Para. H); a buyer with large liquid funds asks the lender how it applies.
- `sba-sop-50-10-8-1-pari-passu`: a non-SBA loan sharing the lien equally with the 7(a) loan isn't treated as a piggyback structure when its maturity isn't shorter than the 7(a) loan's; relevant to larger deals.

## Ownership math template

Use the same labeled business value (V) and debt (D) for every column. Equity value E = V − D.

| | Self-funded + SBA | Search fund | Independent sponsor | Holdco |
|---|---|---|---|---|
| Your ownership % (offered terms, or a hypothetical share the user names, labelled "hypothetical") | | | | |
| Your share of E | | | | |
| Your cash invested | | | | |
| Your share ÷ your cash (if cash > 0) | | | | |
| Personal guarantee exposure | see `personal-guarantee-risk-review` | | | |

Explain: a smaller share of a larger, better-financed business can be worth more than all of a small one, or less, depending on terms and outcomes. The table shows the arithmetic; it doesn't predict which.

## Terms to ask about (search fund and sponsor)

- Search fund: amount of search capital and what it covers; the investors' right to invest in the deal (and whether they can pass); how the searcher's equity is earned (at closing, over time, on performance) and on what conditions; board composition; what happens if the searcher leaves.
- Independent sponsor: closing fee, ongoing fee, carry or promote and the hurdle it sits behind (preferred return), the sponsor's co-investment, who controls major decisions, how broken-deal costs are covered.
- Holdco: investor horizon and liquidity expectations, distribution policy, how new deals are approved, governance.

These are all securities offerings once outside money is involved: see `search-fund-investor-raise`.

## Fit questions (recommended reading of answers)

| If the user says… | It points toward… |
|---|---|
| "I can't go without a salary for long" | Search fund (salary from search capital), or self-funded while keeping a job |
| "I won't sign a personal guarantee" | Search fund or independent sponsor with non-SBA debt; ask each lender |
| "I want to own all of it" | Self-funded + SBA |
| "I want to buy several over time" | Holdco, possibly starting self-funded |
| "I have investors who trust me but no deal" | Search fund |
| "I have a deal but not enough equity" | Independent sponsor, or SBA with a seller note; see `acquisition-equity-sources` |
| "The deal is bigger than a 7(a) loan can cover" | Independent sponsor, search fund, or SBA plus other debt; see the pari passu rule |
