import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { chromium } from "playwright";
import { docsPages } from "../src/docs-pages.js";

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
const ogImageUrl = "https://boobstrap.org/og-image.jpg";
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
  cards: ["bs-card-compact", "bs-card-link", "bs-card-subtle"],
  "code-windows": ["bs-code-action", "bs-code-header", "bs-code-inline", "bs-code-panel", "bs-code-tab", "bs-code-tabs"],
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
  lists: ["bs-reference-list", "bs-reference-name", "bs-reference-row", "bs-reference-value", "bs-checklist"],
  tabs: ["bs-tab-panel-contained", "bs-tabs-contained", "bs-tabs-pills"],
};
const promotedComponentClasses = new Set(Object.values(promotedComponentCoverage).flat());
if (promotedComponentClasses.size !== 86) {
  throw new Error(`Expected documentation coverage for 86 promoted component classes; found ${promotedComponentClasses.size}`);
}
const documentationQualityMinimums = {
  introduction: { examples: 1, code: 1 },
  installation: { code: 5, guidance: true },
  starter: { code: 3, guidance: true },
  theming: { examples: 2, code: 6, guidance: true },
  typography: { examples: 2, code: 3, guidance: true },
  layout: { examples: 2, code: 3, guidance: true },
  "responsive-composition": { examples: 1, code: 1, guidance: true },
  buttons: { examples: 8, code: 8 },
  navbar: { examples: 4, code: 4, guidance: true },
  sidebars: { examples: 8, code: 15, guidance: true },
  badges: { examples: 2, code: 3, guidance: true },
  cards: { examples: 4, code: 4, guidance: true },
  tables: { examples: 1, code: 1, guidance: true },
  "table-fundamentals": { examples: 2, code: 2, guidance: true },
  "table-styles": { examples: 3, code: 3, guidance: true },
  "table-pagination": { examples: 2, code: 2, guidance: true },
  "table-datatables": { examples: 1, code: 3, guidance: true },
  lists: { examples: 2, code: 2, guidance: true },
  alerts: { examples: 3, code: 3, guidance: true },
  banners: { examples: 2, code: 3, guidance: true },
  forms: { examples: 2, code: 2 },
  "form-inputs": { examples: 7, code: 7, guidance: true },
  "form-input-groups": { examples: 5, code: 5 },
  "form-selects": { examples: 4, code: 4 },
  "form-searchable-select": { examples: 1, code: 5 },
  "form-date-time": { examples: 5, code: 5 },
  "form-passwords-masks": { examples: 4, code: 6 },
  "form-checks-radios": { examples: 4, code: 4 },
  "form-otp": { examples: 1, code: 2 },
  "code-windows": { examples: 2, code: 2, guidance: true },
  icons: { examples: 2, code: 4, guidance: true },
  "behavior-layers": { code: 3, guidance: true },
  collapse: { examples: 1, code: 2, guidance: true },
  dropdown: { examples: 1, code: 2, guidance: true },
  tabs: { examples: 3, code: 4, guidance: true },
  utilities: { examples: 3, code: 3, guidance: true },
  tokens: { examples: 1, code: 1, guidance: true },
  "class-reference": { examples: 1, code: 1, guidance: true },
  accessibility: { examples: 3, code: 3, guidance: true },
};

