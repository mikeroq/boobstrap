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

  for (const { path } of docsPages) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) failures.push(`${path}: returned HTTP ${response.status}`);
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
      await docsPage.keyboard.press("/");
      await docsPage.getByLabel("Filter documentation sections").fill("cards");
      if (!await docsPage.locator('.docs-nav a[href="/docs/components/cards"]').isVisible()) {
        failures.push("desktop: multi-page docs filter hid its match");
      }
      if (await docsPage.locator('.docs-nav a[href="/docs/components/buttons"]').isVisible()) {
        failures.push("desktop: multi-page docs filter retained a non-match");
      }
      await docsPage.getByLabel("Filter documentation sections").press("Escape");
      await docsPage.getByRole("button", { name: "Switch to light theme" }).click();
      if (await docsPage.locator("html").getAttribute("data-bs-theme") !== "light") {
        failures.push("desktop: docs theme toggle did not enable light theme");
      }
    } else {
      await docsPage.getByRole("button", { name: "Open documentation menu" }).click();
      if (!await docsPage.locator("#docs-sidebar").isVisible()) failures.push("mobile: docs menu did not open");
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
      if (await routePage.locator("[data-page-nav] a").count() < 1) {
        failures.push(`${viewport.name}: ${config.path} has no local page outline`);
      }
      if (await routePage.locator(".docs-component-pagination a").count() !== 2) {
        failures.push(`${viewport.name}: ${config.path} is missing previous/next documentation links`);
      }
      if (await routePage.getByRole("tab", { name: "Preview", exact: true }).count() !== 0 || await routePage.getByRole("tab", { name: "Code", exact: true }).count() !== 0) {
        failures.push(`${viewport.name}: ${config.path} retained preview/code tabs`);
      }
      const pairedExamples = await previews.evaluateAll((elements) => elements.every((preview) => {
        const code = preview.nextElementSibling;
        return code?.classList.contains("docs-code-block") && getComputedStyle(code).display !== "none";
      }));
      if (!pairedExamples) failures.push(`${viewport.name}: ${config.path} does not place visible code below every preview`);
      if (routeDimensions.scrollWidth > routeDimensions.clientWidth + 1) {
        failures.push(`${viewport.name}: ${config.path} has horizontal overflow (${routeDimensions.scrollWidth}px > ${routeDimensions.clientWidth}px)`);
      }
      if (routeErrors.length) failures.push(`${viewport.name}: ${config.path} ${routeErrors.join("; ")}`);

      if (config.sectionId.startsWith("form-") && viewport.name === "mobile") {
        await routePage.screenshot({ path: `artifacts/${config.sectionId}-mobile.png`, fullPage: true });
      }

      if (viewport.name !== "desktop") continue;

      if (config.sectionId === "installation") {
        await routePage.getByRole("tab", { name: "pnpm", exact: true }).click();
        if (await routePage.locator("[data-package-command-output]").textContent() !== "pnpm add @boobstrap/boobstrap") {
          failures.push("desktop: installation package tabs did not update");
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

      if (config.sectionId === "tokens" && await routePage.locator("#tokens .reference-row").count() !== expectedTokens) {
        failures.push("desktop: token reference does not match the installed stylesheet");
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
