import {
  matchesAssessment,
  fitFor,
  traits,
} from "./component-assessment.mjs";
// A varied starting shelf, not a quality or popularity score.
const featured = [
  "rare:folder-component",
  "interior:segmented-control",
  "opensource:coral-glow-background",
  "beui:tilt-card",
  "interior:loading-button",
  "beautiful:thinking-state",
];
const featuredRank = (id) => {
  const index = featured.indexOf(id);
  return index < 0 ? 999 : index;
};
/** @param {any[]} entries
 * @param {{query?:string,category?:string,library?:string,kind?:string,sort?:string,savedOnly?:boolean,saved?:string[],live?:string[],assessments?:Record<string,any>,useCase?:string,style?:string,motion?:string,setup?:string}} options
 */
export function searchCatalog(
  entries,
  {
    query = "",
    category = "",
    library = "",
    kind = "all",
    sort = "recommended",
    savedOnly = false,
    saved = [],
    live = [],
    assessments = {},
    useCase = "",
    style = "",
    motion = "",
    setup = "",
  } = {},
) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const liveSet = new Set(live),
    savedSet = new Set(saved);
  return entries
    .filter(
      (e) =>
        matchesAssessment(assessments[e.id], {
          useCase,
          style,
          motion,
          setup,
        }) &&
        (!category || e.category === category) &&
        (!library || e.library === library) &&
        (!savedOnly || savedSet.has(e.id)) &&
        (kind === "all" ||
          (kind === "live"
            ? liveSet.has(e.id)
            : kind === "restricted"
              ? e.status === "restricted"
              : kind === "thumbnail"
                ? e.status === "thumbnail"
                : !liveSet.has(e.id) && e.status !== "thumbnail")) &&
        words.every((w) =>
          `${e.name} ${e.description} ${e.category} ${e.library} ${e.dependencies.join(" ")} ${Object.entries(
            assessments[e.id]?.properties || {},
          )
            .map(([key, p]) => traits[key]?.options[p.value] || "")
            .join(" ")}`
            .toLowerCase()
            .includes(w),
        ),
    )
    .sort((a, b) => {
      if (sort === "fit" && useCase) {
        const difference =
          (fitFor(assessments[b.id], useCase)?.score ?? -1) -
          (fitFor(assessments[a.id], useCase)?.score ?? -1);
        if (difference) return difference;
      }
      if (sort === "name")
        return (
          a.name.localeCompare(b.name) || a.library.localeCompare(b.library)
        );
      if (sort === "library")
        return (
          a.library.localeCompare(b.library) || a.name.localeCompare(b.name)
        );
      return (
        Number(liveSet.has(b.id)) - Number(liveSet.has(a.id)) ||
        Number(b.status === "thumbnail") - Number(a.status === "thumbnail") ||
        featuredRank(a.id) - featuredRank(b.id) ||
        a.name.localeCompare(b.name)
      );
    });
}
export function readSaved(storage) {
  try {
    const value = JSON.parse(storage.getItem("super-ui:saved") || "[]");
    return Array.isArray(value)
      ? value.filter((x) => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}
