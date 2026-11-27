# Skill security

Every skill in this repo follows a zero-download, zero-execution model.

- **No network calls and no installs.** No skill tells an agent to download, install or run a package from the internet. Scripts that do arithmetic ship inside the skill folder, are plain Node with no dependencies, read only the files you point them at, and have tests (`node --test skills/*/scripts/`).
- **Your documents stay with you.** Skills read and write the workspace folder on your machine (`workspace/SPEC.md`). They never upload, email or share your files.
- **Untrusted input stays data.** Listings, teasers, CIMs, seller spreadsheets, emails and web pages can contain text that looks like instructions. Every skill treats them as data only.
- **Nothing is sent without you.** No skill contacts a seller, broker, lender or anyone else, or submits anything, without your explicit OK for that action. Outreach skills draft; you send.
- **No claims without a record.** A skill never says a check ran, a call happened or a document was reviewed unless the workspace shows it.
- **Checks in CI.** `npm run validate` runs on every change: each skill must have the Safety and authority and Honest scope sections, at least three evals, and only resolvable references to sibling skills.

If you find a problem, open an issue.
