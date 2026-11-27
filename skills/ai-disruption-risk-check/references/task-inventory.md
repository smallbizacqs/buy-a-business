# Task inventory: from services to tasks

The mistake to avoid is rating a whole industry ("agencies are dead", "trades are safe"). Rate what this business sells, task by task, weighted by revenue.

## Step 1: services and revenue

List each line that earns money. Use revenue by service from the accounting system if the seller provides it; otherwise use the CIM's description and mark shares "assumed".

| Service | Share of revenue | Source | Buyer type | Price model |
|---|---|---|---|---|
| Residential repair calls | 45% | 2025 sales by category (financials/sales-2025.csv) | homeowners | per job |
| Maintenance plans | 20% | CIM p. 9, unverified | homeowners | annual subscription |

Price model matters: hourly billing for information work is the most exposed to AI efficiency (customers notice when the hours should shrink); fixed price for an outcome is less exposed and may gain margin.

## Step 2: the customer's job-to-be-done

For each service, write what the customer is actually trying to get done, in the customer's words, and what they'd do if this business vanished. AI exposure is about whether AI gets that job done for them, not whether AI can do some task inside the business.

- "Keep my AC running in July" → needs a technician on site. Low replace exposure.
- "Have clean books so my CPA can file" → could be done partly by software plus AI. Higher replace exposure.
- "Get more customers" (marketing agency) → partly content and ad production (exposed), partly strategy and accountability (less exposed).

## Step 3: break each service into tasks

Tag each task with one or more of these:

| Tag | Meaning | Examples |
|---|---|---|
| Physical | Needs hands, tools or presence | Repair, installation, cleaning, delivery, inspection |
| Regulated | A license, signature or legal duty is required | Licensed trade work, signed tax returns, clinical care, permits |
| Relationship | Customer buys trust or accountability | Long-term account managers, someone to call when it breaks |
| Judgment | Decisions with ambiguous inputs and consequences | Diagnosis, pricing a job, advice |
| Information | Reading, writing, summarizing, data entry, scheduling, routine analysis | Reports, bookkeeping entry, first-draft content, call answering, quotes |

Estimate the share of delivery hours (from the owner, or payroll by role) in each task. Information-heavy services score higher; physical and regulated tasks score lower, though their back office (scheduling, quoting, billing) may still be a cost lever.

## Step 4: three questions per service

1. **Replace:** Can the customer get the job done without buying this, using AI tools available now, at acceptable quality and effort? Think of who the customer is: a large company with staff will self-serve sooner than a busy homeowner or a small business owner without time.
2. **Commoditize:** Can a competitor use AI to deliver the same outcome much cheaper, faster or at larger scale, and is that showing up in quotes, bids or lost work?
3. **Cost lever:** Which internal tasks (answering calls, scheduling, quoting, invoicing, collections, first drafts, reporting) could the new owner do with fewer hours? This is upside, never a reason to pay more until it's achieved.

## Common patterns (prompts to check, not conclusions)

- Field services (HVAC, plumbing, pest control, landscaping): replace low; commoditize mainly in lead generation and booking; cost lever in dispatch, quoting and the office.
- Professional services billed by the hour (bookkeeping, tax preparation, translation, transcription, basic design, content writing): replace and commoditize can be meaningful; check price trend and client churn closely.
- Marketing and lead-generation agencies: production tasks are exposed; check how much revenue is retainers for production vs strategy and paid media management.
- Call centers, answering services, data entry, staffing for clerical roles: often high exposure; check contract renewals and pricing pressure.
- Education and tutoring: mixed; test-prep content is exposed, in-person accountability less so.
- Software and online content businesses: exposure depends on whether AI-native competitors can rebuild the product cheaply and whether traffic comes from search that AI answers now intercept; check traffic trend by source.

Each pattern must be checked against this business's evidence before it shows up in a rating.
