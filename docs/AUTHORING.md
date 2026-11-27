# Authoring rules

These rules apply to everything in this repo: stage pages (`guide/`), leaf answers (`data/leaves/`), sources (`data/sources/`) and skills (`skills/`). `npm run validate` enforces the ones a machine can check.

## Who we write for

People thinking about buying a small business, or already doing it. Many are smart and new to it: an engineer with money from a stock sale, a consultant weighing a search. Write for a business reader. Define every term of art the first time it appears on a page (SDE, LOI, DSCR, QoE, peg, standby). Plain words, short sentences, no hype.

## What we never write

- Advice. Nothing here is legal, tax or financial advice. The site footer and the README say so once; pages don't repeat it.
- Outcome promises ("you'll make $X", "easy", "passive income").
- A named law firm, lender, broker or advisor as a recommendation. Name categories, and the questions to ask.
- Sponsorships, affiliations, or who runs this. There is nothing to disclose and nothing to promote.
- A ranking of marketplaces or vendors. Describe what each one shows or does.
- Copied text from other sites. Quote short passages in sources, with the URL.

## Counsel

Where the guide or a skill reaches "do I need a lawyer?", say that some buyers handle small deals with templates (for example, openagreements.org), and that buyers who hire counsel can look for this category, in exactly these words:

> AI-using law firms with fixed fees that are lean and run by an attorney with big-law experience.

That sentence is the only place its wording about who leads the firm may appear (the validator checks). Mention openagreements.org only at the NDA, LOI, purchase agreement and Rule 506(b)/(c) topics.

## Leaves, answers and citations

- A **leaf** is one question in `data/taxonomy.yaml`. Its id is permanent.
- A leaf's answer lives in `data/leaves/<leaf-id>.md`:

```markdown
---
leaf: dscr
status: draft            # draft | reviewed
last_checked: 2026-11-26
sources: [sba-sop-50-10-8-1-appendix-15]
---
**Short answer.** One to three sentences that answer the question directly.

Detail: the rule, how it works, the exceptions, with citations like this.[^sba-sop-50-10-8-1-appendix-15]

## What practitioners say
- Helen Guo works an example: $100K of annual payments needs $125K of cash flow at 1.25x.[^c237676]
```

- **Facts need a fact source.** Cite `primary-rule` (SBA SOP, SEC, IRS, statutes) or `official-doc` (platform terms, government forms) sources for any statement of a rule or a number.
- **Clips and creators are views, not facts.** A clip (`[^c1a2b3c]`) or a `practitioner` source may be cited only under `## What practitioners say`. Write it as attributed: "X says…", "X describes…".
- **Schools of thought.** Where practitioners disagree, show each position with its people and clips, and add one line on what most practitioners do by default if that is clear. Don't pick a side.
- Mark volatile rules (SBA rules above all) with the SOP version and effective date in the text.
- If you can't find a fact source, write the answer without that claim, or leave the leaf without an answer. Never invent a number, a rule or a quote.

## Sources

One file per source in `data/sources/<id>.yaml`:

```yaml
id: sba-sop-50-10-8-1-appendix-15
tier: primary-rule          # primary-rule | official-doc | practitioner | field-note
title: "SOP 50 10 8.1, Appendix 15: 7(a) Changes of Ownership"
publisher: U.S. Small Business Administration
url: https://…
quote: "The exact words from the source that support the proposition."
proposition: "What we cite it for, in one sentence."
accessed: 2026-11-26
review_by: 2027-02-26       # volatile rules: 3 months; stable sources: 12 months
```

Check that a file doesn't already exist before you create one, and never edit a source someone else created except to fix a broken URL.

## Field notes

Practical knowledge from real deals goes in `data/field-notes/`, with the approved wording and its sha256. Only the person who approved the wording may change it; any edit breaks the hash and fails validation. Field notes render unattributed, as "From the field".

## Stage pages (`guide/NN-<stage>.md`)

Front matter `stage: <id>`, then: one paragraph on what this stage is and when you're in it, then one `## <topic title>` section per topic with two to four sentences, a link list of its leaf questions (`- [Question?](/q/<leaf-id>)`), and the skill for that topic (`Skill: \`<skill-name>\``). End with "Ask your agent", a prompt the reader can paste.
