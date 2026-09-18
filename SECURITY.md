# Security policy

This early project currently maintains the `main` branch. There is no promised response time or long-term support window.

Please do not disclose credentials, private user queries, or exploitable vulnerabilities in public issues. Use GitHub's private vulnerability reporting for this repository if available. If it is unavailable, open an issue asking for a private reporting channel without publishing exploit details or secrets.

Include the affected revision, impact, and minimal reproduction. Redact secrets from logs and screenshots.

## Operating the search backend

- Keep `TYPESAFE_API_KEY` server-side. Never use a `VITE_` prefix.
- Set an explicit API budget and preserve its ledger across restarts.
- Use HTTPS and a correctly configured reverse proxy for public hosting.
- The current application uses per-process rate limits and local budget storage. Multiple hosts require shared enforcement.
- Search text is transmitted to TypeSafe for ranking. Do not submit confidential information you do not intend to share with that provider.
- Vendored previews execute third-party UI code in same-origin frames. They are isolated for layout and styling, not a security boundary for untrusted code. Only reviewed, provenance-verified imports belong in the application.

No provider key is required by CI, tests, or the frontend build. Dependency updates must pass the same catalog, source-integrity, and browser checks as other changes.
