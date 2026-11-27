# grill.md template

Write to `deals/<slug>/grill.md`. A later run adds a new dated section at the top and keeps the earlier ones below it. Keep every section, even when empty ("None found in the record").

```markdown
# Grill: <Business name>

## 2026-11-26 (deal step: loi-signed)

### Fact sheet
| Claim | Value | Source | Status |
|---|---|---|---|
| SDE, last fiscal year | $412,000 | broker CIM p.4 | Assumption (seller document; not tied to bank statements) |
| Bank deposits, last 12 months | $1.31M | bank statements in financials/ | Fact (third-party record) |
| Price | $1.35M | signed LOI | Fact (signed) |
| Top customer share | "about 20%" | seller on call, notes.md 2026-11-10 | Assumption (seller's word) |

Status is one of: Fact (third-party record or signed document), User decision, Assumption (seller or broker says), Agent analysis.

### Decisions taken
- <decision>. Why: <reason>.
(All of this session's decisions are summarized in one decisions.md entry dated 2026-11-26.)

### Risks accepted
- <risk>. Accepted because <reason>. Would change my mind: <trigger>.

### Deal-killers found
- **Works only if** <condition>. **The record shows** <what it shows, with source>. **Next:** `<skill-name>` (<who must answer>).
- (or) None found in the record. Areas not yet checked: <list>.

### Open questions
| # | Question | Who can answer | Next skill | Due |
|---|---|---|---|---|
| 1 | Do deposits tie to reported revenue for 24 months? | the user, from bank statements | `verify-seller-financials` | before QoE |

### Analysis (agent)
Coverage and downside, only from recorded numbers, with the inputs shown. Labelled as analysis, not a lender's conclusion. If an owner replacement cost had to be assumed, write "ASSUMPTION: owner replacement cost $…, not sourced" beside every figure that uses it and show coverage at $25,000 above and below it.

### What would have to be true
Three to seven lines: the conditions under which this deal works. No "buy" or "don't buy".

### Next skills
1. `<skill-name>`: why first.
2. `<skill-name>`: why.
3. `<skill-name>`: why.
```
