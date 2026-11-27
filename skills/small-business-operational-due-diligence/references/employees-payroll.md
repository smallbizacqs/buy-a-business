# Employees, payroll and worker classification

## 1. The census

Build one table in `evaluation.md` from the seller's census (no Social Security numbers or birth dates in the workspace):

| Role | Name or initials | Tenure | FT/PT | Pay (rate and annual) | Hours/week | W-2 or 1099 | Licenses/certs | Key person? | Notes |
|---|---|---|---|---|---|---:|---|---|---|

Add a row for the owner with the hours and tasks they actually do, and the market cost of replacing them (feeds owner compensation in `sde-and-add-backs-analysis`).

## 2. Payroll tie-out (with financial diligence)

- Payroll register totals to wages on the P&L, by year.
- Quarterly payroll tax filings to the register.
- Family members: on payroll and working? Working and not on payroll? Both change true labor cost.
- Cash wages or off-books pay: a finding for the lawyer and CPA, and a cost the buyer will have to put on the books.

## 3. Worker classification signals

The IRS weighs behavioral control, financial control and the type of relationship to decide whether a worker is an employee or a contractor (source `irs-worker-classification`); states have their own tests. This skill collects facts; employment counsel and the CPA decide.

Facts to collect for each person paid as a contractor:

| Fact | Points toward employee if… |
|---|---|
| Who sets hours and how work is done | The business does |
| Who supplies tools, vehicle, uniform | The business does |
| Paid by the hour or job, and who bears profit or loss | Hourly, no risk of loss |
| Works for other clients | Works only for this business |
| How long, how regularly | Full-time, long-term |
| Does the core work of the business | Yes (a technician in a service company) |
| Written agreement and how it describes the relationship | (The label alone doesn't decide it) |

Record the facts; flag the person for counsel with status `issue`. Misclassification can mean back taxes, penalties and benefits claims; how much of that follows the buyer depends on structure and state law (counsel).

## 4. Key people and retention

- Who would hurt most to lose: lead technicians, the office manager who knows billing, the estimator, the person customers call.
- Licenses the business depends on held by an employee.
- Retention plan before closing: stay bonuses, title, pay review, a conversation with the buyer. Timing of telling employees is the seller's call; most sellers tell key staff shortly before or at closing.
- Non-competes and confidentiality agreements: copies to counsel.

## 5. Amounts owed at closing

- Accrued wages, bonuses, commissions and PTO through the closing date: who pays them (usually the seller) and whether PTO must be paid out under state law (counsel). Feed into `working-capital-peg-for-small-business` as accruals or debt-like items.
- Retirement plan: continue, terminate before closing, or replace (CPA and plan provider).

## 6. Questions for the lawyer and CPA (facts to bring them)

- **New employer setup.** A buyer that takes over another employer's business does not use the seller's employer identification number (source `irs-pub-15-successor-ein`); a successor employer gets new Forms W-4 from transferred employees unless an alternative procedure applies (source `irs-pub-15-successor-w4`). Ask the CPA how payroll should be set up for the closing date.
- **Forms I-9.** An acquiring employer has two options: treat acquired employees as new hires and complete new forms for all of them (source `uscis-m274-acquisitions`), or keep the previous owner's forms and be liable for any errors or omissions on them (source `uscis-m274-acquisitions-option-b`). New-hire forms have a deadline: Section 2 within 3 business days of the first day of work for pay (source `uscis-i9-section-2-timing`). The lawyer advises which option to take.
- **WARN.** The federal WARN rules apply to employers with 100 or more employees, counted as the regulation sets out (source `ecfr-20-cfr-639-3-employer`); a covered employer gives 60 days' written notice before a plant closing or mass layoff (source `ecfr-20-cfr-639-4-60-day-notice`); in a sale, the seller gives notice for events up to the sale date and the buyer after (source `ecfr-20-cfr-639-4-sale-of-business`). States may have their own rules. Only relevant if the business is that size or the buyer plans layoffs; counsel advises.
- Classification facts from section 3.
- Unions, collective agreements, prevailing-wage work.
- Pending employment claims (from the legal list).
