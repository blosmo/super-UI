import {
  IntelligentSearch,
  SearchStatus,
  SearchMatchNote,
  useIntelligentSearch,
} from "./components/intelligent-search";
import {
  Button,
  Sidebar,
  Toaster,
  toast,
  NativeSelect,
  NativeSelectOption,
  Card,
  Disclosure,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./components/host-ui";
import libraryLogos from "./data/library-logos.json";
import { assessments } from "./assessments";
import {
  AssessmentDetails,
  AssessmentTags,
} from "./components/component-assessment";
import { useCases, traits } from "./lib/component-assessment.mjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  X,
  Bookmark,
  Layers,
  SlidersHorizontal,
  Grid2X2,
  Check,
  Plus,
  RotateCcw,
  Code2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Library,
  Sun,
  Moon,
  Link2,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  GitCompareArrows,
  Command,
  Pause,
  Play,
} from "lucide-react";
import {
  catalog,
  categories,
  libraries,
  libraryMap,
  imports,
  type Entry,
} from "./catalog";
import { searchCatalog, readSaved } from "./lib/search.mjs";
import "./styles.css";

import liveIds from "./data/live-ids.json";
import previewSources from "./data/preview-sources.json";
const live = new Set(liveIds);
const status = (e: Entry) =>
  live.has(e.id)
    ? "Live"
    : e.status === "thumbnail"
      ? "Thumbnail"
      : e.status === "restricted"
        ? "At source"
        : "Unavailable";
