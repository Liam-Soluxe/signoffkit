# SignoffKit product specification

## Problem

Small agencies and freelancers often run launch QA in spreadsheets, chat threads and screenshots. Client sign-off then becomes an ambiguous email rather than a versioned evidence record. Existing proofing suites can be larger and more expensive than a small team needs.

## Target buyer

Small marketing, design and web agencies, freelancers and fractional operators delivering websites, campaigns and creative work.

## Core job

Turn a launch checklist, reviewer notes and evidence files into one reviewable, portable sign-off pack without requiring an account or uploading client material to a third party.

## Minimum useful product

1. Create a pack with project name, client label, version, reviewer and review date.
2. Start from Website Launch, Campaign Launch, Creative Delivery or Scope Change templates. Scope Change covers the original scope, requested change, added fee, revised delivery date and explicit review checks while avoiding e-signature or legal-contract claims.
3. Add, edit, remove and reorder checks.
4. Mark each check Pass, Flag or Not applicable and add notes.
5. Attach screenshots or documents locally and calculate SHA-256 hashes in the browser.
6. Show readiness score, blockers and completion summary.
7. Persist drafts locally without a backend.
8. Export and import a versioned JSON pack.
9. Export a self-contained HTML evidence report with safe escaped text, embedded evidence, hashes and print styling.
10. Offer a synthetic demo mode containing no real client data.

## Safety and privacy

- Browser-local processing only.
- No accounts, telemetry, cookies, analytics, external APIs or file uploads.
- Do not claim legal validity, compliance certification or cryptographic timestamping.
- Hashes prove file-byte consistency only.
- Warn users not to include secrets, credentials or regulated personal data.
- Escape all user-controlled text in generated HTML.

## Acceptance criteria

- A new visitor can load the synthetic demo, change a status, attach a sample image, export JSON, import it again and generate a self-contained HTML pack.
- Core state, scoring, validation, hashing and export logic have automated tests written test-first.
- Production build succeeds with no high-severity dependency vulnerabilities.
- Responsive and keyboard-usable at mobile and desktop widths.
- Public deployment loads over HTTPS and completes the demo-to-export path.

## Commercial hypothesis

Free local-first utility creates distribution and validates demand. A later paid edition could add encrypted hosted packs, branded portals, approval links, reminders and team templates only after usage evidence. No paid features are claimed in this launch.

## Operating model

The public beta is static and requires no database, support integration or ongoing founder action. Atlas can monitor availability and aggregate public product signals without collecting user content.
