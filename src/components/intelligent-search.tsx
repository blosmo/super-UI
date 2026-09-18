import { useEffect, useRef, useState, type RefObject } from "react";
import { Search, X, ArrowRight, LoaderCircle } from "lucide-react";
import { Button, Input, Badge } from "./host-ui";
import "./intelligent-search.css";
export type SearchMatch = {
  id: string;
  label: string;
  reasons: string[];
  rank?: number;
};
export type SearchResponse = {
  mode: "jev" | "semantic";
  results: SearchMatch[];
  notice?: string;
  durationMs: number;
};
const responseCache = new Map<string, SearchResponse>();
export function useIntelligentSearch(
  query: string,
  filters: Record<string, unknown>,
  enabled: boolean,
) {
  const key = JSON.stringify({ query, filters });
  const [state, setState] = useState<{
    key: string;
    loading: boolean;
    data?: SearchResponse;
    error?: string;
  }>({ key: "", loading: false });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!query.trim() || !enabled) return;
    const cached = responseCache.get(key);
    if (cached) {
      setState({ key, loading: false, data: cached });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    let cancelled = false;
    setState({ key, loading: true });
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: key,
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok)
          throw Error(
            r.status === 429
              ? "Search is busy. Please try again shortly."
              : "Intelligent search is unavailable. Showing keyword matches.",
          );
        return r.json();
      })
      .then((data: SearchResponse) => {
        if (
          !["jev", "semantic"].includes(data.mode) ||
          !Array.isArray(data.results) ||
          data.results.some(
            (r) => typeof r.id !== "string" || !Array.isArray(r.reasons),
          )
        )
          throw Error("Search returned an invalid response.");
        if (cancelled) return;
        // Only successful Jev responses are cached; fallback results can be retried.
        if (data.mode === "jev") {
          if (responseCache.size >= 30)
            responseCache.delete(responseCache.keys().next().value!);
          responseCache.set(key, data);
        }
        setState({ key, loading: false, data });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            key,
            loading: false,
            error: controller.signal.aborted
              ? "Search took too long. Showing keyword matches."
              : error.message,
          });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, enabled, retry]);
  const current = enabled && query.trim() && state.key === key ? state : null;
  return {
    data: current?.data,
    error: current?.error,
    loading: !!query.trim() && enabled && (!current || current.loading),
    retry: () => setRetry((n) => n + 1),
  };
}
export function IntelligentSearch({
  query,
  onSearch,
  inputRef,
  loading,
}: {
  query: string;
  onSearch: (query: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
}) {
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);
  return (
    <div className="search-field intelligent-search">
      <label className="field-label" htmlFor="component-search">
        What are you trying to build?
      </label>
      <form
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(draft.trim());
        }}
      >
        <Search size={19} aria-hidden="true" />
        <Input
          id="component-search"
          ref={inputRef}
          aria-label="Search components"
          placeholder="Describe a problem, or name a component…"
          value={draft}
          maxLength={600}
          onChange={(e) => setDraft(e.target.value)}
        />
        {draft && (
          <Button
            className="icon-button"
            aria-label="Clear search"
            onClick={() => {
              setDraft("");
              onSearch("");
            }}
          >
            <X size={16} />
          </Button>
        )}
        <Button
          type="submit"
          variant="default"
          className="smart-search-submit"
          aria-label="Find components"
          disabled={!draft.trim()}
        >
          {loading ? (
            <LoaderCircle size={16} className="search-spinner" />
          ) : (
            <ArrowRight size={17} />
          )}
          <span>Find</span>
        </Button>
      </form>
      <p className="search-hint">
        Search by meaning. Jev ranks matches for your task.{" "}
        <span>Search text is sent to TypeSafe.</span>
      </p>
    </div>
  );
}
export function SearchStatus({
  query,
  loading,
  error,
  data,
  onRetry,
  onSearch,
}: {
  query: string;
  loading: boolean;
  error?: string;
  data?: SearchResponse;
  onRetry: () => void;
  onSearch: (q: string) => void;
}) {
  if (!query)
    return (
      <div className="search-examples" aria-label="Example searches">
        <span>Try</span>
        {[
          "Let people approve an AI action",
          "Show progress while a file uploads",
          "Navigate a dashboard",
        ].map((q) => (
          <Button key={q} onClick={() => onSearch(q)}>
            {q}
            <ArrowRight size={12} />
          </Button>
        ))}
      </div>
    );
  const ambiguous = /^(navigation|a better navigation component|menu)$/i.test(
    query.trim(),
  );
  return (
    <div className="intelligent-search-status">
      <div role="status" aria-live="polite">
        {loading
          ? "Finding components that fit your task…"
          : error ||
            data?.notice ||
            (data?.mode === "jev"
              ? `${data.results.length} matches ranked for your task by Jev. Based on source evidence.`
              : "")}
        {!loading && (error || data?.notice) && (
          <Button className="text-button" onClick={onRetry}>
            Retry intelligent search
          </Button>
        )}
      </div>
      {ambiguous && (
        <div className="search-examples">
          <span>What kind of navigation?</span>
          {[
            ["Between pages", "Navigate between pages in an app"],
            ["Within a page", "Navigate between sections within one page"],
            ["A multi-step flow", "Guide users through a multi-step form"],
          ].map(([label, q]) => (
            <Button key={q} onClick={() => onSearch(q)}>
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
export function SearchMatchNote({ match }: { match?: SearchMatch }) {
  if (!match || match.label === "Related component") return null;
  return (
    <div className="search-match">
      <Badge>{match.label}</Badge>
      <p>{match.reasons.join(". ")}.</p>
    </div>
  );
}
