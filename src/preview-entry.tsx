import libraries from "./data/libraries.json";
import { Component, Suspense, lazy, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
const params = new URLSearchParams(location.search);
const id = params.get("id") || "";
const library = id.split(":")[0];
const dark = params.get("theme") === "dark";
const capture = params.has("capture");
// Resolve documentation links against their original library, never against this catalog.
document.addEventListener("click", (event) => {
  if (event.defaultPrevented) return;
  const anchor = (event.target as Element)?.closest?.("a[href]");
  const href = anchor?.getAttribute("href");
  if (!href || href.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(href)) return;
  const source = libraries.find((item) => item.id === library);
  if (!source) return;
  event.preventDefault();
  location.assign(new URL(href, source.url).href);
});
document.documentElement.classList.toggle("dark", dark);
document.documentElement.style.colorScheme = dark ? "dark" : "light";
const modules = {
  interior: () => import("./previews/foundations"),
  rare: () => import("./previews/foundations"),
  shadcn: () => import("./previews/foundations"),
  opensource: () => import("./previews/opensource"),
  beui: () => import("./previews/beui"),
  fluid: () => import("./previews/fluid"),
  coss: () => import("./previews/coss"),
  amicro: () =>
    import("./previews/expressive").then((m) => ({
      previews: m.expressivePreviews,
    })),
  beautiful: () =>
    import("./previews/expressive").then((m) => ({
      previews: m.expressivePreviews,
    })),
  libraries: () =>
    import("./previews/expressive").then((m) => ({
      previews: m.expressivePreviews,
    })),
};
const styles = {
  beui: () => import("./preview-beui.css"),
  fluid: () => import("./preview-fluid.css"),
  coss: () => import("./preview-coss.css"),
};
function report(state: string, message?: string) {
  parent.postMessage(
    { type: "super-ui-preview", id, state, message },
    location.origin,
  );
  document.documentElement.dataset.previewState = state;
  if (message) document.documentElement.dataset.previewError = message;
}
window.addEventListener("error", (e) => report("error", e.message));
window.addEventListener("unhandledrejection", (e) =>
  report("error", String(e.reason)),
);
class Boundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  componentDidCatch(e: Error) {
    report("error", e.message);
  }
  render() {
    return this.state.error ? (
      <div className="preview-error" role="alert">
        <p>Unable to load this preview.</p>
        <button onClick={() => location.reload()}>Reload preview</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
const Demo = lazy(async () => {
  await (styles[library as keyof typeof styles]?.() ||
    import("./preview-base.css"));
  const load = modules[library as keyof typeof modules];
  if (!load) throw new Error("Unknown library");
  const m = await load();
  const Preview = m.previews[id];
  if (!Preview) throw new Error("Missing demo " + id);
  return {
    default: function ReadyPreview() {
      useEffect(() => {
        report("loaded");
        if (!capture) return;
        let cancelled = false;
        const ready = async () => {
          await document.fonts.ready;
          await Promise.all(
            Array.from(document.images)
              .filter((image) => {
                const bounds = image.getBoundingClientRect();
                return bounds.bottom > 0 && bounds.top < innerHeight;
              })
              .map((image) => image.decode().catch(() => {})),
          );
          if (!cancelled)
            setTimeout(() => {
              if (!cancelled)
                document.documentElement.dataset.thumbnailReady = "true";
            }, 1800);
        };
        void ready();
        return () => {
          cancelled = true;
        };
      }, []);
      return <Preview dark={dark} />;
    },
  };
});
createRoot(document.getElementById("root")!).render(
  <Boundary>
    <Suspense
      fallback={
        <div className="preview-loading" role="status">
          Loading preview…
        </div>
      }
    >
      <MotionConfig reducedMotion="user">
        <main className={`preview-root ${library}-root`}>
          <Demo />
        </main>
      </MotionConfig>
    </Suspense>
  </Boundary>,
);
