# Risk register: factors, evidence and questions

One section per factor. For each: what the risk is, the facts to extract from what you already have, the documents to request, the questions for the owner (or broker), and what tends to make it worse or better. Thresholds below are prompts for judgment, not rules; no source in this repo sets a "safe" level, so don't present one as fact. If the user set a limit in `buy-box.yaml`, that limit is the one to test against.

Record each fact with its source: `CIM p. 12`, `2025 P&L`, `owner, call 2026-11-20`, `broker email 2026-11-18`. Seller-provided numbers stay marked "unverified" until a bank statement, tax return, contract or third party confirms them.

---

## 1. Customer concentration

**The risk.** A few customers make up a large share of revenue, and one leaving (often because the relationship was with the old owner) cuts earnings and can break debt coverage.

**Extract.** Share of revenue from the top 1, top 5 and top 10 customers, for each of the last three years and the trailing 12 months (TTM). Whether the top names change from year to year. Contract terms if known (length, renewal, termination for convenience).

**Request.**
- Revenue by customer for 3 years plus TTM (from the accounting system, not a typed summary).
- Contracts, master service agreements or purchase orders with each customer over a set share (ask for any above about 5–10%, adjusted to the business).
- Accounts receivable aging by customer (slow payers and disputes show up here).
- Lost-customer list: who left in the last 3 years and why.

**Ask the owner.**
- Who owns each top relationship day to day: you, a salesperson, a project manager?
- Does any contract let the customer end it on a sale or change of control?
- Has any top customer said anything about the sale, prices or putting the work out to bid?
- How did you win each one, and when was the last price increase?

**Worse if:** the owner is the only contact; no written contract or one cancelable on short notice; one customer is also a reseller or channel; government or big-company procurement rebids on a cycle. **Better if:** many small customers; recurring contracts with history of renewal; relationships held by staff who are staying.

**Impact check.** Recompute earnings and debt coverage with the largest customer gone (hand the numbers to `sba-dscr-and-affordability`). If the deal fails that test, impact is at least 4.

## 2. Supplier concentration

**The risk.** One supplier, distributor, franchisor, platform or manufacturer provides something the business can't easily replace, and the terms change or the relationship ends after the sale.

**Extract.** Top suppliers by spend; any exclusive dealer, distributor or authorized-service status; platform dependence (a marketplace, an app store, a single lead source).

**Request.** Purchases by vendor for 2–3 years; dealer, distribution, franchise or reseller agreements; any notice of price or term changes; the list of alternate suppliers the owner has used.

**Ask the owner.** If this supplier stopped selling to you tomorrow, what would you do and how long would it take? Does the agreement need the supplier's consent to assign or on a change of ownership? Are your prices or rebates tied to volume tiers you might lose?

**Worse if:** consent to assign is required; exclusive territory granted at the supplier's discretion; a single lead source (one referral partner, one ad channel). **Better if:** commodity inputs with several sources; written multi-year terms.

## 3. Owner dependence

**The risk.** The owner is the business: they sell, price, estimate, hold the relationships, fix the hard problems or hold the license. When they leave, revenue or quality drops.

**Extract.** Owner's weekly hours and what they spend them on; who does sales, estimating, scheduling, purchasing, hiring and the books; whether the owner is in the marketing (name on the trucks, face of the brand).

**Request.** An org chart with names, roles, tenure and pay; the owner's calendar for a typical two weeks (or a written week-in-the-life); written procedures, if any; a list of the owner's personal relationships that bring in work.

**Ask the owner.**
- What happens when you take two weeks off? When did you last do that?
- Which decisions does only you make?
- Which customers would call you rather than the office?
- How long would you stay after closing, paid how, and doing what?

**Worse if:** the user plans to hire a manager (`profile.yaml` `operate_or_hire: hire`); the owner wants to leave at closing; no second in command. **Better if:** a manager runs daily operations; the owner already takes long breaks; sales come from marketing or contracts rather than the owner's network.

**Earnings link.** If the owner works in the business, the earnings must carry the cost of replacing that work. Send this to `sde-and-add-backs-analysis` (owner replacement cost).

## 4. Key employees

**The risk.** A small number of staff (a lead technician, an office manager, an estimator, a salesperson) carry knowledge, relationships or licenses, and leave at or after the sale.

**Extract.** Headcount, tenure, pay against the local market if known, who holds certifications, who has customer relationships.

**Request.** Payroll register (names may be redacted before the LOI); employment agreements, offer letters, any non-solicit or non-compete agreements; turnover for the past 2–3 years; benefits summary; any promised bonuses or equity.

**Ask the owner.** Who would hurt most to lose, and why? Do they know about the sale? Has anyone been promised a share of the sale, a raise or a title? When do you want to tell staff, and who tells them?

**Worse if:** promised payouts nobody wrote down; pay below market; a key person is a family member of the owner who is leaving too. **Better if:** long tenure with no history of poaching; a retention bonus the seller helps fund.

**Note.** Whether non-competes or non-solicits are enforceable varies by state and changes over time. That is a question for a lawyer, not this skill.

## 5. Licenses and permits held by one person

**The risk.** The business can only operate under a license, certification or permit that belongs to a person (often the owner, sometimes an employee) rather than to the company, or that doesn't transfer on a sale. Examples: contractor, electrical or plumbing licenses with a "qualifier", professional licenses for practices, liquor licenses, health permits, environmental permits, government contractor registrations.