function installCommand(e: Entry) {
  if (e.id === "libraries:image") return "npm install img-fx three";
  const source = imports.find(
    (i) => i.library === e.library && i.name === e.slug,
  )?.url;
  return source?.endsWith(".json") ? `npx shadcn@latest add ${source}` : "";
}
const sourceFiles = import.meta.glob("./vendor/**/*.{tsx,ts,js,mjs}", {
  query: "?raw",
  import: "default",
});
function useSaved() {
  const [saved, set] = useState<string[]>(() => {
    try {
      return readSaved(localStorage);
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("super-ui:saved", JSON.stringify(saved));
    } catch {}
  }, [saved]);
  return {
    saved,
    toggle: (id: string) =>
      set((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
  };
}
function Demo({
  entry,
  dark = false,
  playing,
  onPlay,
}: {
  entry: Entry;
  dark?: boolean;
  playing: boolean;
  onPlay: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, set] = useState(false);
  const [replay, reset] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => set(e.isIntersecting), {
      rootMargin: "150px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`demo ${dark ? "dark" : ""} ${entry.library === "opensource" ? "full-demo" : ""}`}
    >
      {live.has(entry.id) ? (
        <>
          <span className="live-dot" aria-hidden="true" />
          <Button
            className="replay icon-button"
            disabled={!playing}
            aria-label={`Replay ${entry.name}`}
            onClick={() => reset((n) => n + 1)}
          >
            <RotateCcw size={13} />
          </Button>
          {!playing && (
            <div className="paused-preview">
              <Button className="outline-button" onClick={onPlay}>
                <Play size={16} />
                Play previews
              </Button>
              <span>Previews paused</span>
            </div>
          )}
          {visible && playing && (
            <iframe
              key={`${entry.id}-${replay}-${dark}`}
              className="component-frame"
              title={`${entry.name} by ${libraryMap[entry.library].name}`}
              src={`/preview.html?id=${encodeURIComponent(entry.id)}&theme=${dark ? "dark" : "light"}`}
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          )}
        </>
      ) : entry.status === "restricted" ? (
        <div className="source-preview">
          <ExternalLink size={25} strokeWidth={1} />
          <Button asChild>
            <a
              className="outline-button"
              href={entry.url}
              target="_blank"
              rel="noreferrer"
            >
              Try on Transitions.dev <ArrowUpRight size={14} />
            </a>
          </Button>
          <small>Local previews require creator permission.</small>
        </div>
      ) : entry.thumbnail && !failed ? (
        <>
          <img
            loading="lazy"
            src={
              dark
                ? entry.thumbnail.replace("-light.webp", "-dark.webp")
                : entry.thumbnail
            }
            alt={`${entry.name} by ${libraryMap[entry.library].name}`}
            onError={() => setFailed(true)}
          />
          <span className="preview-label">Official thumbnail</span>
        </>
      ) : (
        <div className="source-preview">
          <Code2 size={27} strokeWidth={1} />
          <span>{entry.name}</span>
          <small>
            {failed ? "Thumbnail unavailable" : "Preview unavailable"}
          </small>
        </div>
      )}
    </div>
  );
}
function App() {
  const pageParams = new URLSearchParams(location.search);
  const route = location.pathname.match(/^\/components\/([^/]+)\/([^/]+)\/?$/);
  const initial = route
    ? new URLSearchParams(pageParams.get("from") || "")
    : pageParams;
  const routeId = route
    ? `${decodeURIComponent(route[1])}:${decodeURIComponent(route[2])}`
    : initial.get("component");
  const componentHref = (entry: Entry) => {
    const filters = new URLSearchParams();
    if (query) filters.set("q", query);
    for (const [key, value] of Object.entries({
      useCase,
      style,
      motion,
      setup,
    }))
      if (value) filters.set(key, value);
    if (category) filters.set("category", category);
    if (library) filters.set("library", library);
    if (sort !== "recommended") filters.set("sort", sort);
    if (view !== "explore") filters.set("view", view);
    const path = `/components/${encodeURIComponent(entry.library)}/${encodeURIComponent(entry.slug)}`;
    return filters.size
      ? `${path}?from=${encodeURIComponent(filters.toString())}`
      : path;
  };
  const [query, setQuery] = useState(initial.get("q") || "");
  const [category, setCategory] = useState(initial.get("category") || "");
  const [library, setLibrary] = useState(
    libraries.some((item) => item.id === initial.get("library"))
      ? initial.get("library")!
      : "",
  );
  const [useCase, setUseCase] = useState(initial.get("useCase") || "");
  const [style, setStyle] = useState(initial.get("style") || "");
  const [motion, setMotion] = useState(initial.get("motion") || "");
  const [setup, setSetup] = useState(initial.get("setup") || "");
  const assessedCount = catalog.filter((entry) => assessments[entry.id]).length;
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState(initial.get("sort") || "recommended");
  const [view, setView] = useState(initial.get("view") || "explore");
  const [selected, setSelected] = useState<string[]>(() =>
    [...new Set((initial.get("compare") || "").split(","))]
      .filter((id) => catalog.some((e) => e.id === id))
      .slice(0, 3),
  );
  const [comparing, setComparing] = useState(
    selected.length >= 2 && initial.has("compare"),
  );
  const [detail, setDetail] = useState<Entry | null>(
    () => catalog.find((e) => e.id === routeId) || null,
  );
  const [page, setPage] = useState(1);
  const [dark, setDark] = useState(
    () => document.documentElement.dataset.theme === "dark",
  );
  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#171717" : "#fcfcfa");
    try {
      localStorage.setItem("super-ui:theme", theme);
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }, [dark]);
  const [playing, setPlaying] = useState(
    () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) setPlaying(false);
    };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const [sidebar, setSidebar] = useState(false);
  const sidebarTrigger = useRef<HTMLButtonElement>(null);
  const { saved, toggle } = useSaved();
  const searchRef = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [tab, setTab] = useState("preview");
  const notify = (msg: string) =>
    toast(msg, { duration: msg.includes("unavailable") ? Infinity : 3000 });
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "k" &&
        !document.querySelector('[role="dialog"]') &&
        !sidebar
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [sidebar]);
  useEffect(() => {
    setPage(1);
  }, [
    query,
    category,
    library,
    kind,
    sort,
    view,
    useCase,
    style,
    motion,
    setup,
  ]);
  useEffect(() => {
    document.title = detail
      ? `${detail.name} by ${libraryMap[detail.library].name} · Super UI`
      : "Super UI · Explore components";
    if (detail) {
      if (!route) {
        initial.delete("component");
        history.replaceState({}, "", componentHref(detail));
      }
      return;
    }
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    for (const [key, value] of Object.entries({
      useCase,
      style,
      motion,
      setup,
    }))
      if (value) p.set(key, value);
    if (category) p.set("category", category);
    if (library) p.set("library", library);
    if (kind !== "all") p.set("kind", kind);
    if (sort !== "recommended") p.set("sort", sort);
    if (view !== "explore") p.set("view", view);
    if (comparing && selected.length) p.set("compare", selected.join(","));
    history.replaceState({}, "", "/" + (p.size ? "?" + p : ""));
  }, [
    query,
    category,
    library,
    kind,
    sort,
    view,
    comparing,
    selected,
    detail,
    useCase,
    style,
    motion,
    setup,
  ]);
  useEffect(() => {
    setTab("preview");
    setCode("");
    setCodeError(false);
    if (!detail) return;
    let cancelled = false;
    const paths = (previewSources as Record<string, string[]>)[detail.id] || [];
    const files = paths.map(
      (file) =>
        imports.find((i) => i.file === file) || { file, url: detail.url },
    );
    Promise.all(
      files.map(async (f) => {
        const loader = sourceFiles["./" + f.file.replace("src/", "")];
        return loader
          ? `// ${f.file}\n// Original: ${f.url}\n\n${await loader()}`
          : "";
      }),
    )
      .then(async (s) => {
        const body = s.filter(Boolean).join("\n\n");
        let license = "";
        try {
          const r = await fetch(`/licenses/${detail.library}.txt`);
          if (r.ok) license = await r.text();
        } catch {}
        if (!cancelled)
          setCode(
            body
              ? license
                  .split("\n")
                  .map((l) => "// " + l)
                  .join("\n") +
                  "\n\n" +
                  body
              : "",
          );
      })
      .catch(() => {
        if (!cancelled) setCodeError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [detail]);
  const smartSearch = useIntelligentSearch(
    query,
    {
      category,
      library,
      useCase,
      style,
      motion,
      setup,
      ...(view === "saved" ? { savedIds: saved } : {}),
    },
    !detail && view !== "libraries",
  );
  const searchMatches = useMemo(
    () =>
      new Map(
        smartSearch.data?.results.map((match) => [match.id, match]) || [],
      ),
    [smartSearch.data],
  );
  const results = useMemo(() => {
    const matching = searchCatalog(catalog, {
      query: smartSearch.data || smartSearch.loading ? "" : query,
      category,
      library,
      kind,
      sort,
      savedOnly: view === "saved",
      saved,
      live: liveIds,
      assessments,
      useCase,
      style,
      motion,
      setup,
    }) as Entry[];
    if (smartSearch.loading) return [];
    if (!smartSearch.data) return matching;
    const order = new Map(
      smartSearch.data.results.map((match, index) => [match.id, index]),
    );
    return matching
      .filter((entry) => order.has(entry.id))
      .sort((a, b) =>
        sort === "name" || sort === "library"
          ? 0
          : order.get(a.id)! - order.get(b.id)!,
      );
  }, [
    smartSearch.data,
    smartSearch.loading,
    query,
    category,
    library,
    kind,
    sort,
    view,
    saved,
    useCase,
    style,
    motion,
    setup,
  ]);
  const pageSize = 24;
  const shown = results.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const choose = (id: string) => {
    if (selected.includes(id)) setSelected((s) => s.filter((x) => x !== id));
    else if (selected.length < 3) setSelected((s) => [...s, id]);
    else notify("Compare up to 3 components. Remove one to add another.");
  };
  const clear = () => {
    setQuery("");
    setCategory("");
    setLibrary("");
    setKind("all");
    setUseCase("");
    setStyle("");
    setMotion("");
    setSetup("");
    setSort("recommended");
  };
  const copy = async (value: string, msg = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(value);
      notify(msg);
    } catch {
      notify("Clipboard unavailable. Select and copy the text instead.");
    }
  };
  const close = () => {
    setDetail(null);
    setComparing(false);
  };
  return (
    <div className="app">
      <a className="skip-link" href="#catalog">
        Skip to components
      </a>
      <Sidebar
        open={sidebar}
        onOpenChange={setSidebar}
        triggerRef={sidebarTrigger}
      >
        <a className="brand" href="/" aria-label="Super UI home">
          <span className="brand-mark">
            <Layers size={22} />
          </span>
          super<span className="brand-ui">ui</span>
          <span className="beta">BETA</span>
        </a>
        <Button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        >
          <X size={18} />
        </Button>
        <nav aria-label="Main navigation">
          <Button
            aria-current={view === "explore" ? "page" : undefined}
            className={`nav-item ${view === "explore" ? "active" : ""}`}
            onClick={() => {
              setDetail(null);
              setView("explore");
              setSidebar(false);
            }}
          >
            <Grid2X2 size={16} />
            Explore<span>{catalog.length.toLocaleString()}</span>
          </Button>
          <Button
            aria-current={view === "saved" ? "page" : undefined}
            className={`nav-item ${view === "saved" ? "active" : ""}`}
            onClick={() => {
              setDetail(null);
              setView("saved");
              setSidebar(false);
            }}
          >
            <Bookmark size={16} />
            Saved
            <span>
              {catalog.filter((entry) => saved.includes(entry.id)).length}
            </span>
          </Button>
          <Button
            aria-current={view === "libraries" ? "page" : undefined}
            className={`nav-item ${view === "libraries" ? "active" : ""}`}
            onClick={() => {
              setDetail(null);
              setView("libraries");
              setSidebar(false);
            }}
          >
            <Library size={16} />
            Libraries<span>{libraries.length}</span>
          </Button>
        </nav>
        <div className="nav-label">BROWSE BY PURPOSE</div>
        <nav aria-label="Component categories">
          <Button
            className={`category-item ${!category ? "chosen" : ""}`}
            onClick={() => {
              setCategory("");
              setDetail(null);
              setView("explore");
              setSidebar(false);
            }}
          >
            All components<span>{catalog.length.toLocaleString()}</span>
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              aria-pressed={category === c}
              className={`category-item ${category === c ? "chosen" : ""}`}
              onClick={() => {
                setCategory(c);
                setDetail(null);
                setView("explore");
                setSidebar(false);
              }}
            >
              {c}
              <span>{catalog.filter((e) => e.category === c).length}</span>
            </Button>
          ))}
        </nav>
      </Sidebar>
      <div className="workspace" inert={sidebar}>
        <header className="topbar">
          <Button
            className="mobile-toggle icon-button"
            aria-label="Open navigation"
            ref={sidebarTrigger}
            aria-expanded={sidebar}
            onClick={() => setSidebar(true)}
          >
            <PanelLeftOpen size={19} />
          </Button>
          <span className="breadcrumb">
            <span className="breadcrumb-prefix">
              The component collection /
            </span>{" "}
            <strong>
              {view === "libraries"
                ? "Libraries"
                : view === "saved"
                  ? "Saved"
                  : "Explore"}
            </strong>
          </span>
          <div className="theme-picker" role="group" aria-label="Color theme">
            <Button
              aria-label="Light mode"
              title="Light mode"
              aria-pressed={!dark}
              onClick={() => setDark(false)}
            >
              <Sun size={14} />
            </Button>
            <Button
              aria-label="Dark mode"
              title="Dark mode"
              aria-pressed={dark}
              onClick={() => setDark(true)}
            >
              <Moon size={14} />
            </Button>
          </div>
          <div className="topbar-actions">
            <Button
              className="text-button"
              onClick={() => copy(location.href, "Link copied")}
            >
              {detail ? "Share component" : "Share collection"}{" "}
              <ArrowUpRight size={14} />
            </Button>
          </div>
        </header>
        <main id="catalog" tabIndex={-1}>
          {detail ? (
            <section className="detail-page">
              <a
                className="back-link"
                href={"/" + (initial.size ? "?" + initial.toString() : "")}
              >
                <ChevronLeft size={16} />
                Back to components
              </a>
              <header className="dialog-header">
                <div>
                  <span className="eyebrow">
                    {libraryMap[detail.library].name} / {detail.category}
                  </span>
                  <h1>{detail.name}</h1>
                </div>
                <Button
                  className="outline-button dialog-playback"
                  onClick={() => setPlaying((value) => !value)}
                  aria-label={playing ? "Pause previews" : "Play previews"}
                >
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </Button>
              </header>
              <div
                className="detail-tabs"
                role="group"
                aria-label="Component view"
              >
                <Button
                  aria-pressed={tab === "preview"}
                  className={tab === "preview" ? "selected" : ""}
                  onClick={() => setTab("preview")}
                >
                  Preview
                </Button>
                {(previewSources as Record<string, string[]>)[detail.id]
                  ?.length > 0 && (
                  <Button
                    aria-pressed={tab === "code"}
                    className={tab === "code" ? "selected" : ""}
                    onClick={() => setTab("code")}
                  >
                    Source code
                  </Button>
                )}
                <Button
                  className="text-button"
                  onClick={() => copy(location.href, "Component link copied")}
                >
                  <Link2 size={14} />
                  Share
                </Button>
              </div>
              <p className="preview-size-note">
                Interactive preview. Wide layouts can be scrolled horizontally.
              </p>
              {tab === "preview" ? (
                <Demo
                  key={detail.id}
                  entry={detail}
                  dark={dark}
                  playing={playing}
                  onPlay={() => setPlaying(true)}
                />
              ) : (
                <div className="code-pane">
                  {!code && (
                    <p role="status">
                      {codeError
                        ? "Unable to load source code. Open the original source below."
                        : "Loading source code…"}
                    </p>
                  )}
                  <Button
                    className="text-button"
                    disabled={!code}
                    onClick={() => copy(code)}
                  >
                    <Copy size={14} />
                    Copy source
                  </Button>
                  <pre>
                    <code>{code}</code>
                  </pre>
                </div>
              )}
              <div className="detail-info">
                <p>
                  {detail.description ||
                    `Explore ${detail.name} from ${libraryMap[detail.library].name}.`}
                </p>
                <AssessmentDetails id={detail.id} />
                <dl>
                  <div>
                    <dt>Preview</dt>
                    <dd>{status(detail)}</dd>
                  </div>
                  <div>
                    <dt>License</dt>
                    <dd>{libraryMap[detail.library].license}</dd>
                  </div>
                  <div>
                    <dt>Dependencies</dt>
                    <dd>
                      {(
                        imports.find(
                          (i) =>
                            i.library === detail.library &&
                            i.name === detail.slug,
                        )?.dependencies || detail.dependencies
                      ).join(", ") || "See source documentation"}
                    </dd>
                  </div>
                </dl>
                {!live.has(detail.id) && (
                  <p className="integration-note">
                    {detail.thumbnail
                      ? "Official image preview. Open the source to interact with this component."
                      : "This source prohibits republishing its transition collection. Open the original source to try it; local previews require permission from its creator."}
                  </p>
                )}
                {installCommand(detail) && (
                  <div className="install-command">
                    <code>{installCommand(detail)}</code>
                    <Button
                      className="icon-button"
                      aria-label="Copy install command"
                      onClick={() => copy(installCommand(detail))}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                )}
                <div className="detail-actions">
                  {live.has(detail.id) && (
                    <Button asChild>
                      <a
                        className="outline-button"
                        href={`/preview.html?id=${encodeURIComponent(detail.id)}&theme=${dark ? "dark" : "light"}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Full preview <ArrowUpRight size={14} />
                      </a>
                    </Button>
                  )}
                  <Button asChild>
                    <a
                      className="solid-button"
                      href={detail.sourceUrl || detail.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open original source <ArrowUpRight size={15} />
                    </a>
                  </Button>
                  <Button
                    className="outline-button"
                    onClick={() => {
                      choose(detail.id);
                    }}
                  >
                    {selected.includes(detail.id)
                      ? "Remove from comparison"
                      : "Add to comparison"}
                  </Button>
                  {libraryMap[detail.library].license === "MIT" && (
                    <a
                      className="text-button muted"
                      href={
                        detail.library === "beautiful"
                          ? "https://www.beautifului.dev/license"
                          : `/licenses/${detail.library}.txt`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      License <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <h1>
                    {view === "libraries"
                      ? "Libraries"
                      : view === "saved"
                        ? "Saved components"
                        : category
                          ? category
                          : "Explore components"}
                  </h1>
                  <p>
                    {view === "libraries"
                      ? "Independent makers, brought together with care and credit."
                      : view === "saved"
                        ? "A shortlist of components worth coming back to. Saved on this device."
                        : "Find, try, and compare original React components."}
                  </p>
                </div>
                <span className="heading-symbol" aria-hidden="true">
                  ✳
                </span>
              </div>
              {view === "libraries" ? (
                <>
                  <div className="coverage-note">
                    <Layers size={18} />
                    <div>
                      <strong>A growing collection of original work.</strong>
                      <p>
                        {catalog.length} interactive previews from{" "}
                        {libraries.length} libraries. Original components, with
                        source code and attribution.
                      </p>
                    </div>
                  </div>
                  <div className="library-grid">
                    {libraries.map((l) => (
                      <Card role="article" className="library-card" key={l.id}>
                        <span className="library-logo" aria-hidden="true">
                          <img
                            src={
                              libraryLogos[l.id as keyof typeof libraryLogos]
                                .src
                            }
                            alt=""
                            width={40}
                            height={40}
                          />
                        </span>
                        <h2>
                          <a href={`/?library=${encodeURIComponent(l.id)}`}>
                            {l.name}
                          </a>
                        </h2>
                        <p>{l.note}</p>
                        <div className="library-facts">
                          <span>
                            {catalog.filter((e) => e.library === l.id).length}{" "}
                            components
                          </span>
                        </div>
                        <div className="library-links">
                          <Button
                            className="text-button"
                            onClick={() => {
                              setLibrary(l.id);
                              setCategory("");
                              setKind("all");
                              setUseCase("");
                              setStyle("");
                              setMotion("");
                              setSetup("");
                              setDetail(null);
                              setView("explore");
                            }}
                          >
                            Browse library <ArrowRight size={14} />
                          </Button>
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Visit ${l.name}`}
                          >
                            <ArrowUpRight size={17} />
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="search-row">
                    <IntelligentSearch
                      query={query}
                      onSearch={(value) =>
                        value === query ? smartSearch.retry() : setQuery(value)
                      }
                      inputRef={searchRef}
                      loading={smartSearch.loading}
                    />
                    <div className="library-field">
                      <label className="field-label" htmlFor="library-filter">
                        Library
                      </label>
                      <label className="select-box">
                        <Library size={16} />
                        <NativeSelect
                          id="library-filter"
                          aria-label="Filter by library"
                          value={library}
                          onChange={(e) => setLibrary(e.target.value)}
                        >
                          <NativeSelectOption value="">
                            All libraries
                          </NativeSelectOption>
                          {libraries.map((l) => (
                            <NativeSelectOption key={l.id} value={l.id}>
                              {l.name}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </label>
                    </div>
                  </div>
                  <SearchStatus
                    query={query}
                    loading={smartSearch.loading}
                    error={smartSearch.error}
                    data={smartSearch.data}
                    onRetry={smartSearch.retry}
                    onSearch={(value) =>
                      value === query ? smartSearch.retry() : setQuery(value)
                    }
                  />
                  {assessedCount > 0 && (
                    <Disclosure
                      className="fit-finder"
                      open={Boolean(useCase || style || motion || setup)}
                      title={
                        <>
                          Find the right fit{" "}
                          <span>Use case, style, motion, and setup</span>
                        </>
                      }
                    >
                      <div className="fit-fields">
                        <label>
                          Use case
                          <NativeSelect
                            aria-label="Use case"
                            value={useCase}
                            onChange={(event) => {
                              setUseCase(event.target.value);
                              setSort(
                                event.target.value ? "fit" : "recommended",
                              );
                            }}
                          >
                            <NativeSelectOption value="">
                              Any use case
                            </NativeSelectOption>
                            {Object.entries(useCases).map(([key, label]) => (
                              <NativeSelectOption key={key} value={key}>
                                {label}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </label>
                        <label>
                          Style
                          <NativeSelect
                            aria-label="Visual style"
                            value={style}
                            onChange={(event) => setStyle(event.target.value)}
                          >
                            <NativeSelectOption value="">
                              Any style
                            </NativeSelectOption>
                            {Object.entries(traits.style.options).map(
                              ([key, label]) => (
                                <NativeSelectOption key={key} value={key}>
                                  {label}
                                </NativeSelectOption>
                              ),
                            )}
                          </NativeSelect>
                        </label>
                        <label>
                          Motion
                          <NativeSelect
                            aria-label="Motion"
                            value={motion}
                            onChange={(event) => setMotion(event.target.value)}
                          >
                            <NativeSelectOption value="">
                              Any motion
                            </NativeSelectOption>
                            {Object.entries(traits.motion.options).map(
                              ([key, label]) => (
                                <NativeSelectOption key={key} value={key}>
                                  {label}
                                </NativeSelectOption>
                              ),
                            )}
                          </NativeSelect>
                        </label>
                        <label>
                          Setup
                          <NativeSelect
                            aria-label="Setup effort"
                            value={setup}
                            onChange={(event) => setSetup(event.target.value)}
                          >
                            <NativeSelectOption value="">
                              Any setup
                            </NativeSelectOption>
                            {Object.entries(traits.setup.options).map(
                              ([key, label]) => (
                                <NativeSelectOption key={key} value={key}>
                                  {label}
                                </NativeSelectOption>
                              ),
                            )}
                          </NativeSelect>
                        </label>
                      </div>
                      <p>
                        {assessedCount} of {catalog.length} components assessed
                        by Jev from their source. Uncertain matches are excluded
                        when you filter.
                      </p>
                    </Disclosure>
                  )}
                  <div className="filter-row">
                    <div className="view-controls">
                      <label className="sort-select">
                        <span>Sort</span>
                        <NativeSelect
                          aria-label="Sort components"
                          value={sort}
                          onChange={(e) => setSort(e.target.value)}
                        >
                          <NativeSelectOption value="recommended">
                            {query ? "Best match" : "Featured first"}
                          </NativeSelectOption>
                          {useCase && (
                            <NativeSelectOption value="fit">
                              Best fit for use case
                            </NativeSelectOption>
                          )}
                          <NativeSelectOption value="name">
                            Name A–Z
                          </NativeSelectOption>
                          <NativeSelectOption value="library">
                            Library A–Z
                          </NativeSelectOption>
                        </NativeSelect>
                      </label>
                    </div>
                  </div>
                  <div className="results-summary">
                    <span role="status" aria-live="polite" aria-atomic="true">
                      <strong>{results.length.toLocaleString()}</strong>{" "}
                      {category || "components"}
                      {library &&
                        ` from ${libraryMap[library]?.name || library}`}
                    </span>
                    {query ||
                    category ||
                    library ||
                    kind !== "all" ||
                    useCase ||
                    style ||
                    motion ||
                    setup ? (
                      <Button className="text-button muted" onClick={clear}>
                        Clear filters <X size={12} />
                      </Button>
                    ) : (
                      <span className="muted">
                        Original components. Always credited.
                      </span>
                    )}
                  </div>
                  {smartSearch.loading ? (
                    <div className="empty-state" aria-busy="true">
                      <Search size={24} />
                      <h2>Finding the right components</h2>
                      <p>
                        Matching your problem with the original component
                        sources.
                      </p>
                    </div>
                  ) : shown.length ? (
                    <div className="component-grid">
                      {shown.map((e) => (
                        <Card
                          role="article"
                          className={`component-card ${selected.includes(e.id) ? "is-selected" : ""}`}
                          key={e.id}
                        >
                          <a
                            className="thumbnail-link"
                            href={componentHref(e)}
                            aria-label={`View ${e.name} by ${libraryMap[e.library].name}`}
                          >
                            <img
                              src={`/thumbnails/${e.library}--${e.slug}.webp`}
                              alt={`${e.name} preview`}
                              width={720}
                              height={480}
                              loading="lazy"
                            />
                          </a>
                          <div className="card-meta">
                            <SearchMatchNote match={searchMatches.get(e.id)} />
                            <AssessmentTags id={e.id} useCase={useCase} />
                            <div className="card-title">
                              <a href={componentHref(e)}>{e.name}</a>
                              <Button
                                className={`icon-button save-button ${saved.includes(e.id) ? "is-saved" : ""}`}
                                aria-label={`${saved.includes(e.id) ? "Unsave" : "Save"} ${e.name} by ${libraryMap[e.library].name}`}
                                aria-pressed={saved.includes(e.id)}
                                onClick={() => toggle(e.id)}
                              >
                                <Bookmark
                                  size={16}
                                  fill={
                                    saved.includes(e.id)
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              </Button>
                            </div>
                            <a
                              className="source-link"
                              href={e.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="source-logo" aria-hidden="true">
                                <img
                                  src={
                                    libraryLogos[
                                      e.library as keyof typeof libraryLogos
                                    ].src
                                  }
                                  alt=""
                                  width={18}
                                  height={18}
                                />
                              </span>
                              {libraryMap[e.library].name}
                              <ArrowUpRight size={11} />
                            </a>
                            <div className="card-bottom">
                              <span>{e.category}</span>
                              <div>
                                <span
                                  className={`status ${status(e) === "Live" ? "live" : ""}`}
                                >
                                  {status(e)}
                                </span>
                                <Button
                                  className={`compare-add ${selected.includes(e.id) ? "added" : ""}`}
                                  aria-label={`${selected.includes(e.id) ? "Remove" : "Compare"} ${e.name} by ${libraryMap[e.library].name}`}
                                  aria-pressed={selected.includes(e.id)}
                                  onClick={() => choose(e.id)}
                                >
                                  {selected.includes(e.id) ? (
                                    <Check size={13} />
                                  ) : (
                                    <Plus size={13} />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Search size={28} />
                      <h2>
                        {view === "saved" &&
                        !catalog.some((entry) => saved.includes(entry.id))
                          ? "No saved components yet"
                          : query
                            ? `No results for “${query}”`
                            : "No components match these filters"}
                      </h2>
                      <p>
                        {view === "saved" &&
                        !catalog.some((entry) => saved.includes(entry.id))
                          ? "Save components with the bookmark button to find them here."
                          : "Try a broader search or clear your filters."}
                      </p>
                      <Button
                        className="solid-button"
                        onClick={() => {
                          clear();
                          setDetail(null);
                          setView("explore");
                        }}
                      >
                        Explore components <ArrowRight size={15} />
                      </Button>
                    </div>
                  )}
                  {pages > 1 && (
                    <nav className="pagination" aria-label="Pagination">
                      <span>
                        Showing {(page - 1) * pageSize + 1}–
                        {Math.min(page * pageSize, results.length)} of{" "}
                        {results.length.toLocaleString()}
                      </span>
                      <div>
                        <Button
                          className="icon-button"
                          aria-label="Previous page"
                          disabled={page === 1}
                          onClick={() => {
                            setPage((n) => n - 1);
                            window.scrollTo({
                              top: 180,
                              behavior: matchMedia(
                                "(prefers-reduced-motion: reduce)",
                              ).matches
                                ? "instant"
                                : "smooth",
                            });
                          }}
                        >
                          <ChevronLeft size={17} />
                        </Button>
                        <span>
                          {page} / {pages}
                        </span>
                        <Button
                          className="icon-button"
                          aria-label="Next page"
                          disabled={page === pages}
                          onClick={() => {
                            setPage((n) => n + 1);
                            window.scrollTo({
                              top: 180,
                              behavior: matchMedia(
                                "(prefers-reduced-motion: reduce)",
                              ).matches
                                ? "instant"
                                : "smooth",
                            });
                          }}
                        >
                          <ChevronRight size={17} />
                        </Button>
                      </div>
                    </nav>
                  )}
                </>
              )}
              <footer className="page-footer">
                <span>
                  Super UI{" "}
                  <a
                    className="muted"
                    href="https://github.com/blosmo/super-UI"
                    target="_blank"
                    rel="noreferrer"
                  >
                    / Source code
                  </a>
                </span>
                <Button
                  className="text-button muted"
                  onClick={() => setView("libraries")}
                >
                  Sources & coverage <ArrowUpRight size={13} />
                </Button>
              </footer>
            </>
          )}
        </main>
      </div>
      {selected.length > 0 && !comparing && (
        <div className="compare-tray" inert={sidebar}>
          <div className="tray-label">
            <GitCompareArrows size={18} />
            <strong>{selected.length} selected</strong>
          </div>
          <div className="tray-items">
            {selected.map((id) => (
              <Button
                key={id}
                onClick={() => choose(id)}
                title="Remove from comparison"
              >
                {catalog.find((e) => e.id === id)?.name}
                <X size={12} />
              </Button>
            ))}
          </div>
          <Button
            className="solid-button"
            ref={opener}
            disabled={selected.length < 2}
            onClick={() => {
              setDetail(null);
              setComparing(true);
            }}
          >
            Compare <ArrowRight size={15} />
          </Button>
          <Button
            className="icon-button"
            aria-label="Clear comparison"
            onClick={() => setSelected([])}
          >
            <X size={16} />
          </Button>
        </div>
      )}
      <Dialog
        open={comparing}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="catalog-dialog comparison-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
        >
          <div className="dialog-inner">
            {comparing && (
              <>
                <header className="dialog-header">
                  <div>
                    <span className="eyebrow">SIDE BY SIDE</span>
                    <DialogTitle>Find the right fit.</DialogTitle>
                  </div>

                  <Button
                    className="icon-button"
                    aria-label="Close comparison"
                    onClick={close}
                  >
                    <X size={20} />
                  </Button>
                </header>
                <DialogDescription className="compare-intro">
                  Compare appearance, dependencies, and licenses. Open a
                  component to try it.
                </DialogDescription>
                <div
                  className="comparison-grid"
                  style={{
                    gridTemplateColumns: `repeat(${selected.length},minmax(0,1fr))`,
                  }}
                >
                  {selected.map((id) => {
                    const e = catalog.find((e) => e.id === id)!;
                    return (
                      <section key={id}>
                        <h3>{e.name}</h3>
                        <AssessmentTags id={e.id} useCase={useCase} />
                        <a
                          className="source-link"
                          href={e.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {libraryMap[e.library].name}
                          <ArrowUpRight size={12} />
                        </a>
                        <a
                          className="thumbnail-link"
                          href={componentHref(e)}
                          aria-label={`Open ${e.name} by ${libraryMap[e.library].name}`}
                        >
                          <img
                            src={`/thumbnails/${e.library}--${e.slug}.webp`}
                            alt={`${e.name} preview`}
                            width={720}
                            height={480}
                          />
                        </a>
                        <Button asChild>
                          <a className="outline-button" href={componentHref(e)}>
                            Open details <ArrowRight size={14} />
                          </a>
                        </Button>
                        <dl>
                          <div>
                            <dt>Preview</dt>
                            <dd>{status(e)}</dd>
                          </div>
                          <div>
                            <dt>License</dt>
                            <dd>{libraryMap[e.library].license}</dd>
                          </div>
                          <div>
                            <dt>Dependencies</dt>
                            <dd>
                              {(
                                imports.find(
                                  (i) =>
                                    i.library === e.library &&
                                    i.name === e.slug,
                                )?.dependencies || e.dependencies
                              ).join(", ") || "See documentation"}
                            </dd>
                          </div>
                        </dl>
                        <p>
                          {e.description ||
                            "Explore the original documentation for usage and behavior."}
                        </p>
                        <Button asChild>
                          <a
                            className="outline-button"
                            href={e.sourceUrl || e.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View source <ArrowUpRight size={14} />
                          </a>
                        </Button>
                      </section>
                    );
                  })}
                </div>
                <div className="compare-footer">
                  <Button
                    className="text-button"
                    onClick={() =>
                      copy(location.href, "Comparison link copied")
                    }
                  >
                    <Link2 size={15} />
                    Copy comparison link
                  </Button>
                  <span className="muted">
                    Original components, independent styles.
                  </span>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Toaster
        theme={dark ? "dark" : "light"}
        position="bottom-right"
        closeButton
        toastOptions={{
          style: {
            background: "var(--ui-surface)",
            color: "var(--ui-text)",
            borderColor: "var(--ui-line)",
          },
        }}
      />
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
