import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const cssPath = resolve(root, "node_modules/@boobstrap/boobstrap/dist/boobstrap.css");
const referencePath = resolve(root, "src/docs/content/class-reference.html");
const tokenReferencePath = resolve(root, "src/docs/content/tokens.html");
const themingPath = resolve(root, "src/docs/content/theming.html");
const countPaths = [
  resolve(root, "src/docs/content/overview.html"),
  resolve(root, "src/docs/content/introduction.html"),
];
const checkOnly = process.argv.includes("--check");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const css = await readFile(cssPath, "utf8");
const classes = [...new Set(
  [...css.matchAll(/\.([a-z][a-z0-9-]*)/gi)]
    .map((match) => match[1])
    .filter((name) => name.startsWith("bs-")),
)].sort();
const tokenBlock = css.match(/:root\s*,\s*\[data-bs-theme=["']dark["']\]\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const tokens = [...tokenBlock.matchAll(/^\s*(--bs-[a-z0-9-]+)\s*:\s*([^;]+);/gmi)]
  .map(([, name, value]) => ({ name, value: value.trim() }));

const declarations = new Map();
for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const selectors = match[1];
  const body = match[2].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  if (!body) continue;
  for (const className of classes) {
    if (declarations.has(className)) continue;
    const pattern = new RegExp(`\\.${className}(?![a-z0-9-])`, "i");
    if (pattern.test(selectors)) declarations.set(className, body);
  }
}

const rows = classes.map((className) => {
  const declaration = declarations.get(className) ?? "See component guidance.";
  return `<div class="reference-row bs-reference-row"><div class="reference-name bs-reference-name"><code class="bs-code-inline">.${className}</code></div><div class="reference-value bs-reference-value">${escapeHtml(declaration)}</div></div>`;
}).join("");
const generatedReference = `<div class="docs-class-groups" data-class-reference=""><section class="reference-group"><h3>All public classes<span class="reference-count">${classes.length}</span></h3><div class="reference-list bs-reference-list">${rows}</div></section></div>`;
const tokenGroups = [
  ["Palette", (name) => name === "--bs-white" || name.startsWith("--bs-brand-") || name.startsWith("--bs-plum-")],
  ["Semantic colors", (name) => name.startsWith("--bs-color-")],
  ["Typography", (name) => name.startsWith("--bs-font-") || name.startsWith("--bs-line-height-")],
  ["Spacing", (name) => name.startsWith("--bs-space-")],
  ["Radius", (name) => name.startsWith("--bs-radius-")],
  ["Effects", (name) => name.startsWith("--bs-shadow-") || name.startsWith("--bs-gradient-")],
  ["Containers", (name) => name.startsWith("--bs-container-")],
  ["Breakpoints", (name) => name.startsWith("--bs-breakpoint-")],
  ["Z-index", (name) => name.startsWith("--bs-z-")],
  ["Control sizes", (name) => name.startsWith("--bs-control-size-") || name.startsWith("--bs-control-block-size") || name.startsWith("--bs-control-padding") || name.startsWith("--bs-control-radius")],
  ["Button sizes", (name) => name.startsWith("--bs-btn-size-") || name.startsWith("--bs-btn-block-size") || name.startsWith("--bs-btn-padding-inline") || name.startsWith("--bs-btn-radius")],
  ["Component customization", (name) => name.startsWith("--bs-card-") || name.startsWith("--bs-dialog-") || name.startsWith("--bs-drawer-") || name.startsWith("--bs-alert-") || name.startsWith("--bs-banner-") || name.startsWith("--bs-toast-") || name.startsWith("--bs-sidebar-") || name.startsWith("--bs-progress-") || name.startsWith("--bs-skeleton-") || name.startsWith("--bs-avatar-") || name.startsWith("--bs-badge-") || name.startsWith("--bs-floating-") || name.startsWith("--bs-table-")],
  ["Overlay", (name) => name.startsWith("--bs-overlay-")],
  ["Motion", (name) => name.startsWith("--bs-duration-") || name.startsWith("--bs-ease-")],
  ["Scrollbars", (name) => name.startsWith("--bs-scrollbar-")],
];
const tokenHasSwatch = (name) => name === "--bs-white"
  || name.startsWith("--bs-brand-")
  || name.startsWith("--bs-plum-")
  || name.startsWith("--bs-color-")
  || name.startsWith("--bs-gradient-");
const generatedTokenReference = `<div class="docs-token-groups" data-token-reference="">${tokenGroups.map(([title, includes]) => {
  const groupTokens = tokens.filter(({ name }) => includes(name));
  const tokenRows = groupTokens.map(({ name, value }) => {
    const swatch = tokenHasSwatch(name) ? `<span class="token-swatch token-swatch-${name.slice(5)}"></span>` : "";
    return `<div class="reference-row bs-reference-row"><div class="reference-name bs-reference-name">${swatch}<code class="bs-code-inline">${name}</code></div><div class="reference-value bs-reference-value">${escapeHtml(value)}</div></div>`;
  }).join("");
  return `<section class="reference-group"><h3>${title}<span class="reference-count">${groupTokens.length}</span></h3><div class="reference-list bs-reference-list">${tokenRows}</div></section>`;
}).join("")}</div>`;

const synchronize = async (path, transform) => {
  const current = await readFile(path, "utf8");
  const next = transform(current);
  if (current === next) return false;
  if (checkOnly) throw new Error(`${path} is out of sync. Run npm run docs:sync-reference.`);
  await writeFile(path, next);
  return true;
};

await synchronize(referencePath, (source) => {
  const startMarker = '<div class="docs-class-groups" data-class-reference="">';
  const endMarker = "\n          </section>";
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error("Could not find the class-reference generation boundary.");
  return `${source.slice(0, start)}${generatedReference}${source.slice(end)}`;
});

await synchronize(tokenReferencePath, (source) => {
  const startMarker = '<div class="docs-token-groups" data-token-reference="">';
  const endMarker = "\n          </section>";
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error("Could not find the token-reference generation boundary.");
  return `${source.slice(0, start)}${generatedTokenReference}${source.slice(end)}`;
});

await synchronize(themingPath, (source) => source.replace(
  /(<td data-bs-theme="dark" data-bs-palette="[^"]+" data-color-token-cell="" data-token="--bs-color-primary-contrast">[\s\S]*?<code>)[^<]+(<\/code>)/g,
  "$1#ffffff$2",
));

for (const path of countPaths) {
  await synchronize(path, (source) => source.replace(
    /(<strong data-class-count="">)\d+(<\/strong> classes)/,
    `$1${classes.length}$2`,
  ).replace(
    /(<strong data-token-count="">)\d+(<\/strong> tokens)/,
    `$1${tokens.length}$2`,
  ));
}

console.log(`${checkOnly ? "Verified" : "Generated"} documentation for ${classes.length} framework classes and ${tokens.length} tokens.`);
