import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import {
  prepareIndex,
  corpusVersion,
  embeddingModel,
  embeddingRevision,
} from "../server/retrieval.mjs";
const vectors = await prepareIndex();
const target = new URL("../server/search-assets/", import.meta.url);
mkdirSync(target, { recursive: true });
writeFileSync(
  new URL(`${corpusVersion}.json`, target),
  JSON.stringify(vectors),
);
// Ship only this pinned quantized model, never the cache's budget ledger or keys.
const model = new URL(
  `../.cache/search/models/${embeddingModel}/${embeddingRevision}/`,
  import.meta.url,
);
cpSync(model, new URL("model/", target), { recursive: true });
console.log(
  `Bundled ${vectors.length} component vectors and pinned ${embeddingModel} model.`,
);
