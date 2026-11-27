# Funnel math and timeline

## The funnel

Each channel moves through the same stages:

```
contacts → conversations → CIMs (or full financials) → LOIs → closes
```

- **Contact**: a listing inquiry, a letter, an email, a call, a referral introduction.
- **Conversation**: a real exchange with an owner or broker about this business.
- **CIM**: a confidential information memorandum or a real financial package, usually after an NDA.
- **LOI**: a letter of intent the user submitted (or, if they prefer, one that was signed; pick one definition and keep it).
- **Close**: the deal closed.

Rates differ by channel, industry, deal size, the buyer's credibility and how they count each stage. That is why this skill has no built-in rates.

## Getting assumptions from the user

Ask, per channel and per stage: "Out of 100 at this stage, how many do you expect to reach the next?" Then:

1. If the user has any history (their own pipeline, a prior search), use it.
2. If they cite a creator, course or article, record the source in the Basis column as "user cites X", not as a fact. Practitioner views live in `data/clips/` and the leaf answers; present them as views.
3. Otherwise, choose deliberately cautious placeholders together and mark them "placeholder, replace by <date>".

## Replacing assumptions with actuals

Every review gate, count from the workspace:

| Stage | Count from |
|---|---|
| Contacts | `targets.csv` rows with status `sent-by-user` or later, plus listing inquiries noted in `pipeline.csv` |
| Conversations | `targets.csv` `conversation` + `pipeline.csv` rows past `sourced` |
| CIMs | `pipeline.csv` rows at `nda` or later with a CIM in the deal folder |
| LOIs | `pipeline.csv` rows at `loi-sent` or later |
| Closes | `closed` |

Small numbers are noisy: three conversations out of 100 letters tells you little yet. Keep the placeholder alongside the actual until counts are meaningful, and say so.

## Timeline pieces

Total time ≈ time to generate enough LOIs for one close + time from LOI to close.

- **Outreach time** comes from the script: `closes_wanted ÷ expected closes per week`.
- **Lag after LOI** (diligence, financing, legal documents) is the user's assumption; ask their lender and advisors. Record the basis.
- Add ramp-up time at the start (building lists, learning the industry, broker relationships) as a separate line if the user expects slow early weeks.

## Worked example (illustrative numbers, not benchmarks)

A user assumes for letters: 3% of letters lead to a conversation, 40% of conversations to a CIM or financials, 25% of those to an LOI, 40% of LOIs to a close. Then per close: 1 ÷ 0.4 = 2.5 LOIs, 2.5 ÷ 0.25 = 10 CIMs, 10 ÷ 0.4 = 25 conversations, 25 ÷ 0.03 ≈ 833 letters. At 40 letters a week, that's about 21 weeks of outreach, plus the user's assumed LOI-to-close lag. Halving the first rate doubles the letters needed. These are the user's example inputs; the point is the method.

## Sensitivity

Halve each rate in turn. The stage whose change moves total time most is the one to measure carefully and improve (better targeting for contact→conversation; better owner conversations for conversation→CIM; faster, clearer screening for CIM→LOI; more realistic offers and financing preparation for LOI→close).
