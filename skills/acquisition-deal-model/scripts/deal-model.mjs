#!/usr/bin/env node
// Acquisition deal model: sources and uses, annual debt service, coverage, owner pay.
// Plain Node, no dependencies, no network. Usage:
//   node deal-model.mjs input.json          prints markdown
//   node deal-model.mjs input.json --json   prints JSON
// Coverage follows the definition quoted in data/sources/sba-sop-50-10-8-1-dsc-definition.yaml
// (EBITDA divided by combined post-transaction debt service). It is a screen, not the lender's
// underwriting: the lender chooses the period, the adjustments and the debt it counts.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function monthlyPayment(principal, annualRatePct, months) {
  if (!(months > 0) || !(principal > 0)) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

// Standby (no payments), then interest-only, then level amortization over `years`.
export function loanSchedule(loan, horizonMonths) {
  const { principal = 0, ratePct = 0, years = 10, standbyMonths = 0, interestOnlyMonths = 0, accrueDuringStandby = true, balloonMonth = null } = loan;
  const r = ratePct / 100 / 12;
  let bal = principal, pmt = null;
  const rows = [];
  for (let m = 1; m <= horizonMonths; m++) {
    if (bal <= 1e-6) { rows.push({ month: m, payment: 0, interest: 0, principal: 0, balance: 0, balloon: 0 }); continue; }
    let interest = bal * r, payment = 0, princ = 0, balloon = 0;
    if (m <= standbyMonths) { if (accrueDuringStandby) bal += interest; else interest = 0; }
    else if (m <= standbyMonths + interestOnlyMonths) payment = interest;
    else {
      if (pmt === null) pmt = monthlyPayment(bal, ratePct, Math.round(years * 12));
      payment = Math.min(pmt, bal + interest); princ = payment - interest; bal -= princ;
    }
    if (balloonMonth && m === balloonMonth && bal > 1e-6) { balloon = bal; payment += bal; princ += bal; bal = 0; }
    rows.push({ month: m, payment, interest, principal: princ, balance: Math.max(bal, 0), balloon });
  }
  return rows;
}

function annual(rows, years) {
  return Array.from({ length: years }, (_, i) => {
    const s = rows.slice(i * 12, (i + 1) * 12);
    return { payment: s.reduce((a, x) => a + x.payment - x.balloon, 0), balloon: s.reduce((a, x) => a + x.balloon, 0), endBalance: s.at(-1)?.balance ?? 0 };
  });
}

export function dealModel(input) {
  const {
    label = 'Scenario', price, closingCosts = 0, workingCapital = 0, otherUses = 0,
    ebitda: ebitdaIn = null, sde = null, ownerSalary = null, capexReserve = 0,
    bank = null, sellerNote = null, otherDebt = [], equity: equityIn = null,
    requiredDsc = 1.25, years = 5,
  } = input;
  if (!(price > 0)) throw new Error('price is required');
  let ebitda = ebitdaIn;
  if (ebitda == null) {
    if (sde == null) throw new Error('give ebitda, or sde with ownerSalary (a market salary for someone doing the owner\'s job)');
    if (ownerSalary == null) throw new Error('sde given without ownerSalary: EBITDA = SDE minus a market owner salary, so the salary is needed');
    ebitda = sde - ownerSalary;
  }
  const salary = ownerSalary ?? 0;

  const uses = [['Purchase price', price], ['Closing costs and fees', closingCosts], ['Working capital at close', workingCapital], ['Other uses', otherUses]].filter(([, v]) => v);
  const totalUses = uses.reduce((a, [, v]) => a + v, 0);
  const loans = [];
  if (bank?.principal) loans.push({ name: bank.name ?? 'Bank loan', ...bank });
  if (sellerNote?.principal) loans.push({ name: sellerNote.name ?? 'Seller note', ...sellerNote });
  for (const d of otherDebt) if (d.principal) loans.push({ name: d.name ?? 'Other debt', ...d });
  const totalDebt = loans.reduce((a, l) => a + l.principal, 0);
  const equity = equityIn ?? totalUses - totalDebt;
  const sources = [...loans.map((l) => [l.name, l.principal]), ['Buyer equity', equity]];
  const totalSources = sources.reduce((a, [, v]) => a + v, 0);
  const gap = totalUses - totalSources;

  const sched = loans.map((l) => ({ name: l.name, years: annual(loanSchedule(l, years * 12), years) }));
  const rows = Array.from({ length: years }, (_, i) => {
    const byLoan = sched.map((s) => ({ name: s.name, payment: s.years[i].payment, balloon: s.years[i].balloon, endBalance: s.years[i].endBalance }));
    const debtService = byLoan.reduce((a, x) => a + x.payment, 0);
    const balloons = byLoan.reduce((a, x) => a + x.balloon, 0);
    return {
      year: i + 1, byLoan, debtService, balloons,
      dsc: debtService > 0 ? ebitda / debtService : null,
      ownerPay: salary + ebitda - debtService - capexReserve,
    };
  });
  const worst = rows.reduce((w, r) => (r.debtService > w.debtService ? r : w), rows[0]);
  const maxDebtService = ebitda / requiredDsc;
  const bankLoan = loans.find((l) => l.name === (bank?.name ?? 'Bank loan'));
  let maxBankPrincipal = null;
  if (bank && bank.ratePct != null) {
    const otherWorst = worst.byLoan.filter((x) => x.name !== (bank.name ?? 'Bank loan')).reduce((a, x) => a + x.payment, 0);
    const perDollar = monthlyPayment(1, bank.ratePct, Math.round((bank.years ?? 10) * 12)) * 12;
    maxBankPrincipal = Math.max(0, (maxDebtService - otherWorst) / perDollar);
  }
  const cushionPct = (target) => (worst.debtService > 0 ? (1 - (target * worst.debtService) / ebitda) * 100 : null);
  const sensitivity = [0, -10, -20].map((p) => {
    const e = ebitda * (1 + p / 100);
    return { ebitdaChangePct: p, ebitda: e, worstDsc: worst.debtService > 0 ? e / worst.debtService : null, worstOwnerPay: salary + e - worst.debtService - capexReserve };
  });
  return {
    label, ebitda, ownerSalary: salary, capexReserve, requiredDsc,
    uses, totalUses, sources, totalSources, equity, equityPctOfUses: (equity / totalUses) * 100, gap,
    rows, year1Dsc: rows[0].dsc, worstYear: worst.year, worstDsc: worst.dsc,
    meetsRequiredInWorstYear: worst.dsc == null ? null : worst.dsc >= requiredDsc,
    maxDebtServiceAtRequired: maxDebtService, maxBankPrincipal, bankPrincipal: bankLoan?.principal ?? null,
    ebitdaCushionToRequiredPct: cushionPct(requiredDsc), ebitdaCushionToBreakEvenPct: cushionPct(1),
    sensitivity,
  };
}