**Extract.** Every license and permit named in the listing; whose name it's in; renewal dates.

**Request.** Copies of each license and permit; the licensing board's record (the user looks it up or asks permission for you to search public records); any notices of violation; for a qualifier arrangement, what the qualifier is paid and whether they stay.

**Ask the owner.** If you left tomorrow, which licenses would the business lose? Who else on staff holds one? Has the business ever had a license suspended or a violation?

**Ask a lawyer (and the licensing board).** Does the license transfer with an asset or stock sale? How long does a new application take, and can the business keep operating meanwhile?

**Worse if:** only the departing owner qualifies and the user can't qualify; transfer requires a new application with a long wait. **Better if:** several staff hold the license; company-level permits that transfer with a stock sale.

## 6. Labor availability

**The risk.** The business needs skilled workers (technicians, nurses, drivers, licensed trades) that are hard to hire locally, which caps growth and pushes wages up.

**Extract.** Open positions and how long they've been open; overtime levels; wage increases over 3 years; use of subcontractors.

**Request.** Payroll by year (wage trend), overtime hours, job postings, subcontractor spend, any union agreement.

**Ask the owner.** How long does it take to fill a technician role? Where do your hires come from? What did you raise wages last year? Do you turn down work for lack of staff?

**User's own check.** Local job postings for the same roles and posted wages; whether trade schools nearby train for them. Label this as the user's research or as a search you actually ran.

**Worse if:** work turned away; wages rising faster than prices; heavy overtime. **Better if:** an apprenticeship pipeline; low turnover; pricing power to pass wages through.

## 7. Private equity consolidation (roll-ups)

**The risk and the chance.** Investors buying up businesses in the industry can raise prices you pay for add-ons, compete for staff and customers with bigger budgets, or squeeze suppliers. They can also be a buyer when you sell later.

**Extract.** Whether the listing or CIM mentions competitors owned by larger groups; whether the business lost staff or customers to them.

**Request / research.** The user can look at local competitors' websites ("part of the … family of companies"), trade press and job postings. Record what was actually found and where.

**Ask the owner.** Has anyone approached you to buy? Have you lost technicians or accounts to a newly acquired competitor? Have supplier terms changed for independents?

**Score both ways.** Write down the downside (competition for labor, pricing pressure) and the upside (exit buyers), with evidence for each. Don't call it good or bad in general.

## 8. Macro exposure: rates, tariffs, the economy

**The risk.** Revenue or margins swing with interest rates (customers who finance purchases, new construction, real estate), with tariffs or import costs (imported parts or goods), or with recessions (discretionary spending). The buyer's own loan cost moves with rates too if the loan is variable.

**Extract.** Revenue by year through any downturn the records cover; share of revenue from new construction vs repair and maintenance; share of inputs that are imported; how fast the business has passed cost increases to customers.

**Request.** Monthly revenue for 3+ years (shows seasonality and shocks); cost of goods by supplier and country of origin if relevant; price lists over time.

**Ask the owner.** What happened to revenue in your worst year and why? How quickly can you raise prices when costs rise? Which customers cut back first in a slowdown?

**Link.** Run the downside cases in `sba-dscr-and-affordability` (stress test): revenue down, margin down, rate up. A variable-rate loan makes the rate case matter.

**Worse if:** discretionary, big-ticket, financed purchases; imported inputs with thin margins. **Better if:** required or recurring services (repairs, compliance, maintenance contracts).

## 9. Distressed or turnaround situation

**The risk.** Revenue or earnings are falling, and the price assumes a recovery the buyer has to deliver. Lenders test coverage on historical results, so a declining business may not support the debt (see `references/sources.md`: in a 7(a) change of ownership the lender may not rely on projections to meet coverage, except for an owner-occupied special purpose property).

**Extract.** Three-year trend of revenue, gross margin and earnings; TTM against the last full year; reason the owner gives for the decline.

**Request.** Monthly P&Ls for 24–36 months; lost-customer list; any notices from lenders, landlords or tax authorities; aged payables (unpaid vendors are a distress sign).

**Ask the owner.** What changed, and when? What have you tried? Why will it reverse?

**Worse if:** the decline cause is outside anyone's control (a lost contract, a market shift); the buyer has no direct experience fixing this. **Better if:** a clear, fixable cause (owner illness, under-marketing) with evidence; price reflects current earnings, not past ones.

## 10. Hidden upside

**Not a risk, but scored the same way** so it isn't overstated. Upside the owner hasn't captured: prices not raised in years, no recurring maintenance plans, no online presence, unused capacity, manual processes, an adjacent service customers already ask for.

**Evidence.** Last price increase date; price comparison with competitors (the user's research, labeled); capacity use; customer requests the owner turns away.

**Rule.** Don't pay for upside you'd have to create. Note it, score how likely it is with evidence, and keep it out of the price discussion unless the user decides otherwise (log that in `decisions.md`).

---

## Questions to draft for customer, employee and supplier calls

These are drafts for the user, used only after the seller agrees to the calls (usually late in diligence, after the LOI). Never contact anyone yourself.

- **Customer:** How long have you worked with the business? Who do you deal with there? What would make you switch? How do you expect your spending to change next year? What do they do better or worse than alternatives?
- **Key employee (after the seller has told staff):** What does a normal week look like? What would make you stay for the next two years? What do customers complain about? What would you change first?
- **Supplier:** How long have you supplied them? Are there terms that change with new ownership? Any concerns about payment or volume?