try {
  await waitForServer();
  await mkdir("artifacts", { recursive: true });

  for (const asset of ["/favicon.svg", "/apple-touch-icon.png", "/og-image.jpg", "/boobstrap-starter.zip"]) {
    const response = await fetch(`${baseUrl}${asset}`);
    if (!response.ok) failures.push(`${asset}: returned HTTP ${response.status}`);
  }

  for (const [legacyPath, cleanPath] of [["/docs.html", "/docs"], ["/playground.html", "/playground"]]) {
    const response = await fetch(`${baseUrl}${legacyPath}`, { redirect: "manual" });
    if (response.status !== 308 || response.headers.get("location") !== cleanPath) {
      failures.push(`${legacyPath}: expected a 308 redirect to ${cleanPath}`);
    }
  }

  const docsOverviewSource = await (await fetch(`${baseUrl}/docs`)).text();
  if (!docsOverviewSource.includes(`<strong data-token-count>${expectedTokens}</strong> tokens`)) {
    failures.push(`docs overview: static token count does not match the installed framework (${expectedTokens})`);
  }

  for (const { path, title, description } of docsPages) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) failures.push(`${path}: returned HTTP ${response.status}`);
    const source = await response.text();
    const pageTitle = `${title} — Boobstrap`;
    const canonicalUrl = `https://boobstrap.org${path}`;
    if (!source.includes(`<title>${escapeHtml(pageTitle)}</title>`)) failures.push(`${path}: raw HTML has the wrong page title`);
    if (!source.includes(`<meta property="og:title" content="${escapeHtml(pageTitle)}"`)) failures.push(`${path}: raw HTML has the wrong Open Graph title`);
    if (!source.includes(`<meta property="og:description" content="${escapeHtml(description)}"`)) failures.push(`${path}: raw HTML has the wrong Open Graph description`);
    if (!source.includes(`<meta property="og:url" content="${canonicalUrl}"`)) failures.push(`${path}: raw HTML has the wrong Open Graph URL`);
    if (!source.includes(`<meta name="twitter:title" content="${escapeHtml(pageTitle)}"`)) failures.push(`${path}: raw HTML has the wrong Twitter title`);
    if (!source.includes(`<link rel="canonical" href="${canonicalUrl}"`)) failures.push(`${path}: raw HTML has the wrong canonical URL`);
    const slashResponse = await fetch(`${baseUrl}${path}/`, { redirect: "manual" });
    if (slashResponse.status !== 308 || slashResponse.headers.get("location") !== path) {
      failures.push(`${path}/: expected a 308 redirect to ${path}`);
    }
  }

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
    const npmUrl = await page.getByRole("link", { name: "v0.3.1 npm package", exact: true }).getAttribute("href");
    const docsUrl = await page.getByRole("link", { name: "Read the docs", exact: true }).getAttribute("href");
    const playgroundUrl = await page.getByRole("link", { name: "Open playground", exact: true }).getAttribute("href");
    const dimensions = await dimensionsFor(page);

    if (!titleVisible) failures.push(`${viewport.name}: hero title is not visible`);
    if (canonicalUrl !== "https://boobstrap.org/") failures.push(`${viewport.name}: landing canonical URL is incorrect`);
    if (faviconUrl !== "/favicon.svg") failures.push(`${viewport.name}: landing favicon is incorrect`);
    if (ogImage !== ogImageUrl) failures.push(`${viewport.name}: landing OG image is incorrect`);
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
        };
      });
      if (!Object.values(drawerGeometry).every(Boolean)) {
        failures.push(`mobile: docs menu does not expose a complete independent scroll region (${JSON.stringify(drawerGeometry)})`);
      }
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
      if (await routePage.locator(".docs-code-block:not(.bs-code-window), .docs-code-label:not(.bs-code-header), .docs-code-label button:not(.bs-code-action), .docs-code-block > pre:not(.bs-code-body)").count() !== 0) {
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
        const shellSidebar = routePage.locator("#sidebar-shell > .bs-sidebar-layout > .bs-sidebar");
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
        if (await routePage.locator("[data-package-command-output]").textContent() !== "pnpm add @boobstrap/boobstrap") {
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
          || await configurator.locator('[data-theme-axis="radius"]').count() !== 2) {
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
          || await configurator.locator('[data-theme-axis="radius"][data-theme-value="rounded"]').getAttribute("aria-pressed") !== "false") {
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
        for (const publicContract of ["data-bs-theme", "data-bs-palette", "data-bs-radius", "--bs-color-primary-contrast", "--bs-color-focus-ring"]) {
          if (!themingText.includes(publicContract)) failures.push(`desktop: theming guide is missing ${publicContract}`);
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

      if (["collapse", "dropdown", "tabs"].includes(config.sectionId)) {
        const variants = routePage.locator("[data-code-variants]:visible");
        if (await variants.count() !== 1 || await variants.locator("[data-code-variant]").count() !== 3) {
          failures.push(`desktop: ${config.sectionId} implementation tabs are incomplete`);
        } else {
          await variants.getByRole("tab", { name: "Alpine.js", exact: true }).click();
          await variants.locator("[data-copy-example]").click();
          if (!await routePage.evaluate(() => navigator.clipboard.readText()).then((source) => source.includes("x-data"))) {
            failures.push(`desktop: ${config.sectionId} Alpine tab did not copy its implementation`);
          }
        }
      }

      if (config.sectionId === "behavior-layers" && await routePage.locator("[data-framework-tab]").count() !== 3) {
        failures.push("desktop: behavior overview does not preserve all framework tabs");
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
        for (let index = 0; index < 6; index += 1) await otpInputs.nth(index).fill(String(index + 1));
        if (await routePage.locator("#form-otp [data-bs-otp-value]").inputValue() !== "123456") failures.push("desktop: OTP example did not synchronize its value");
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
        if (await previews.count() !== 8) failures.push("desktop: button reference is missing rendered examples");
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
        for (const [tabName, marker] of [["Boobstrap JS", "data-bs-button"], ["Alpine.js", "x-data"], ["React", "useButton"]]) {
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
