# SignoffKit

SignoffKit creates portable launch QA and scope-change evidence packs entirely in the browser.

**Public beta:** https://liam-soluxe.github.io/signoffkit/

## What it does

- Starts from Website Launch, Campaign Launch, Creative Delivery or Scope Change templates.
- Tracks each check as pending, pass, flag or not applicable.
- Adds notes and local evidence files.
- Calculates a SHA-256 digest from the exact evidence bytes attached in the current browser.
- Marks evidence hashes from imported JSON as unverified rather than trusting the file's claim.
- Saves the current draft to browser localStorage.
- Imports and exports a versioned JSON pack.
- Exports a self-contained HTML report for sharing or printing.
- Includes a fictional synthetic demo.

## Privacy model

There is no backend, account, analytics, telemetry, advertising or external API. Files are processed in the browser and are not uploaded by SignoffKit.

Browser localStorage is not encrypted. Do not add secrets, credentials or regulated personal data. The static host may retain ordinary request logs under its own policy.

## Important boundaries

A SignoffKit pack is an evidence record. It is not an electronic signature, legal approval, compliance certificate or cryptographic timestamp. Locally computed SHA-256 values help compare file bytes only. Imported values are labelled unverified.

## Run locally

Requirements:

- Node.js 22.13 or later, or Node.js 24 or later
- npm

```bash
npm ci
npm run dev
```

Open the URL printed by Vite.

## Verify

```bash
npm test
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --audit-level=high
```

## Production build

```bash
VITE_BASE_PATH=/signoffkit/ npm run build
```

The static output is written to `dist/`.

## Project structure

- `src/domain/`: pack state, validation, hashing, storage and report generation
- `src/App.tsx`: browser workspace
- `e2e/`: Playwright acceptance tests
- `config/schema.json`: versioned pack schema
- `PRODUCT-SPEC.md`: scope and acceptance criteria
- `THREAT-MODEL.md`: trust boundaries and controls
- `BUYER-ONE-PAGER.md`: commercial description

## Demo mode

Choose **Load synthetic demo** in the app. The demo uses fictional names and deliberately includes one blocker so the readiness workflow is visible.

## Feedback

Use [GitHub Issues](https://github.com/Liam-Soluxe/signoffkit/issues) for workflow feedback and bugs. Report security concerns privately through [GitHub Security Advisories](https://github.com/Liam-Soluxe/signoffkit/security/advisories/new).

## Licence

MIT. See `LICENSE`.
