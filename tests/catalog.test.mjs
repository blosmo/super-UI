import { createHash } from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { searchCatalog, readSaved } from "../src/lib/search.mjs";
const read = (n) =>
  JSON.parse(
    readFileSync(
      new URL("../src/data/" + n + ".json", import.meta.url),
      "utf8",
    ),
  );
const catalog = read("catalog"),
  libraries = read("libraries"),
  live = read("live-ids"),
  imports = read("imports");
test("catalog IDs are unique and every library is represented", () => {
  assert.equal(new Set(catalog.map((x) => x.id)).size, catalog.length);
  for (const l of libraries) assert(catalog.some((e) => e.library === l.id));
  for (const e of catalog) {
    assert(libraries.some((l) => l.id === e.library));
    assert.equal(new URL(e.url).protocol, "https:");
  }
});
test("every live preview has a catalog entry, vendored source, provenance, and a license", () => {
  for (const id of live) {
    const e = catalog.find((e) => e.id === id);
    assert(e, id);
    const integration = readdirSync("src/data/integrations")
      .map((f) =>
        JSON.parse(readFileSync("src/data/integrations/" + f, "utf8")),
      )
      .find((m) => m.covered.includes(id));
    assert(integration, id);
    const files = integration.imports.filter((i) => i.library === e.library);
    assert(files.length, id);
    for (const f of files) {
      assert(existsSync(f.file), f.file);
      assert.match(f.sha256, /^[a-f0-9]{64}$/);
    }
    assert(existsSync("public/licenses/" + e.library + ".txt"), e.library);
  }
});
test("search combines tokens and filters, including live status", () => {
  const found = searchCatalog(catalog, { query: "tabs", kind: "live", live });
  assert(found.length >= 3);
  assert(found.every((e) => live.includes(e.id)));
  const narrow = searchCatalog(catalog, {
    query: "tabs",
    library: "beui",
    kind: "live",
    live,
  });
  assert(narrow.some((e) => e.id === "beui:tabs"));
  assert(narrow.every((e) => e.library === "beui"));
});
test("saved filtering and empty searches do not leak unrelated entries", () => {
  assert.deepEqual(searchCatalog(catalog, { savedOnly: true, saved: [] }), []);
  const first = catalog[0];
  assert.deepEqual(
    searchCatalog(catalog, { savedOnly: true, saved: [first.id] }),
    [first],
  );
  assert.equal(searchCatalog(catalog, { query: "zzzznomatchzzzz" }).length, 0);
});
test("pending libraries and their thumbnails are absent from the published source catalog", () => {
  assert(!catalog.some((e) => ["reui", "transitions"].includes(e.library)));
  assert(!libraries.some((l) => ["reui", "transitions"].includes(l.id)));
  assert.equal(searchCatalog(catalog, { kind: "thumbnail" }).length, 0);
});
test("damaged saved storage fails safely", () => {
  assert.deepEqual(readSaved({ getItem: () => "{broken" }), []);
  assert.deepEqual(readSaved({ getItem: () => '{"x":1}' }), []);
  assert.deepEqual(readSaved({ getItem: () => '["a",2,null]' }), ["a"]);
});
test("name sorting is deterministic", () => {
  const found = searchCatalog(catalog, { sort: "name" });
  for (let i = 1; i < found.length; i++)
    assert(found[i - 1].name.localeCompare(found[i].name) <= 0);
});

test("retained source files match recorded output checksums or unchanged upstream source", () => {
  for (const f of imports) {
    const bytes = readFileSync(f.file);
    const content = f.outputSha256
      ? bytes
      : bytes.toString("utf8").replaceAll(`@/vendor/${f.library}/`, "@/");
    assert.equal(
      createHash("sha256").update(content).digest("hex"),
      f.outputSha256 || f.sha256,
      f.file,
    );
  }
});
test("every entry has an integrated preview or an explicit provider restriction", () => {
  for (const e of catalog)
    assert(["live", "thumbnail", "restricted"].includes(e.status), e.id);
  assert.equal(catalog.filter((e) => e.status === "live").length, 685);
  assert.equal(catalog.filter((e) => e.status === "restricted").length, 0);
  assert(
    catalog
      .filter((e) => e.status === "restricted")
      .every((e) => e.library === "transitions"),
  );
});

test("all interactive previews have explicit original source associations", () => {
  const map = read("preview-sources");
  for (const id of live) {
    assert(map[id]?.length, id);
    for (const file of map[id]) assert(existsSync(file), file);
  }
});

test("pending libraries are excluded from the public discovery catalog", () => {
  const published = JSON.parse(readFileSync("public/catalog.json", "utf8"));
  const hidden = read("hidden-libraries");
  assert(published.libraries.every((library) => !hidden.includes(library.id)));
  assert(published.entries.every((entry) => !hidden.includes(entry.library)));
  assert.equal(published.entries.length, 685);
  assert.equal(published.libraries.length, 10);
});

test("every public component has a details route and a real thumbnail", () => {
  const published = JSON.parse(readFileSync("public/catalog.json", "utf8"));
  for (const entry of published.entries) {
    assert.equal(
      entry.detailsUrl,
      `/components/${encodeURIComponent(entry.library)}/${encodeURIComponent(entry.slug)}`,
    );
    assert(
      existsSync(`public${entry.thumbnail}`),
      `Missing thumbnail: ${entry.id}`,
    );
    const bytes = readFileSync(`public${entry.thumbnail}`);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", entry.id);
  }
});
