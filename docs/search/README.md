# Problem-based component search

Describe the task in the main search field and submit with Enter or Find. Search text and public component source excerpts are sent to TypeSafe for ranking; the field explains this. Example prompts, editable existing filters, and optional navigation clarification buttons provide refinement without a chat transcript. Cards show Strong match or Possible match and evidence-based judgment templates. No percentage is presented as accuracy or component quality.

## Architecture

1. A pinned local `Xenova/all-MiniLM-L6-v2` embedding model matches meaning. BM25-style keyword scores preserve names and technical terms. Reciprocal-rank fusion produces a shortlist of 30 candidates after explicit library/category/trait/saved filters. The corpus includes public catalog descriptions and existing source assessments, with a small editorial glossary for conventional patterns such as accordion and combobox. It is not an image-based search.
2. Jev `jev-1.13.0` evaluates each shortlisted component separately against the problem: functional fit (Score), requested interaction (Noul), and explicit preferences (Noul). Original source provenance is verified before sending bounded excerpts. The query and source remain untrusted evidence, not rubric instructions.
3. Application code combines those independent answers (75% functional, 15% interaction, 10% preferences). Exact component names receive deterministic priority. Strong match requires sufficiently clear support on all dimensions. A possible match is not a promise of fitness, accessibility, mobile support, or tested performance.
4. Query, filters, model, rubric, and corpus fingerprint determine server cache keys. Up to 200 successful results are held in memory for one hour; the browser keeps up to 30 successful searches for the current page session. Query text is not written to application logs or disk by this implementation. Shared URLs include the submitted query.

## Run

```sh
npm install
npm run search:index    # First install downloads the pinned public model; builds a local vector index.
npm run search:server   # API + built app on 127.0.0.1:4174
npm run dev             # Separate terminal; /api/search proxies to port 4174
```

For the built application, use `npm run build` then `npm start`. Vite preview also proxies search when the backend is running. `TYPESAFE_API_KEY` belongs in `.env.local`, `.env`, or the server environment, never a VITE variable. The semantic model runs locally, so no embedding-provider key is needed. Model weights and vectors are cached under ignored `.cache/search/`. Model revision is pinned in `server/retrieval.mjs`; the model license is Apache-2.0. Transformers.js is pinned to 4.3.0 in the lockfile.

The Node server binds to loopback by default. `PORT` and `HOST` are explicit deployment settings. This is a local implementation, not a public deployment. Run one API process per deployment; the local budget ledger is locked and atomic even when a local evaluation process runs alongside it. Multiple hosts would need shared rate limiting and budget storage. Preserve `.cache/search/budget.json` across restarts to preserve the daily cap. A stale `.lock` after a forced process kill fails closed; remove it only after confirming no server/evaluation process is updating it.

## API and behavior

`POST /api/search`, JSON body:

```json
{"query":"Let people approve an AI action","filters":{"library":"beui"}}
```

Optional filters: `library`, `category`, `useCase`, `style`, `motion`, `setup`, `savedIds` (visible component IDs). Hidden libraries cannot be requested or returned. Query length: 1–600 characters; body: 64 KiB maximum. Response contains ordered `results` with `id`, `label`, `reasons`, plus `mode` (`jev` or `semantic`). Successful Jev responses include model, duration, and estimated input-token cost. These API scores are ranking judgments, not probabilities that a component is universally best.

Requests have a 25-second Jev deadline, up to six candidate evaluations at a time, two active HTTP searches, and 15 requests per minute per socket IP. Cross-origin browser requests are rejected. Rate limits return 429 with Retry-After. No automatic retry multiplies provider spend. Default daily budget: $1; configurable with `SEARCH_DAILY_BUDGET_USD`. Every call reserves a conservative token allowance before transmission, then settles against validated usage. Unknown or failed calls retain their reservation. The checked input price is $0.042 per million tokens; verify provider pricing before changing deployment limits.

If Jev is missing/unavailable, a visibly labeled semantic fallback is returned. Candidate failures do not silently disappear or get mixed with incomparable scores. If the backend is unavailable, the browser shows keyword results and an explicit retry action. In-flight browser searches are aborted on query/filter changes; stale responses cannot overwrite current results. Reduced-motion disables the search spinner.

## Evaluation

`node scripts/evaluate-search.mjs` makes real API calls using the configured key and daily budget. It compares 30 hand-authored tasks against the previous search and records `docs/search/evaluation.json`. The final run found an expected relevant component in the first five for 29/30 cases, versus 1/30 previously. All 30 shortlists contained an expected component. Median: 1,714 ms; p95: 2,473 ms. Reported input cost: $0.073679844 for this run. All 30 used Jev, not fallback.

These are development fixtures, not held-out evaluation or exhaustive relevance judgments. The glossary and exact-name ordering were improved using failures from an initial run. The remaining fixture miss is AI thinking feedback: the results include Agent Loading States, but the expected-ID list names different thinking indicators. Do not interpret this as 96.7% general accuracy, or expand expected labels after seeing the result to claim 100%.

`npm test` covers ranking validation, uncertainty, hidden/explicit/saved filters, API validation and failures, cross-origin requests, and concurrent budget accounting. Browser verification covers submitted search, fallback/retry, ranked result cards, and details/back navigation. Host controls use the included shadcn/ui source, with keyboard and responsive behavior verified in the browser.

## References

- https://docs.typesafe.ai/cookbooks/rerank_typesafe
- https://docs.typesafe.ai/patterns/composite-scoring
- https://docs.typesafe.ai/primitives/score
- https://docs.typesafe.ai/primitives/noul
- https://huggingface.co/docs/transformers.js/index
- https://huggingface.co/Xenova/all-MiniLM-L6-v2
