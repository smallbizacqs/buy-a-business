#!/usr/bin/env node
// Search funnel and runway arithmetic for acquisition-search-plan.
// Plain Node, no dependencies, no network. Every rate and cost is the user's own assumption;
// this script has no built-in defaults for conversion rates.
//
// Usage: node search-math.mjs <input.json>
// Input shape (all money in one currency, per month unless noted):
// {
//   "channels": [
//     { "name": "letters", "contacts_per_week": 40,
//       "rates": { "contact_to_conversation": 0.03, "conversation_to_cim": 0.4,
//                  "cim_to_loi": 0.25, "loi_to_close": 0.4 } }
//   ],
//   "closes_wanted": 1,
//   "lag_weeks_after_loi": 16,
//   "runway": { "liquid_funds": 300000, "reserved_for_deal": 180000,
//               "monthly_living": 7000, "monthly_search_costs": 1500, "monthly_income": 0 }
// }
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const STAGES = ['contact_to_conversation', 'conversation_to_cim', 'cim_to_loi', 'loi_to_close'];
const LABELS = ['contacts', 'conversations', 'cims', 'lois', 'closes'];

function num(v, name, { min = 0, allowZero = true } = {}) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${name} must be a number`);
  if (v < min || (!allowZero && v === 0)) throw new Error(`${name} must be ${allowZero ? '>=' : '>'} ${min}`);
  return v;
}

export function checkRates(rates, where = 'rates') {
  if (!rates || typeof rates !== 'object') throw new Error(`${where}: all four conversion rates are required (no defaults)`);
  for (const s of STAGES) {
    const r = rates[s];
    if (r === undefined) throw new Error(`${where}.${s} is missing; ask the user for their own assumption`);
    num(r, `${where}.${s}`);
    if (r <= 0 || r > 1) throw new Error(`${where}.${s} must be a fraction in (0, 1]`);
  }
  return rates;
}

// Forward: expected count at each stage from a number of contacts.
export function funnelForward(contacts, rates) {
  num(contacts, 'contacts');
  checkRates(rates);
  const out = { contacts };
  let n = contacts;
  STAGES.forEach((s, i) => { n *= rates[s]; out[LABELS[i + 1]] = n; });
  return out;
}

// Backward: contacts and stage counts needed for a number of closes.
export function funnelBackward(closes, rates) {
  num(closes, 'closes', { allowZero: false });
  checkRates(rates);
  const out = { closes };
  let n = closes;
  for (let i = STAGES.length - 1; i >= 0; i--) { n /= rates[STAGES[i]]; out[LABELS[i]] = n; }
  return out;
}

// Months of runway: money not reserved for the deal, divided by the net monthly burn.
export function runway({ liquid_funds, reserved_for_deal = 0, monthly_living, monthly_search_costs = 0, monthly_income = 0 }) {
  num(liquid_funds, 'liquid_funds');
  num(reserved_for_deal, 'reserved_for_deal');
  num(monthly_living, 'monthly_living');
  num(monthly_search_costs, 'monthly_search_costs');
  num(monthly_income, 'monthly_income');
  const available = liquid_funds - reserved_for_deal;
  const burn = monthly_living + monthly_search_costs - monthly_income;
  if (available < 0) return { available, burn, months: 0, note: 'reserved_for_deal exceeds liquid_funds' };
  if (burn <= 0) return { available, burn, months: Infinity, note: 'income covers living and search costs' };
  return { available, burn, months: available / burn };
}

// Combine channels: expected closes per week, weeks of outreach for the closes wanted, and total time with the lag.
export function plan(input) {
  const { channels, closes_wanted = 1, lag_weeks_after_loi = 0 } = input ?? {};
  if (!Array.isArray(channels) || channels.length === 0) throw new Error('channels: at least one channel is required');
  num(lag_weeks_after_loi, 'lag_weeks_after_loi');
  const perChannel = channels.map((c, i) => {
    const name = c.name ?? `channel ${i + 1}`;
    num(c.contacts_per_week, `${name}.contacts_per_week`);
    checkRates(c.rates, `${name}.rates`);
    return { name, contacts_per_week: c.contacts_per_week, weekly: funnelForward(c.contacts_per_week, c.rates), per_close: funnelBackward(1, c.rates) };
  });
  const closesPerWeek = perChannel.reduce((a, c) => a + c.weekly.closes, 0);
  const loisPerWeek = perChannel.reduce((a, c) => a + c.weekly.lois, 0);
  const outreachWeeks = closesPerWeek > 0 ? closes_wanted / closesPerWeek : Infinity;
  const result = {
    channels: perChannel,
    closes_wanted,
    expected_closes_per_week: closesPerWeek,
    expected_lois_per_week: loisPerWeek,
    outreach_weeks_for_closes_wanted: outreachWeeks,
    total_weeks_incl_lag: outreachWeeks + lag_weeks_after_loi,
    total_months_incl_lag: (outreachWeeks + lag_weeks_after_loi) * 7 / (365.25 / 12),
  };
  if (input.runway) {
    const r = runway(input.runway);
    result.runway = r;
    result.runway_covers_plan = r.months >= result.total_months_incl_lag;
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node search-math.mjs <input.json>'); process.exit(2); }
  try {
    const out = plan(JSON.parse(readFileSync(file, 'utf8')));
    console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 100) / 100 : v === Infinity ? 'infinite' : v), 2));
  } catch (e) { console.error(`error: ${e.message}`); process.exit(1); }
}
