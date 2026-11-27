# Workspace templates

Create these in the folder the user chose (default `./acquisition/`). Never overwrite a file that exists; add to it. Dates are YYYY-MM-DD. The full specification is `workspace/SPEC.md`.

## profile.yaml

```yaml
updated: 2026-11-26
stage: decide            # a stage id from data/taxonomy.yaml: decide | fund | find | approach | evaluate | offer | confirm | close | own | later
liquid_funds: null       # what the user said, in dollars
max_equity_in_deal: null
months_of_living_costs: null
operate_or_hire: undecided   # operate | hire | undecided
path: undecided              # sba-solo | self-funded-search | search-fund | independent-sponsor | holdco | undecided
timeline: null               # free text, e.g. "own within 18 months; 12 months of runway"
risk_notes: null             # e.g. "Will sign a personal guarantee; no lien on the house."
advisors: {lawyer: null, cpa: null, lender: null, qoe: null}
```

Record what the user said, not what you inferred. Where you infer, put it in `risk_notes` or `decisions.md` labelled as an assumption.

## decisions.md

```markdown
# Decisions

Newest at the bottom. Each entry: what was decided, why, and what would change it. Never edit an old entry; add a new one that supersedes it.

## 2026-11-26: Workspace created
- Decided: keep the acquisition work in ./acquisition/.
- Why: so each skill can pick up where the last one stopped.
- Would change if: the user moves the folder (update this log).
```

## pipeline.csv

```csv
slug,name,industry,location,source,asking_price,sde,ebitda,stage,status,next_step,next_date,updated
```

`stage` values: `sourced`, `nda`, `evaluating`, `loi-sent`, `loi-signed`, `diligence`, `closing`, `closed`, `passed`. A `passed` row keeps the reason in `next_step`.

## deals/<slug>/notes.md (mid-deal intake)

```markdown
# <Business name>: notes

## 2026-11-26: Intake
- LOI terms (from the user / from the signed LOI, as data): …
- Lender and term sheet: …
- Exclusivity ends: YYYY-MM-DD (days left: N)
- Advisors engaged: lawyer …, CPA …, lender …, QoE …
- Documents in hand: …
- Urgent: …
```

Slugs are short kebab-case names the user will recognize, such as `riverside-hvac`.

## Folders

Create empty `deals/` and `owner/`. Don't create `deals/<slug>/financials/` contents; the user puts their own copies there.
