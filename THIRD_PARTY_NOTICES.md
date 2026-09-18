# Third-party notices

Super UI combines project-owned discovery code with original component source. The repository is distributed under AGPL-3.0; this does not replace the licenses or copyrights attached to individual upstream components. Keep the relevant license when reusing a component.

| Source | Included material | License notice |
| --- | --- | --- |
| [Libraries.dev](https://libraries.dev) | Original examples and npm-backed previews | [MIT](public/licenses/libraries.txt) |
| [interior.dev](https://www.interior.dev) | Original components and demos | [MIT](public/licenses/interior.txt) |
| [Rare UI](https://www.rareui.com) | Original components and demos | [MIT](public/licenses/rare.txt) |
| [coss ui](https://coss.com/ui) | Original components and examples | [AGPL-3.0](public/licenses/coss.txt) |
| [shadcn/ui](https://ui.shadcn.com) | Original components, examples, and host interface controls | [MIT](public/licenses/shadcn.txt) |
| [Opensource UI](https://opensourceui.in) | Original component source | [MIT](public/licenses/opensource.txt) |
| [Beautiful UI](https://www.beautifului.dev) | Original distributed components and styles | [MIT](public/licenses/beautiful.txt) |
| [Fluid Functionalism](https://www.fluidfunctionalism.com) | Original components and examples | [MIT](public/licenses/fluid.txt) |
| [beUI](https://beui.dev) | Original components and previews | [MIT](public/licenses/beui.txt) |
| [Amicro](https://amicro.vercel.app) | Original component source and demo adapters | [MIT](public/licenses/amicro.txt) |

`src/data/imports.json` and `src/data/integrations/` record original source URLs, checksums, dependencies, and modifications. Original/output hashes are verified during builds. Import paths and compatibility changes are documented there. Beautiful UI's SidebarNav substitutes free Lucide equivalents for twelve glyphs from a paid icon dependency; the original component structure is retained.

`public/thumbnails/` contains screenshots of the included demos. `src/data/thumbnail-manifest.json` records their provenance. Brand logos/favicons are used for source identification; `src/data/library-logos.json` records official asset URLs. All names and marks belong to their owners. Inclusion does not imply endorsement, and this project's license grants no additional trademark rights.

The optional local embedding model is [Xenova/all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2), licensed Apache-2.0. It is downloaded separately at the pinned revision recorded in `server/retrieval.mjs`; its weights are not distributed in this repository. npm dependencies retain their own package licenses and are recorded in `package-lock.json`.

ReUI and Transitions.dev are not included in the published catalog or source distribution pending approval. Local research snapshots are excluded from Git.
