# Building a target list

Sources are described by category; none is recommended over another. Check each source's terms of use before copying data, and record source and date for every row in `targets.csv`.

## Free or low-cost sources

| Source | What it gives | Notes |
|---|---|---|
| State business entity registries (secretary of state or equivalent) | Legal name, formation date, registered agent, sometimes officers | Formation date is a proxy for age. Registered agent is often not the owner. |
| State and local licensing board lookups (contractors, HVAC, plumbing, electrical, pest control, health professions) | License holder, license type, status, sometimes address | Strong for licensed trades; shows who holds the license, which matters later for `small-business-risk-assessment`. |
| Maps and review sites | Name, address, phone, website, review count and dates | Review count over years hints at volume and age; recent owner replies hint at owner involvement. |
| Company websites | Services, team page, "family-owned since", owner names | "Since 1985" with the founder pictured is a long-tenure signal, not a sign they want to sell. |
| Trade association member directories | Members by region and specialty | Membership may be required to see the directory. |
| Chamber of commerce and local business journal lists | Local companies, sometimes revenue ranks and employee counts | Lists of "largest" firms skew big. |
| Government contract award data | Contractors, award amounts, agencies | Useful for government-contracting targets. |
| UCC filings (state) | Lenders with liens on business assets | Shows existing financing; treat with care and only as public record. |

## Paid sources

Commercial business databases sell lists filtered by industry code (NAICS or SIC), location, estimated revenue, employee count and years in business, often with owner names and contact details. Before paying, ask the vendor:

- How are revenue and employee figures estimated, and how often refreshed?
- What share of contacts bounce or are out of date (and can I see a sample first)?
- What may I do with the data under the license (mail, email, phone)? How was any personal contact data collected?
- Can I filter out businesses that are part of larger companies or franchises?

Estimated revenue in these databases is often modelled, not reported. Use it only as a rough filter.

## Fields to capture per target

`business`, `owner_name` (if public), `industry`, `location`, `source`, `source_date`, `est_size_signal` (e.g. "12 employees on website; 9 trucks visible"), and a short `notes` field with the public fact you'd use to personalize. Avoid collecting personal data you don't need (home addresses, family details, personal social media).

## Signals of a possible transition (guesses, never facts)

- Founder in business 20+ years; no next generation visible on the team page.
- Website and marketing unchanged for years.
- Owner mentions retirement, health or "slowing down" in a public interview.
- License held by one person nearing the end of a career.

Write these as "signal" in `notes`; never in a message to the owner ("I hear you're retiring") unless the owner said it publicly and it would be kind to mention.

## Batch size

Pick a weekly number of new targets the user can personally follow up on (letters plus a follow-up call or email). Bigger batches without follow-up waste the list. `acquisition-search-plan` turns this into funnel math using the user's own assumptions.
