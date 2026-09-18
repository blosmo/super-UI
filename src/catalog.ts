import data from "./data/catalog.json";
import libraryData from "./data/libraries.json";
import imports from "./data/imports.json";
export type Entry = {
  id: string;
  slug: string;
  name: string;
  library: string;
  url: string;
  description: string;
  category: string;
  dependencies: string[];
  status: string;
  thumbnail?: string;
  sourceUrl?: string;
};
import hiddenLibraries from "./data/hidden-libraries.json";

// Keep pending libraries in the internal index so approval can restore them.
export const libraries = libraryData.filter(
  (library) => !hiddenLibraries.includes(library.id),
);
export const catalog = (data as Entry[]).filter(
  (entry) => !hiddenLibraries.includes(entry.library),
);
export { imports };
export const libraryMap = Object.fromEntries(libraries.map((l) => [l.id, l]));
export const categories = [
  "Buttons",
  "Navigation",
  "Inputs",
  "Feedback",
  "AI & chat",
  "Images & media",
  "Text & motion",
  "Backgrounds",
  "Overlays",
  "Data display",
  "Cards & layout",
];
