# Changelog

All notable changes to SignoffKit are recorded here.

## 0.1.0 - 2026-08-29

### Added

- Browser-local Website Launch, Campaign Launch, Creative Delivery and Scope Change templates
- Pass, flag, pending and not-applicable readiness scoring
- Local evidence attachment with SHA-256 file digests
- Versioned JSON import and export
- Self-contained HTML evidence reports
- Local draft persistence with quota-safe failure handling
- Synthetic demo mode
- Plain-language privacy and terms views
- Responsive desktop and mobile interface
- Unit, acceptance, lint, type and dependency checks
- GitHub Actions CI and GitHub Pages deployment

### Security

- Strict imported evidence-object validation
- Imported evidence integrity claims are marked unverified
- Runtime validation enforces schema limits, unique IDs and known properties
- 5 MB per-file and 10 MB imported-pack limits
- Aggregate UTF-8 export and import guards keep every accepted pack re-importable
- Pack state always retains at least one check
- Escaped report text and allowlisted embedded media types
- Restrictive Content Security Policy in the app and exported reports
- No backend, analytics, telemetry or external API
- Least-privilege, commit-pinned GitHub Actions with full release checks before deployment
