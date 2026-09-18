# Jev component discovery

Jev now evaluates every visible component from its original source. The catalog uses these assessments for use-case matching, visual-character and motion filters, setup-effort filters, and explanatory details. Verified source facts such as licenses and dependencies stay separate. Hidden libraries remain excluded.

## How the documentation informed this implementation

The complete [documentation index](https://docs.typesafe.ai/llms.txt) was fetched first. The relevant API, primitives, state, confidence, model, patterns, limitations and classification/search cookbooks were then reviewed.

| Jev guidance | Application here |
| --- | --- |
| [State](https://docs.typesafe.ai/concepts/state): text only, focused structured context | One component's public metadata and up to three relevant original source files; no image input or private application source |
| [Choice](https://docs.typesafe.ai/primitives/choice): discrete alternatives with explicit boundaries | Purpose, visual character, motion, density, interaction, setup; every question includes `unknown` |
| [Score](https://docs.typesafe.ai/primitives/score): ordered descriptive situations, not arbitrary numerical ratings | Eight independent use-case judgments: irrelevant, supporting, direct fit. Generic controls are explicitly supporting unless domain-specific |
| [Noul](https://docs.typesafe.ai/primitives/noul): yes/no probability, no separate confidence field | Primarily decorative and caller-provided content properties; ambiguous probabilities withheld |
| [Fan-out](https://docs.typesafe.ai/patterns/fan-out) and [parallel questions](https://docs.typesafe.ai/cookbooks/parallel_questions) | All 16 questions share one component state in one request. Do not repeat the source once per question |
| [Confidence](https://docs.typesafe.ai/confidence) | Choice/Score results below 0.70 are omitted from filters and labeled unclear in details. Confidence is not a measured accuracy or quality score |
| [Composite scoring](https://docs.typesafe.ai/patterns/composite-scoring) | Code normalizes fit and sorts it. User-selected constraints determine matches; no opaque global quality score |
| [Re-ranking](https://docs.typesafe.ai/cookbooks/rerank_typesafe) | Existing keyword/category/library filtering remains deterministic; cached goal-specific fit orders the matching candidates |
| [Hierarchical classification](https://docs.typesafe.ai/cookbooks/hierarchical_classification) | Avoid premature commitment to a fine-grained taxonomy; keep the modest existing category system and independent traits instead of introducing a deep hierarchy |
| [Model versions](https://docs.typesafe.ai/models) | Pin `jev-1.13.0`, record the returned version, invalidate caches when model/rubric/source changes |
| [Known limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13) | Do not ask Jev to count dependencies, do arithmetic, compare dates, judge colors from hex codes, or invent prose. Keep source untrusted, questions literal, and criteria distinct |

Question IDs are only response keys, not inference instructions. Every question therefore states its meaning in its instructions and criteria. Score descriptions stand alone because levels are evaluated independently. `unknown` is only offered to Choice questions, never requested from a Score or Noul.

## Calibration and limitations

Two live 12-component pilot passes were run across the ten visible libraries. The first exposed missing purpose categories for actions and overlays, and overly broad direct-fit scoring for generic controls. The revised rubric added those categories and explicitly treats generic primitives as supporting fits.

Representative checks after the full run: textarea → input, breadcrumb → navigation, progress → feedback, alert dialog → overlay. The chat app's purpose remained uncertain and was withheld rather than forced. This is a smoke/calibration exercise, not a representative accuracy benchmark; the confidence threshold is provisional.

All 685 entries have responses, but not every dimension has a confident answer. In the current run, 4,015 of 10,960 dimension results are withheld. “Not clear from the source” is intentional. Source-based visual character is an inference, not visual inspection of screenshots. Accessibility, actual mobile usability, runtime performance, bundle size, and integration reliability require separate testing.

## Running it

The API key belongs in `.env.local` (or `.env`) as `TYPESAFE_API_KEY`. Both are ignored; never use a `VITE_` prefix. No key is shipped to visitors. Problem-based search uses a separate server-side endpoint for live ranking.

```sh
# No API calls: inspect scope and conservative cost reservation.
npm run classify

# Bounded calibration run. Omit --run for a dry run.
npm run classify -- --pilot --run --max-usd 0.05

# Explicit bounded full run; unchanged results are reused.
npm run classify -- --run --publish --max-usd 1.50

# Re-publish existing matching cache entries without API calls.
npm run classify -- --publish

npm test
npm run build
```

One state is sent per component, with 16 questions. Four requests run concurrently. Requests time out after 45 seconds; 429/529 responses back off and retry at most twice. Every attempt reserves budget before sending. A conservative reservation uses twice the serialized UTF-8 byte length plus overhead as the token allowance; actual cost is estimated from reported input tokens. API pricing changes require updating the script's checked price before running.

Only vendored public files whose checksums match recorded imports can be sent. The publisher rejects malformed answers, invalid probabilities, wrong model versions, unknown options, inconsistent score expectations, and mismatched provenance. A failed item does not create a fabricated assessment. Partial coverage is explicitly counted in the UI and the run exits unsuccessfully if any request fails.

The build validates the committed assessments against current source/rubric fingerprints and will fail on stale entries. A clean checkout can use committed assessments without having the ignored raw cache or an API key. Raw responses stay in `research/jev-cache`; public compact results are in `src/data/assessments.json` and `/assessments.json`.

## Recorded run

- Current model: `jev-1.13.0`; rubric version 2.
- Current catalog: 685 assessed entries, 10 visible libraries, 16 dimensions each.
- Full run after calibration: 673 new components plus 12 cached results; zero API failures.
- Full-run reported input: 3,468,619 tokens.
- Both pilots plus full run: 3,607,705 reported input tokens; estimated $0.15152361 at the checked $0.042 per million input tokens. Output tokens are free under the documented pricing. This is an estimate, not an invoice.

## Product behavior

Open “Find the right fit” and choose a use case, style, motion, or setup preference. A selected use case enables “Best fit for use case.” Unknown values do not match a requested constraint. The same filters round-trip through details links, sharing, and comparison.

The details page exposes the six trait dimensions, suitable use cases, inferred content flexibility, and an expandable explanation with model confidence and original-source links. These are model assessments, not certifications or community ratings.
