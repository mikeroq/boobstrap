import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const cssPath = resolve(root, "node_modules/@boobstrap/boobstrap/dist/boobstrap.css");
const referencePath = resolve(root, "src/docs/content/class-reference.html");
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

for (const path of countPaths) {
  await synchronize(path, (source) => source.replace(
    /(<strong data-class-count="">)\d+(<\/strong> classes)/,
    `$1${classes.length}$2`,
  ));
}

console.log(`${checkOnly ? "Verified" : "Generated"} documentation for ${classes.length} framework classes.`);
