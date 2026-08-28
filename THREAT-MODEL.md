# SignoffKit threat model

## Scope

SignoffKit is a static, browser-local utility. It has no backend, account system, telemetry, payment flow or external API. GitHub Pages serves the application shell. Pack content and evidence remain in browser storage until the user exports or clears them.

## Trust boundaries

- Treat imported JSON and attached files as untrusted data.
- Treat all project, client, reviewer, checklist and note text as untrusted data.
- Generated HTML is a portable file that may be opened outside the application.
- GitHub Pages and the user's browser are external runtime dependencies.

## Controls

- Escape all user-controlled text before adding it to generated HTML.
- Embed only explicit allowlisted data URL media types.
- Add a restrictive Content Security Policy to exported reports.
- Validate the full evidence object shape during JSON import.
- Limit imported pack and attached evidence sizes to avoid browser and localStorage exhaustion.
- Use locally computed SHA-256 only to help compare file bytes. Never call it a signature or timestamp. Mark imported hash claims unverified.
- Never upload files, call an analytics endpoint or include third-party scripts.
- Keep dependency versions reproducible through exact package versions and a committed lockfile.

## Accepted limitations

- Browser localStorage is not encrypted and is available to anyone with access to the same browser profile.
- A user can alter an exported JSON or HTML file. Hashes help compare evidence bytes but do not prove identity, approval time or legal consent.
- The static host may retain ordinary request logs under its own policy.
- Users remain responsible for whether they are authorised to process and share the material they add.
