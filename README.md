# Super UI

Find the right React component for the problem you’re solving.

Super UI brings **685 original components from 10 independent libraries** into one searchable catalog. Browse thumbnails, describe what you need, compare alternatives, and open full-size interactive previews with original source and attribution.

[Getting started](#getting-started) · [Contributing](CONTRIBUTING.md) · [Search architecture](docs/search/README.md) · [Licenses](THIRD_PARTY_NOTICES.md)

## What you can do

- **Search by problem.** Describe a task such as “let people approve an AI action.” Local semantic matching finds candidates; Jev ranks their fit.
- **Browse and refine.** Filter by purpose, library, use case, style, motion, and setup effort.
- **Try the originals.** Each component has a details page with an isolated interactive preview, source, and license.
- **Compare and save.** Compare up to three components and keep a shortlist in your browser.
- **Share discoveries.** Share search, filter, component, and comparison URLs.
- **Use the API.** `/catalog.json`, `/assessments.json`, `/llms.txt`, and `POST /api/search` support agent workflows.

The app uses shadcn/ui controls, supports light and neutral dark themes, and respects reduced-motion preferences. Component screenshots are captured from the original demos. AI judgments are labeled separately from verified source facts.

## Getting started

Requires **Node.js 22.12 or newer** and npm. No account, database, or API key is needed to browse the catalog.

```sh
git clone https://github.com/blosmo/super-UI.git
cd super-UI
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173). Component-name search and browsing work without the search backend.

### Enable intelligent search

```sh
cp .env.example .env.local
# Optional: add your TypeSafe API key to .env.local to enable Jev ranking.
npm run search:index
npm run search:server
```

Keep the backend running in a second terminal alongside `npm run dev`. The first index build downloads a pinned public embedding model; later runs use the local cache. Without a TypeSafe key, the backend returns semantic matches. With a key, Jev ranks candidates against the submitted problem.

Search text and bounded public component source excerpts are sent to TypeSafe when ranking is enabled. Credentials stay on the server. The default daily API budget is **$1**, with request limits and explicit fallback states. The app does not write search text to application logs or disk, although shared search URLs contain the query. See [search setup, privacy, limits, and evaluation](docs/search/README.md).

### Build and serve

```sh
npm run build
npm start
```

Open [localhost:4174](http://localhost:4174). This serves the built app and search API together. `npm run preview` serves the built app on port 4173 and proxies search to the backend on 4174.

The server binds to loopback by default. Public hosting requires explicit `HOST`/`PORT` configuration, HTTPS, persistent budget storage, and an appropriate reverse proxy. The current budget and rate-limit design is intended for one API process per deployment. Nothing in this repository automatically deploys the app.

## Included libraries

| Library | Components | Original license |
| --- | ---: | --- |
| [Libraries.dev](https://libraries.dev) | 5 | MIT |
| [interior.dev](https://www.interior.dev) | 54 | MIT |
| [Rare UI](https://www.rareui.com) | 21 | MIT |
| [coss ui](https://coss.com/ui) | 55 | AGPL-3.0 |
| [shadcn/ui](https://ui.shadcn.com) | 59 | MIT |
| [Opensource UI](https://opensourceui.in) | 207 | MIT |
| [Beautiful UI](https://www.beautifului.dev) | 21 | MIT |
| [Fluid Functionalism](https://www.fluidfunctionalism.com) | 26 | MIT |
| [beUI](https://beui.dev) | 82 | MIT |
| [Amicro](https://amicro.vercel.app) | 155 | MIT |

Counts include variants and reflect the September 2026 import, not a claim of complete upstream coverage. **ReUI and Transitions.dev are excluded pending approval**, including their catalog entries and raw research snapshots. The exclusion list remains enforced in code.

## Development

```sh
npm test                 # Offline unit, catalog, provenance, and local HTTP tests
npm run build            # Verify source hashes and assessments, generate styles, build
npm run check:release    # Check tracked files for release hygiene
npm run check            # All required checks
```

Tests and builds do not require a TypeSafe key or download the semantic model. `npm run classify` is a dry run unless `--run` is supplied. `node scripts/evaluate-search.mjs` makes paid API requests and uses the configured daily budget.

| Directory | Purpose |
| --- | --- |
| `src/main.tsx`, `src/components/` | Catalog interface and shared host controls |
| `src/vendor/` | Imported upstream source, with recorded checksums |
| `src/data/` | Catalog, source provenance, and cached Jev assessments |
| `server/` | Semantic retrieval, Jev ranking, API, and budget accounting |
| `public/thumbnails/`, `public/licenses/` | Original demo captures and upstream licenses |
| `scripts/` | Validation, style generation, and manual ingestion utilities |
| `tests/` | Regression and integrity tests |

Each original demo runs through `preview.html` in an isolated iframe. The grid uses thumbnails rather than squeezing live components into small cards. `src/data/imports.json` records upstream URLs, original/output hashes, dependencies, and compatibility changes.

See [CONTRIBUTING.md](CONTRIBUTING.md) before changing imported source. Raw ingestion snapshots and local model caches are intentionally not distributed; normal development builds use checked-in source and catalog data.

## Limits and project status

This is an early project. Search recommendations are source-based estimates, not accessibility, performance, or quality certifications. Some assessment dimensions remain unknown. Saved components are device-local. Pages are client-rendered; search-engine-oriented hosting would benefit from server-rendered details pages.

In a 30-task development benchmark, the new search placed an expected relevant component in the top five for 29 tasks, compared with one for the previous word matcher. Median response time was 1.7 seconds. These fixtures informed tuning and are not a held-out accuracy benchmark. [Results and methodology](docs/search/README.md#evaluation).

## Contributing and security

Bug reports, component suggestions, accessibility fixes, and focused pull requests are welcome. Read the [contribution guide](CONTRIBUTING.md) and [security policy](SECURITY.md). Please keep discussions respectful and give original creators clear credit.

## License

Super UI is distributed under [GNU AGPL v3](LICENSE), matching the bundled coss components. Vendored components retain their original licenses and copyright notices; see [third-party notices](THIRD_PARTY_NOTICES.md) and `public/licenses/`. Brand names and logos identify their respective creators and do not imply endorsement or grant trademark rights.

If you modify and host this AGPL-covered application, retain the applicable notices and provide users access to the corresponding source under the license’s terms.
