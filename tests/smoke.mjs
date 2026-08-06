import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

const port = 4173;
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

  for (const asset of ["/favicon.svg", "/apple-touch-icon.png", "/og-image.jpg"]) {
    const response = await fetch(`${baseUrl}${asset}`);
    if (!response.ok) failures.push(`${asset}: returned HTTP ${response.status}`);
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
    const npmUrl = await page.getByRole("link", { name: "Boobstrap v0.1.3 on npm" }).getAttribute("href");
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
    const docsConsoleErrors = [];
    docsPage.on("console", (message) => {
      if (message.type() === "error") docsConsoleErrors.push(message.text());
    });
    docsPage.on("pageerror", (error) => docsConsoleErrors.push(error.message));

    await docsPage.goto(`${baseUrl}/docs.html`, { waitUntil: "networkidle" });
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
    const packageTabs = docsPage.getByRole("tab");
    const selectedManager = viewport.name === "desktop" ? "pnpm" : "Bun";
    const expectedCommand = viewport.name === "desktop" ? "pnpm add @boobstrap/boobstrap" : "bun add @boobstrap/boobstrap";

    if (!await docsPage.getByRole("heading", { name: "All classes", level: 2 }).isVisible()) {
      failures.push(`${viewport.name}: class reference heading is not visible`);
    }
    if (docsCanonicalUrl !== "https://boobstrap.org/docs.html") failures.push(`${viewport.name}: docs canonical URL is incorrect`);
    if (docsFaviconUrl !== "/favicon.svg") failures.push(`${viewport.name}: docs favicon is incorrect`);
    if (docsOgImage !== ogImageUrl) failures.push(`${viewport.name}: docs OG image is incorrect`);
    if (docsNpmLinks < 2) failures.push(`${viewport.name}: docs npm links are missing`);
    if (await packageTabs.count() !== 4) failures.push(`${viewport.name}: expected four package-manager tabs`);
    await docsPage.getByRole("tab", { name: selectedManager, exact: true }).click();
    if (await docsPage.locator("[data-package-command-output]").textContent() !== expectedCommand) {
      failures.push(`${viewport.name}: ${selectedManager} command did not activate`);
    }
    if (await docsPage.locator("[data-package-copy]").getAttribute("data-copy") !== expectedCommand) {
      failures.push(`${viewport.name}: ${selectedManager} copy command is incorrect`);
    }
    if (!await docsPage.locator(".docs-code-block code").filter({ hasText: "https://cdn.jsdelivr.net/npm/@boobstrap/boobstrap@0.1.3/dist/boobstrap.css" }).isVisible()) {
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
    if (docsConsoleErrors.length) failures.push(`${viewport.name}: docs ${docsConsoleErrors.join("; ")}`);

    if (viewport.name === "desktop") {
      await docsPage.getByLabel("Filter classes").fill("bs-btn");
      if (await docsPage.locator("#class-reference .reference-row").count() !== 7) {
        failures.push("desktop: class filtering did not return the seven button classes");
      }
      await docsPage.getByRole("button", { name: "Switch to light theme" }).click();
      if (await docsPage.locator("html").getAttribute("data-bs-theme") !== "light") {
        failures.push("desktop: theme toggle did not enable light theme");
      }
    } else {
      await docsPage.getByRole("button", { name: "Open documentation menu" }).click();
      if (!await docsPage.locator("#docs-sidebar").isVisible()) {
        failures.push("mobile: documentation menu did not open");
      }
    }

    await docsPage.close();
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
