import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { chromium } from "playwright";

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

const browser = await chromium.launch({ headless: true });
const failures = [];
const frameworkCss = await readFile("node_modules/@boobstrap/boobstrap/dist/boobstrap.css", "utf8");
const expectedClasses = new Set(
  [...frameworkCss.matchAll(/\.([a-z][a-z0-9-]*)/gi)]
    .map((match) => match[1])
    .filter((name) => name.startsWith("bs-")),
);
const tokenBlock = frameworkCss.match(/:root\s*,\s*\[data-bs-theme=["']dark["']\]\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const expectedTokens = [...tokenBlock.matchAll(/--bs-[a-z0-9-]+\s*:/g)].length;
const npmPackageUrl = "https://www.npmjs.com/package/@boobstrap/boobstrap";
const ogImageUrl = "https://boobstrap.org/og-image.jpg";

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

  for (const viewport of [
    { name: "desktop", width: 1680, height: 940 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.screenshot({ path: `artifacts/${viewport.name}.png` });

    const titleVisible = await page.getByRole("heading", { name: "Boobstrap", level: 1 }).isVisible();
    const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute("href");
    const faviconUrl = await page.locator('link[rel="icon"]').getAttribute("href");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    const npmUrl = await page.getByRole("link", { name: "v0.3.1 npm package", exact: true }).getAttribute("href");
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    if (!titleVisible) failures.push(`${viewport.name}: hero title is not visible`);
    if (canonicalUrl !== "https://boobstrap.org/") failures.push(`${viewport.name}: landing canonical URL is incorrect`);
    if (faviconUrl !== "/favicon.svg") failures.push(`${viewport.name}: landing favicon is incorrect`);
    if (ogImage !== ogImageUrl) failures.push(`${viewport.name}: landing OG image is incorrect`);
    if (twitterCard !== "summary_large_image") failures.push(`${viewport.name}: landing Twitter card is incorrect`);
    if (npmUrl !== npmPackageUrl) failures.push(`${viewport.name}: landing npm link is incorrect`);
    if (dimensions.scrollWidth > dimensions.clientWidth + 1) {
      failures.push(`${viewport.name}: horizontal overflow (${dimensions.scrollWidth}px > ${dimensions.clientWidth}px)`);
    }
    if (consoleErrors.length) failures.push(`${viewport.name}: ${consoleErrors.join("; ")}`);

    if (viewport.name === "desktop") {
      await page.getByLabel("Email address").fill("dev@example.com");
      await page.getByRole("button", { name: "Subscribe" }).click();
      await page.getByText("You're covered").waitFor();
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

    const docsDimensions = await docsPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    const documentedClasses = await docsPage.locator("#class-reference .reference-row").count();
    const documentedTokens = await docsPage.locator("#tokens .reference-row").count();
    const docsCanonicalUrl = await docsPage.locator('link[rel="canonical"]').getAttribute("href");
    const docsFaviconUrl = await docsPage.locator('link[rel="icon"]').getAttribute("href");
    const docsOgImage = await docsPage.locator('meta[property="og:image"]').getAttribute("content");
    const docsNpmLinks = await docsPage.locator(`a[href="${npmPackageUrl}"]`).count();
    const starterDownloadLinks = await docsPage.locator('a[href="/boobstrap-starter.zip"][download]').count();
    const buttonDocumentationLinks = await docsPage.locator('a[href="/docs/components/buttons"]').count();
    const componentExamples = docsPage.locator("[data-component-example]");
    const componentCopyButtons = docsPage.locator("[data-copy-example]");
    const packageTabs = docsPage.locator("[data-package-command]");
    const selectedManager = viewport.name === "desktop" ? "pnpm" : "Bun";
    const expectedCommand = viewport.name === "desktop" ? "pnpm add @boobstrap/boobstrap" : "bun add @boobstrap/boobstrap";

    if (!await docsPage.getByRole("heading", { name: "All classes", level: 2 }).isVisible()) {
      failures.push(`${viewport.name}: class reference heading is not visible`);
    }
    if (docsCanonicalUrl !== "https://boobstrap.org/docs") failures.push(`${viewport.name}: docs canonical URL is incorrect`);
    if (docsFaviconUrl !== "/favicon.svg") failures.push(`${viewport.name}: docs favicon is incorrect`);
    if (docsOgImage !== ogImageUrl) failures.push(`${viewport.name}: docs OG image is incorrect`);
    if (docsNpmLinks < 2) failures.push(`${viewport.name}: docs npm links are missing`);
    if (starterDownloadLinks < 2) failures.push(`${viewport.name}: starter download is not prominent in docs`);
    if (buttonDocumentationLinks < 3) failures.push(`${viewport.name}: dedicated button documentation is not prominent in docs`);
    if (await componentExamples.count() !== 9) failures.push(`${viewport.name}: expected nine rendered component examples`);
    if (await componentCopyButtons.count() !== 10) failures.push(`${viewport.name}: expected ten component copy controls`);
    if (await docsPage.locator(".docs-example-guidance").count() !== 9) failures.push(`${viewport.name}: example guidance is incomplete`);
    if (await docsPage.locator(".docs-example-guidance > div").count() !== 27) failures.push(`${viewport.name}: detailed example anatomy is incomplete`);
    if (await docsPage.locator(".docs-api").count() !== 11) failures.push(`${viewport.name}: component API references are incomplete`);
    if (await docsPage.locator("[data-example-shell]").count() !== 9) failures.push(`${viewport.name}: tabbed examples are incomplete`);
    if (await docsPage.locator("[data-code-variants]").count() !== 4) failures.push(`${viewport.name}: behavior code variants are incomplete`);
    if (await packageTabs.count() !== 4) failures.push(`${viewport.name}: expected four package-manager tabs`);
    await docsPage.getByRole("tab", { name: selectedManager, exact: true }).click();
    if (await docsPage.locator("[data-package-command-output]").textContent() !== expectedCommand) {
      failures.push(`${viewport.name}: ${selectedManager} command did not activate`);
    }
    if (await docsPage.locator("[data-package-copy]").getAttribute("data-copy") !== expectedCommand) {
      failures.push(`${viewport.name}: ${selectedManager} copy command is incorrect`);
    }
    if (!await docsPage.locator(".docs-code-block code").filter({ hasText: "https://cdn.jsdelivr.net/npm/@boobstrap/boobstrap@0.3.1/dist/boobstrap.css" }).isVisible()) {
      failures.push(`${viewport.name}: version-pinned CDN option is not visible`);
    }
    if (docsDimensions.scrollWidth > docsDimensions.clientWidth + 1) {
      failures.push(`${viewport.name}: docs horizontal overflow (${docsDimensions.scrollWidth}px > ${docsDimensions.clientWidth}px)`);
    }
    if (documentedClasses !== expectedClasses.size) {
      failures.push(`${viewport.name}: docs list ${documentedClasses} of ${expectedClasses.size} framework classes`);
    }
    if (documentedTokens !== expectedTokens) {
      failures.push(`${viewport.name}: docs list ${documentedTokens} of ${expectedTokens} framework tokens`);
    }
    if (viewport.name === "desktop") {
      for (const name of ["responsive-layout", "buttons", "navbar", "cards", "alerts", "forms", "collapse", "dropdown", "tabs"]) {
        const exampleShell = docsPage.locator(`[data-example-shell="${name}"]`);
        await exampleShell.getByRole("tab", { name: "Code" }).click();
        const copyButton = exampleShell.locator(`[data-copy-example="${name}"]`);
        if (["collapse", "dropdown", "tabs"].includes(name)) {
          const jsTab = exampleShell.getByRole("tab", { name: "Boobstrap JS", exact: true });
          const alpineTab = exampleShell.getByRole("tab", { name: "Alpine.js", exact: true });
          await jsTab.click();
          const jsMarkup = await exampleShell.locator('[data-code-variant-panel="js"]').getAttribute("data-copy-source");
          await copyButton.click();
          if (await docsPage.evaluate(() => navigator.clipboard.readText()) !== jsMarkup || !jsMarkup.includes("data-bs")) {
            failures.push(`desktop: ${name} Boobstrap JS variant did not copy complete markup`);
          }
          await alpineTab.click();
          const alpineMarkup = await exampleShell.locator('[data-code-variant-panel="alpine"]').getAttribute("data-copy-source");
          await copyButton.click();
          if (await docsPage.evaluate(() => navigator.clipboard.readText()) !== alpineMarkup || !alpineMarkup.includes("x-data")) {
            failures.push(`desktop: ${name} Alpine variant did not copy complete markup`);
          }
          const reactTab = exampleShell.getByRole("tab", { name: "React", exact: true });
          await reactTab.click();
          const reactMarkup = await exampleShell.locator('[data-code-variant-panel="react"]').getAttribute("data-copy-source");
          await copyButton.click();
          if (await docsPage.evaluate(() => navigator.clipboard.readText()) !== reactMarkup || !reactMarkup.includes("use")) {
            failures.push(`desktop: ${name} React variant did not copy complete markup`);
          }
          await jsTab.focus();
          await jsTab.press("ArrowRight");
          if (await alpineTab.getAttribute("aria-selected") !== "true" || !await alpineTab.evaluate((element) => element === document.activeElement)) {
            failures.push(`desktop: ${name} behavior switcher is not keyboard accessible`);
          }
          await alpineTab.press("End");
          if (await reactTab.getAttribute("aria-selected") !== "true" || !await reactTab.evaluate((element) => element === document.activeElement)) {
            failures.push(`desktop: ${name} React variant is not keyboard accessible`);
          }
        } else {
          const expectedMarkup = await copyButton.getAttribute("data-copy");
          await copyButton.click();
          const copiedMarkup = await docsPage.evaluate(() => navigator.clipboard.readText());
          if (copiedMarkup !== expectedMarkup) failures.push(`desktop: ${name} copy control did not copy complete markup`);
        }
        await exampleShell.getByRole("tab", { name: "Preview" }).click();
        if (!await exampleShell.locator("[data-component-example]").isVisible()) failures.push(`desktop: ${name} preview did not restore`);
      }
      const frameworkSwitcher = docsPage.locator("[data-framework-tabs]");
      const alpineTab = frameworkSwitcher.getByRole("tab", { name: "Alpine.js", exact: true });
      await alpineTab.click();
      const alpinePanel = docsPage.locator('[data-framework-panel="alpine"]');
      if (!await alpinePanel.isVisible()) failures.push("desktop: Alpine integration panel did not activate");
      const alpineCopy = alpinePanel.locator("[data-copy]");
      await alpineCopy.click();
      const alpineSource = await docsPage.evaluate(() => navigator.clipboard.readText());
      if (!alpineSource.includes('@boobstrap/alpine')) failures.push("desktop: Alpine setup did not copy its complete source");
      const reactTab = frameworkSwitcher.getByRole("tab", { name: "React", exact: true });
      await reactTab.click();
      const reactPanel = docsPage.locator('[data-framework-panel="react"]');
      if (!await reactPanel.isVisible()) failures.push("desktop: React integration panel did not activate");
      await reactPanel.locator("[data-copy]").click();
      const reactSource = await docsPage.evaluate(() => navigator.clipboard.readText());
      if (!reactSource.includes('@boobstrap/react')) failures.push("desktop: React setup did not copy its complete source");

      const loadingVariants = docsPage.locator('[data-code-variants]').filter({ has: docsPage.locator('[data-copy-example="button-loading"]') });
      for (const [tabName, marker] of [["Boobstrap JS", "data-bs-button"], ["Alpine.js", "x-data"], ["React", "useButton"]]) {
        await loadingVariants.getByRole("tab", { name: tabName, exact: true }).click();
        await loadingVariants.locator('[data-copy-example="button-loading"]').click();
        if (!await docsPage.evaluate(() => navigator.clipboard.readText()).then((source) => source.includes(marker))) {
          failures.push(`desktop: loading button ${tabName} variant did not copy complete source`);
        }
      }

      const loadingButton = docsPage.locator("[data-demo-loading]");
      await loadingButton.click();
      await docsPage.waitForFunction(() => document.querySelector("[data-demo-loading]")?.dataset.bsState === "loading");
      if (!await loadingButton.isDisabled() || await loadingButton.getAttribute("aria-busy") !== "true" || !await loadingButton.locator(".bs-btn-spinner").isVisible()) {
        failures.push("desktop: loading button did not synchronize its disabled, busy, and spinner states");
      }
      const spinnerOffsets = await loadingButton.evaluate(async (button) => {
        const spinner = button.querySelector(".bs-btn-spinner");
        const offsets = [];
        for (let frame = 0; frame < 3; frame += 1) {
          const buttonRect = button.getBoundingClientRect();
          const spinnerRect = spinner.getBoundingClientRect();
          offsets.push({
            x: Math.abs((spinnerRect.left + spinnerRect.width / 2) - (buttonRect.left + buttonRect.width / 2)),
            y: Math.abs((spinnerRect.top + spinnerRect.height / 2) - (buttonRect.top + buttonRect.height / 2)),
          });
          await new Promise((resolve) => window.setTimeout(resolve, 90));
        }
        return offsets;
      });
      if (spinnerOffsets.some(({ x, y }) => x > 1 || y > 1)) {
        failures.push("desktop: loading spinner moved away from the button center while rotating");
      }
      await docsPage.waitForFunction(() => document.querySelector("[data-demo-loading]")?.dataset.bsState === "idle");
      if (await loadingButton.isDisabled()) failures.push("desktop: loading button did not restore after the demo request");

      const collapsePreview = docsPage.locator('[data-component-example="collapse"]');
      const collapseToggle = collapsePreview.getByRole("button", { name: "Toggle details" });
      await collapseToggle.click();
      if (await collapseToggle.getAttribute("aria-expanded") !== "true" || !await collapsePreview.locator("#docs-collapse-panel").isVisible()) {
        failures.push("desktop: collapse example did not reveal and synchronize its panel");
      }

      const dropdownPreview = docsPage.locator('[data-component-example="dropdown"]');
      const dropdownToggle = dropdownPreview.getByRole("button", { name: "More save options" });
      await dropdownToggle.focus();
      await dropdownToggle.press("ArrowDown");
      const publishItem = dropdownPreview.getByRole("menuitem", { name: "Save and publish" });
      if (!await dropdownPreview.getByRole("menu").isVisible() || !await publishItem.evaluate((element) => element === document.activeElement)) {
        failures.push("desktop: dropdown example did not open with keyboard focus");
      }
      await publishItem.press("Escape");
      if (await dropdownPreview.getByRole("menu").isVisible() || !await dropdownToggle.evaluate((element) => element === document.activeElement)) {
        failures.push("desktop: dropdown example did not close and restore focus with Escape");
      }

      const tabsPreview = docsPage.locator('[data-component-example="tabs"]');
      const profileTab = tabsPreview.getByRole("tab", { name: "Profile" });
      const securityTab = tabsPreview.getByRole("tab", { name: "Security" });
      await profileTab.focus();
      await profileTab.press("ArrowRight");
      if (await securityTab.getAttribute("aria-selected") !== "true" || !await tabsPreview.getByRole("tabpanel", { name: "Security" }).isVisible()) {
        failures.push("desktop: tabs example did not activate the next panel from the keyboard");
      }

      await docsPage.keyboard.press("/");
      await docsPage.getByLabel("Filter documentation sections").fill("cards");
      if (!await docsPage.locator('.docs-nav a[href="#cards"]').isVisible()) failures.push("desktop: docs navigation filter hid its match");
      if (await docsPage.locator('.docs-nav a[href="/docs/components/buttons"]').isVisible()) failures.push("desktop: docs navigation filter retained a non-match");
      await docsPage.getByLabel("Filter documentation sections").fill("alpine");
      if (!await docsPage.locator('.docs-nav a[href="#behavior-layers"]').isVisible()) failures.push("desktop: docs navigation filter could not find Alpine guidance");
      await docsPage.getByLabel("Filter documentation sections").press("Escape");
      await docsPage.getByLabel("Filter classes").fill("bs-btn");
      if (await docsPage.locator("#class-reference .reference-row").count() !== 18) {
        failures.push("desktop: class filtering did not return the eighteen button classes");
      }
      await docsPage.getByRole("button", { name: "Switch to light theme" }).click();
      if (await docsPage.locator("html").getAttribute("data-bs-theme") !== "light") {
        failures.push("desktop: theme toggle did not enable light theme");
      }
      await docsPage.locator('.docs-nav a[href="#cards"]').click();
      await docsPage.waitForFunction(() => document.querySelector('.docs-nav a[href="#cards"]')?.getAttribute("aria-current") === "location");
      await docsPage.evaluate(() => {
        const section = document.querySelector("#forms");
        const headerHeight = document.querySelector(".docs-header")?.offsetHeight ?? 0;
        window.scrollTo({ top: section.offsetTop - headerHeight, behavior: "instant" });
      });
      await docsPage.waitForFunction(() => document.querySelector('.docs-nav a[href="#forms"]')?.getAttribute("aria-current") === "location");
      if (await docsPage.locator('.docs-nav a[href="#cards"]').getAttribute("aria-current") !== null) {
        failures.push("desktop: clicked navigation link stayed active after scrolling to another section");
      }
      await docsPage.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await docsPage.waitForFunction(() => document.querySelector('.docs-nav a[href="#accessibility"]')?.getAttribute("aria-current") === "location");
    } else {
      await docsPage.getByRole("button", { name: "Open documentation menu" }).click();
      if (!await docsPage.locator("#docs-sidebar").isVisible()) {
        failures.push("mobile: documentation menu did not open");
      }
    }

    if (docsConsoleErrors.length) failures.push(`${viewport.name}: docs after interaction ${docsConsoleErrors.join("; ")}`);

    await docsPage.close();

    const buttonsPage = await browser.newPage({ viewport });
    await buttonsPage.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    const buttonsConsoleErrors = [];
    buttonsPage.on("console", (message) => {
      if (message.type() === "error") buttonsConsoleErrors.push(message.text());
    });
    buttonsPage.on("pageerror", (error) => buttonsConsoleErrors.push(error.message));

    await buttonsPage.goto(`${baseUrl}/docs/components/buttons`, { waitUntil: "networkidle" });
    await buttonsPage.screenshot({ path: `artifacts/buttons-${viewport.name}.png`, fullPage: true });
    const buttonsDimensions = await buttonsPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    const buttonSections = buttonsPage.locator(".docs-section");
    const buttonExamples = buttonsPage.locator("[data-component-example]");
    const buttonCopies = buttonsPage.locator("[data-copy-example]");

    if (!await buttonsPage.getByRole("heading", { name: "Buttons", level: 1 }).isVisible()) {
      failures.push(`${viewport.name}: dedicated button documentation heading is not visible`);
    }
    if (await buttonsPage.locator('link[rel="canonical"]').getAttribute("href") !== "https://boobstrap.org/docs/components/buttons") {
      failures.push(`${viewport.name}: button documentation canonical URL is incorrect`);
    }
    if (await buttonSections.count() !== 10) failures.push(`${viewport.name}: button documentation is missing detailed sections`);
    if (await buttonExamples.count() !== 8) failures.push(`${viewport.name}: button documentation is missing rendered examples`);
    if (await buttonCopies.count() !== 8) failures.push(`${viewport.name}: button documentation is missing copy controls`);
    if (await buttonsPage.locator("[data-example-shell]").count() !== 8) failures.push(`${viewport.name}: button examples are not tabbed`);
    if (await buttonsPage.locator("[data-page-nav] a").count() !== 10) failures.push(`${viewport.name}: button page outline is incomplete`);
    if (await buttonsPage.locator('.docs-nav a[href="/docs/components/buttons"]').getAttribute("aria-current") !== "page") {
      failures.push(`${viewport.name}: button component is not current in the global docs navigation`);
    }
    if (buttonsDimensions.scrollWidth > buttonsDimensions.clientWidth + 1) {
      failures.push(`${viewport.name}: button docs horizontal overflow (${buttonsDimensions.scrollWidth}px > ${buttonsDimensions.clientWidth}px)`);
    }

    if (viewport.name === "desktop") {
      const variantsShell = buttonsPage.locator('[data-example-shell="button-variants"]');
      await variantsShell.getByRole("tab", { name: "Code" }).click();
      const variantsCopy = variantsShell.locator('[data-copy-example="button-variants"]');
      const variantsMarkup = await variantsCopy.getAttribute("data-copy");
      await variantsCopy.click();
      if (await buttonsPage.evaluate(() => navigator.clipboard.readText()) !== variantsMarkup) {
        failures.push("desktop: dedicated button example did not copy complete markup");
      }
      await variantsShell.getByRole("tab", { name: "Preview" }).click();

      const splitPreview = buttonsPage.locator('[data-component-example="button-split-dropdown"]');
      const splitToggle = splitPreview.getByRole("button", { name: "More save options" });
      await splitToggle.focus();
      await splitToggle.press("ArrowDown");
      const splitItem = splitPreview.getByRole("menuitem", { name: "Save and publish" });
      if (!await splitPreview.getByRole("menu").isVisible() || !await splitItem.evaluate((element) => element === document.activeElement)) {
        failures.push("desktop: dedicated split button did not open with keyboard focus");
      }
      await splitItem.press("Escape");

      const loadingShell = buttonsPage.locator('[data-example-shell="button-loading-detail"]');
      await loadingShell.getByRole("tab", { name: "Code" }).click();
      for (const [tabName, marker] of [["Boobstrap JS", "data-bs-button"], ["Alpine.js", "x-data"], ["React", "useButton"]]) {
        await loadingShell.getByRole("tab", { name: tabName, exact: true }).click();
        await loadingShell.locator('[data-copy-example="button-loading-detail"]').click();
        if (!await buttonsPage.evaluate(() => navigator.clipboard.readText()).then((source) => source.includes(marker))) {
          failures.push(`desktop: dedicated loading button ${tabName} variant did not copy complete source`);
        }
      }
      await loadingShell.getByRole("tab", { name: "Preview" }).click();
      const detailedLoadingButton = loadingShell.locator("[data-demo-loading]");
      await detailedLoadingButton.click();
      await buttonsPage.waitForFunction(() => document.querySelector("[data-demo-loading]")?.dataset.bsState === "loading");
      if (!await detailedLoadingButton.isDisabled() || await detailedLoadingButton.getAttribute("aria-busy") !== "true") {
        failures.push("desktop: dedicated loading example did not synchronize busy state");
      }
      await buttonsPage.waitForFunction(() => document.querySelector("[data-demo-loading]")?.dataset.bsState === "idle");

      await buttonsPage.getByLabel("Filter documentation").fill("buttons");
      if (!await buttonsPage.locator('.docs-nav a[href="/docs/components/buttons"]').isVisible()) {
        failures.push("desktop: multi-page docs filter hid the button page match");
      }
      await buttonsPage.getByLabel("Filter documentation").press("Escape");

      await buttonsPage.locator('[data-page-nav] a[href="#groups"]').click();
      await buttonsPage.waitForFunction(() => document.querySelector('[data-page-nav] a[href="#groups"]')?.getAttribute("aria-current") === "location");
      await buttonsPage.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await buttonsPage.waitForFunction(() => document.querySelector('[data-page-nav] a[href="#accessibility"]')?.getAttribute("aria-current") === "location");
      if (await buttonsPage.locator('[data-page-nav] a[href="#groups"]').getAttribute("aria-current") !== null) {
        failures.push("desktop: dedicated page outline did not update after scrolling");
      }
    } else {
      await buttonsPage.getByRole("button", { name: "Open documentation menu" }).click();
      if (!await buttonsPage.locator("#docs-sidebar").isVisible()) {
        failures.push("mobile: button documentation menu did not open");
      }
    }

    if (buttonsConsoleErrors.length) failures.push(`${viewport.name}: button docs ${buttonsConsoleErrors.join("; ")}`);
    await buttonsPage.close();

    const playgroundPage = await browser.newPage({ viewport });
    await playgroundPage.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    const playgroundConsoleErrors = [];
    playgroundPage.on("console", (message) => {
      if (message.type() === "error") playgroundConsoleErrors.push(message.text());
    });
    playgroundPage.on("pageerror", (error) => playgroundConsoleErrors.push(error.message));

    await playgroundPage.goto(`${baseUrl}/playground`, { waitUntil: "networkidle" });
    const playgroundDimensions = await playgroundPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    const previewFrame = playgroundPage.frameLocator("[data-preview]");
    await previewFrame.getByRole("heading", { name: "Build boldly." }).waitFor();
    await playgroundPage.screenshot({ path: `artifacts/playground-${viewport.name}.png`, fullPage: true });

    if (playgroundDimensions.scrollWidth > playgroundDimensions.clientWidth + 1) {
      failures.push(`${viewport.name}: playground horizontal overflow (${playgroundDimensions.scrollWidth}px > ${playgroundDimensions.clientWidth}px)`);
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
    if (!copiedPage.includes("Edited preview") || !copiedPage.includes(editedCss)) {
      failures.push(`${viewport.name}: playground copy did not return the current source`);
    }

    await playgroundPage.getByRole("button", { name: "Mobile", exact: true }).click();
    if (await playgroundPage.getByRole("button", { name: "Mobile", exact: true }).getAttribute("aria-pressed") !== "true") {
      failures.push(`${viewport.name}: mobile preview control did not activate`);
    }
    if (!await playgroundPage.locator("[data-preview-shell]").evaluate((element) => element.classList.contains("preview-size-mobile"))) {
      failures.push(`${viewport.name}: mobile preview width class is missing`);
    }

    await playgroundPage.getByRole("button", { name: "Reset" }).click();
    await previewFrame.getByRole("heading", { name: "Build boldly." }).waitFor();
    if (!await playgroundPage.getByLabel("HTML").inputValue().then((value) => value.includes("Boobstrap starter"))) {
      failures.push(`${viewport.name}: playground reset did not restore starter HTML`);
    }

    if (viewport.name === "mobile") {
      const htmlBox = await playgroundPage.getByLabel("HTML").boundingBox();
      const cssBox = await playgroundPage.getByLabel("CSS").boundingBox();
      if (!htmlBox || !cssBox || cssBox.y <= htmlBox.y + htmlBox.height) {
        failures.push("mobile: playground editors did not stack vertically");
      }
    }
    if (playgroundConsoleErrors.length) failures.push(`${viewport.name}: playground ${playgroundConsoleErrors.join("; ")}`);

    await playgroundPage.close();
  }
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Smoke checks passed at 1680×940 and 390×844; documented ${expectedClasses.size} classes and ${expectedTokens} tokens.`);
}
