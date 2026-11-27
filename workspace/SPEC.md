# The buyer's workspace

Every skill reads and writes the same folder in the user's own files, so work survives between sessions and passes from one skill to the next (buy box → evaluate → diligence → close). The `buy-a-business` skill creates it. Default location: `./acquisition/` in the folder the user is working in; the user may choose another.

Nothing in the workspace leaves the user's machine unless they send it themselves.

```
acquisition/
  profile.yaml          who the buyer is: budget, liquidity, risk tolerance, operate or hire, timeline, financing path
  buy-box.yaml          criteria: industries, size (SDE/EBITDA, price), geography, deal-breakers
  decisions.md          dated decision log: what was decided, why, and what would change it
  pipeline.csv          one row per deal; opens in any spreadsheet
  buyer-profile.md      one-page buyer profile for brokers and owners
  search-plan.md        search plan; inputs in search-plan-inputs.json
  outreach/             off-market targets.csv, referral-sources.csv, drafts (marked "DRAFT: not sent")
  decide/               stage 1 work: buy-vs-start.md, readiness.md, operator-model.md, take-home.md (+ take-home-input.json),
                        guarantee-risk.md, what-to-buy.md
  fund/                 stage 2 work: path.md, sba-loan-plan.md, equity-plan.md, investor-raise.md
  deals/
    <deal-slug>/
      listing.md        the listing, teaser or CIM summary, with the source
      evaluation.md     earnings, add-backs, valuation, DSCR scenario, risks, questions
      addbacks.csv      each add-back with evidence and supported / assumed / unsupported
      financials/       the user's copies of P&Ls, tax returns, bank statements (never uploaded by a skill)
        proof-of-cash/  the CSVs the proof-of-cash script reads
      verification.md   proof-of-cash tie-out and gaps
      loi-draft.md      offer terms and the LOI draft
      diligence-tracker.csv   request list with owner, due date, status, notes
      lender.md         lender, term sheet, package checklist
      deal-model.md     capital stack, debt service and coverage by scenario (+ deal-model.json)
      seller-note.md    seller-note structures compared
      sop-check.md      the deal checked against the current SBA SOP (+ sop-check-input.json)
      legal-inventory.md   contracts, leases, licenses and permits found in legal diligence
      purchase-agreement-questions.md   questions for counsel on the draft agreement
      closing-checklist.md
      grill.md          the stress test from `grill-my-deal`: decisions, risks accepted, deal-killers, open questions
      notes.md          calls and meetings, dated
  grill-search-plan.md  the stress test of a search plan, before there is a deal
  owner/                after closing
    transition-plan.md
    100-day-plan.md
    operating-system.md
    value-creation-plan.md
    add-on-plan.md
    exit-options.md
```

## profile.yaml

```yaml
updated: 2026-11-26
stage: decide            # current stage id (see data/taxonomy.yaml)
liquid_funds: 300000
max_equity_in_deal: 150000
months_of_living_costs: 18
timeline: "Close within 12 to 18 months"
operate_or_hire: operate # operate | hire | undecided
path: undecided          # sba-solo | self-funded-search | search-fund | independent-sponsor | holdco | undecided
risk_notes: "Spouse agrees to a personal guarantee but not a lien on the house."
advisors: {lawyer: null, cpa: null, lender: null, qoe: null, insurance: null}
```

## pipeline.csv columns

`slug,name,industry,location,source,asking_price,sde,ebitda,stage,status,next_step,next_date,updated`

- `stage` is the deal's step: `sourced`, `nda`, `evaluating`, `loi-sent`, `loi-signed`, `diligence`, `closing`, `closed`, `passed`.
- `status` is free text; `passed` rows keep the reason in `next_step`.

## diligence-tracker.csv columns

`id,area,request,why,owner,requested_on,due,status,received_on,file,finding,follow_up`

- `area`: `financial`, `legal`, `operational`, `lender`, `insurance`, `other`.
- `status`: `open`, `requested`, `received`, `reviewed`, `issue`, `closed`.
- `id` prefixes, so skills never collide: `P` pre-offer requests (`screen-business-cim`), `F` financial, `L` legal, `O` operational, `B` lender, `I` insurance, `X` other; then a two-digit number (`F07`).

## Rules for skills

- Read `profile.yaml` and the deal folder before asking the user anything; ask only for what's missing.
- Append to `decisions.md` when the user decides something; never rewrite history.
- Keep the user's documents where they put them; never upload, email or share them.
- Write dates as YYYY-MM-DD.
