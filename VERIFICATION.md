# Verification record

Verified on 29 August 2026 at 00:22 CEST on the Atlas Mac mini.

## Automated checks

```text
npm test
6 test files passed
23 tests passed

npm run lint
0 errors

npm run typecheck
0 errors

VITE_BASE_PATH=/signoffkit/ npm run build
22 modules transformed
Production bundle built successfully
JavaScript: 215.72 kB, 68.73 kB gzip
CSS: 9.62 kB, 2.80 kB gzip

npm run test:e2e
2 Playwright tests passed in Chromium

npm audit --audit-level=high
0 vulnerabilities
```

## Reproducibility

`npm ci --ignore-scripts` completed from the committed lockfile before the final checks. Direct dependency versions are exact rather than `latest` ranges.

## Security checks

- No hard-coded API keys, passwords, secrets or tokens were found in visible project files.
- No `eval`, `exec`, `innerHTML`, `dangerouslySetInnerHTML`, `document.write` or application `fetch` call is present.
- Imported packs have a 10 MB limit, reject unknown properties, enforce the published schema limits and reject duplicate IDs.
- Attached evidence files have a 5 MB per-file limit.
- The app measures UTF-8 bytes and rejects any change or export that would exceed the 10 MB re-import limit.
- The import boundary uses the same UTF-8 byte measurement, and every pack retains at least one check.
- Imported evidence hashes are visibly marked unverified rather than trusted as locally computed values.
- Generated HTML escapes user text, allowlists embedded media data URLs and includes a restrictive Content Security Policy.
- Browser storage quota errors fail safely and show an actionable notice.
- The dependency audit reported zero known vulnerabilities.

## Browser acceptance

Playwright verified:

1. The synthetic demo loads.
2. Required metadata appears.
3. A blocker appears in the readiness summary.
4. A local text file is attached and receives the expected SHA-256 digest.
5. A check status is changed and preserved in JSON export.
6. Exported JSON is imported again and imported evidence is marked unverified.
7. The self-contained HTML report contains the project, integrity warning and restrictive CSP.
8. The Scope Change template exposes original scope, added fee and revised delivery date checks.
9. The legal limitation remains visible.

A separate Chromium visual run captured desktop and 390 px mobile states. Neither viewport had horizontal overflow. No clipping, overlap or broken layout was observed.

## Remaining product limitation

This is a free, browser-local validation beta. It has no hosted client approval link, user account, payment flow or server-side timestamp. Those remain gated on evidence of repeated real use and willingness to pay.

## Independent review

The final independent blocking review passed with no security concerns, logic errors or suggestions after verifying the UTF-8 import limit and minimum-one-check invariants. Its focused regression run passed 13 of 13 tests and modified no files.
