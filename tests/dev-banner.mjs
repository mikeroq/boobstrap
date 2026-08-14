import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import { chromium } from "playwright";
import { developmentSiteOrigin, socialCards } from "../src/social-cards.js";

const run = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  child.once("error", reject);
  child.once("exit", (code, signal) => {
    if (code === 0) resolve();
    else reject(new Error(`${command} exited with ${code ?? signal}`));
  });
});

await run("npm", ["run", "build"], {
  env: { ...process.env, VITE_SITE_ENV: "development" },
});

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
  throw new Error("Development preview server did not start in time");
}

const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  await waitForServer();
  await mkdir("artifacts", { recursive: true });

  for (const card of socialCards) {
    const response = await fetch(`${baseUrl}${card.path}`);
    if (!response.ok) {
      failures.push(`${card.path}: development social metadata page returned HTTP ${response.status}`);
      continue;
    }
    const source = await response.text();
    const expectedImageUrl = `${developmentSiteOrigin}${card.imagePath}`;
    if (!source.includes(`<meta property="og:image" content="${expectedImageUrl}"`)
      || !source.includes(`<meta name="twitter:image" content="${expectedImageUrl}"`)) {
      failures.push(`${card.path}: development social image metadata does not use dev.boobstrap.org`);
    }
    const imageResponse = await fetch(`${baseUrl}${card.imagePath}`);
    if (!imageResponse.ok || imageResponse.headers.get("content-type") !== "image/png") {
      failures.push(`${card.path}: development social image is not available as PNG`);
    }
  }

  for (const viewport of [
    { name: "desktop", width: 1680, height: 940 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    for (const target of [
      { name: "landing", path: "/" },
      { name: "docs-overview", path: "/docs" },
      { name: "docs-route", path: "/docs/components/banners" },
    ]) {
      const page = await browser.newPage({ viewport });
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      await page.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle" });
      const banner = page.locator("[data-dev-banner]");
      const testName = `${viewport.name} ${target.name}`;

      if (!await banner.isVisible()) failures.push(`${testName}: development banner is not visible`);
      if (await banner.getAttribute("data-bs-state") !== "visible") failures.push(`${testName}: development banner controller did not initialize`);
      if (!await banner.getByText("Development preview", { exact: true }).isVisible()) failures.push(`${testName}: development banner title is missing`);
      if (!await banner.getByText("You are viewing dev.boobstrap.org, not the live Boobstrap site.", { exact: true }).isVisible()) {
        failures.push(`${testName}: development banner message is missing`);
      }
      if (await banner.getByRole("link", { name: "Visit live site", exact: true }).getAttribute("href") !== "https://boobstrap.org/") {
        failures.push(`${testName}: development banner live-site action is incorrect`);
      }

      const bannerBox = await banner.boundingBox();
      if (!bannerBox || Math.abs(bannerBox.width - viewport.width) > 1) failures.push(`${testName}: development banner is not full width`);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (dimensions.scrollWidth > dimensions.clientWidth + 1) failures.push(`${testName}: development banner causes horizontal overflow`);

      if (viewport.name === "mobile" && target.name === "docs-overview") {
        await page.getByRole("button", { name: "Open documentation menu" }).click();
        const openNavigationGeometry = await page.evaluate(() => {
          const bannerRect = document.querySelector("[data-dev-banner]").getBoundingClientRect();
          const headerRect = document.querySelector(".docs-header").getBoundingClientRect();
          const sidebarRect = document.querySelector("#docs-sidebar").getBoundingClientRect();
          return {
            headerFollowsBanner: Math.abs(headerRect.top - bannerRect.bottom) <= 1,
            sidebarFollowsHeader: Math.abs(sidebarRect.top - headerRect.bottom) <= 1,
          };
        });
        if (!Object.values(openNavigationGeometry).every(Boolean)) {
          failures.push(`${testName}: opening navigation breaks the banner/header/sidebar stack (${JSON.stringify(openNavigationGeometry)})`);
        }
        await page.keyboard.press("Escape");
      }

      await page.screenshot({ path: `artifacts/dev-banner-${target.name}-${viewport.name}.png`, fullPage: true });
      await banner.getByRole("button", { name: "Dismiss development preview banner" }).click();
      if (await banner.isVisible() || await banner.getAttribute("data-bs-state") !== "dismissed") {
        failures.push(`${testName}: development banner did not dismiss`);
      }
      if (consoleErrors.length) failures.push(`${testName}: ${consoleErrors.join("; ")}`);

      await page.close();
    }
  }
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Development banner checks passed on landing and docs pages at 1680×940 and 390×844.");
}
