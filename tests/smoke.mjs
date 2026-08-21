import { spawn } from "node:child_process";
import { mkdir, readFile, readdir } from "node:fs/promises";
import { createServer } from "node:net";
import { chromium } from "playwright";
import { docsPages } from "../src/docs-pages.js";
import { socialCardForPath, socialCards } from "../src/social-cards.js";

const port = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    probe.close(() => resolve(address.port));
  });
});
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn("./node_modules/.bin/vite", ["preview", "--host", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Preview server did not start in time");
}

const dimensionsFor = (page) => page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));

const browser = await chromium.launch({ headless: true });
const failures = [];
const docsContentFiles = await readdir("src/docs/content");
const docsWithIntentionalDiagrams = new Set(["native-elements.html"]);
for (const file of docsContentFiles.filter((name) => name.endsWith(".html"))) {
  const source = await readFile(`src/docs/content/${file}`, "utf8");
  if (!docsWithIntentionalDiagrams.has(file) && /(?:<svg\b|&lt;svg\b)/iu.test(source)) {
    failures.push(`${file}: hand-authored SVG found; documentation interface icons must use Lucide`);
  }
  const copyReadyButtons = source.match(/&lt;button\b(?:(?!&lt;\/button&gt;)[\s\S])*?&lt;\/button&gt;/giu) ?? [];
  if (copyReadyButtons.some((button) => (
    /(?:\bdata-bs-[a-z0-9-]*dismiss\b|\baria-label="(?:close|dismiss)\b)/iu.test(button)
    && /&gt;\s*×\s*&lt;\/button&gt;/u.test(button)
  ))) {
    failures.push(`${file}: hand-authored close glyph found; copy-ready documentation buttons must use Lucide`);
  }
}
const frameworkCss = await readFile("node_modules/@boobstrap/boobstrap/dist/boobstrap.css", "utf8");
const expectedClasses = new Set(
  [...frameworkCss.matchAll(/\.([a-z][a-z0-9-]*)/gi)]
    .map((match) => match[1])
    .filter((name) => name.startsWith("bs-")),
);
const tokenBlock = frameworkCss.match(/:root\s*,\s*\[data-bs-theme=["']dark["']\]\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const expectedTokenNames = [...tokenBlock.matchAll(/(--bs-[a-z0-9-]+)\s*:/g)].map(([, name]) => name);
const expectedTokens = expectedTokenNames.length;
const expectedBrandTokens = expectedTokenNames.filter((name) => name.startsWith("--bs-brand-"));
const expectedSemanticColorTokens = expectedTokenNames.filter((name) => name.startsWith("--bs-color-"));
const expectedThemeColorRows = expectedBrandTokens.length + (expectedSemanticColorTokens.length * 2);
const expectedThemeColorCells = expectedThemeColorRows * 5;
const npmPackageUrl = "https://www.npmjs.com/package/@boobstrap/boobstrap";
const landingSocialCard = socialCardForPath("/");
const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const expectedFormExampleCounts = {
  forms: 2,
  "form-inputs": 7,
  "form-input-groups": 5,
  "form-selects": 4,
  "form-searchable-select": 1,
  "form-date-time": 5,
  "form-native-controls": 3,
  "form-passwords-masks": 4,
  "form-checks-radios": 4,
  "form-otp": 1,
};
const expectedTableExampleCounts = {
  tables: 1,
  "table-fundamentals": 2,
  "table-styles": 3,
  "table-pagination": 2,
  "table-datatables": 1,
};
const promotedComponentCoverage = {
  links: ["bs-link", "bs-link-muted", "bs-link-plain", "bs-link-subtle"],
  "native-elements": ["bs-details"],
  navbar: [
    "bs-breadcrumb",
    "bs-nav",
    "bs-nav-group",
    "bs-nav-heading",
    "bs-nav-link",
    "bs-nav-link-subitem",
    "bs-navbar",
    "bs-navbar-brand",
    "bs-navbar-link",
    "bs-navbar-menu",
    "bs-navbar-nav",
    "bs-navbar-actions",
    "bs-navbar-backdrop",
    "bs-navbar-open",
    "bs-navbar-toggle",
    "bs-page-nav",
    "bs-page-nav-context",
    "bs-page-nav-link",
    "bs-page-nav-title",
  ],
  sidebars: [
    "bs-sidebar",
    "bs-sidebar-backdrop",
    "bs-sidebar-collapsible",
    "bs-sidebar-content",
    "bs-sidebar-drawer",
    "bs-sidebar-end",
    "bs-sidebar-floating",
    "bs-sidebar-footer",
    "bs-sidebar-group",
    "bs-sidebar-group-action",
    "bs-sidebar-group-content",
    "bs-sidebar-group-label",
    "bs-sidebar-header",
    "bs-sidebar-inset",
    "bs-sidebar-label",
    "bs-sidebar-layout",
    "bs-sidebar-main",
    "bs-sidebar-menu",
    "bs-sidebar-menu-action",
    "bs-sidebar-menu-badge",
    "bs-sidebar-menu-button",
    "bs-sidebar-menu-button-lg",
    "bs-sidebar-menu-button-sm",
    "bs-sidebar-menu-item",
    "bs-sidebar-menu-sub",
    "bs-sidebar-menu-sub-button",
    "bs-sidebar-menu-sub-item",
    "bs-sidebar-open",
    "bs-sidebar-rail",
    "bs-sidebar-separator",
    "bs-sidebar-skeleton",
    "bs-sidebar-start",
    "bs-sidebar-toc",
    "bs-sidebar-trigger",
  ],
  cards: ["bs-card-action", "bs-card-compact", "bs-card-content", "bs-card-description", "bs-card-footer", "bs-card-header", "bs-card-link", "bs-card-separated", "bs-card-subtle"],
  dialogs: ["bs-alert-dialog", "bs-alert-dialog-danger", "bs-alert-dialog-icon", "bs-alert-dialog-success", "bs-dialog", "bs-dialog-body", "bs-dialog-close", "bs-dialog-description", "bs-dialog-footer", "bs-dialog-fullscreen", "bs-dialog-header", "bs-dialog-height-lg", "bs-dialog-height-sm", "bs-dialog-lg", "bs-dialog-open", "bs-dialog-sm", "bs-dialog-title", "bs-dialog-xl"],
  drawers: ["bs-drawer", "bs-drawer-body", "bs-drawer-close", "bs-drawer-description", "bs-drawer-end", "bs-drawer-footer", "bs-drawer-header", "bs-drawer-lg", "bs-drawer-sm", "bs-drawer-start", "bs-drawer-title", "bs-drawer-xl"],
  "code-windows": ["bs-code-action", "bs-code-header", "bs-code-inline", "bs-code-panel", "bs-code-tab", "bs-code-tabs", "bs-code-tabs-underline"],
  tables: ["bs-table", "bs-table-cell-numeric", "bs-table-responsive"],
  "table-fundamentals": [
    "bs-table",
    "bs-table-cell-actions",
    "bs-table-cell-numeric",
    "bs-table-empty",
    "bs-table-responsive",
    "bs-table-sort",
    "bs-table-sticky-header",
  ],
  "table-styles": [
    "bs-table",
    "bs-table-bordered",
    "bs-table-borderless",
    "bs-table-caption-bottom",
    "bs-table-cell-actions",
    "bs-table-cell-numeric",
    "bs-table-compact",
    "bs-table-hover",
    "bs-table-responsive",
    "bs-table-striped",
  ],
  "table-pagination": [
    "bs-pagination",
    "bs-pagination-ellipsis",
    "bs-pagination-item",
    "bs-pagination-lg",
    "bs-pagination-link",
    "bs-pagination-optional",
    "bs-pagination-sm",
  ],
  "table-datatables": [
    "bs-datatable",
    "bs-table",
    "bs-table-hover",
    "bs-table-striped",
  ],
  lists: ["bs-reference-list", "bs-reference-name", "bs-reference-row", "bs-reference-value", "bs-checklist", "bs-list-group", "bs-list-group-compact", "bs-list-group-content", "bs-list-group-description", "bs-list-group-flush", "bs-list-group-item", "bs-list-group-item-action", "bs-list-group-leading", "bs-list-group-title", "bs-list-group-trailing"],
  avatars: ["bs-avatar", "bs-avatar-excess", "bs-avatar-fallback", "bs-avatar-group", "bs-avatar-image", "bs-avatar-lg", "bs-avatar-sm", "bs-avatar-status", "bs-avatar-status-danger", "bs-avatar-status-warning", "bs-avatar-xl"],
  accordion: [
    "bs-accordion",
    "bs-accordion-item",
    "bs-accordion-header",
    "bs-accordion-trigger",
    "bs-accordion-icon",
    "bs-accordion-panel",
    "bs-accordion-body",
    "bs-accordion-compact",
    "bs-accordion-flush",
  ],
  tabs: ["bs-tab-panel-contained", "bs-tabs-contained", "bs-tabs-pills"],
  progress: [
    "bs-progress",
    "bs-progress-bar",
    "bs-progress-sm",
    "bs-progress-lg",
    "bs-progress-primary",
    "bs-progress-info",
    "bs-progress-success",
    "bs-progress-warning",
    "bs-progress-danger",
    "bs-progress-striped",
    "bs-progress-animated",
    "bs-progress-indeterminate",
  ],
  skeletons: [
    "bs-skeleton",
    "bs-skeleton-text",
    "bs-skeleton-circle",
    "bs-skeleton-media",
    "bs-skeleton-sm",
    "bs-skeleton-lg",
    "bs-skeleton-pulse",
    "bs-skeleton-wave",
  ],
  "empty-state": ["bs-empty", "bs-empty-actions", "bs-empty-compact", "bs-empty-description", "bs-empty-icon", "bs-empty-title"],
  "form-native-controls": ["bs-color", "bs-file", "bs-file-lg", "bs-file-sm", "bs-range"],
  toasts: [
    "bs-toast-region",
    "bs-toast-region-bottom",
    "bs-toast-region-start",
    "bs-toast",
    "bs-toast-info",
    "bs-toast-success",
    "bs-toast-warning",
    "bs-toast-danger",
    "bs-toast-title",
    "bs-toast-message",
    "bs-toast-dismiss",
  ],
  "tooltips-popovers": ["bs-tooltip", "bs-popover", "bs-popover-header", "bs-popover-body", "bs-floating-arrow"],
  theming: ["bs-scrollbar"],
};
const promotedComponentClasses = new Set(Object.values(promotedComponentCoverage).flat());
if (promotedComponentClasses.size !== 211) {
  throw new Error(`Expected documentation coverage for 211 promoted component classes; found ${promotedComponentClasses.size}`);
}
const documentationQualityMinimums = {
  introduction: { examples: 1, code: 1 },
  "whats-new": { code: 2, guidance: true },
  installation: { code: 5, guidance: true },
  starter: { code: 3, guidance: true },
  theming: { examples: 3, code: 7, guidance: true },
  typescript: { code: 7, guidance: true },
  typography: { examples: 2, code: 3, guidance: true },
  links: { examples: 3, code: 3, guidance: true },
  "native-elements": { examples: 4, code: 4, guidance: true },
  layout: { examples: 2, code: 3, guidance: true },
  "responsive-composition": { examples: 1, code: 1, guidance: true },
  buttons: { examples: 9, code: 10 },
  navbar: { examples: 4, code: 4, guidance: true },
  sidebars: { examples: 8, code: 15, guidance: true },
  badges: { examples: 2, code: 3, guidance: true },
  avatars: { examples: 3, code: 3, guidance: true },
  cards: { examples: 5, code: 5, guidance: true },
  dialogs: { examples: 4, code: 8, guidance: true },
  drawers: { examples: 4, code: 6, guidance: true },
  tables: { examples: 1, code: 1, guidance: true },
  "table-fundamentals": { examples: 2, code: 2, guidance: true },
  "table-styles": { examples: 3, code: 3, guidance: true },
  "table-pagination": { examples: 2, code: 2, guidance: true },
  "table-datatables": { examples: 1, code: 3, guidance: true },
  lists: { examples: 3, code: 3, guidance: true },
  alerts: { examples: 3, code: 3, guidance: true },
  accordion: { examples: 2, code: 8, guidance: true },
  banners: { examples: 2, code: 3, guidance: true },
  progress: { examples: 3, code: 3, guidance: true },
  skeletons: { examples: 4, code: 5, guidance: true },
  "empty-state": { examples: 3, code: 3, guidance: true },
  toasts: { examples: 2, code: 5, guidance: true },
  forms: { examples: 2, code: 2 },
  "form-inputs": { examples: 7, code: 7, guidance: true },
  "form-input-groups": { examples: 5, code: 5 },
  "form-selects": { examples: 4, code: 4 },
  "form-searchable-select": { examples: 1, code: 6 },
  "form-date-time": { examples: 5, code: 5 },
  "form-native-controls": { examples: 3, code: 4, guidance: true },
  "form-passwords-masks": { examples: 4, code: 6 },
  "form-checks-radios": { examples: 4, code: 4 },
  "form-otp": { examples: 1, code: 2 },
  "code-windows": { examples: 2, code: 2, guidance: true },
  icons: { examples: 2, code: 4, guidance: true },
  "behavior-layers": { code: 3, guidance: true },
  collapse: { examples: 1, code: 5, guidance: true },
  dropdown: { examples: 1, code: 5, guidance: true },
  tabs: { examples: 3, code: 7, guidance: true },
  "tooltips-popovers": { examples: 2, code: 5, guidance: true },
  "react-adapter": { examples: 1, code: 5, guidance: true },
  "vue-adapter": { examples: 1, code: 5, guidance: true },
  utilities: { examples: 3, code: 3, guidance: true },
  tokens: { examples: 1, code: 1, guidance: true },
  "class-reference": { examples: 1, code: 1, guidance: true },
  accessibility: { examples: 3, code: 3, guidance: true },
};
const adapterComponentCoverage = {
  accordion: ["useAccordion", "useCollapse"],
  buttons: ["useButton"],
  collapse: ["useCollapse"],
  dialogs: ["useDialog"],
  dropdown: ["useDropdown"],
  navbar: ["useNavbar", "bsNavbar"],
  "form-searchable-select": ["useCombobox"],
  tabs: ["useTabs"],
  toasts: ["useToast"],
  "tooltips-popovers": ["useTooltip", "usePopover"],
};

try {
  await waitForServer();
  await mkdir("artifacts", { recursive: true });

  for (const asset of ["/favicon.svg", "/apple-touch-icon.png", "/boobstrap-starter.zip"]) {
    const response = await fetch(`${baseUrl}${asset}`);
    if (!response.ok) failures.push(`${asset}: returned HTTP ${response.status}`);
  }

  const socialImageBodies = new Set();
  for (const card of socialCards) {
    const response = await fetch(`${baseUrl}${card.imagePath}`);
    if (!response.ok) {
      failures.push(`${card.imagePath}: returned HTTP ${response.status}`);
      continue;
    }
    const body = Buffer.from(await response.arrayBuffer());
    socialImageBodies.add(body.toString("base64"));
    if (response.headers.get("content-type") !== "image/png") failures.push(`${card.imagePath}: is not served as image/png`);
    if (body.readUInt32BE(16) !== 1200 || body.readUInt32BE(20) !== 630) {
      failures.push(`${card.imagePath}: is not 1200×630`);
    }
  }
  if (socialImageBodies.size !== socialCards.length) failures.push("social images: one or more routes share identical image output");

  if (socialCardForPath("/not-a-public-route") !== landingSocialCard) {
    failures.push("social metadata: unknown routes do not fall back to the main social image");
  }

  for (const card of socialCards) {
    const response = await fetch(`${baseUrl}${card.path}`);
    if (!response.ok) {
      failures.push(`${card.path}: social metadata page returned HTTP ${response.status}`);
      continue;
    }
    const source = await response.text();
    if (!source.includes(`<meta property="og:image" content="${card.imageUrl}"`)
      || !source.includes(`<meta name="twitter:image" content="${card.imageUrl}"`)) {
      failures.push(`${card.path}: complete production social image metadata is missing`);
    }
  }

  for (const [legacyPath, cleanPath] of [["/docs.html", "/docs"], ["/playground.html", "/playground"]]) {
    const response = await fetch(`${baseUrl}${legacyPath}`, { redirect: "manual" });
    if (response.status !== 308 || response.headers.get("location") !== cleanPath) {
      failures.push(`${legacyPath}: expected a 308 redirect to ${cleanPath}`);
    }
  }

  const docsOverviewSource = await (await fetch(`${baseUrl}/docs`)).text();
  const docsOverviewSocialCard = socialCardForPath("/docs");
  if (!new RegExp(`<strong[^>]*data-token-count(?:="")?[^>]*>${expectedTokens}</strong> tokens`).test(docsOverviewSource)) {
    failures.push(`docs overview: static token count does not match the installed framework (${expectedTokens})`);
  }
  if (!docsOverviewSource.includes(`<meta property="og:image" content="${docsOverviewSocialCard.imageUrl}"`)
    || !docsOverviewSource.includes(`<meta name="twitter:image" content="${docsOverviewSocialCard.imageUrl}"`)) {
    failures.push("docs overview: route-specific social image metadata is missing");
  }

  const playgroundSource = await (await fetch(`${baseUrl}/playground`)).text();
  const playgroundSocialCard = socialCardForPath("/playground");
  if (!playgroundSource.includes(`<meta property="og:image" content="${playgroundSocialCard.imageUrl}"`)
    || !playgroundSource.includes(`<meta name="twitter:image" content="${playgroundSocialCard.imageUrl}"`)) {
    failures.push("playground: route-specific social image metadata is missing");
  }

  for (const { path, title, description } of docsPages) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) failures.push(`${path}: returned HTTP ${response.status}`);
    const source = await response.text();
    const pageTitle = `${title} — Boobstrap`;
    const canonicalUrl = `https://boobstrap.org${path}`;
    const socialCard = socialCardForPath(path);
    if (!source.includes(`<title>${escapeHtml(pageTitle)}</title>`)) failures.push(`${path}: raw HTML has the wrong page title`);
    if (!source.includes(`<meta property="og:title" content="${escapeHtml(pageTitle)}"`)) failures.push(`${path}: raw HTML has the wrong Open Graph title`);
    if (!source.includes(`<meta property="og:description" content="${escapeHtml(description)}"`)) failures.push(`${path}: raw HTML has the wrong Open Graph description`);
    if (!source.includes(`<meta property="og:url" content="${canonicalUrl}"`)) failures.push(`${path}: raw HTML has the wrong Open Graph URL`);
    if (!source.includes(`<meta property="og:image" content="${socialCard.imageUrl}"`)) failures.push(`${path}: raw HTML has the wrong route-specific Open Graph image`);
    if (!source.includes(`<meta property="og:image:alt" content="${escapeHtml(socialCard.imageAlt)}"`)) failures.push(`${path}: raw HTML has the wrong Open Graph image alt text`);
    if (!source.includes(`<meta name="twitter:title" content="${escapeHtml(pageTitle)}"`)) failures.push(`${path}: raw HTML has the wrong Twitter title`);
    if (!source.includes(`<meta name="twitter:image" content="${socialCard.imageUrl}"`)) failures.push(`${path}: raw HTML has the wrong route-specific Twitter image`);
    if (!source.includes(`<meta name="twitter:image:alt" content="${escapeHtml(socialCard.imageAlt)}"`)) failures.push(`${path}: raw HTML has the wrong Twitter image alt text`);
    if (!source.includes(`<link rel="canonical" href="${canonicalUrl}"`)) failures.push(`${path}: raw HTML has the wrong canonical URL`);
    const currentLinkPattern = new RegExp(`<a[^>]*(?:href="${path}"[^>]*aria-current="page"|aria-current="page"[^>]*href="${path}")[^>]*>`);
    if (!currentLinkPattern.test(source)) failures.push(`${path}: raw HTML does not identify the current navigation link before JavaScript`);
    const disclosure = ["tables", "forms"].find((section) => path === `/docs/components/${section}` || path.startsWith(`/docs/components/${section}/`));
    if (disclosure && (!source.includes(`aria-expanded="true" aria-controls="docs-${disclosure}-submenu"`)
      || source.includes(`id="docs-${disclosure}-submenu" data-nav-submenu hidden`))) {
      failures.push(`${path}: raw HTML does not expose its active navigation submenu before JavaScript`);
    }
    const slashResponse = await fetch(`${baseUrl}${path}/`, { redirect: "manual" });
    if (slashResponse.status !== 308 || slashResponse.headers.get("location") !== path) {
      failures.push(`${path}/: expected a 308 redirect to ${path}`);
    }
  }

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1680, height: 940 } });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto(`${baseUrl}/docs/components/tables/styles`, { waitUntil: "load" });
  const initialNavigationStyle = await noScriptPage.locator(".docs-nav a").first().evaluate((link) => ({
    display: getComputedStyle(link).display,
    minBlockSize: getComputedStyle(link).minBlockSize,
    paddingInline: getComputedStyle(link).paddingInline,
  }));
  if (await noScriptPage.locator(".docs-nav a:not(.bs-nav-link)").count() !== 0
    || initialNavigationStyle.display !== "flex"
    || initialNavigationStyle.minBlockSize !== "36px"
    || initialNavigationStyle.paddingInline === "0px") {
    failures.push(`docs initial render: navigation links are unstyled before JavaScript (${JSON.stringify(initialNavigationStyle)})`);
  }
  if (!await noScriptPage.locator("#docs-tables-submenu").isVisible()
    || await noScriptPage.locator('.docs-nav a[href="/docs/components/tables/styles"]').getAttribute("aria-current") !== "page") {
    failures.push("docs initial render: current table navigation state is missing before JavaScript");
  }
  if ((await noScriptPage.locator(".docs-content > .docs-component-hero > h1").textContent())?.trim() !== "Table styles") {
    failures.push("docs initial render: route content is not server-rendered before JavaScript");
  }
  await noScriptContext.close();

  for (const viewport of [
    { name: "desktop", width: 1680, height: 940 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.screenshot({ path: `artifacts/${viewport.name}.png`, fullPage: true });

    const titleVisible = await page.locator("h1#hero-heading").isVisible();
    const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute("href");
    const faviconUrl = await page.locator('link[rel="icon"]').getAttribute("href");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    const npmUrl = await page.getByRole("link", { name: "v0.5.0 npm package", exact: true }).getAttribute("href");
    const docsUrl = await page.getByRole("link", { name: "Read the docs", exact: true }).getAttribute("href");
    const playgroundUrl = await page.getByRole("link", { name: "Open playground", exact: true }).getAttribute("href");
    const dimensions = await dimensionsFor(page);

    if (!titleVisible) failures.push(`${viewport.name}: hero title is not visible`);
    if (canonicalUrl !== "https://boobstrap.org/") failures.push(`${viewport.name}: landing canonical URL is incorrect`);
    if (faviconUrl !== "/favicon.svg") failures.push(`${viewport.name}: landing favicon is incorrect`);
    if (ogImage !== landingSocialCard.imageUrl) failures.push(`${viewport.name}: landing OG image is incorrect`);
    if (twitterCard !== "summary_large_image") failures.push(`${viewport.name}: landing Twitter card is incorrect`);
    if (npmUrl !== npmPackageUrl) failures.push(`${viewport.name}: landing npm link is incorrect`);
    if (docsUrl !== "/docs/getting-started/installation") failures.push(`${viewport.name}: landing docs CTA is incorrect`);
    if (playgroundUrl !== "/playground") failures.push(`${viewport.name}: landing playground CTA is incorrect`);
    if (!await page.getByRole("link", { name: "Docs", exact: true }).first().isVisible()) {
      failures.push(`${viewport.name}: primary Docs navigation is not visible`);
    }
    if (await page.locator(".component-catalog > a").count() !== 6) failures.push(`${viewport.name}: landing component catalog is incomplete`);
    if (await page.locator(".behavior-grid > a").count() !== 4) failures.push(`${viewport.name}: landing behavior choices are incomplete`);
    if (await page.locator("[data-signup-form]").count() !== 0) failures.push(`${viewport.name}: simulated signup form remains on landing page`);
    if (await page.locator("[data-dev-banner]").count() !== 0) failures.push(`${viewport.name}: development banner remains in the production build`);
    if (!await page.locator("[data-starter-download]").isVisible()) failures.push(`${viewport.name}: starter download is not visible`);
    if (dimensions.scrollWidth > dimensions.clientWidth + 1) {
      failures.push(`${viewport.name}: horizontal overflow (${dimensions.scrollWidth}px > ${dimensions.clientWidth}px)`);
    }
    if (consoleErrors.length) failures.push(`${viewport.name}: ${consoleErrors.join("; ")}`);

    if (viewport.name === "desktop") {
      const pnpmTab = page.getByRole("tab", { name: "pnpm", exact: true });
      await pnpmTab.click();
      if (await page.locator("[data-install-command-output]").textContent() !== "pnpm add @boobstrap/boobstrap") {
        failures.push("desktop: landing package-manager tabs did not update");
      }
      await page.getByRole("button", { name: "Copy pnpm installation command" }).click();
      if (await page.evaluate(() => navigator.clipboard.readText()) !== "pnpm add @boobstrap/boobstrap") {
        failures.push("desktop: landing install command did not copy");
      }
      await pnpmTab.press("ArrowRight");
      if (await page.getByRole("tab", { name: "Yarn", exact: true }).getAttribute("aria-selected") !== "true") {
        failures.push("desktop: landing package-manager tabs are not keyboard operable");
      }
    }
    await page.close();

    const docsPage = await browser.newPage({ viewport });
    await docsPage.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    const docsConsoleErrors = [];
    docsPage.on("console", (message) => {
      if (message.type() === "error") docsConsoleErrors.push(message.text());
    });
    docsPage.on("pageerror", (error) => docsConsoleErrors.push(error.message));

    await docsPage.goto(`${baseUrl}/docs`, { waitUntil: "networkidle" });
    await docsPage.screenshot({ path: `artifacts/docs-${viewport.name}.png`, fullPage: true });
    const docsDimensions = await dimensionsFor(docsPage);
    if (await docsPage.locator('link[rel="canonical"]').getAttribute("href") !== "https://boobstrap.org/docs") {
      failures.push(`${viewport.name}: docs overview canonical URL is incorrect`);
    }
    if (!await docsPage.getByRole("heading", { name: "Browse by topic", level: 2 }).isVisible()) {
      failures.push(`${viewport.name}: docs directory is not visible`);
    }
    if (await docsPage.locator("[data-dev-banner]").count() !== 0) failures.push(`${viewport.name}: development banner remains in production docs`);
    if (await docsPage.locator(".docs-directory-grid a").count() !== docsPages.length) {
      failures.push(`${viewport.name}: docs directory does not link every topic`);
    }
    if (await docsPage.locator(".docs-content > .docs-section:visible").count() !== 1) {
      failures.push(`${viewport.name}: docs overview still exposes routed detail sections`);
    }
    if (await docsPage.getByRole("tab", { name: "Preview", exact: true }).count() !== 0) {
      failures.push(`${viewport.name}: docs overview retained preview/code tabs`);
    }
    if (docsDimensions.scrollWidth > docsDimensions.clientWidth + 1) {
      failures.push(`${viewport.name}: docs overview horizontal overflow`);
    }
    if (viewport.name === "desktop") {
      if (await docsPage.locator("#docs-sidebar.bs-sidebar.bs-sidebar-start.bs-sidebar-drawer").count() !== 1) failures.push("desktop: documentation sidebar is not using the framework component");
      if (await docsPage.locator("#docs-sidebar > .bs-sidebar-header").count() !== 1 || await docsPage.locator("#docs-sidebar > .bs-sidebar-content").count() !== 1) failures.push("desktop: documentation sidebar is not using fixed header and scrolling content regions");
      const desktopSidebarGeometry = await docsPage.locator("#docs-sidebar").evaluate((sidebar) => {
        const content = sidebar.querySelector(":scope > .bs-sidebar-content");
        const sidebarRect = sidebar.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        return {
          shellClipsRegions: getComputedStyle(sidebar).overflowY === "hidden",
          navigationOwnsScroll: ["auto", "scroll"].includes(getComputedStyle(content).overflowY),
          scrollbarMeetsSidebarEdge: Math.abs(sidebarRect.right - contentRect.right) <= 1,
          sidebarMeetsViewportStart: Math.abs(sidebarRect.left) <= 1,
        };
      });
      if (!Object.values(desktopSidebarGeometry).every(Boolean)) {
        failures.push(`desktop: documentation scrollbar is inset from the sidebar edge (${JSON.stringify(desktopSidebarGeometry)})`);
      }
      if (await docsPage.locator(".docs-on-this-page.bs-sidebar.bs-sidebar-end.bs-sidebar-toc").count() !== 1) failures.push("desktop: on-this-page rail is not using the framework component");
      const formsDisclosure = docsPage.locator('[data-nav-prefix="/docs/components/forms"]');
      const formsToggle = formsDisclosure.locator("[data-nav-disclosure-toggle]");
      const tablesDisclosure = docsPage.locator('[data-nav-prefix="/docs/components/tables"]');
      const tablesToggle = tablesDisclosure.locator("[data-nav-disclosure-toggle]");
      if (await formsToggle.getAttribute("aria-expanded") !== "false" || await docsPage.locator("#docs-forms-submenu").isVisible()) {
        failures.push("desktop: Forms navigation is expanded outside the Forms section");
      }
      if (await tablesToggle.getAttribute("aria-expanded") !== "false" || await docsPage.locator("#docs-tables-submenu").isVisible()) {
        failures.push("desktop: Tables navigation is expanded outside the Tables section");
      }
      const docsNavRhythm = await docsPage.locator(".docs-nav-group > a, .docs-nav-group > .docs-nav-disclosure > .docs-nav-disclosure-row > a").evaluateAll((links) => ({
        heights: links.map((link) => link.getBoundingClientRect().height),
        gaps: links.slice(1).map((link, index) => link.getBoundingClientRect().top - links[index].getBoundingClientRect().bottom),
      }));
      if (docsNavRhythm.heights.length < 2 || docsNavRhythm.heights.some((height) => Math.abs(height - docsNavRhythm.heights[0]) > 0.5)) failures.push("desktop: documentation links do not share one sidebar row height");
      if (docsNavRhythm.gaps.some((gap) => gap < 1)) failures.push("desktop: documentation links do not preserve visible row spacing");
      await docsPage.keyboard.press("/");
      await docsPage.getByLabel("Filter documentation sections").fill("cards");
      if (!await docsPage.locator('.docs-nav a[href="/docs/components/cards"]').isVisible()) {
        failures.push("desktop: multi-page docs filter hid its match");
      }
      if (await docsPage.locator('.docs-nav a[href="/docs/components/buttons"]').isVisible()) {
        failures.push("desktop: multi-page docs filter retained a non-match");
      }
      await docsPage.getByLabel("Filter documentation sections").press("Escape");
      await docsPage.getByLabel("Filter documentation sections").fill("one-time password");
      if (!await docsPage.locator('.docs-nav a[href="/docs/components/forms/otp"]').isVisible()
        || await formsToggle.getAttribute("aria-expanded") !== "true") {
        failures.push("desktop: docs filter did not reveal a matching Forms child page");
      }
      await docsPage.getByLabel("Filter documentation sections").press("Escape");
      if (await formsToggle.getAttribute("aria-expanded") !== "false" || await docsPage.locator("#docs-forms-submenu").isVisible()) {
        failures.push("desktop: clearing the docs filter did not restore the Forms disclosure state");
      }
      await docsPage.keyboard.press("/");
      await docsPage.getByLabel("Filter documentation sections").fill("DataTables.net");
      if (!await docsPage.locator('.docs-nav a[href="/docs/components/tables/datatables"]').isVisible()
        || await tablesToggle.getAttribute("aria-expanded") !== "true") {
        failures.push("desktop: docs filter did not reveal the DataTables.net child page");
      }
      await docsPage.getByLabel("Filter documentation sections").press("Escape");
      if (await tablesToggle.getAttribute("aria-expanded") !== "false" || await docsPage.locator("#docs-tables-submenu").isVisible()) {
        failures.push("desktop: clearing the docs filter did not restore the Tables disclosure state");
      }
      await docsPage.getByRole("button", { name: "Switch to light theme" }).click();
      if (await docsPage.locator("html").getAttribute("data-bs-theme") !== "light") {
        failures.push("desktop: docs theme toggle did not enable light theme");
      }
      const stylesheetCount = await docsPage.locator('link[rel="stylesheet"]').count();
      await docsPage.locator(".docs-header").evaluate((header) => { header.dataset.spaShellMarker = "retained"; });
      await docsPage.locator('.docs-nav a[href="/docs/components/cards"]').click();
      await docsPage.waitForURL(`${baseUrl}/docs/components/cards`);
      await docsPage.getByRole("heading", { name: "Cards", level: 1 }).waitFor();
      if (await docsPage.locator('.docs-header[data-spa-shell-marker="retained"]').count() !== 1
        || await docsPage.locator('link[rel="stylesheet"]').count() !== stylesheetCount) {
        failures.push("desktop: React documentation navigation reloaded the shell or its styles");
      }
    } else {
      const menuToggle = docsPage.getByRole("button", { name: "Open documentation menu" });
      const mobileSidebar = docsPage.locator("#docs-sidebar");
      if (!await docsPage.locator("[data-nav-disclosure-toggle]").evaluateAll((toggles) => toggles.every((toggle) => toggle.getAttribute("aria-expanded") === "false"))) {
        failures.push("mobile: a nested navigation family is expanded outside its section");
      }
      await docsPage.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await menuToggle.click();
      if (!await mobileSidebar.isVisible() || await mobileSidebar.getAttribute("data-bs-state") !== "open") failures.push("mobile: docs menu did not open through the sidebar controller");
      if (await menuToggle.getAttribute("aria-expanded") !== "true" || !await docsPage.locator("body").evaluate((element) => element.classList.contains("bs-sidebar-open"))) failures.push("mobile: docs menu state did not synchronize");
      const closeButton = docsPage.locator(".docs-sidebar-close");
      await docsPage.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Close documentation menu");
      if (!await closeButton.evaluate((element) => element === document.activeElement)
        || await docsPage.getByLabel("Filter documentation sections").evaluate((element) => element === document.activeElement)) {
        failures.push("mobile: opening the docs menu focused search instead of the close control");
      }
      const drawerGeometry = await mobileSidebar.evaluate((sidebar) => {
        const content = sidebar.querySelector(":scope > .bs-sidebar-content");
        const lastLink = [...content.querySelectorAll("a")].filter((link) => !link.hidden).at(-1);
        const header = document.querySelector(".docs-header");
        content.scrollTop = content.scrollHeight;
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        const headerRect = header.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const lastLinkRect = lastLink.getBoundingClientRect();
        return {
          headerRemainsVisible: headerRect.top >= -1 && headerRect.bottom > 0,
          headerIsFixedWhileScrollLocked: getComputedStyle(header).position === "fixed",
          sidebarMeetsHeader: Math.abs(headerRect.bottom - sidebarRect.top) <= 1,
          sidebarFitsViewport: sidebarRect.bottom <= viewportHeight + 1,
          contentScrolls: content.scrollHeight > content.clientHeight,
          contentReachedBottom: Math.abs(content.scrollHeight - content.clientHeight - content.scrollTop) <= 1,
          lastLinkVisible: lastLinkRect.bottom <= contentRect.bottom + 1,
          scrollbarMeetsSidebarEdge: Math.abs(sidebarRect.right - contentRect.right) <= 1,
        };
      });
      if (!Object.values(drawerGeometry).every(Boolean)) {
        failures.push(`mobile: docs menu does not expose a complete independent scroll region (${JSON.stringify(drawerGeometry)})`);
      }
      await docsPage.screenshot({ path: "artifacts/docs-sidebar-mobile-open.png" });
      await docsPage.keyboard.press("Escape");
      if (await mobileSidebar.getAttribute("data-bs-state") !== "closed" || !await menuToggle.evaluate((element) => element === document.activeElement)) failures.push("mobile: docs menu did not close and restore focus on Escape");
    }
    if (docsConsoleErrors.length) failures.push(`${viewport.name}: docs overview ${docsConsoleErrors.join("; ")}`);
    await docsPage.close();

    const routePage = await browser.newPage({ viewport });
    await routePage.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    let routeErrors = [];
    routePage.on("console", (message) => {
      if (message.type() === "error") routeErrors.push(message.text());
    });
    routePage.on("pageerror", (error) => routeErrors.push(error.message));

    for (const config of docsPages) {
      routeErrors = [];
      const response = await routePage.goto(`${baseUrl}${config.path}`, { waitUntil: "domcontentloaded" });
      await routePage.waitForFunction(() => document.documentElement.classList.contains("js-ready"));
      const routeDimensions = await dimensionsFor(routePage);
      const visibleHeading = routePage.locator(".docs-content > .docs-component-hero > h1:visible, .docs-content > .docs-hero > h1:visible");
      const previews = routePage.locator("[data-component-example]:visible");
      const genericVisibleDemos = routePage.locator(".docs-demo:visible:not([data-theme-configurator])");
      const renderedCode = routePage.locator(".docs-content .docs-code-block pre code");

      if (response?.status() !== 200) failures.push(`${viewport.name}: ${config.path} did not return 200`);
      if (await visibleHeading.count() !== 1 || (await visibleHeading.textContent())?.trim() !== config.title) {
        failures.push(`${viewport.name}: ${config.path} has the wrong page heading`);
      }
      if (await routePage.title() !== `${config.title} — Boobstrap`) {
        failures.push(`${viewport.name}: ${config.path} has the wrong document title`);
      }
      if (await routePage.locator('link[rel="canonical"]').getAttribute("href") !== `https://boobstrap.org${config.path}`) {
        failures.push(`${viewport.name}: ${config.path} has the wrong canonical URL`);
      }
      if (await routePage.locator(`.docs-nav a[href="${config.path}"]`).getAttribute("aria-current") !== "page") {
        failures.push(`${viewport.name}: ${config.path} is not current in the docs navigation`);
      }
      for (const prefix of ["/docs/components/tables", "/docs/components/forms"]) {
        const disclosureExpanded = await routePage.locator(`[data-nav-prefix="${prefix}"] [data-nav-disclosure-toggle]`).getAttribute("aria-expanded");
        const expectsDisclosure = config.path === prefix || config.path.startsWith(`${prefix}/`);
        if (disclosureExpanded !== String(expectsDisclosure)) {
          failures.push(`${viewport.name}: ${config.path} has the wrong ${prefix.split("/").at(-1)} navigation disclosure state`);
        }
      }
      if (config.sectionId === "theming" && await routePage.locator("[data-theme-color-reference] [data-color-token-cell]").count() !== expectedThemeColorCells) {
        failures.push(`${viewport.name}: complete theme color reference does not render all ${expectedThemeColorCells} palette values`);
      }
      if (await routePage.locator("[data-page-nav] a").count() < 1) {
        failures.push(`${viewport.name}: ${config.path} has no local page outline`);
      }
      if (await routePage.locator(".docs-component-pagination a").count() !== 2) {
        failures.push(`${viewport.name}: ${config.path} is missing previous/next documentation links`);
      }
      if (await routePage.locator(".docs-header.bs-navbar").count() !== 1 || await routePage.locator(".docs-nav a:not(.bs-nav-link)").count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} is not using the framework navigation components`);
      }
      if (await routePage.locator(".docs-content [data-lucide]:not(svg)").count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} has a Lucide marker that was not rendered`);
      }
      if (await routePage.locator(".docs-header svg:not(.docs-brand-mark):not(.lucide), .docs-nav svg:not(.lucide), .docs-component-pagination svg:not(.lucide), .docs-footer svg:not(.lucide)").count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} has a hand-authored interface icon in the documentation shell`);
      }
      if (await routePage.locator('.docs-code-block:not(.bs-code-window), .docs-code-label:not(.bs-code-header), .docs-code-label button:not(.bs-code-action), .docs-code-block pre:not(.bs-code-body), pre.bs-code-body:not([tabindex="0"]), pre.bs-code-body:not([aria-label])').count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} has a code sample outside the framework code components`);
      }
      if (await routePage.locator(".docs-table-wrap:not(.bs-table-responsive), .docs-table:not(.bs-table)").count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} has a reference table outside the framework table components`);
      }
      if (await routePage.locator(".docs-component-pagination:not(.bs-page-nav), .docs-component-pagination > a:not(.bs-page-nav-link)").count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} is not using the framework page-navigation component`);
      }
      if (await routePage.getByRole("tab", { name: "Preview", exact: true }).count() !== 0 || await routePage.getByRole("tab", { name: "Code", exact: true }).count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} retained preview/code tabs`);
      }
      if (await renderedCode.count() > 0 && !await renderedCode.evaluateAll((elements) => elements.every((code) => (
        code.classList.contains("hljs")
        && code.dataset.highlighted === "yes"
        && Boolean(code.dataset.highlightLanguage)
      )))) {
        failures.push(`${viewport.name}: ${config.path} has an unhighlighted code block`);
      }
      const pairedExamples = await previews.evaluateAll((elements) => elements.every((preview) => {
        const code = preview.nextElementSibling;
        return code?.classList.contains("docs-code-block") && getComputedStyle(code).display !== "none";
      }));
      if (!pairedExamples) failures.push(`${viewport.name}: ${config.path} does not place visible code below every preview`);
      const qualityMinimums = documentationQualityMinimums[config.sectionId];
      if (!qualityMinimums) {
        failures.push(`${viewport.name}: ${config.path} is missing a documentation quality contract`);
      } else {
        const exampleCount = await previews.count();
        const codeCount = await renderedCode.count();
        if (exampleCount < (qualityMinimums.examples ?? 0)) {
          failures.push(`${viewport.name}: ${config.path} has ${exampleCount} focused examples; expected at least ${qualityMinimums.examples}`);
        }
        if (codeCount < (qualityMinimums.code ?? 0)) {
          failures.push(`${viewport.name}: ${config.path} has ${codeCount} code examples; expected at least ${qualityMinimums.code}`);
        }
        if (qualityMinimums.guidance && await routePage.locator(".docs-example-guidance:visible").count() === 0) {
          failures.push(`${viewport.name}: ${config.path} is missing structured usage guidance`);
        }
      }
      const promotedClasses = promotedComponentCoverage[config.sectionId];
      if (promotedClasses) {
        const apiText = (await routePage.locator(".docs-api").allTextContents()).join(" ");
        const missingClasses = promotedClasses.filter((className) => !apiText.includes(`.${className}`));
        if (missingClasses.length) {
          failures.push(`${viewport.name}: ${config.path} API reference is missing ${missingClasses.map((name) => `.${name}`).join(", ")}`);
        }
      }
      const adapterHooks = adapterComponentCoverage[config.sectionId];
      if (adapterHooks) {
        const source = (await routePage.locator(".docs-content").textContent()) ?? "";
        for (const contract of ["@boobstrap/react", "@boobstrap/vue", ...adapterHooks]) {
          if (!source.includes(contract)) failures.push(`${viewport.name}: ${config.sectionId} is missing colocated adapter contract ${contract}`);
        }
      }
      if (await genericVisibleDemos.count() > 0 && !await genericVisibleDemos.evaluateAll((elements) => elements.every((preview) => (
        ["light", "dark"].includes(preview.dataset.bsTheme)
        && preview.querySelectorAll(":scope > [data-preview-theme-controls]").length === 1
        && preview.querySelectorAll(":scope > [data-preview-theme-controls] [data-preview-theme-option]").length === 2
      )))) {
        failures.push(`${viewport.name}: ${config.path} has a preview without independent light/dark controls`);
      }
      if (config.sectionId in expectedFormExampleCounts && await previews.count() !== expectedFormExampleCounts[config.sectionId]) {
        failures.push(`${viewport.name}: ${config.path} does not expose the expected focused form examples`);
      }
      if (config.sectionId in expectedTableExampleCounts && await previews.count() !== expectedTableExampleCounts[config.sectionId]) {
        failures.push(`${viewport.name}: ${config.path} does not expose the expected focused table examples`);
      }
      if (config.sectionId.startsWith("form") && await routePage.locator('.docs-code-label:has-text("Complete labeled controls"), .docs-code-label:has-text("Complete input groups"), .docs-code-label:has-text("Complete native selects"), .docs-code-label:has-text("Complete date and time controls"), .docs-code-label:has-text("Complete mask examples"), .docs-code-label:has-text("Complete selection controls")').count() > 0) {
        failures.push(`${viewport.name}: ${config.path} retains a grouped form code block`);
      }
      if (routeDimensions.scrollWidth > routeDimensions.clientWidth + 1) {
        failures.push(`${viewport.name}: ${config.path} has horizontal overflow (${routeDimensions.scrollWidth}px > ${routeDimensions.clientWidth}px)`);
      }
      if (routeErrors.length) failures.push(`${viewport.name}: ${config.path} ${routeErrors.join("; ")}`);

      if (config.sectionId.startsWith("form-") && viewport.name === "mobile") {
        await routePage.screenshot({ path: `artifacts/${config.sectionId}-mobile.png`, fullPage: true });
      }

      if (config.sectionId === "sidebars" && viewport.name === "mobile") {
        const drawerTrigger = routePage.getByRole("button", { name: "Toggle documentation menu" });
        const drawer = routePage.locator("#example-sidebar");
        await drawerTrigger.click();
        if (await drawer.getAttribute("data-bs-state") !== "open" || await drawer.getAttribute("role") !== "dialog" || await drawerTrigger.getAttribute("aria-expanded") !== "true") {
          failures.push("mobile: sidebar reference drawer did not synchronize dialog state");
        }
        await routePage.keyboard.press("Escape");
        if (await drawer.getAttribute("data-bs-state") !== "closed" || !await drawerTrigger.evaluate((element) => element === document.activeElement)) {
          failures.push("mobile: sidebar reference drawer did not dismiss and restore focus");
        }
        await routePage.screenshot({ path: "artifacts/sidebar-mobile.png", fullPage: true });
      }

      if (config.sectionId === "sidebars") {
        if (await routePage.locator('#sidebar-shell [style]').count() !== 0) failures.push(`${viewport.name}: complete application shell relies on CSP-blocked inline styles`);
        const shellSidebar = routePage.locator("#sidebar-shell .docs-sidebar-shell-preview > .bs-sidebar-layout > .bs-sidebar-start");
        const shellRegionsAlign = await shellSidebar.evaluate((sidebar) => {
          const sidebarRect = sidebar.getBoundingClientRect();
          const mainRect = sidebar.nextElementSibling.getBoundingClientRect();
          const headerRect = sidebar.querySelector(":scope > .bs-sidebar-header").getBoundingClientRect();
          const footerRect = sidebar.querySelector(":scope > .bs-sidebar-footer").getBoundingClientRect();
          return Math.abs(sidebarRect.height - 480) <= 1
            && Math.abs(mainRect.top - sidebarRect.top) <= 1
            && Math.abs(headerRect.width - sidebarRect.width) <= 1
            && Math.abs(footerRect.width - sidebarRect.width) <= 1
            && Math.abs(footerRect.bottom - sidebarRect.bottom) <= 1;
        });
        if (!shellRegionsAlign) failures.push(`${viewport.name}: complete application shell regions do not remain side by side`);
        if (await routePage.locator("#sidebar-shell .docs-sidebar-shell-header.bs-navbar").count() !== 1
          || await routePage.locator("#sidebar-shell .bs-sidebar-end.bs-sidebar-toc").count() !== 1
          || await routePage.locator("#sidebar-shell svg.bs-icon").count() < 5) {
          failures.push(`${viewport.name}: complete application shell does not mirror the documentation header, rails, and Lucide icon treatment`);
        }
      }

      if (config.sectionId === "cards") {
        const completeCard = routePage.locator("#card-action > .bs-card");
        if (await completeCard.locator(":scope > .bs-card-header + .bs-card-content + .bs-card-footer").count() !== 1
          || await completeCard.locator(":scope > .bs-card-header > .bs-card-title").count() !== 1
          || await completeCard.locator(":scope > .bs-card-header > .bs-card-description").count() !== 1
          || await completeCard.locator(":scope > .bs-card-header > .bs-card-action").count() !== 1) {
          failures.push(`${viewport.name}: complete card does not expose the header, title, description, action, content, and footer contract`);
        }
        if (await routePage.locator("#card-basic .bs-card-header, #card-basic .bs-card-footer").count() !== 0
          || await routePage.locator("#card-header-content .bs-card-footer").count() !== 0) {
          failures.push(`${viewport.name}: optional card header or footer regions are rendered when omitted`);
        }
        const structuredCardLayout = await completeCard.evaluate((card) => {
          const header = card.querySelector(".bs-card-header");
          const action = card.querySelector(".bs-card-action");
          const content = card.querySelector(".bs-card-content");
          const footer = card.querySelector(".bs-card-footer");
          return {
            cardDisplay: getComputedStyle(card).display,
            separated: card.classList.contains("bs-card-separated"),
            headerDisplay: getComputedStyle(header).display,
            headerBorder: getComputedStyle(header).borderBottomStyle,
            actionArea: getComputedStyle(action).gridArea,
            footerDisplay: getComputedStyle(footer).display,
            footerBorder: getComputedStyle(footer).borderTopStyle,
            contentPaddingInline: getComputedStyle(content).paddingInline,
            footerPaddingInline: getComputedStyle(footer).paddingInline,
          };
        });
        if (structuredCardLayout.cardDisplay !== "flex"
          || !structuredCardLayout.separated
          || structuredCardLayout.headerDisplay !== "grid"
          || structuredCardLayout.headerBorder === "none"
          || structuredCardLayout.actionArea !== "action"
          || structuredCardLayout.footerDisplay !== "flex"
          || structuredCardLayout.footerBorder === "none"
          || structuredCardLayout.contentPaddingInline === "0px"
          || structuredCardLayout.contentPaddingInline !== structuredCardLayout.footerPaddingInline) {
          failures.push(`${viewport.name}: structured card layout did not render correctly (${JSON.stringify(structuredCardLayout)})`);
        }
        await routePage.screenshot({ path: `artifacts/cards-${viewport.name}.png`, fullPage: true });
      }

      if (config.sectionId === "dialogs") {
        const trigger = routePage.getByRole("button", { name: "Edit profile" });
        const dialog = routePage.locator("#profile-dialog");
        await trigger.click();
        const dialogLayout = await dialog.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const header = element.querySelector(":scope > .bs-dialog-header");
          const body = element.querySelector(":scope > .bs-dialog-body");
          const footer = element.querySelector(":scope > .bs-dialog-footer");
          return {
            open: element.open && element.dataset.bsState === "open",
            centered: Math.abs((rect.left + rect.width / 2) - (window.innerWidth / 2)) <= 1,
            headerFixed: getComputedStyle(header).flexShrink === "0",
            bodyScrolls: getComputedStyle(body).overflowY === "auto" && getComputedStyle(body).flexGrow === "1",
            footerFixed: getComputedStyle(footer).flexShrink === "0",
            named: element.getAttribute("aria-labelledby") === "profile-dialog-title" && element.getAttribute("aria-describedby") === "profile-dialog-description",
          };
        });
        if (!Object.values(dialogLayout).every(Boolean)) failures.push(`${viewport.name}: complete dialog layout is incomplete (${JSON.stringify(dialogLayout)})`);
        if (!await routePage.locator("body").evaluate((element) => element.classList.contains("bs-dialog-open"))) failures.push(`${viewport.name}: dialog did not lock document scrolling`);
        await routePage.screenshot({ path: `artifacts/dialog-open-${viewport.name}.png` });
        await routePage.keyboard.press("Escape");
        await routePage.waitForFunction(() => !document.querySelector("#profile-dialog").open);
        if (!await trigger.evaluate((element) => element === document.activeElement)) failures.push(`${viewport.name}: dialog did not restore focus after Escape`);

        const staticTrigger = routePage.getByRole("button", { name: "Archive project" });
        const staticDialog = routePage.locator("#archive-dialog");
        await staticTrigger.click();
        await routePage.mouse.click(1, 1);
        if (!await staticDialog.evaluate((element) => element.open)) failures.push(`${viewport.name}: static-backdrop dialog closed from an outside click`);
        await staticDialog.getByRole("button", { name: "Keep project" }).click();
        await routePage.waitForFunction(() => !document.querySelector("#archive-dialog").open);

        const scrollTrigger = routePage.getByRole("button", { name: "Review release" });
        const scrollDialog = routePage.locator("#release-dialog");
        await scrollTrigger.click();
        const scrollRegions = await scrollDialog.evaluate((element) => {
          const body = element.querySelector(".bs-dialog-body");
          body.scrollTop = body.scrollHeight;
          return {
            constrained: element.clientHeight <= (24 * parseFloat(getComputedStyle(document.documentElement).fontSize)) + 1,
            scrollable: body.scrollHeight > body.clientHeight,
            reachedBottom: Math.abs(body.scrollHeight - body.clientHeight - body.scrollTop) <= 1,
          };
        });
        if (!Object.values(scrollRegions).every(Boolean)) failures.push(`${viewport.name}: constrained dialog body does not scroll independently (${JSON.stringify(scrollRegions)})`);
        await scrollDialog.getByRole("button", { name: "Checklist complete" }).click();
      }

      if (config.sectionId === "drawers") {
        const endTrigger = routePage.getByRole("button", { name: "Edit account" });
        const endDrawer = routePage.locator("#account-drawer");
        await endTrigger.click();
        await endDrawer.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
        const endLayout = await endDrawer.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const body = element.querySelector(":scope > .bs-drawer-body");
          const footer = element.querySelector(":scope > .bs-drawer-footer");
          return {
            open: element.open && element.dataset.bsState === "open",
            meetsEnd: Math.abs(rect.right - document.documentElement.clientWidth) <= 1,
            fillsViewport: Math.abs(rect.height - window.innerHeight) <= 1,
            bodyOwnsScroll: getComputedStyle(body).overflowY === "auto" && getComputedStyle(body).flexGrow === "1",
            footerFixed: getComputedStyle(footer).flexShrink === "0" && footer.getBoundingClientRect().bottom <= rect.bottom + 1,
            checkDescriptionStacks: getComputedStyle(element.querySelector(".bs-check-description")).gridColumnStart === "2",
          };
        });
        if (!Object.values(endLayout).every(Boolean)) failures.push(`${viewport.name}: end drawer layout is incomplete (${JSON.stringify(endLayout)})`);
        await routePage.screenshot({ path: `artifacts/drawer-open-${viewport.name}.png` });
        await routePage.mouse.click(1, Math.floor(viewport.height / 2));
        if (!await endDrawer.evaluate((element) => element.open)) failures.push(`${viewport.name}: form drawer closed despite disabled backdrop dismissal`);
        await endDrawer.getByRole("button", { name: "Cancel" }).click();
        await routePage.waitForFunction(() => !document.querySelector("#account-drawer").open);
        if (!await endTrigger.evaluate((element) => element === document.activeElement)) failures.push(`${viewport.name}: drawer dismiss control did not restore focus`);

        const startTrigger = routePage.getByRole("button", { name: "Filter results" });
        const startDrawer = routePage.locator("#filter-drawer");
        await startTrigger.click();
        await startDrawer.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
        if (!await startDrawer.evaluate((element) => Math.abs(element.getBoundingClientRect().left) <= 1)) failures.push(`${viewport.name}: start drawer does not meet the logical start edge`);
        await routePage.keyboard.press("Escape");

        const activityTrigger = routePage.getByRole("button", { name: "View activity" });
        const activityDrawer = routePage.locator("#activity-drawer");
        await activityTrigger.click();
        const activityScroll = await activityDrawer.evaluate((element) => {
          const body = element.querySelector(".bs-drawer-body");
          body.scrollTop = body.scrollHeight;
          return {
            scrollable: body.scrollHeight > body.clientHeight,
            reachedBottom: Math.abs(body.scrollHeight - body.clientHeight - body.scrollTop) <= 1,
          };
        });
        if (!Object.values(activityScroll).every(Boolean)) failures.push(`${viewport.name}: long drawer body does not scroll to its final item (${JSON.stringify(activityScroll)})`);
        await routePage.mouse.click(1, Math.floor(viewport.height / 2));
        await routePage.waitForFunction(() => !document.querySelector("#activity-drawer").open);
        if (!await activityTrigger.evaluate((element) => element === document.activeElement)) failures.push(`${viewport.name}: dismissible drawer backdrop did not close and restore focus`);

        for (const [name, expectedRem] of [["Small", 20], ["Large", 36], ["Custom 32rem", 32]]) {
          await routePage.getByRole("button", { name, exact: true }).click();
          const openDrawer = routePage.locator("dialog.bs-drawer[open]");
          await openDrawer.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
          const width = await openDrawer.evaluate((element) => element.getBoundingClientRect().width);
          const sizing = await routePage.evaluate(() => {
            const styles = getComputedStyle(document.documentElement);
            const rootFontSize = parseFloat(styles.fontSize);
            return { rootFontSize, mobileInset: parseFloat(styles.getPropertyValue("--bs-space-8")) * rootFontSize };
          });
          const maximumWidth = viewport.width <= 640 ? viewport.width - sizing.mobileInset : Infinity;
          if (Math.abs(width - Math.min(expectedRem * sizing.rootFontSize, maximumWidth)) > 2) failures.push(`${viewport.name}: ${name} drawer width is ${width}px`);
          await openDrawer.getByRole("button", { name: "Done" }).click();
        }
      }

      if (config.sectionId in expectedTableExampleCounts) {
        const activeTableSection = routePage.locator(`#${config.sectionId}`);
        const exampleTables = activeTableSection.locator("[data-component-example] table.bs-table");
        const responsiveExamples = activeTableSection.locator("[data-component-example] .bs-table-responsive");
        if (!await exampleTables.evaluateAll((tables) => tables.every((table) => (
          table.querySelector(":scope > caption")
          && [...table.querySelectorAll("th")].every((header) => ["col", "row"].includes(header.getAttribute("scope")))
        )))) {
          failures.push(`${viewport.name}: a table example is missing a caption or scoped header`);
        }
        if (!await responsiveExamples.evaluateAll((wrappers) => wrappers.every((wrapper) => (
          wrapper.getAttribute("role") === "region"
          && wrapper.getAttribute("tabindex") === "0"
          && Boolean(wrapper.getAttribute("aria-label"))
        )))) {
          failures.push(`${viewport.name}: a scrollable table example is not a named keyboard-focusable region`);
        }
      }

      if (config.sectionId === "table-fundamentals") {
        const stickyPosition = await routePage.locator("#table-sticky-sortable thead th").first().evaluate((header) => getComputedStyle(header).position);
        if (stickyPosition !== "sticky") failures.push(`${viewport.name}: sticky table headers did not render`);
      }

      if (config.sectionId === "table-pagination") {
        const paginationPresentation = await routePage.locator("#pagination-dataset").evaluate((example) => {
          const currentPage = example.querySelector('[aria-current="page"]');
          const optionalPage = example.querySelector(".bs-pagination-optional");
          return {
            currentPageBackground: getComputedStyle(currentPage).backgroundColor,
            optionalPageDisplay: getComputedStyle(optionalPage).display,
          };
        });
        if (paginationPresentation.currentPageBackground === "rgba(0, 0, 0, 0)") failures.push(`${viewport.name}: pagination current state did not render`);
        if ((viewport.name === "mobile") !== (paginationPresentation.optionalPageDisplay === "none")) {
          failures.push(`${viewport.name}: optional pagination pages did not follow the mobile visibility contract`);
        }
        if (await routePage.locator("#table-pagination [data-component-example] .bs-pagination").count() !== 3) {
          failures.push(`${viewport.name}: pagination guide does not expose default, small, and large compositions`);
        }
      }

      if (config.sectionId === "table-datatables") {
        const dataTable = routePage.locator("#datatable-customer-directory");
        await dataTable.locator(".dt-container").waitFor();
        const dataTableSearch = dataTable.locator(".dt-search input");
        const dataTableLength = dataTable.locator(".dt-length select");
        const dataTableRows = dataTable.locator("tbody tr");
        const dataTableRegion = dataTable.locator(".dt-layout-table > .dt-layout-cell");
        if (await dataTableRows.count() !== 5 || await dataTable.locator(".dt-info").getAttribute("role") !== "status") {
          failures.push(`${viewport.name}: DataTables did not initialize with five visible rows and live result information`);
        }
        if (await dataTableRegion.getAttribute("role") !== "region"
          || await dataTableRegion.getAttribute("tabindex") !== "0"
          || await dataTableRegion.getAttribute("aria-label") !== "Customer directory results") {
          failures.push(`${viewport.name}: DataTables overflow region is not keyboard accessible and named`);
        }
        await dataTableSearch.fill("Berlin");
        if (await dataTableRows.count() !== 1 || !await dataTableRows.first().textContent().then((text) => text.includes("Noor Hassan"))) {
          failures.push(`${viewport.name}: DataTables search did not filter to the matching customer`);
        }
        await dataTableSearch.fill("");
        await dataTableLength.selectOption("10");
        if (await dataTableRows.count() !== 10) failures.push(`${viewport.name}: DataTables page-length control did not show ten rows`);
        await dataTableLength.selectOption("5");
        await dataTable.locator("thead .dt-column-order").first().click();
        await dataTable.locator("thead th").first().waitFor();
        await routePage.waitForFunction(() => document.querySelector("#datatable-customer-directory thead th")?.getAttribute("aria-sort") === "ascending");
        if (!await dataTableRows.first().textContent().then((text) => text.includes("Alexis Martin"))) {
          failures.push(`${viewport.name}: DataTables column sorting did not reorder customer names`);
        }
        await dataTable.locator('[aria-label="Next"]').click();
        if (!await dataTable.locator(".dt-info").textContent().then((text) => text.includes("6 to 10"))) {
          failures.push(`${viewport.name}: DataTables pagination did not advance to the second page`);
        }
        await routePage.screenshot({ path: `artifacts/table-datatables-${viewport.name}.png`, fullPage: true });
      }

      if (viewport.name !== "desktop") continue;

      if (config.sectionId === "sidebars") {
        const collapseTrigger = routePage.getByRole("button", { name: "Toggle example sidebar", exact: true });
        const collapsible = routePage.locator("#collapse-example-sidebar");
        await collapseTrigger.click();
        await routePage.waitForTimeout(300);
        if (await collapsible.getAttribute("data-bs-state") !== "collapsed" || await collapseTrigger.getAttribute("aria-expanded") !== "false") {
          failures.push("desktop: sidebar reference did not collapse through its public controller");
        }
        if (await collapsible.locator(".bs-sidebar-label").first().evaluate((element) => getComputedStyle(element).display) !== "none") {
          failures.push("desktop: icon-collapse mode did not hide sidebar labels");
        }
        await routePage.screenshot({ path: "artifacts/sidebar-desktop.png", fullPage: true });
      }

      if (config.sectionId === "installation") {
        await routePage.getByRole("tab", { name: "pnpm", exact: true }).click();
        if (await routePage.locator("[data-package-command-output]").textContent() !== "pnpm add @boobstrap/boobstrap lucide") {
          failures.push("desktop: installation package tabs did not update");
        }
        if (await routePage.locator("[data-package-command-output]").getAttribute("data-highlight-language") !== "bash") {
          failures.push("desktop: dynamic package command was not re-highlighted");
        }
      }

      if (config.sectionId === "class-reference") {
        if (await routePage.locator("#class-reference .reference-row").count() !== expectedClasses.size) {
          failures.push("desktop: class reference does not match the installed stylesheet");
        }
        await routePage.getByLabel("Filter classes").fill("bs-btn");
        if (await routePage.locator("#class-reference .reference-row").count() !== 18) {
          failures.push("desktop: class filtering did not return the button classes");
        }
      }

      if (config.sectionId === "tokens") {
        if (await routePage.locator("#tokens .reference-row").count() !== expectedTokens) {
          failures.push("desktop: token reference does not match the installed stylesheet");
        }
        if (await routePage.locator('#tokens a[href="/docs/getting-started/theming#theming-complete-color-token-reference"]').count() !== 1) {
          failures.push("desktop: token index does not link to the complete theme color reference");
        }
      }

      if (config.sectionId === "theming" && viewport.name === "desktop") {
        const configurator = routePage.locator("[data-theme-configurator]");
        const initialThemeTokens = await configurator.evaluate((element) => ({
          primary: getComputedStyle(element).getPropertyValue("--bs-color-primary").trim(),
          radius: getComputedStyle(element).getPropertyValue("--bs-radius-lg").trim(),
        }));

        if (await configurator.count() !== 1) failures.push("desktop: theming guide is missing its configurator");
        if (await configurator.locator('[data-theme-axis="theme"]').count() !== 2
          || await configurator.locator('[data-theme-axis="palette"]').count() !== 5
          || await configurator.locator('[data-theme-axis="radius"]').count() !== 4) {
          failures.push("desktop: theming configurator does not expose every supported option");
        }

        const colorReference = routePage.locator("[data-theme-color-reference]");
        if (await routePage.locator("#theming-complete-color-token-reference").count() !== 1) {
          failures.push("desktop: complete theme color reference is not directly linkable");
        }
        if (await colorReference.locator(".docs-color-reference-group").count() !== 3
          || await colorReference.locator("tbody tr").count() !== expectedThemeColorRows) {
          failures.push(`desktop: complete theme color reference does not cover every palette token (${expectedThemeColorRows} rows expected)`);
        }
        const colorReferenceMismatch = await colorReference.locator("[data-color-token-cell]").evaluateAll((cells) => {
          const mismatch = cells.find((cell) => {
            const displayedValue = cell.querySelector("code")?.textContent.trim();
            const resolvedValue = getComputedStyle(cell).getPropertyValue(cell.dataset.token).trim();
            return !displayedValue || displayedValue !== resolvedValue || !cell.querySelector(".docs-color-token-swatch");
          });
          return mismatch?.dataset.token ?? null;
        });
        if (colorReferenceMismatch) failures.push(`desktop: theme color reference has a stale or missing value for ${colorReferenceMismatch}`);
        if ((await colorReference.locator('[data-bs-theme="light"][data-bs-palette="blue"][data-token="--bs-color-primary"] code').textContent())?.trim() !== "#1d4ed8"
          || (await colorReference.locator('[data-bs-theme="dark"][data-bs-palette="amber"][data-token="--bs-color-primary"] code').textContent())?.trim() !== "#fbbf24") {
          failures.push("desktop: theme color reference does not expose expected light and dark palette hex values");
        }
        if (await colorReference.locator("[style]").count() !== 0) failures.push("desktop: theme color reference relies on CSP-blocked inline styles");

        for (const theme of ["dark", "light"]) {
          await configurator.locator(`[data-theme-axis="theme"][data-theme-value="${theme}"]`).click();
          for (const palette of ["rose", "violet", "blue", "teal", "amber"]) {
            await configurator.locator(`[data-theme-axis="palette"][data-theme-value="${palette}"]`).click();
            const buttonSeparation = await configurator.evaluate((element) => {
              const stage = element.querySelector(".docs-theme-stage");
              const primary = element.querySelector(".docs-theme-actions .bs-btn-primary");
              const secondary = element.querySelector(".docs-theme-actions .bs-btn-secondary");
              return {
                stage: getComputedStyle(stage).backgroundColor,
                primary: getComputedStyle(primary).backgroundColor,
                secondary: getComputedStyle(secondary).backgroundColor,
                secondaryBorder: getComputedStyle(secondary).borderColor,
              };
            });
            if (buttonSeparation.primary === buttonSeparation.stage
              || buttonSeparation.secondary === buttonSeparation.stage
              || buttonSeparation.secondaryBorder === "rgba(0, 0, 0, 0)") {
              failures.push(`desktop: ${theme}/${palette} theme preview does not separate actions from their canvas (${JSON.stringify(buttonSeparation)})`);
            }
          }
        }

        await configurator.locator('[data-theme-axis="theme"][data-theme-value="light"]').click();
        await configurator.locator('[data-theme-axis="palette"][data-theme-value="blue"]').click();
        const configuredRadii = {};
        for (const radius of ["small", "normal", "large"]) {
          await configurator.locator(`[data-theme-axis="radius"][data-theme-value="${radius}"]`).click();
          configuredRadii[radius] = await configurator.evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue("--bs-radius-lg")));
        }
        if (!(configuredRadii.small < configuredRadii.normal && configuredRadii.normal < configuredRadii.large)) {
          failures.push(`desktop: theming radius presets are not ordered from small through large (${JSON.stringify(configuredRadii)})`);
        }
        await configurator.locator('[data-theme-axis="radius"][data-theme-value="square"]').click();

        const configuredTheme = await configurator.evaluate((element) => ({
          theme: element.dataset.bsTheme,
          palette: element.dataset.bsPalette,
          radiusPreset: element.dataset.bsRadius,
          primary: getComputedStyle(element).getPropertyValue("--bs-color-primary").trim(),
          radius: getComputedStyle(element).getPropertyValue("--bs-radius-lg").trim(),
        }));
        if (configuredTheme.theme !== "light" || configuredTheme.palette !== "blue" || configuredTheme.radiusPreset !== "square") {
          failures.push(`desktop: theming configurator did not apply the selected attributes (${JSON.stringify(configuredTheme)})`);
        }
        if (configuredTheme.primary === initialThemeTokens.primary || Number.parseFloat(configuredTheme.radius) !== 0 || Number.parseFloat(initialThemeTokens.radius) === 0) {
          failures.push(`desktop: theming configurator did not resolve palette and radius tokens (${JSON.stringify({ initialThemeTokens, configuredTheme })})`);
        }
        if (await configurator.locator('[data-theme-axis="palette"][data-theme-value="blue"]').getAttribute("aria-pressed") !== "true"
          || await configurator.locator('[data-theme-axis="radius"][data-theme-value="normal"]').getAttribute("aria-pressed") !== "false") {
          failures.push("desktop: theming configurator did not expose its selected state accessibly");
        }
        if ((await configurator.locator("[data-theme-summary]").textContent())?.trim() !== "Light · Blue · Square") {
          failures.push("desktop: theming configurator summary did not update");
        }

        const expectedThemeMarkup = '<html\n  data-bs-theme="light"\n  data-bs-palette="blue"\n  data-bs-radius="square"\n>';
        if ((await routePage.locator("[data-theme-markup]").textContent())?.trim() !== expectedThemeMarkup) {
          failures.push("desktop: theming configurator did not update its copy-ready markup");
        }
        await routePage.locator("[data-theme-copy]").click();
        if (await routePage.evaluate(() => navigator.clipboard.readText()) !== expectedThemeMarkup) {
          failures.push("desktop: theming configurator copied stale markup");
        }

        const themingText = await routePage.locator("#theming").textContent();
        for (const publicContract of ["data-bs-theme", "data-bs-palette", "data-bs-radius", "data-bs-scrollbars", "--bs-color-primary-contrast", "--bs-color-focus-ring", "--bs-scrollbar-thumb", ".bs-scrollbar"]) {
          if (!themingText.includes(publicContract)) failures.push(`desktop: theming guide is missing ${publicContract}`);
        }
        const scrollbarStyle = await routePage.locator(".docs-scrollbar-demo.bs-scrollbar").evaluate((element) => ({
          color: getComputedStyle(element).scrollbarColor,
          overflow: getComputedStyle(element).overflowY,
        }));
        if (scrollbarStyle.color === "auto" || scrollbarStyle.overflow !== "auto") {
          failures.push(`desktop: themed scrollbar example is not active (${JSON.stringify(scrollbarStyle)})`);
        }
      }

      if (config.sectionId === "code-windows") {
        const underlineTabs = routePage.locator("#code-window-source .bs-code-tabs-underline");
        const underlineStyle = await underlineTabs.locator('[role="tab"][aria-selected="true"]').evaluate((element) => {
          const after = getComputedStyle(element, "::after");
          return {
            radius: getComputedStyle(element).borderRadius,
            indicator: after.backgroundColor,
          };
        });
        if (underlineStyle.radius !== "0px" || underlineStyle.indicator === "rgba(0, 0, 0, 0)") {
          failures.push(`${viewport.name}: code tab underline variant did not render correctly (${JSON.stringify(underlineStyle)})`);
        }
      }

      if (config.sectionId === "banners") {
        const contextualBanners = routePage.locator('[data-component-example="banner-variants"] .bs-banner');
        if (await contextualBanners.count() !== 5) failures.push("desktop: banner reference is missing contextual variants");

        const backgrounds = await contextualBanners.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).backgroundColor));
        if (new Set(backgrounds).size !== 5) failures.push("desktop: banner contextual variants do not have distinct backgrounds");

        const dismissible = routePage.locator('[data-component-example="banner-dismissible"] [data-bs-banner]');
        await dismissible.locator("[data-bs-banner-dismiss]").click();
        if (await dismissible.isVisible() || await dismissible.getAttribute("data-bs-state") !== "dismissed") {
          failures.push("desktop: dismissible banner did not synchronize its hidden state");
        }

        const bannerSource = await routePage.locator("#banners .docs-code-block").allTextContents();
        if (!bannerSource.some((source) => source.includes("initBanners"))) {
          failures.push("desktop: banner documentation is missing its JavaScript initialization example");
        }
        if (await routePage.locator('#banners .docs-code-block code .hljs-tag').count() === 0
          || await routePage.locator('#banners .docs-code-block code .hljs-keyword').count() === 0) {
          failures.push("desktop: banner HTML and JavaScript examples are missing syntax tokens");
        }
      }

      if (config.sectionId === "progress") {
        const determinate = routePage.locator('[data-component-example="progress-determinate"] [role="progressbar"]').first();
        const valueWidth = await determinate.locator(".bs-progress-bar").evaluate((element) => element.getBoundingClientRect().width / element.parentElement.getBoundingClientRect().width);
        if (await determinate.getAttribute("aria-valuenow") !== "68" || Math.abs(valueWidth - 0.68) > 0.02) {
          failures.push("desktop: determinate progress does not synchronize its accessible and visual values");
        }
        if (await routePage.locator('[data-component-example="progress-variants"] .bs-progress-bar').count() !== 5) {
          failures.push("desktop: progress reference is missing contextual variants");
        }
      }

      if (config.sectionId === "accordion") {
        const single = routePage.locator('[data-component-example="accordion"]');
        const account = single.getByRole("button", { name: /Account settings/ });
        const billing = single.getByRole("button", { name: /Billing and invoices/ });
        await billing.click();
        if (await billing.getAttribute("aria-expanded") !== "true"
          || await account.getAttribute("aria-expanded") !== "false"
          || !await single.locator("#accordion-demo-panel-billing").isVisible()
          || await single.locator("#accordion-demo-panel-account").isVisible()) {
          failures.push("desktop: accordion single-open example did not close its open sibling");
        }

        const multiple = routePage.locator('[data-component-example="accordion-always-open"]');
        const email = multiple.getByRole("button", { name: /Email notifications/ });
        const push = multiple.getByRole("button", { name: /Push notifications/ });
        await push.click();
        if (await email.getAttribute("aria-expanded") !== "true" || await push.getAttribute("aria-expanded") !== "true") {
          failures.push("desktop: accordion always-open example did not preserve sibling state");
        }

        const source = (await routePage.locator("#accordion").textContent()) ?? "";
        for (const contract of ["Accordion.getOrCreateInstance", "bsAccordion", "useAccordion", "@boobstrap/react", "@boobstrap/vue", "bs:collapse:show"]) {
          if (!source.includes(contract)) failures.push(`desktop: accordion guide is missing ${contract}`);
        }
      }

      if (config.sectionId === "skeletons") {
        const source = (await routePage.locator("#skeletons").textContent()) ?? "";
        for (const contract of ["--bs-skeleton-width", "--bs-skeleton-height", "aria-busy", "aria-hidden", "prefers-reduced-motion", "role=\"progressbar\""]) {
          if (!source.includes(contract)) failures.push(`desktop: skeleton guide is missing ${contract}`);
        }
        const animated = routePage.locator('[data-component-example="skeletons-text"] .bs-skeleton-pulse').first();
        if (await animated.evaluate((element) => getComputedStyle(element).animationName) === "none") {
          failures.push("desktop: skeleton pulse example is not using the framework animation");
        }
      }

      if (config.sectionId === "typescript") {
        const source = (await routePage.locator("#typescript").textContent()) ?? "";
        for (const contract of ["@boobstrap/boobstrap/js", "@boobstrap/alpine", "@boobstrap/react", "@boobstrap/vue", "@boobstrap/boobstrap/tokens", "moduleResolution", "NodeNext", "Bundler", "DOM"]) {
          if (!source.includes(contract)) failures.push(`desktop: TypeScript guide is missing ${contract}`);
        }
        await routePage.locator("#typescript-react").evaluate((element) => {
          document.documentElement.style.scrollBehavior = "auto";
          const header = document.querySelector(".docs-header")?.offsetHeight ?? 0;
          window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - header - 24 });
        });
        await routePage.waitForTimeout(100);
        if (await routePage.locator('[data-page-nav] a[href="#typescript-react"]').getAttribute("aria-current") !== "location") {
          failures.push("desktop: TypeScript page outline did not highlight the section at the reading line");
        }
      }

      if (config.sectionId === "tokens") {
        const source = (await routePage.locator("#tokens").textContent()) ?? "";
        for (const contract of ["@boobstrap/boobstrap/tokens", "@boobstrap/boobstrap/tokens.json", "{ tokens, modes }", "DTCG-style references"]) {
          if (!source.includes(contract)) failures.push(`desktop: token guide is missing ${contract}`);
        }
      }

      if (config.sectionId === "whats-new") {
        const source = (await routePage.locator("#whats-new").textContent()) ?? "";
        for (const contract of ["Accordion", "Skeletons", "TypeScript", "token", "Toast autohide", "Available now"]) {
          if (!source.includes(contract)) failures.push(`desktop: v0.5 overview is missing ${contract}`);
        }
      }

      if (config.sectionId === "toasts") {
        const trigger = routePage.getByRole("button", { name: "Show notification" });
        const toast = routePage.locator("#docs-toast");
        await trigger.click();
        await routePage.waitForFunction(() => document.querySelector("#docs-toast")?.dataset.bsState === "shown");
        if (!await toast.isVisible() || await trigger.getAttribute("aria-expanded") !== "true") {
          failures.push("desktop: toast trigger did not synchronize notification state");
        }
        await toast.getByRole("button", { name: "Dismiss deployment notification" }).click();
        await routePage.waitForFunction(() => document.querySelector("#docs-toast")?.hidden === true);
        if (await trigger.getAttribute("aria-expanded") !== "false") failures.push("desktop: toast dismissal did not synchronize its trigger");
      }

      if (config.sectionId === "tooltips-popovers") {
        const tooltipTrigger = routePage.getByRole("button", { name: "Copy link" });
        await tooltipTrigger.focus();
        const tooltip = routePage.locator("body > .bs-tooltip");
        if (!await tooltip.isVisible() || !await tooltipTrigger.getAttribute("aria-describedby")) {
          failures.push("desktop: tooltip did not expose its generated accessible description");
        }
        await tooltipTrigger.press("Escape");
        const popoverTrigger = routePage.getByRole("button", { name: "Retention details" });
        await popoverTrigger.click();
        if (await popoverTrigger.getAttribute("aria-expanded") !== "true" || !await routePage.locator("body > .bs-popover").isVisible()) {
          failures.push("desktop: popover did not synchronize its generated panel");
        }
        await routePage.evaluate(() => window.dispatchEvent(new Event("scroll")));
        if (await popoverTrigger.getAttribute("aria-expanded") !== "false" || await routePage.locator("body > .bs-popover").isVisible()) {
          failures.push("desktop: popover did not dismiss when the page scrolled");
        }
        await popoverTrigger.click();
        await popoverTrigger.press("Escape");
        if (await popoverTrigger.getAttribute("aria-expanded") !== "false") failures.push("desktop: popover did not dismiss with Escape");
      }

      if (["collapse", "dropdown", "tabs"].includes(config.sectionId)) {
        const variants = routePage.locator("[data-code-variants]:visible");
        if (await variants.count() !== 1 || await variants.locator("[data-code-variant]").count() !== 4) {
          failures.push(`desktop: ${config.sectionId} implementation tabs are incomplete`);
        } else {
          await variants.getByRole("tab", { name: "Alpine.js", exact: true }).click();
          await variants.locator("[data-copy-example]").click();
          if (!await routePage.evaluate(() => navigator.clipboard.readText()).then((source) => source.includes("x-data"))) {
            failures.push(`desktop: ${config.sectionId} Alpine tab did not copy its implementation`);
          }
          await variants.getByRole("tab", { name: "Vue", exact: true }).click();
          await variants.locator("[data-copy-example]").click();
          if (!await routePage.evaluate(() => navigator.clipboard.readText()).then((source) => source.includes("@boobstrap/vue") && source.includes("v-bind"))) {
            failures.push(`desktop: ${config.sectionId} Vue tab did not copy its implementation`);
          }
        }
      }

      if (config.sectionId === "behavior-layers" && await routePage.locator("[data-framework-tab]").count() !== 4) {
        failures.push("desktop: behavior overview does not preserve all framework tabs");
      }

      if (config.sectionId === "react-adapter") {
        const source = (await routePage.locator("#react-adapter").textContent()) ?? "";
        for (const contract of ["@boobstrap/react", "useCollapse", "getTriggerProps", "useDialog", "useToast", "useTooltip", "usePopover"]) {
          if (!source.includes(contract)) failures.push(`desktop: React adapter guide is missing ${contract}`);
        }
      }

      if (config.sectionId === "vue-adapter") {
        const source = (await routePage.locator("#vue-adapter").textContent()) ?? "";
        for (const contract of ["@boobstrap/vue", "useCollapse", "v-bind", "useToast", "useTooltip", "usePopover"]) {
          if (!source.includes(contract)) failures.push(`desktop: Vue adapter guide is missing ${contract}`);
        }
      }

      if (["react-adapter", "vue-adapter"].includes(config.sectionId)) {
        const adapter = config.sectionId.replace("-adapter", "");
        const preview = routePage.locator(`[data-component-example="${adapter}-adapter-collapse"]`);
        const code = preview.locator("xpath=following-sibling::*[1]");
        const trigger = preview.getByRole("button", { name: "Account details", exact: true });
        const panel = preview.locator("#account-details");
        const codeSource = (await code.locator("pre code").textContent()) ?? "";
        if (await preview.count() !== 1 || !codeSource.includes("Account details") || !codeSource.includes("Profile and security settings.")) {
          failures.push(`desktop: ${adapter} adapter preview content does not match its adjacent component code`);
        }
        const initialContract = await routePage.evaluate(({ sectionId }) => {
          const root = document.querySelector(`[data-component-example="${sectionId}"]`);
          const button = root?.querySelector("button[aria-controls]");
          const controlledPanel = button ? root.querySelector(`#${CSS.escape(button.getAttribute("aria-controls"))}`) : null;
          return {
            expanded: button?.getAttribute("aria-expanded"),
            hidden: controlledPanel?.hidden,
            state: controlledPanel?.dataset.bsState,
          };
        }, { sectionId: `${adapter}-adapter-collapse` });
        if (initialContract.expanded !== "true" || initialContract.hidden !== false || initialContract.state !== "open" || !codeSource.includes("defaultOpen: true")) {
          failures.push(`desktop: ${adapter} adapter preview does not begin in the state produced by useCollapse`);
        }
        await trigger.click();
        await panel.waitFor({ state: "hidden" });
        if (await trigger.getAttribute("aria-expanded") !== "false" || await panel.getAttribute("data-bs-state") !== "closed") {
          failures.push(`desktop: ${adapter} adapter preview does not demonstrate the adjacent collapse behavior`);
        }
        if (adapter === "vue" && codeSource.includes('import "@boobstrap/boobstrap";')) {
          failures.push("desktop: Vue adapter component example imports a second behavior owner");
        }
      }

      if (config.sectionId === "utilities") {
        const source = (await routePage.locator("#utilities").textContent()) ?? "";
        for (const contract of [".bs-sm-block", ".bs-md-flex-row", ".bs-lg-order-last"]) {
          if (!source.includes(contract)) failures.push(`desktop: utilities guide is missing ${contract}`);
        }
      }

      if (config.sectionId === "form-inputs") {
        const [smallHeight, largeHeight] = await Promise.all([
          routePage.locator("#input-small").evaluate((element) => element.getBoundingClientRect().height),
          routePage.locator("#input-large").evaluate((element) => element.getBoundingClientRect().height),
        ]);
        if (smallHeight >= largeHeight) failures.push("desktop: form size examples are not ordered");

        const emailPreview = routePage.locator('[data-component-example="form-input-email"]');
        const textareaPreview = routePage.locator('[data-component-example="form-textarea"]');
        await emailPreview.getByRole("button", { name: "Use light theme for this preview" }).click();
        await routePage.waitForTimeout(250);
        const independentThemeState = await routePage.evaluate(() => ({
          page: document.documentElement.dataset.bsTheme,
          email: document.querySelector('[data-component-example="form-input-email"]')?.dataset.bsTheme,
          emailBackground: getComputedStyle(document.querySelector("#input-email")).backgroundColor,
          textarea: document.querySelector('[data-component-example="form-textarea"]')?.dataset.bsTheme,
          textareaBackground: getComputedStyle(document.querySelector("#input-message")).backgroundColor,
        }));
        if (independentThemeState.page !== "dark" || independentThemeState.email !== "light" || independentThemeState.textarea !== "dark") {
          failures.push("desktop: a preview theme control changed the page or another preview");
        }
        if (independentThemeState.emailBackground !== "rgb(255, 255, 255)" || independentThemeState.emailBackground === independentThemeState.textareaBackground) {
          failures.push("desktop: light form preview does not use a distinct white control background");
        }

        await routePage.getByRole("button", { name: "Switch to light theme" }).click();
        if (await textareaPreview.getAttribute("data-bs-theme") !== "dark" || await emailPreview.getAttribute("data-bs-theme") !== "light") {
          failures.push("desktop: page theme toggle overrode an independent preview theme");
        }
      }

      if (config.sectionId === "form-input-groups") {
        if (await routePage.locator("html").getAttribute("data-bs-theme") !== "dark") {
          await routePage.getByRole("button", { name: "Switch to dark theme" }).click();
        }
        const iconPreviews = routePage.locator('[data-component-example="form-input-icon-start"], [data-component-example="form-input-icon-end"]');
        for (const preview of await iconPreviews.all()) {
          if (await preview.getAttribute("data-bs-theme") !== "dark") {
            await preview.getByRole("button", { name: "Use dark theme for this preview" }).click();
          }
        }
        const iconContracts = await routePage.locator(".bs-input-icon").evaluateAll((icons) => icons.map((icon) => ({
          pageTheme: document.documentElement.dataset.bsTheme,
          previewTheme: icon.closest("[data-component-example]")?.dataset.bsTheme,
          usesIconClass: icon.classList.contains("bs-icon"),
          color: getComputedStyle(icon).color,
          stroke: getComputedStyle(icon.querySelector("path, circle")).stroke,
        })));
        if (iconContracts.length !== 2 || iconContracts.some(({ pageTheme, previewTheme, usesIconClass, color, stroke }) => (
          pageTheme !== "dark"
          || previewTheme !== "dark"
          || !usesIconClass
          || color === "rgba(0, 0, 0, 0)"
          || stroke === "none"
        ))) {
          failures.push(`desktop: form input icons are not visible Lucide-style SVGs (${JSON.stringify(iconContracts)})`);
        }
      }

      if (config.sectionId === "form-native-controls") {
        const range = routePage.locator("#native-range");
        await range.fill("82");
        if ((await routePage.locator("#native-range-value").textContent())?.trim() !== "82%") {
          failures.push("desktop: range example did not synchronize its displayed percentage");
        }
        await routePage.locator("#native-color").evaluate((input) => {
          input.value = "#123456";
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        if ((await routePage.locator("#native-color-value").textContent())?.trim() !== "#123456") {
          failures.push("desktop: color example did not synchronize its displayed value");
        }
      }

      if (config.sectionId === "typography") {
        const preview = routePage.locator('[data-component-example="typography-overview"]');
        await preview.getByRole("button", { name: "Use light theme for this preview" }).click();
        const lightText = await preview.evaluate((element) => {
          const expected = getComputedStyle(element).color;
          return {
            expected,
            values: [...element.querySelectorAll("h1, h2, h3, p:not(.bs-text-gradient):not(.bs-lead)")].map((node) => getComputedStyle(node).color),
          };
        });
        if (!lightText.values.length || lightText.values.some((color) => color !== lightText.expected)) {
          failures.push(`desktop: light typography preview does not inherit its scoped text color (${JSON.stringify(lightText)})`);
        }
        const previewText = (await preview.textContent())?.replace(/Light|Dark/g, "").replace(/\s+/g, " ").trim() ?? "";
        const sourceText = (await preview.locator("xpath=following-sibling::*[1]//code").textContent())?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() ?? "";
        for (const label of ["Boobstrap", "Heading one", "Heading two", "Heading three"]) {
          if (!previewText.includes(label) || !sourceText.includes(label)) failures.push(`desktop: typography preview and source diverge at ${label}`);
        }
      }

      if (config.sectionId === "form-passwords-masks") {
        const password = routePage.locator("#password-current");
        await routePage.locator("[data-bs-password-toggle]").click();
        if (await password.getAttribute("type") !== "text") failures.push("desktop: password example did not reveal its value");

        const phone = routePage.locator("#mask-phone");
        await phone.fill("4155550123");
        if (await phone.inputValue() !== "(415) 555-0123") failures.push("desktop: mask example did not format its value");
      }

      if (config.sectionId === "form-otp") {
        const otpInputs = routePage.locator("#form-otp [data-bs-otp-input]");
        const pasteOtp = (value) => otpInputs.first().evaluate((input, pastedValue) => {
          const clipboardData = new DataTransfer();
          clipboardData.setData("text/plain", pastedValue);
          input.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData }));
        }, value);
        await pasteOtp("1234567");
        const rejectedOtp = await routePage.locator("#form-otp [data-bs-otp]").evaluate((element) => ({
          inputs: [...element.querySelectorAll("[data-bs-otp-input]")].map((input) => input.value),
          value: element.querySelector("[data-bs-otp-value]").value,
          state: element.dataset.bsState,
        }));
        if (rejectedOtp.inputs.some(Boolean) || rejectedOtp.value !== "" || rejectedOtp.state !== "empty") failures.push(`desktop: OTP example did not reject an overlength paste atomically (${JSON.stringify(rejectedOtp)})`);
        await pasteOtp("123456");
        const acceptedOtp = await routePage.locator("#form-otp [data-bs-otp]").evaluate((element) => ({
          inputs: [...element.querySelectorAll("[data-bs-otp-input]")].map((input) => input.value),
          value: element.querySelector("[data-bs-otp-value]").value,
          state: element.dataset.bsState,
        }));
        if (acceptedOtp.inputs.join("") !== "123456" || acceptedOtp.value !== "123456" || acceptedOtp.state !== "complete") failures.push(`desktop: OTP example did not synchronize its exact six-digit paste (${JSON.stringify(acceptedOtp)})`);
        const otpSource = await routePage.locator("#form-otp .docs-code-block").allTextContents();
        if (otpSource.some((source) => source.includes("Repeat through")) || !otpSource.some((source) => source.match(/data-bs-otp-input/g)?.length === 6)) {
          failures.push("desktop: OTP documentation is not a complete six-input example");
        }
      }

      if (config.sectionId === "form-searchable-select") {
        const comboboxInput = routePage.locator("#combobox-role");
        await comboboxInput.fill("eng");
        const comboboxState = await routePage.locator('[data-component-example="form-combobox"]').evaluate((element) => ({
          open: !element.querySelector("[data-bs-combobox-listbox]").hidden,
          visibleOptions: [...element.querySelectorAll("[data-bs-combobox-option]")].filter((option) => !option.hidden).length,
        }));
        if (!comboboxState.open || comboboxState.visibleOptions !== 1) failures.push("desktop: searchable select did not filter");
        await comboboxInput.press("Enter");
        if (await routePage.locator('[name="team_role"]').inputValue() !== "engineer") failures.push("desktop: searchable select did not submit its selected value");

        const formSource = await routePage.locator("#form-searchable-select .docs-code-block").allTextContents();
        if (!formSource.some((source) => source.includes("initComboboxes")) || !formSource.some((source) => source.includes("Alpine.plugin")) || !formSource.some((source) => source.includes("useCombobox"))) {
          failures.push("desktop: searchable select is missing complete JS, Alpine, or React documentation");
        }
        await routePage.locator("#form-searchable-select [data-copy-code]").first().click();
        if (!await routePage.evaluate(() => navigator.clipboard.readText()).then((source) => source.includes("data-bs-combobox-value"))) {
          failures.push("desktop: form code examples did not copy their displayed source");
        }
      }

      if (config.sectionId === "collapse") {
        const preview = routePage.locator('[data-component-example="collapse"]');
        const toggle = preview.getByRole("button", { name: "Toggle details" });
        await toggle.click();
        if (await toggle.getAttribute("aria-expanded") !== "true" || !await preview.locator("#docs-collapse-panel").isVisible()) {
          failures.push("desktop: routed collapse example did not open");
        }
      }

      if (config.sectionId === "dropdown") {
        const preview = routePage.locator('[data-component-example="dropdown"]');
        const toggle = preview.getByRole("button", { name: "More save options" });
        await toggle.focus();
        await toggle.press("ArrowDown");
        const item = preview.getByRole("menuitem", { name: "Save and publish" });
        if (!await item.evaluate((element) => element === document.activeElement)) {
          failures.push("desktop: routed dropdown example did not manage keyboard focus");
        }
        await item.press("Escape");
      }

      if (config.sectionId === "tabs") {
        const preview = routePage.locator('[data-component-example="tabs"]');
        const profile = preview.getByRole("tab", { name: "Profile" });
        const security = preview.getByRole("tab", { name: "Security" });
        await profile.focus();
        await profile.press("ArrowRight");
        if (await security.getAttribute("aria-selected") !== "true") failures.push("desktop: routed tabs example did not activate from the keyboard");
      }

      if (config.sectionId === "buttons") {
        if (await previews.count() !== 9) failures.push("desktop: button reference is missing rendered examples");
        const linkButton = routePage.locator("[data-link-button-example]");
        if (await linkButton.evaluate((element) => element.tagName) !== "A" || !await linkButton.getAttribute("href")) {
          failures.push("desktop: button documentation does not demonstrate a semantic anchor button");
        }
        if (!await linkButton.evaluate((element) => getComputedStyle(element).display.includes("flex"))) {
          failures.push("desktop: anchor button does not receive button styling");
        }

        const variantsCopy = routePage.locator('[data-copy-example="button-variants"]');
        const variantsMarkup = await variantsCopy.getAttribute("data-copy");
        await variantsCopy.click();
        if (await routePage.evaluate(() => navigator.clipboard.readText()) !== variantsMarkup) {
          failures.push("desktop: always-visible button source did not copy complete markup");
        }

        const loadingVariants = routePage.locator('[data-code-variants]').filter({ has: routePage.locator('[data-copy-example="button-loading-detail"]') });
        for (const [tabName, marker] of [["Boobstrap JS", "data-bs-button"], ["Alpine.js", "x-data"], ["React", "useButton"], ["Vue", "@boobstrap/vue"]]) {
          await loadingVariants.getByRole("tab", { name: tabName, exact: true }).click();
          await loadingVariants.locator('[data-copy-example="button-loading-detail"]').click();
          if (!await routePage.evaluate(() => navigator.clipboard.readText()).then((source) => source.includes(marker))) {
            failures.push(`desktop: loading ${tabName} tab did not copy complete source`);
          }
        }

        const split = routePage.locator('[data-component-example="button-split-dropdown"]');
        const splitToggle = split.getByRole("button", { name: "More save options" });
        await splitToggle.focus();
        await splitToggle.press("ArrowDown");
        const splitItem = split.getByRole("menuitem", { name: "Save and publish" });
        if (!await splitItem.evaluate((element) => element === document.activeElement)) failures.push("desktop: split button keyboard behavior failed");
        await splitItem.press("Escape");
        const splitRadius = await split.locator(".bs-btn-group > .bs-btn").last().evaluate((button) => ({
          top: getComputedStyle(button).borderTopRightRadius,
          bottom: getComputedStyle(button).borderBottomRightRadius,
        }));
        if (Number.parseFloat(splitRadius.top) === 0 || Number.parseFloat(splitRadius.bottom) === 0) {
          failures.push(`desktop: split dropdown trigger is missing its end radius (${JSON.stringify(splitRadius)})`);
        }

        const startSplit = routePage.locator('[data-component-example="button-split-dropdown-start"]');
        const startToggle = startSplit.getByRole("button", { name: "More export options" });
        await startToggle.click();
        const startAlignment = await startSplit.evaluate((element) => {
          const group = element.querySelector(".bs-btn-group").getBoundingClientRect();
          const menu = element.querySelector(".bs-dropdown-menu").getBoundingClientRect();
          return Math.abs(group.left - menu.left);
        });
        if (startAlignment > 1) failures.push(`desktop: start-aligned split menu is offset by ${startAlignment}px`);
        await startToggle.press("Escape");

        const loading = routePage.locator("[data-demo-loading]");
        await loading.click();
        await routePage.waitForFunction(() => document.querySelector("[data-demo-loading]")?.dataset.bsState === "loading");
        if (!await loading.isDisabled() || await loading.getAttribute("aria-busy") !== "true") failures.push("desktop: loading button state did not synchronize");
        await routePage.waitForFunction(() => document.querySelector("[data-demo-loading]")?.dataset.bsState === "idle");
        await routePage.screenshot({ path: `artifacts/buttons-${viewport.name}.png`, fullPage: true });
      }
    }

    await routePage.close();

    const playgroundPage = await browser.newPage({ viewport });
    await playgroundPage.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    const playgroundConsoleErrors = [];
    playgroundPage.on("console", (message) => {
      if (message.type() === "error") playgroundConsoleErrors.push(message.text());
    });
    playgroundPage.on("pageerror", (error) => playgroundConsoleErrors.push(error.message));

    await playgroundPage.goto(`${baseUrl}/playground`, { waitUntil: "networkidle" });
    const playgroundDimensions = await dimensionsFor(playgroundPage);
    const previewFrame = playgroundPage.frameLocator("[data-preview]");
    await previewFrame.getByRole("heading", { name: "Build boldly." }).waitFor();
    await playgroundPage.screenshot({ path: `artifacts/playground-${viewport.name}.png`, fullPage: true });

    if (playgroundDimensions.scrollWidth > playgroundDimensions.clientWidth + 1) {
      failures.push(`${viewport.name}: playground horizontal overflow`);
    }
    if (await playgroundPage.locator('link[rel="canonical"]').getAttribute("href") !== "https://boobstrap.org/playground") {
      failures.push(`${viewport.name}: playground canonical URL is incorrect`);
    }

    const editedHtml = '<main><h1 data-test-marker>Edited preview</h1><button type="button" onclick="document.body.dataset.ran=\'true\'">Safe button</button><script>document.body.dataset.scriptRan="true"</script></main>';
    const editedCss = "h1 { color: rgb(1, 2, 3); }";
    await playgroundPage.getByLabel("HTML").fill(editedHtml);
    await playgroundPage.getByLabel("CSS").fill(editedCss);
    const editedHeading = previewFrame.getByRole("heading", { name: "Edited preview" });
    await editedHeading.waitFor();
    if (await editedHeading.evaluate((element) => getComputedStyle(element).color) !== "rgb(1, 2, 3)") {
      failures.push(`${viewport.name}: playground CSS edit did not update the preview`);
    }
    if (await previewFrame.locator("script").count() !== 0) failures.push(`${viewport.name}: playground retained a user script`);
    if (await previewFrame.getByRole("button", { name: "Safe button" }).getAttribute("onclick") !== null) {
      failures.push(`${viewport.name}: playground retained an inline event handler`);
    }

    await playgroundPage.getByRole("button", { name: "Copy page" }).click();
    const copiedPage = await playgroundPage.evaluate(() => navigator.clipboard.readText());
    if (!copiedPage.includes("Edited preview") || !copiedPage.includes(editedCss)) failures.push(`${viewport.name}: playground copy did not return current source`);

    await playgroundPage.getByRole("button", { name: "Mobile", exact: true }).click();
    if (await playgroundPage.getByRole("button", { name: "Mobile", exact: true }).getAttribute("aria-pressed") !== "true") {
      failures.push(`${viewport.name}: mobile preview control did not activate`);
    }

    await playgroundPage.getByRole("button", { name: "Reset" }).click();
    await previewFrame.getByRole("heading", { name: "Build boldly." }).waitFor();
    if (!await playgroundPage.getByLabel("HTML").inputValue().then((value) => value.includes("Boobstrap starter"))) {
      failures.push(`${viewport.name}: playground reset did not restore starter HTML`);
    }

    if (viewport.name === "mobile") {
      const htmlBox = await playgroundPage.getByLabel("HTML").boundingBox();
      const cssBox = await playgroundPage.getByLabel("CSS").boundingBox();
      if (!htmlBox || !cssBox || cssBox.y <= htmlBox.y + htmlBox.height) failures.push("mobile: playground editors did not stack vertically");
    }
    if (playgroundConsoleErrors.length) failures.push(`${viewport.name}: playground ${playgroundConsoleErrors.join("; ")}`);
    await playgroundPage.close();
  }

  const compactDesktopPage = await browser.newPage({ viewport: { width: 980, height: 844 } });
  const compactDesktopErrors = [];
  compactDesktopPage.on("console", (message) => {
    if (message.type() === "error") compactDesktopErrors.push(message.text());
  });
  compactDesktopPage.on("pageerror", (error) => compactDesktopErrors.push(error.message));
  await compactDesktopPage.goto(`${baseUrl}/docs/getting-started/introduction`, { waitUntil: "networkidle" });
  const compactSidebar = compactDesktopPage.locator("#docs-sidebar");
  const compactMenuToggle = compactDesktopPage.getByRole("button", { name: "Open documentation menu" });
  const compactSidebarState = await compactSidebar.evaluate((sidebar) => ({
    state: sidebar.dataset.bsState,
    position: getComputedStyle(sidebar).position,
    transform: getComputedStyle(sidebar).transform,
    visible: sidebar.getBoundingClientRect().width > 0 && sidebar.getBoundingClientRect().height > 0,
  }));
  if (!compactSidebarState.visible || compactSidebarState.state !== "expanded"
    || compactSidebarState.position !== "sticky" || compactSidebarState.transform !== "none"
    || await compactMenuToggle.isVisible()) {
    failures.push(`980px desktop view: documentation sidebar did not remain persistent (${JSON.stringify(compactSidebarState)})`);
  }

  await compactDesktopPage.setViewportSize({ width: 390, height: 844 });
  await compactDesktopPage.waitForFunction(() => document.querySelector("#docs-sidebar")?.dataset.bsState === "closed");
  if (!await compactMenuToggle.isVisible()) failures.push("responsive sidebar: menu control did not appear after switching to mobile view");
  await compactDesktopPage.setViewportSize({ width: 980, height: 844 });
  await compactDesktopPage.waitForFunction(() => document.querySelector("#docs-sidebar")?.dataset.bsState === "expanded");
  if (!await compactSidebar.isVisible() || await compactMenuToggle.isVisible()) {
    failures.push("responsive sidebar: persistent navigation did not return after switching to desktop view");
  }
  if (compactDesktopErrors.length) failures.push(`980px desktop view: ${compactDesktopErrors.join("; ")}`);
  await compactDesktopPage.close();
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Smoke checks passed across ${docsPages.length} docs routes at 1680×940 and 390×844; documented ${expectedClasses.size} classes and ${expectedTokens} tokens.`);
}
