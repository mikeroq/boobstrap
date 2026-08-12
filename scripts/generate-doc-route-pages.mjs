import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { docsOverview, docsPages } from "../src/docs-pages.js";

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

const renderRoutePage = (config, appMarkup) => {
  const pageTitle = config.path === "/docs" ? "Documentation — Boobstrap" : `${config.title} — Boobstrap`;
  const canonicalUrl = `https://boobstrap.org${config.path}`;
  let html = docsTemplate.replace(
    /(<div id="docs-root">)[\s\S]*(<\/div>\s*<\/body>)/,
    (_match, openingRoot, closingDocument) => `${openingRoot}${appMarkup}${closingDocument}`,
  );
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/, `$1${canonicalUrl}$2`);
  html = replaceMeta(html, "name", "description", config.description);
  html = replaceMeta(html, "property", "og:title", pageTitle);
  html = replaceMeta(html, "property", "og:description", config.description);
  html = replaceMeta(html, "property", "og:url", canonicalUrl);
  html = replaceMeta(html, "name", "twitter:title", pageTitle);
  html = replaceMeta(html, "name", "twitter:description", config.description);
  return html;
};

const vite = await createServer({
  root: projectRoot,
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const { renderDocs } = await vite.ssrLoadModule("/src/docs/entry-server.jsx");
  const development = process.env.VITE_SITE_ENV === "development";
  for (const config of [docsOverview, ...docsPages]) {
    const appMarkup = await renderDocs(config.path, { development });
    const outputDirectory = resolve(distRoot, ...config.path.slice(1).split("/"));
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(resolve(outputDirectory, "index.html"), renderRoutePage(config, appMarkup));
  }
} finally {
  await vite.close();
}

console.log(`Rendered ${docsPages.length + 1} React documentation routes.`);
