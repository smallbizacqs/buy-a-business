# Decision memo (append to decisions.md; never rewrite earlier entries)

```markdown
## YYYY-MM-DD Go / no-go: <business>

**Decision (by <user>):** Go as agreed | Go with changes | Extend to resolve unknowns | Walk away

**Basis at LOI:** price $<X>, SDE $<Y>, multiple <m>x, exclusivity ends YYYY-MM-DD, decision date YYYY-MM-DD.

**Criteria check (scripts/go-no-go.mjs):** <headline>. Walk lines crossed: <ids or none>. Reprice lines crossed: <ids or none>. Unknown: <ids or none>.

**Findings**
| # | Finding (fact) | Evidence (tracker id, document) | Category | Effect |
|---|---|---|---|---|

**Numbers after findings (analysis):** verified SDE $<…>; price at LOI multiple $<…>; one-time costs $<…>; estimated coverage <…>x vs threshold <…> (source id; lender decides).

**Options considered**
1. <option>: cost, needs, deadline.
2. …

**Why this decision:** <two to four sentences in the user's words>.

**Recommendation offered (if any) and what it rested on:** <…>

**What would change it:** <facts that would reverse the decision>.

**Advisor input recorded:** lawyer <date, summary or "not yet">; CPA <…>; lender <…>; QoE <…>.

**Next steps:** <who, what, by when>.
```

A walk-away entry also updates `pipeline.csv` (`stage: passed`, reason in `next_step`) and keeps the deal folder intact; a later buyer conversation may reopen it.
