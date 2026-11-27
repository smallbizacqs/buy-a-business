# Where listed businesses show up, and what each kind of source shows

No ranking here and no endorsement. Sites change their features, fees and access rules often; check the site itself before relying on anything below, and note the date in `listing.md`.

## Kinds of source

| Kind | What it typically shows | Watch for |
|---|---|---|
| **Broad main-street marketplaces** (BizBuySell and similar sites such as BizQuest) | Broker and owner listings across industries and states: asking price, gross revenue, a "cash flow" figure, location (often only city or county), years established, employees, reason for selling, whether real estate or seller financing is offered, broker contact form | "Cash flow" is defined by whoever wrote the listing; the year it refers to is often missing. The same business may appear on several sites. |
| **Online-business marketplaces** (Acquire.com, Flippa and similar) | Software, e-commerce, content and app businesses: revenue and profit (often trailing twelve months), traffic or user metrics, asking price, tech stack. Many details sit behind a buyer account, verification step or NDA. Some sites run auctions as well as fixed-price listings. | Metrics are usually seller-reported unless the site says how it verifies them. Platform and payment-processor dependence is a core risk. |
| **Revenue-verified startup directories** (TrustMRR and similar) | Online businesses showing revenue figures the site says come from a connected payment provider; some are marked for sale with an asking price. | Read the site's own explanation of what is verified and what isn't. Revenue isn't profit, and a payment connection doesn't show costs, refunds or concentration. |
| **Broker firms' own websites** | Each broker's current listings, often including ones not posted elsewhere yet, plus the broker's industries and region. | Same claims caveats. Signing up for a broker's buyer list usually means an NDA and a buyer profile form. |
| **Industry-specific brokers and marketplaces** (for example practices, insurance agencies, franchise resales, trucking) | Listings in one sector, often with sector-specific metrics (book of business, collections, patient counts, revenue per route). | The sector metric may not map to SDE or EBITDA. |
| **Lower-middle-market deal networks and investment bankers** | Larger deals (often several million in EBITDA and up), usually through a membership or a banker's process rather than public listings. | Usually beyond a first-time SBA buyer's range; processes are formal with deadlines. |
| **Commercial real estate sites with a business-for-sale section** | Businesses sold with or alongside property. | Price may mix business and real estate value. |

## Translating the buy box into filters

| Buy box field | Typical site filter | Note |
|---|---|---|
| `size.earnings_min/max` | Cash flow or profit range | Record the site's definition; don't assume it's SDE. |
| `size.price_max` | Asking price | Asking price is the seller's opening number. Search a bit above the ceiling; some sellers come down. |
| `industries.include` | Category | Categories are coarse. Also run keyword searches (e.g. "commercial cleaning", "janitorial"). |
| `geography` | State, county, city, radius | Many listings hide the exact town. |
| Recurring revenue | Keyword | Search "contracts", "recurring", "maintenance agreements", "routes". |

## Things a listing rarely tells you

- Which year the numbers cover, and whether they are from tax returns or internal books.
- What's included in "cash flow" (one owner's salary? two? the owner's family on payroll?).
- Customer concentration, owner's actual hours and duties, lease terms.
- How long it's been listed, and whether the price has dropped (sometimes visible on the site or via a saved copy).

These become the first questions in `listing.md` and, later, the document request in `screen-business-cim`.
