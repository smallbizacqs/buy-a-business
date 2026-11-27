# Workspace templates

Create these in the folder the user chose (default `./acquisition/`). Never overwrite a file that exists; add to it. Dates are YYYY-MM-DD. The full specification is `references/workspace.md`.

## profile.yaml

```yaml
updated: 2026-11-26
stage: decide            # a stage id from references/stage-map.md: decide | fund | find | approach | evaluate | offer | confirm | close | own | later
liquid_funds: null       # what the user said, in dollars
max_equity_in_deal: null
monthly_household_spend: null  # what the household spends a month
months_of_living_costs: null   # reserve kept outside the deal after closing, in months of household spend
search_runway_months: null     # months the user can search without a salary
operating_experience: null     # the user's words: people managed, P&L or budget owned, selling
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

## deals/<slug>/loi-draft.md (mid-deal intake)

```markdown
# <Business name>: LOI terms (user-stated)

Source: what the user told us on YYYY-MM-DD, not read from the signed LOI. Replace with the LOI's own wording when the user shares it.

- Price: $…
- Structure: asset / stock; how it's paid (cash at close, seller note, earnout, rollover): …
- LOI signed: YYYY-MM-DD
- Exclusivity ends: YYYY-MM-DD
- Target closing: YYYY-MM-DD
- Other terms the user mentioned (working capital, seller transition): …
```

Slugs are short kebab-case names the user will recognize, such as `riverside-hvac`.

## Folders

Create empty `deals/` and `owner/`. Don't create `deals/<slug>/financials/` contents; the user puts their own copies there.
