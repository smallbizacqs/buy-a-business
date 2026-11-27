#!/usr/bin/env node
// Checks a deal's numbers against the SOP 50 10 8.1 facts quoted in data/sources/.
// Plain Node, no dependencies, no network. Usage:
//   node sop-check.mjs deal.json          prints a markdown table
//   node sop-check.mjs deal.json --json   prints JSON
// Results are "consistent", "conflicts", "missing-fact" or "lender-call". It never says a deal is
// eligible: it compares numbers with quoted rules, and the lender applies the current SOP.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const SOP = { name: 'SOP 50 10 8.1', effective: '2026-10-01' };
export const DSC_BY_TYPE = { 'initial-acquisition': 1.25, 'business-expansion': 1.15, 'owner-buyout': 1.25, 'esop-coop': 1.25 };

export function monthlyPayment(principal, annualRatePct, months) {
  if (!(months > 0) || !(principal > 0)) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

const has = (v) => v !== undefined && v !== null;

export function sopCheck(deal) {
  const out = [];
  const add = (id, check, dealFact, rule, source, result, note = '') => out.push({ id, check, dealFact, rule, source, result, note });
  const type = deal.transactionType;

  // C1: which SOP and which transaction type
  if (!has(deal.loanNumberDate)) add('C1', 'Which SOP applies', 'loan number date unknown', 'SOP 50 10 8.1 applies to loans given an SBA loan number on or after 2026-10-01', 'sba-information-notice-5000-880695', 'missing-fact', 'Ask the lender which SOP version governs this loan.');
  else if (deal.loanNumberDate < SOP.effective) add('C1', 'Which SOP applies', `loan number date ${deal.loanNumberDate}`, 'SOP 50 10 8.1 applies on or after 2026-10-01', 'sba-information-notice-5000-880695', 'lender-call', 'An earlier SOP may govern; these checks may not apply. Ask the lender.');
  else add('C1', 'Which SOP applies', `loan number date ${deal.loanNumberDate}`, 'SOP 50 10 8.1 applies on or after 2026-10-01', 'sba-information-notice-5000-880695', 'consistent');
  if (!DSC_BY_TYPE[type]) add('C2', 'Transaction type', type ?? 'unknown', 'Initial Acquisition, Business Expansion, Owner Buyout, ESOP and Cooperative', 'sba-sop-50-10-8-1-change-types', 'missing-fact', 'Set transactionType to initial-acquisition, business-expansion, owner-buyout or esop-coop.');
  else add('C2', 'Transaction type', type, 'Four change-of-ownership categories', 'sba-sop-50-10-8-1-change-types', 'consistent', 'The lender confirms the category.');

  // Project cost and equity
  const costs = ['businessPurchasePrice', 'realEstate', 'closingCosts', 'workingCapital', 'otherCosts'];
  const projectCost = has(deal.businessPurchasePrice) ? costs.reduce((a, k) => a + (deal[k] ?? 0), 0) : null;
  const e = deal.equity ?? {};
  const unlimited = (e.unborrowedCash ?? 0) + (e.gift ?? 0) + (e.qualifyingPersonalLoan ?? 0) + (e.diligenceCostsPaid ?? 0);
  const limited = (e.standbySellerNote ?? 0) + (e.otherStandbyDebt ?? 0) + (e.minorityEquity ?? 0);
  const required = projectCost != null ? projectCost * 0.10 : null;
  if (type === 'initial-acquisition') {
    if (projectCost == null) add('C3', 'Equity at least 10% of total project cost', 'price or costs missing', 'Initial Acquisition: 10%, cannot be reduced or eliminated; based on total project cost', 'sba-sop-50-10-8-1-equity-minimum; sba-sop-50-10-8-1-equity-project-cost', 'missing-fact');
    else {
      const counted = unlimited + Math.min(limited, required / 2);
      add('C3', 'Equity at least 10% of total project cost', `project cost ${usd(projectCost)}; 10% = ${usd(required)}; equity counted ${usd(counted)}`, 'Initial Acquisition: 10%, cannot be reduced or eliminated', 'sba-sop-50-10-8-1-equity-minimum; sba-sop-50-10-8-1-equity-project-cost', counted >= required - 0.5 ? 'consistent' : 'conflicts', 'The lender may require more than the minimum.');
      add('C4', 'Limited sources no more than half of required equity', `limited sources ${usd(limited)}; half of required ${usd(required / 2)}`, 'Standby debt, standby seller debt and minority equity may provide no more than half of the required equity', 'sba-sop-50-10-8-1-equity-limited-sources', limited <= required / 2 + 0.5 ? 'consistent' : 'conflicts', limited > required / 2 ? 'Only half of the required equity can come from these; the rest must be unlimited sources.' : '');
    }
  } else if (DSC_BY_TYPE[type]) {
    add('C3', 'Equity minimum', type, 'Our sources quote the minimum only for initial acquisitions', 'sba-sop-50-10-8-1-equity-minimum', 'lender-call', 'Check the current SOP and your lender for this transaction type.');
  }
  if ((e.advisoryFeesClaimed ?? 0) > 0) add('C5', 'Fees claimed as equity', `${usd(e.advisoryFeesClaimed)} of education, advisory or agent fees`, 'Expenses related to education, advisory services, or fees paid to an Agent are not considered equity', 'sba-sop-50-10-8-1-prepaid-not-equity', 'conflicts', 'Remove these from the equity count.');

  // Seller note
  const sn = deal.sellerNote;
  if (sn?.principal) {
    if ((e.standbySellerNote ?? 0) > 0 && sn.fullStandbyForLoanTerm !== true) add('C6', 'Seller note counted as equity', 'counted as equity but not on full standby for the 7(a) term', 'Seller debt counts as equity only if subordinated and on full standby (no principal or interest for the term of the 7(a) loan)', 'sba-sop-50-10-8-1-seller-debt-equity', 'conflicts');
    else if ((e.standbySellerNote ?? 0) > 0) add('C6', 'Seller note counted as equity', 'full standby for the 7(a) term', 'Subordinated and on full standby for the term of the 7(a) loan; interest may accrue', 'sba-sop-50-10-8-1-seller-debt-equity; sba-sop-50-10-8-1-standby-terms', 'consistent', 'The standby agreement and subordination are lender and lawyer documents.');
    if (!sn.fullStandbyForLoanTerm && sn.interestOnly) add('C7', 'Interest-only seller note in coverage', 'interest-only, not on full standby', 'The lender must apply an amortization of no more than 10 years to interest-only acquisition debt for coverage', 'sba-sop-50-10-8-1-interest-only-debt', 'lender-call', 'Coverage below uses a 10-year amortization for this note.');
  }

  // Valuation and debt cap
  if (!has(deal.valuation)) add('C8', 'Valuation supports price', 'no lender valuation yet', 'Price above the valuation must be made up by equity', 'sba-sop-50-10-8-1-valuation-gap-equity', 'missing-fact', 'The lender orders the valuation (sba-sop-50-10-8-1-valuation-for-lender).');
  else if (has(deal.businessPurchasePrice)) {
    const gap = deal.businessPurchasePrice - deal.valuation;
    add('C8', 'Valuation supports price', `price ${usd(deal.businessPurchasePrice)}; valuation ${usd(deal.valuation)}`, 'If the amount paid exceeds the valuation, the difference must be made up by equity', 'sba-sop-50-10-8-1-valuation-gap-equity', gap > 0.5 ? 'conflicts' : 'consistent', gap > 0.5 ? `Gap of ${usd(gap)} must come from added equity, or the price must change.` : '');
  }
  const sbaP = deal.sba?.principal ?? 0;
  const snNotStandby = sn?.principal && !sn.fullStandbyForLoanTerm ? sn.principal : 0;
  const otherP = (deal.otherDebt ?? []).reduce((a, d) => a + (d.principal ?? 0), 0);
  const totalDebt = sbaP + snNotStandby + otherP;
  if (has(deal.valuation) && totalDebt) add('C9', 'Total debt no more than the valuation', `debt ${usd(totalDebt)} (incl. seller debt not on full standby); valuation ${usd(deal.valuation)}`, 'Total debt, including seller debt not on full standby, is limited to the business valuation', 'sba-sop-50-10-8-1-total-debt-cap', totalDebt <= deal.valuation + 0.5 ? 'consistent' : 'conflicts');

  // QoE trigger
  if (has(deal.businessPurchasePrice) && ['initial-acquisition', 'business-expansion'].includes(type)) add('C10', 'Quality of earnings report needed', `business purchase price ${usd(deal.businessPurchasePrice)}`, 'QoE required at a purchase price of $3 million or more, before financing', 'sba-sop-50-10-8-1-qoe-threshold', deal.businessPurchasePrice >= 3_000_000 ? 'lender-call' : 'consistent', deal.businessPurchasePrice >= 3_000_000 ? 'A QoE is required; coverage will be computed from its findings (sba-sop-50-10-8-1-qoe-dsc).' : 'Below the $3M trigger; the lender may still ask for one.');

  // Loan size and term
  if (sbaP) add('C11', 'Loan within the Standard 7(a) maximum', usd(sbaP), 'Maximum Standard 7(a) loan $5,000,000', 'sba-sop-50-10-8-1-max-loan', sbaP <= 5_000_000 ? 'consistent' : 'conflicts');
  if (deal.sba && has(deal.sba.amortYears)) {
    const ok = deal.sba.amortYears <= 10 || (deal.sba.realEstatePortion && deal.sba.amortYears <= 25);
    add('C12', 'Amortization and balloon', `${deal.sba.amortYears} years${deal.sba.balloon ? ', with balloon' : ''}`, 'No more than 10 years (real estate portion up to 25); no balloon', 'sba-sop-50-10-8-1-change-of-ownership-term; sba-sop-50-10-8-1-real-estate-structure', ok && !deal.sba.balloon ? 'consistent' : 'conflicts');
  }

  // Coverage
  const req = DSC_BY_TYPE[type];
  const ebitdas = [deal.ebitdaLastFye, deal.ebitdaPriorFye].filter(has);
  let ds = deal.combinedAnnualDebtService ?? null;
  if (ds == null && deal.sba?.principal && has(deal.sba.ratePct)) {
    ds = monthlyPayment(deal.sba.principal, deal.sba.ratePct, Math.round((deal.sba.amortYears ?? 10) * 12)) * 12;
    if (snNotStandby && has(sn.ratePct)) ds += monthlyPayment(sn.principal, sn.ratePct, Math.round((sn.interestOnly ? 10 : (sn.years ?? 10)) * 12)) * 12;
    ds += (deal.otherDebt ?? []).reduce((a, d) => a + (d.annualDebtService ?? 0), 0);
  }
  if (!req || !ebitdas.length || !ds) add('C13', 'Debt service coverage', 'EBITDA or debt service missing', 'EBITDA ÷ combined post-transaction debt service, last FYE or two-year average', 'sba-sop-50-10-8-1-dsc-ratio; sba-sop-50-10-8-1-dsc-definition', 'missing-fact');
  else {
    const last = deal.ebitdaLastFye != null ? deal.ebitdaLastFye / ds : null;
    const avg = ebitdas.length === 2 ? (ebitdas[0] + ebitdas[1]) / 2 / ds : null;
    const best = Math.max(...[last, avg].filter(has));
    add('C13', 'Debt service coverage', `combined debt service ${usd(ds)}; DSC last FYE ${fx(last)}; two-year average ${fx(avg)}`, `${req.toFixed(2)}:1 for ${type}, last FYE or average of last two, historical or adjusted basis`, 'sba-sop-50-10-8-1-dsc-ratio; sba-sop-50-10-8-1-dsc-definition', best >= req ? 'consistent' : 'conflicts', 'Projections can\'t be relied on (sba-sop-50-10-8-1-projections); adjustments must be justified by the lender (sba-sop-50-10-8-1-adjustment-justification).');
  }

  // Deal terms
  if (deal.earnout) add('C14', 'Seller earnout', 'deal includes a seller earnout', 'Seller earnouts are prohibited; buyer rebates based on performance are allowed', 'sba-sop-50-10-8-1-earnouts', 'conflicts', 'Discuss alternatives with the lender and a lawyer.');
  if (deal.buyerRebate) add('C15', 'Buyer rebate', 'deal includes a buyer rebate', 'Rebate proceeds must pay down the 7(a) loan principal', 'sba-sop-50-10-8-1-seller-rebate-principal', 'lender-call');
  if (['initial-acquisition', 'business-expansion'].includes(type)) {
    if (deal.sellerStaysAsEmployeeOrOwner) add('C16', 'Seller staying on', 'seller stays as officer, director, owner or employee', 'Seller may not remain as officer, director, stockholder or employee; consultant up to 24 months in aggregate', 'sba-sop-50-10-8-1-seller-consultant', 'conflicts');
    if (has(deal.sellerConsultingMonths)) add('C17', 'Seller consulting period', `${deal.sellerConsultingMonths} months`, 'Consultant for a period not to exceed 24 months, including extensions', 'sba-sop-50-10-8-1-seller-consultant', deal.sellerConsultingMonths <= 24 ? 'consistent' : 'conflicts');
  }
  if (has(deal.leaseTermYearsInclRenewals) && has(deal.sba?.amortYears)) add('C18', 'Lease term vs loan term', `lease incl. borrower renewal options ${deal.leaseTermYearsInclRenewals} years; loan ${deal.sba.amortYears} years`, 'Lease term including borrower renewal options should equal or exceed the loan term', 'sba-sop-50-10-8-1-lease-term', deal.leaseTermYearsInclRenewals >= deal.sba.amortYears ? 'consistent' : 'conflicts');

  // Always: items the lender decides that we can't compute
  add('C19', 'Guaranties and collateral', 'owners and percentages', '20%+ owners give an unlimited full guaranty; spouse rule; personal real estate if not fully secured', 'sba-sop-50-10-8-1-personal-guaranty; sba-sop-50-10-8-1-spouse-guaranty; sba-sop-50-10-8-1-personal-real-estate', 'lender-call', 'See personal-guarantee-risk-review.');
  add('C20', 'Business type eligibility', deal.industry ?? 'industry', 'The lender must check the ineligible list (13 CFR 120.110)', 'sba-sop-50-10-8-1-ineligible-businesses', 'lender-call');
  return { sop: SOP, checks: out, projectCost, requiredEquity: required };
}

function usd(n) { return n == null ? 'n/a' : (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'); }
function fx(n) { return n == null ? 'n/a' : n.toFixed(2) + 'x'; }

export function toMarkdown(res) {
  const L = [`Checked against ${res.sop.name} facts in data/sources (effective for loans numbered on or after ${res.sop.effective}). Confirm the current SOP and your lender's reading; this is not an eligibility decision.`, '', '| # | Check | Deal fact | Rule (quoted or summarized) | Source | Result | Note |', '|---|---|---|---|---|---|---|'];
  for (const c of res.checks) L.push(`| ${c.id} | ${c.check} | ${c.dealFact} | ${c.rule} | ${c.source} | ${c.result} | ${c.note} |`);
  return L.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node sop-check.mjs deal.json [--json]'); process.exit(2); }
  const res = sopCheck(JSON.parse(readFileSync(file, 'utf8')));
  console.log(process.argv.includes('--json') ? JSON.stringify(res, null, 2) : toMarkdown(res));
}
