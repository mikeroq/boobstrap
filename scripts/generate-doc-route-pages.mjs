import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { docsPages } from "../src/docs-pages.js";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const distRoot = resolve(projectRoot, "dist");
const docsTemplate = await readFile(resolve(distRoot, "docs/index.html"), "utf8");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const replaceMeta = (html, attribute, name, content) => html.replace(
  new RegExp(`(<meta\\s+${attribute}="${name}"\\s+content=")[^"]*("\\s*/?>)`),
  `$1${escapeHtml(content)}$2`,
);

const renderNavigationState = (html, path) => {
  let rendered = html.replace(`href="${path}"`, `href="${path}" aria-current="page"`);
  const disclosure = ["tables", "forms"].find((section) => path === `/docs/components/${section}` || path.startsWith(`/docs/components/${section}/`));
  if (!disclosure) return rendered;

  rendered = rendered.replace(
    `aria-expanded="false" aria-controls="docs-${disclosure}-submenu"`,
    `aria-expanded="true" aria-controls="docs-${disclosure}-submenu"`,
  );
  return rendered.replace(
    `id="docs-${disclosure}-submenu" data-nav-submenu hidden`,
    `id="docs-${disclosure}-submenu" data-nav-submenu`,
  );
};

const renderRoutePage = (config) => {
  const pageTitle = `${config.title} — Boobstrap`;
  const canonicalUrl = `https://boobstrap.org${config.path}`;
  let html = docsTemplate;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/, `$1${canonicalUrl}$2`);
  html = replaceMeta(html, "name", "description", config.description);
  html = replaceMeta(html, "property", "og:title", pageTitle);
  html = replaceMeta(html, "property", "og:description", config.description);
  html = replaceMeta(html, "property", "og:url", canonicalUrl);
  html = replaceMeta(html, "name", "twitter:title", pageTitle);
  html = replaceMeta(html, "name", "twitter:description", config.description);
  return renderNavigationState(html, config.path);
};

let generatedCount = 0;
for (const config of docsPages) {
  if (config.standalone) continue;
  const outputDirectory = resolve(distRoot, ...config.path.slice(1).split("/"));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(resolve(outputDirectory, "index.html"), renderRoutePage(config));
  generatedCount += 1;
}

console.log(`Generated ${generatedCount} route-specific documentation pages.`);