const usd = (n) => (n == null ? 'n/a' : (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'));
const x = (n) => (n == null ? 'n/a' : n.toFixed(2) + 'x');
const pct = (n) => (n == null ? 'n/a' : n.toFixed(1) + '%');

export function toMarkdown(m) {
  const L = [];
  L.push(`### ${m.label}`, '', '**Sources and uses**', '', '| Uses | Amount | | Sources | Amount | % of uses |', '|---|---|---|---|---|---|');
  const n = Math.max(m.uses.length, m.sources.length);
  for (let i = 0; i < n; i++) {
    const u = m.uses[i] ?? ['', null], s = m.sources[i] ?? ['', null];
    L.push(`| ${u[0]} | ${u[1] == null ? '' : usd(u[1])} | | ${s[0]} | ${s[1] == null ? '' : usd(s[1])} | ${s[1] == null ? '' : pct((s[1] / m.totalUses) * 100)} |`);
  }
  L.push(`| **Total** | **${usd(m.totalUses)}** | | **Total** | **${usd(m.totalSources)}** | |`, '');
  if (Math.abs(m.gap) > 0.5) L.push(`Sources and uses do not balance: gap of ${usd(m.gap)}.`, '');
  const names = m.rows[0].byLoan.map((b) => b.name);
  L.push('**Debt service and coverage** (EBITDA ' + usd(m.ebitda) + ')', '', `| Year | ${names.join(' | ')} | Total debt service | DSC | Owner pay |`, `|---|${names.map(() => '---|').join('')}---|---|---|`);
  for (const r of m.rows) L.push(`| ${r.year} | ${r.byLoan.map((b) => usd(b.payment) + (b.balloon ? ` + balloon ${usd(b.balloon)}` : '')).join(' | ')} | ${usd(r.debtService)} | ${x(r.dsc)} | ${usd(r.ownerPay)} |`);
  L.push('', `- Year-1 DSC ${x(m.year1Dsc)}; heaviest year is year ${m.worstYear} at ${x(m.worstDsc)} against a ${m.requiredDsc.toFixed(2)}x screen.`);
  L.push(`- Most total annual debt service the EBITDA supports at ${m.requiredDsc.toFixed(2)}x: ${usd(m.maxDebtServiceAtRequired)}.`);
  if (m.maxBankPrincipal != null) L.push(`- Largest bank loan at that coverage, with the other debt as modeled: ${usd(m.maxBankPrincipal)} (modeled: ${usd(m.bankPrincipal)}).`);
  L.push(`- EBITDA can fall ${pct(m.ebitdaCushionToRequiredPct)} before coverage drops below ${m.requiredDsc.toFixed(2)}x, and ${pct(m.ebitdaCushionToBreakEvenPct)} before it drops below 1.00x.`);
  L.push(`- Owner pay = owner salary ${usd(m.ownerSalary)} + EBITDA - debt service - capex reserve ${usd(m.capexReserve)}; before income taxes.`, '');
  L.push('| EBITDA change | EBITDA | DSC (heaviest year) | Owner pay (heaviest year) |', '|---|---|---|---|');
  for (const s of m.sensitivity) L.push(`| ${s.ebitdaChangePct}% | ${usd(s.ebitda)} | ${x(s.worstDsc)} | ${usd(s.worstOwnerPay)} |`);
  return L.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node deal-model.mjs input.json [--json]   (input may be one scenario or an array)'); process.exit(2); }
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const models = (Array.isArray(raw) ? raw : [raw]).map(dealModel);
  console.log(process.argv.includes('--json') ? JSON.stringify(models, null, 2) : models.map(toMarkdown).join('\n\n'));
}
