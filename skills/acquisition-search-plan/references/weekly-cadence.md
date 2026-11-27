# Weekly cadence

A search mostly fails from inconsistency, not from a bad week. Pick blocks the user can keep for months, and adjust hours to full-time or part-time.

## Template week (adjust to the user's hours)

| Block | What happens | Workspace file |
|---|---|---|
| Sourcing (listed) | Review new listings from saved searches against the buy box; record matches | `pipeline.csv`, `deals/<slug>/listing.md` (`find-businesses-for-sale`) |
| Sourcing (direct) | Add the weekly batch of new targets; draft letters/emails; user sends | `outreach/targets.csv`, `outreach/drafts/` (`off-market-deal-sourcing`) |
| Follow-ups | Everything with `next_touch` or `next_date` this week | `targets.csv`, `pipeline.csv` |
| Broker relationships | Check in with a few brokers; respond fast to new CIMs | `business-broker-relations` |
| Owner conversations | Calls and meetings; notes the same day | `deals/<slug>/notes.md` (`business-owner-outreach`) |
| Screening | Read CIMs, decide pass or dig in within days, not weeks | `screen-business-cim` |
| Referral network | One or two touches with CPAs, attorneys, bankers | `outreach/referral-sources.csv` |
| Weekly review (fixed time) | Count the week's numbers; update actuals; pick next week's focus | `search-plan.md` actuals log |

## The weekly review (about 30 minutes)

1. Count contacts, conversations, CIMs, LOIs this week and cumulatively.
2. Compare with the plan. Which stage is behind?
3. Clean the pipeline: every row has a `next_step` and `next_date`, or is marked `passed` with a reason.
4. Check runway against the review checkpoint.
5. Write one line in the actuals log and, if anything changed, in `decisions.md`.

## Signs the cadence needs changing

- Many contacts, few conversations: targeting or message (revisit drafts and list quality).
- Conversations but no CIMs or financials: owner trust or fit (see `business-owner-outreach`).
- CIMs but no LOIs: buy box too loose, or screening too slow or too strict.
- LOIs but no closes: pricing, financing readiness or diligence surprises; `grill-my-deal` before the next LOI.
