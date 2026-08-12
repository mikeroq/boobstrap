import { docsOverview, docsPageForPath, normalizeDocsPath } from "../docs-pages.js";

const contentLoaders = import.meta.glob("./content/*.html", {
  query: "?raw",
  import: "default",
});

export const docsRouteForPath = (pathname) => {
  const normalizedPath = normalizeDocsPath(pathname);
  if (normalizedPath === docsOverview.path) return docsOverview;
  return docsPageForPath(normalizedPath) ?? docsOverview;
};

export const loadDocsContent = async (sectionId) => {
  const load = contentLoaders[`./content/${sectionId}.html`];
  if (!load) throw new Error(`Missing documentation content for ${sectionId}.`);
  return load();
};

const textFromMarkup = (markup) => markup
  .replace(/<a\b[^>]*class="docs-heading-anchor"[^>]*>[\s\S]*?<\/a>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"')
  .replace(/\s+/g, " ")
  .trim();

export const outlineForContent = (content, route) => {
  if (route.sectionId === "overview") return [{ id: "browse", label: "Browse documentation" }];

  if (route.sectionId === "buttons") {
    return [...content.matchAll(/<section\b[^>]*class="[^"]*docs-section[^"]*"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map(([, id, label]) => ({ id, label: textFromMarkup(label) }));
  }

  const outline = [{ id: route.sectionId, label: "Overview" }];
  const headingPattern = /<h[23]\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/gi;
  for (const [, id, label] of content.matchAll(headingPattern)) {
    if (id === route.sectionId || !id.startsWith(`${route.sectionId}-`)) continue;
    outline.push({ id, label: textFromMarkup(label) });
  }
  return outline;
};
