# Buy a business

**A guide to buying a small business, plus agent skills.**

[![skills.sh](https://www.skills.sh/b/smallbizacqs/buy-a-business)](https://www.skills.sh/smallbizacqs/buy-a-business) [![validate](https://github.com/smallbizacqs/buy-a-business/actions/workflows/validate.yml/badge.svg)](https://github.com/smallbizacqs/buy-a-business/actions/workflows/validate.yml)

You want to buy a small business, or you're wondering whether you should. The advice is scattered across podcasts, broker sites and forums, a lot of it is selling something, and the rules (SBA loans above all) keep changing. This repo puts the whole journey in one place, in a form your AI agent can read and act on: ten stages, about 250 specific questions, answers with dated primary sources, short clips from people who've done it, and a skill for each job along the way.

Read it as a person at [smallbizacqs.com](https://smallbizacqs.com), or hand it to your agent.

```bash
npx skills add smallbizacqs/buy-a-business
```

Then ask your agent: *"I'm thinking about buying a small business. Where do I start?"* or *"Grill my deal."*

## Install

| Agent | How |
|---|---|
| Any agent that supports Agent Skills | `npx skills add smallbizacqs/buy-a-business` |
| Claude Code | `/plugin marketplace add smallbizacqs/buy-a-business`, then `/plugin install buy-a-business@buy-a-business` for everything, or one stage's pack (e.g. `stage-7-diligence-and-the-loan@buy-a-business`) |
| Gemini CLI | `gemini extensions install https://github.com/smallbizacqs/buy-a-business` |
| claude.ai (no terminal) | download the ZIP for each skill you want from [Releases](https://github.com/smallbizacqs/buy-a-business/releases/latest) and upload it under Settings → Capabilities → Skills |
| Anything else | point it at [`AGENTS.md`](AGENTS.md) or [smallbizacqs.com/llms.txt](https://smallbizacqs.com/llms.txt) |

## The ten stages

| # | Stage | Guide |
|---|---|---|
<!-- STAGES -->

## Skills

Two entry points you call by name, and one specialist skill per topic that your agent picks up when the situation fits. Skills share a workspace folder on your machine ([`workspace/SPEC.md`](workspace/SPEC.md)), so the buy box feeds the evaluation, the evaluation feeds diligence, and nothing is lost between sessions.

<!-- CATALOG -->

## How it works

- **Questions, not chapters.** Each stage is broken into topics and then into single questions ("Does the SBA require the seller note to be on standby?"). Each question has a permanent id in [`data/taxonomy.yaml`](data/taxonomy.yaml), and its answer lives in [`data/leaves/`](data/leaves/).
- **Facts have sources; opinions have names.** Rules and numbers cite primary sources in [`data/sources/`](data/sources/) with a quote and a review date. What practitioners say is shown as their view, with their clip and a link to their full video ([`data/clips/`](data/clips/)). Where they disagree, both sides are shown.
- **Checked on every change.** `npm run validate` enforces the structure, the citation rules and the skill format; `npm test` tests the validator itself.

## What this is not

Nothing here is legal, tax or financial advice. The skills organize, calculate and flag; your lawyer, your CPA and your lender make the calls that are theirs to make. There are no ads, no affiliate links and no referral fees from brokers, lenders or anyone mentioned here. Skills make no network calls and install nothing ([`docs/skill-security.md`](docs/skill-security.md)).

## Contributing

Corrections and new questions are welcome. Read [`docs/AUTHORING.md`](docs/AUTHORING.md) and [`docs/SKILL-AUTHORING.md`](docs/SKILL-AUTHORING.md), run `npm run validate && npm test`, and open a pull request.

Text and data: CC BY 4.0. Scripts: MIT. Creators' videos and quoted sources belong to their owners. See [`LICENSE`](LICENSE).
