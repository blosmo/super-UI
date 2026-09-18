# Contributing

Thanks for helping make component discovery clearer and more useful.

## Start locally

Use Node.js 22.12+ and `npm ci`, then `npm run dev`. You can work on the catalog without API keys. The optional semantic backend and Jev setup are documented in the README. Never commit `.env` files, provider keys, model caches, or user queries.

Keep pull requests focused. Explain the user problem, what changes, and how you verified it. Include before/after screenshots for interface changes. Use the existing shadcn host controls and neutral dark/light tokens; preserve keyboard behavior, focus visibility, mobile layouts, and reduced-motion support.

## Required checks

```sh
npm run check
```

Tests use a temporary local HTTP server but make no paid model calls. Validate the actual browser flow for interface changes, including both themes and a narrow viewport. For search changes, document relevance tradeoffs; do not silently replace uncertain model assessments with facts. Live evaluation costs money and requires your own explicitly configured key and budget.

## Imported components

Do not replace original components with lookalikes or edit vendor files casually.

1. Confirm redistribution permission and record the exact upstream source and license.
2. Preserve attribution and original bytes/checksums in the appropriate `src/data/integrations/` manifest.
3. Record any import-path or compatibility change and update its output checksum deliberately.
4. Add a preview adapter and explicit catalog/source association.
5. Verify the original demo in a browser, then create its thumbnail.
6. Refresh source-based assessments when evidence changes. Builds reject stale evidence fingerprints.

ReUI and Transitions.dev remain excluded pending approval. Do not remove an exclusion without documented permission and a maintainer-reviewed change. Licenses and notices must accompany all new imports.

The `research/` directory is a local workspace for manual ingestion snapshots and is ignored. Existing ingestion scripts may require freshly collected snapshots; they are not part of the normal build or an unattended synchronization service. Use checked-in catalog data for ordinary development.

## Pull requests

Run relevant tests and the production build. Mention any unverified behavior or deployment limitations. Do not include generated `dist/`, local caches, screenshots of private information, or unrelated reformatting.

Contributions to project-owned code are provided under this repository’s AGPL-3.0 license. Upstream source retains its own applicable license. Only submit work you have the right to contribute.
