import frameworkCss from "@boobstrap/boobstrap/dist/boobstrap.css?raw";
import "@boobstrap/boobstrap/dist/boobstrap.css";
import { initBoobstrap } from "@boobstrap/boobstrap/js";
import "./docs.css";
import { initDevelopmentBanner } from "./dev-banner.js";
import { initDataTablesDemo } from "./datatables-demo.js";
import { enhanceDocumentation } from "./docs-enhancements.js";
import { docsPageForPath, docsPages, normalizeDocsPath } from "./docs-pages.js";
import { highlightCodeBlocks, highlightCodeElement } from "./syntax-highlighting.js";

initDevelopmentBanner();
enhanceDocumentation();

document.querySelectorAll(".docs-nav a, .docs-on-this-page a").forEach((link) => {
  link.classList.add("bs-nav-link");
  if (link.classList.contains("docs-nav-subitem")) link.classList.add("bs-nav-link-subitem");
});
document.querySelectorAll(".docs-code-block").forEach((block) => {
  block.classList.add("bs-code-window");
  block.querySelector(":scope > .docs-code-label")?.classList.add("bs-code-header");
  block.querySelector(":scope > .docs-code-label button")?.classList.add("bs-code-action");
  const codeLabel = block.querySelector(":scope > .docs-code-label > span")?.textContent.trim() || "Source";
  block.querySelectorAll(":scope > pre, :scope > .docs-code-variant-panel > pre").forEach((pre) => {
    pre.classList.add("bs-code-body");
    pre.tabIndex = 0;
    pre.setAttribute("aria-label", `${codeLabel} code example`);
  });
  block.querySelectorAll(".docs-code-variant-tabs").forEach((tabs) => tabs.classList.add("bs-code-tabs"));
  block.querySelectorAll(".docs-code-variant-tabs button").forEach((tab) => tab.classList.add("bs-code-tab"));
  block.querySelectorAll(".docs-code-variant-panel").forEach((panel) => panel.classList.add("bs-code-panel"));
});
document.querySelectorAll(":not(pre) > code").forEach((code) => code.classList.add("bs-code-inline"));
document.querySelectorAll(".docs-package-tabs").forEach((tabs) => tabs.classList.add("bs-tabs", "bs-tabs-pills"));
document.querySelectorAll(".docs-package-tab").forEach((tab) => tab.classList.add("bs-tab"));
document.querySelectorAll(".docs-framework-tablist").forEach((tabs) => tabs.classList.add("bs-tabs", "bs-tabs-contained"));
document.querySelectorAll(".docs-framework-tablist button").forEach((tab) => tab.classList.add("bs-tab"));
document.querySelectorAll(".docs-framework-switcher [role=\"tabpanel\"]").forEach((panel) => panel.classList.add("bs-tab-panel", "bs-tab-panel-contained"));
document.querySelectorAll(".docs-quick-links a").forEach((card) => card.classList.add("bs-card", "bs-card-subtle", "bs-card-compact", "bs-card-link"));
document.querySelectorAll(".docs-directory-grid > section, .docs-usage-grid article").forEach((card) => card.classList.add("bs-card", "bs-card-subtle", "bs-card-body"));
document.querySelectorAll(".docs-topic-grid a").forEach((card) => card.classList.add("bs-card", "bs-card-subtle", "bs-card-body", "bs-card-link"));
document.querySelectorAll(".docs-reference-card").forEach((card) => card.classList.add("bs-card", "bs-card-subtle", "bs-card-compact"));
document.querySelectorAll(".docs-callout, .docs-note").forEach((callout) => {
  callout.classList.add("bs-alert", "bs-alert-primary");
  const content = document.createElement("span");
  content.append(...callout.childNodes);
  callout.append(content);
});
document.querySelectorAll(".docs-component-meta span, .docs-stat-row > span").forEach((badge) => badge.classList.add("bs-badge", "bs-text-xs"));
document.querySelectorAll(".docs-component-pagination").forEach((pagination) => {
  pagination.classList.add("bs-page-nav");
  pagination.querySelectorAll(":scope > a").forEach((link) => {
    link.classList.add("bs-page-nav-link");
    link.querySelector("span")?.classList.add("bs-page-nav-context");
    link.querySelector("strong")?.classList.add("bs-page-nav-title");
  });
});

const root = document.documentElement;

const updateSidebarOffset = () => {
  const header = document.querySelector(".docs-header");
  const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
  root.style.setProperty("--docs-sidebar-offset", `${Math.max(header?.offsetHeight ?? 0, headerBottom)}px`);
};

let sidebarOffsetQueued = false;
const queueSidebarOffset = () => {
  if (sidebarOffsetQueued) return;
  sidebarOffsetQueued = true;
  requestAnimationFrame(() => {
    sidebarOffsetQueued = false;
    updateSidebarOffset();
  });
};

updateSidebarOffset();
window.addEventListener("scroll", queueSidebarOffset, { passive: true });
window.addEventListener("resize", queueSidebarOffset);
document.addEventListener("bs:banner:dismissed", queueSidebarOffset);

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const storedTheme = localStorage.getItem("boobstrap-theme");
if (storedTheme === "light" || storedTheme === "dark") root.dataset.bsTheme = storedTheme;

const updateThemeLabel = () => {
  const nextTheme = root.dataset.bsTheme === "light" ? "dark" : "light";
  document.querySelector("[data-theme-toggle]")?.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
};

updateThemeLabel();
document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
  root.dataset.bsTheme = root.dataset.bsTheme === "light" ? "dark" : "light";
  localStorage.setItem("boobstrap-theme", root.dataset.bsTheme);
  updateThemeLabel();
});

const previewThemes = ["light", "dark"];

document.querySelectorAll(".docs-demo:not([data-theme-configurator])").forEach((preview) => {
  const initialTheme = root.dataset.bsTheme === "light" ? "light" : "dark";
  preview.dataset.bsTheme = initialTheme;
  preview.dataset.previewThemeReady = "";

  const controls = document.createElement("span");
  controls.className = "docs-preview-theme-switch";
  controls.dataset.previewThemeControls = "";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Preview color theme");

  const setPreviewTheme = (theme) => {
    preview.dataset.bsTheme = theme;
    controls.querySelectorAll("[data-preview-theme-option]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.previewThemeOption === theme));
    });
  };

  previewThemes.forEach((theme) => {
    const button = document.createElement("button");
    button.className = "docs-preview-theme-button";
    button.dataset.previewThemeOption = theme;
    button.type = "button";
    button.textContent = theme[0].toUpperCase() + theme.slice(1);
    button.setAttribute("aria-label", `Use ${theme} theme for this preview`);
    button.addEventListener("click", () => setPreviewTheme(theme));
    controls.append(button);
  });

  preview.prepend(controls);
  setPreviewTheme(initialTheme);
});

const themeAxes = {
  theme: ["dark", "light"],
  palette: ["rose", "violet", "blue", "teal", "amber"],
  radius: ["rounded", "square"],
};

const titleCase = (value) => value[0].toUpperCase() + value.slice(1);

document.querySelectorAll("[data-theme-configurator]").forEach((configurator) => {
  const markup = configurator.nextElementSibling?.querySelector("[data-theme-markup]");
  const copyButton = configurator.nextElementSibling?.querySelector("[data-theme-copy]");
  const status = configurator.querySelector("[data-theme-status]");
  const summary = configurator.querySelector("[data-theme-summary]");
  const state = {
    theme: themeAxes.theme.includes(configurator.dataset.bsTheme) ? configurator.dataset.bsTheme : "dark",
    palette: themeAxes.palette.includes(configurator.dataset.bsPalette) ? configurator.dataset.bsPalette : "rose",
    radius: themeAxes.radius.includes(configurator.dataset.bsRadius) ? configurator.dataset.bsRadius : "rounded",
  };

  const renderTheme = () => {
    configurator.dataset.bsTheme = state.theme;
    configurator.dataset.bsPalette = state.palette;
    configurator.dataset.bsRadius = state.radius;

    configurator.querySelectorAll("[data-theme-axis][data-theme-value]").forEach((button) => {
      button.setAttribute("aria-pressed", String(state[button.dataset.themeAxis] === button.dataset.themeValue));
    });

    const selectionLabel = `${titleCase(state.theme)} · ${titleCase(state.palette)} · ${titleCase(state.radius)}`;
    if (summary) summary.textContent = selectionLabel;
    if (status) status.textContent = `Previewing ${state.theme} mode, ${state.palette} palette, and ${state.radius} corners.`;

    const source = `<html\n  data-bs-theme="${state.theme}"\n  data-bs-palette="${state.palette}"\n  data-bs-radius="${state.radius}"\n>`;
    if (markup) {
      markup.textContent = source;
      highlightCodeElement(markup);
    }
    if (copyButton) copyButton.dataset.copy = source;
  };

  configurator.querySelectorAll("[data-theme-axis][data-theme-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const { themeAxis: axis, themeValue: value } = button.dataset;
      if (!themeAxes[axis]?.includes(value)) return;
      state[axis] = value;
      renderTheme();
    });
  });

  renderTheme();
});

const themeColorReference = document.querySelector("[data-theme-color-reference]");
const isThemeColorReferenceRoute = normalizeDocsPath(window.location.pathname) === "/docs/getting-started/theming";
if (themeColorReference && isThemeColorReferenceRoute) {
  const themeReferenceTokenBlock = frameworkCss.match(/:root\s*,\s*\[data-bs-theme=["']dark["']\]\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const themeReferenceTokens = [...themeReferenceTokenBlock.matchAll(/(--bs-[a-z0-9-]+)\s*:/g)].map(([, name]) => name);
  const brandTokens = themeReferenceTokens.filter((name) => name.startsWith("--bs-brand-"));
  const semanticColorTokens = themeReferenceTokens.filter((name) => name.startsWith("--bs-color-"));
  const probe = document.createElement("div");
  probe.className = "docs-color-token-probe";
  probe.setAttribute("aria-hidden", "true");
  document.body.append(probe);

  const tokenValuesFor = (theme, palette, tokenNames) => {
    probe.dataset.bsTheme = theme;
    probe.dataset.bsPalette = palette;
    const styles = getComputedStyle(probe);
    return Object.fromEntries(tokenNames.map((name) => [name, styles.getPropertyValue(name).trim()]));
  };

  const paletteValues = Object.fromEntries(themeAxes.palette.map((palette) => [
    palette,
    {
      brand: tokenValuesFor("dark", palette, brandTokens),
      dark: tokenValuesFor("dark", palette, semanticColorTokens),
      light: tokenValuesFor("light", palette, semanticColorTokens),
    },
  ]));
  probe.remove();

  const swatchClassFor = (token) => `token-swatch-${token.replace("--bs-", "")}`;
  const renderPaletteHeading = (palette) => `<span class="docs-color-palette-heading" data-bs-theme="dark" data-bs-palette="${palette}"><span class="token-swatch docs-color-token-swatch token-swatch-brand-500" aria-hidden="true"></span>${titleCase(palette)}</span>`;
  const renderMatrix = ({ heading, description, tokens: tokenNames, valueKey }) => {
    const rows = tokenNames.map((token) => {
      const values = themeAxes.palette.map((palette) => {
        const value = paletteValues[palette][valueKey][token];
        return `<td data-bs-theme="${valueKey === "brand" ? "dark" : valueKey}" data-bs-palette="${palette}" data-color-token-cell data-token="${escapeHtml(token)}"><span class="docs-color-token-value"><span class="token-swatch docs-color-token-swatch ${swatchClassFor(token)}" aria-hidden="true"></span><code>${escapeHtml(value)}</code></span></td>`;
      }).join("");
      return `<tr><th scope="row"><code>${escapeHtml(token)}</code></th>${values}</tr>`;
    }).join("");

    return `<section class="docs-color-reference-group"><h4>${escapeHtml(heading)}</h4><p>${escapeHtml(description)}</p><div class="docs-table-wrap docs-color-table-wrap bs-table-responsive" role="region" tabindex="0" aria-label="${escapeHtml(heading)}"><table class="docs-table docs-color-token-table bs-table"><caption class="bs-sr-only">${escapeHtml(heading)} across Rose, Violet, Blue, Teal, and Amber palettes</caption><thead><tr><th scope="col">Token</th>${themeAxes.palette.map((palette) => `<th scope="col">${renderPaletteHeading(palette)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
  };

  themeColorReference.innerHTML = [
    renderMatrix({
      heading: "Palette brand scales",
      description: "Primitive accent steps shared by dark and light mode for each palette.",
      tokens: brandTokens,
      valueKey: "brand",
    }),
    renderMatrix({
      heading: "Dark mode semantic colors",
      description: "Resolved component-facing colors when data-bs-theme is dark.",
      tokens: semanticColorTokens,
      valueKey: "dark",
    }),
    renderMatrix({
      heading: "Light mode semantic colors",
      description: "Resolved component-facing colors when data-bs-theme is light.",
      tokens: semanticColorTokens,
      valueKey: "light",
    }),
  ].join("");
}

const docsPath = normalizeDocsPath(window.location.pathname);
const activeDocsPage = docsPageForPath(docsPath);
const isDocsOverview = docsPath === "/docs";
const docsIndex = document.querySelector("[data-docs-index]");
const monolithSections = [...document.querySelectorAll(".docs-content > .docs-section")];
let routedSection = null;

const updatePageMetadata = ({ path, title, description }) => {
  const pageTitle = `${title} — Boobstrap`;
  const canonicalUrl = `https://boobstrap.org${path}`;
  document.title = pageTitle;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", pageTitle);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
};

const createRoutedHero = (config) => {
  const header = document.createElement("header");
  header.className = "docs-component-hero docs-routed-hero";

  const breadcrumb = document.createElement("nav");
  breadcrumb.className = "docs-breadcrumb bs-breadcrumb";
  breadcrumb.setAttribute("aria-label", "Breadcrumb");
  const docsLink = document.createElement("a");
  docsLink.href = "/docs";
  docsLink.textContent = "Docs";
  const firstDivider = document.createElement("span");
  firstDivider.setAttribute("aria-hidden", "true");
  firstDivider.textContent = "/";
  const category = document.createElement("span");
  category.textContent = config.category;
  const secondDivider = firstDivider.cloneNode(true);
  const current = document.createElement("span");
  current.textContent = config.title;
  breadcrumb.append(docsLink, firstDivider, category, secondDivider, current);

  const kicker = document.createElement("div");
  kicker.className = "docs-kicker";
  kicker.textContent = config.category;
  const heading = document.createElement("h1");
  heading.textContent = config.title;
  const lead = document.createElement("p");
  lead.className = "bs-lead";
  lead.textContent = config.description;
  const meta = document.createElement("div");
  meta.className = "docs-component-meta";
  meta.setAttribute("aria-label", `${config.title} documentation summary`);
  const hasExamples = routedSection?.querySelector("[data-component-example], .docs-code-block");
  meta.innerHTML = `<span class="bs-badge bs-text-xs"><strong>${escapeHtml(config.category)}</strong> guide</span><span class="bs-badge bs-text-xs"><strong>${hasExamples ? "Copy-ready" : "Complete"}</strong> reference</span><span class="bs-badge bs-text-xs"><strong>v0.3.1</strong> current</span>`;
  header.append(breadcrumb, kicker, heading, lead, meta);
  return header;
};

if (docsIndex) {
  const introduction = document.querySelector("#introduction");
  if (isDocsOverview) {
    monolithSections.forEach((section) => { section.hidden = section !== docsIndex; });
    if (introduction) introduction.hidden = false;
  } else if (activeDocsPage) {
    updatePageMetadata(activeDocsPage);
    routedSection = document.querySelector(`#${activeDocsPage.sectionId}`);
    monolithSections.forEach((section) => { section.hidden = section !== routedSection; });
    if (introduction) introduction.hidden = activeDocsPage.sectionId !== "introduction";
    if (docsIndex) docsIndex.hidden = true;

    if (routedSection?.classList.contains("docs-section")) {
      routedSection.classList.add("docs-routed-section");
      routedSection.querySelectorAll(":scope > h3").forEach((heading) => heading.setAttribute("aria-level", "2"));
      routedSection.before(createRoutedHero(activeDocsPage));
    } else if (routedSection === introduction) {
      introduction.classList.add("docs-routed-introduction");
      const heading = introduction.querySelector("h1");
      const lead = introduction.querySelector(".bs-lead");
      const breadcrumb = introduction.querySelector(".docs-breadcrumb");
      if (heading) heading.textContent = activeDocsPage.title;
      if (lead) lead.textContent = activeDocsPage.description;
      if (breadcrumb) breadcrumb.innerHTML = '<a href="/docs">Docs</a><span aria-hidden="true">/</span><span>Get started</span><span aria-hidden="true">/</span><span>Introduction</span>';
    }
  }
}

if (activeDocsPage?.sectionId === "table-datatables" && routedSection) {
  initDataTablesDemo(routedSection);
}

if (docsIndex && activeDocsPage) {
  const activeIndex = docsPages.findIndex(({ path }) => path === activeDocsPage.path);
  const previousPage = docsPages[activeIndex - 1] ?? { path: "/docs", title: "Documentation overview", category: "Documentation" };
  const nextPage = docsPages[activeIndex + 1] ?? { path: "/docs", title: "Documentation overview", category: "Documentation" };
  const pagination = document.createElement("nav");
  pagination.className = "docs-component-pagination bs-page-nav";
  pagination.setAttribute("aria-label", "Documentation pagination");

  const createPaginationLink = (config, direction) => {
    const link = document.createElement("a");
    link.className = "bs-page-nav-link";
    link.href = config.path;
    const context = document.createElement("span");
    context.className = "bs-page-nav-context";
    context.textContent = direction === "previous" ? `Previous · ${config.category}` : `Next · ${config.category}`;
    const title = document.createElement("strong");
    title.className = "bs-page-nav-title";
    title.textContent = direction === "previous" ? `← ${config.title}` : `${config.title} →`;
    link.append(context, title);
    return link;
  };

  pagination.append(createPaginationLink(previousPage, "previous"), createPaginationLink(nextPage, "next"));
  document.querySelector(".docs-footer")?.before(pagination);
}

if (activeDocsPage) {
  updatePageMetadata(activeDocsPage);
  document.querySelectorAll(".docs-nav a").forEach((link) => {
    const linkPath = normalizeDocsPath(new URL(link.href, window.location.origin).pathname);
    if (linkPath === docsPath) link.setAttribute("aria-current", "page");
    else if (link.getAttribute("aria-current") === "page") link.removeAttribute("aria-current");
  });
}

const navDisclosures = [...document.querySelectorAll("[data-nav-disclosure]")].map((disclosure) => {
  const toggle = disclosure.querySelector("[data-nav-disclosure-toggle]");
  const submenu = disclosure.querySelector("[data-nav-submenu]");
  const row = disclosure.querySelector(".docs-nav-disclosure-row");
  const parentLink = row?.querySelector("a");
  const prefix = normalizeDocsPath(disclosure.dataset.navPrefix ?? "");
  const label = parentLink?.textContent.trim() || "Submenu";
  let open = docsPath === prefix || docsPath.startsWith(`${prefix}/`);

  const render = (forcedOpen) => {
    const expanded = forcedOpen ?? open;
    submenu.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", `${expanded ? "Hide" : "Show"} ${label} pages`);
  };

  toggle?.addEventListener("click", () => {
    open = !open;
    render();
  });
  render();

  return { disclosure, parentLink, row, submenu, render };
});

document.querySelectorAll("[data-copy], [data-copy-code]").forEach((button) => {
  button.addEventListener("click", async () => {
    const originalLabel = button.textContent;
    const source = button.dataset.copy
      ?? button.closest(".docs-code-block")?.querySelector("pre code")?.textContent.trim()
      ?? "";
    try {
      await navigator.clipboard.writeText(source);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select code";
    }
    window.setTimeout(() => { button.textContent = originalLabel; }, 1400);
  });
});

document.querySelectorAll("[data-framework-tabs]").forEach((switcher) => {
  const tabs = [...switcher.querySelectorAll("[data-framework-tab]")];
  const panels = [...switcher.querySelectorAll("[data-framework-panel]")];

  const selectFramework = (tab, moveFocus = false) => {
    const framework = tab.dataset.frameworkTab;
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.frameworkPanel !== framework;
    });
    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectFramework(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      selectFramework(tabs[nextIndex], true);
    });
  });
});

document.querySelectorAll("[data-code-variants]").forEach((switcher) => {
  const tabs = [...switcher.querySelectorAll("[data-code-variant]")];
  const panels = [...switcher.querySelectorAll("[data-code-variant-panel]")];
  const copyButton = switcher.querySelector("[data-copy-example]");
  const codeLabel = switcher.querySelector("[data-code-label]");

  const selectVariant = (tab, moveFocus = false) => {
    const variant = tab.dataset.codeVariant;
    const panel = panels.find((candidate) => candidate.dataset.codeVariantPanel === variant);
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((candidate) => {
      candidate.hidden = candidate !== panel;
    });
    copyButton.dataset.copy = panel.dataset.copySource;
    copyButton.dataset.copyVariant = variant;
    codeLabel.textContent = `HTML · ${tab.textContent}`;
    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectVariant(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      selectVariant(tabs[nextIndex], true);
    });
  });

  const selectedTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ?? tabs[0];
  selectVariant(selectedTab);
});

initBoobstrap(document);
document.querySelectorAll("[data-demo-loading]").forEach((button) => {
  button.addEventListener("bs:button:started", (event) => {
    window.setTimeout(() => event.detail.controller.stop({ reason: "demo" }), 1200);
  });
});

const navFilter = document.querySelector("[data-nav-filter]");
const navGroups = [...document.querySelectorAll("[data-nav-group]")];
const navEmpty = document.querySelector("[data-nav-empty]");

const filterNavigation = () => {
  const query = navFilter.value.trim().toLowerCase();
  let visibleCount = 0;
  navGroups.forEach((group) => {
    let groupCount = 0;
    group.querySelectorAll("a").forEach((link) => {
      const visible = link.textContent.toLowerCase().includes(query);
      link.hidden = !visible;
      if (visible) groupCount += 1;
    });

    navDisclosures
      .filter(({ disclosure }) => group.contains(disclosure))
      .forEach(({ disclosure, parentLink, row, submenu, render }) => {
        const parentMatches = parentLink && !parentLink.hidden;
        const childMatches = [...submenu.querySelectorAll("a")].some((link) => !link.hidden);
        disclosure.hidden = Boolean(query) && !parentMatches && !childMatches;
        row.hidden = Boolean(query) && !parentMatches;
        render(query ? childMatches : undefined);
      });

    group.hidden = groupCount === 0;
    visibleCount += groupCount;
  });
  navEmpty.hidden = visibleCount !== 0;
};

navFilter?.addEventListener("input", filterNavigation);
navFilter?.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  navFilter.value = "";
  filterNavigation();
  navFilter.blur();
});
document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (event.key !== "/" || target.matches("input, textarea, select") || target.isContentEditable) return;
  event.preventDefault();
  navFilter?.focus();
});

const packageTabs = [...document.querySelectorAll("[data-package-command]")];
const packageCommandOutput = document.querySelector("[data-package-command-output]");
const packageLabel = document.querySelector("[data-package-label]");
const packageCopy = document.querySelector("[data-package-copy]");

const selectPackageTab = (tab, moveFocus = false) => {
  packageTabs.forEach((candidate) => {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
  });
  packageCommandOutput.textContent = tab.dataset.packageCommand;
  highlightCodeElement(packageCommandOutput);
  packageLabel.textContent = tab.dataset.packageName;
  packageCopy.dataset.copy = tab.dataset.packageCommand;
  if (moveFocus) tab.focus();
};

packageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectPackageTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % packageTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + packageTabs.length) % packageTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = packageTabs.length - 1;
    else return;
    event.preventDefault();
    selectPackageTab(packageTabs[nextIndex], true);
  });
});

document.querySelector("[data-docs-form]")?.addEventListener("submit", (event) => event.preventDefault());

const classNames = [...new Set(
  [...frameworkCss.matchAll(/\.([a-z][a-z0-9-]*)/gi)]
    .map((match) => match[1])
    .filter((name) => name.startsWith("bs-")),
)];

const tokenBlock = frameworkCss.match(/:root\s*,\s*\[data-bs-theme=["']dark["']\]\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const tokens = [...tokenBlock.matchAll(/(--bs-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => ({
  name,
  value: value.trim(),
}));

const classCount = document.querySelector("[data-class-count]");
const tokenCount = document.querySelector("[data-token-count]");
if (classCount) classCount.textContent = String(classNames.length);
if (tokenCount) tokenCount.textContent = String(tokens.length);

const ruleBlocks = [...frameworkCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, declarations]) => ({
  selectors: selectors.trim(),
  declarations: declarations.trim().replace(/\s+/g, " "),
}));

const declarationsFor = (className) => {
  const classPattern = new RegExp(`\\.${className}(?![a-z0-9-])`);
  const rule = ruleBlocks.find(({ selectors }) => classPattern.test(selectors) && !selectors.includes(":"));
  return rule?.declarations || "See component guidance above.";
};

const classCategory = (name) => {
  if (name === "bs-display" || name === "bs-lead") return "Typography primitives";
  if (name.startsWith("bs-container") || name === "bs-section" || name === "bs-grid" || name === "bs-row" || name.startsWith("bs-col")) return "Layout & grid";
  if (name.startsWith("bs-btn") || name.startsWith("bs-spinner")) return "Buttons";
  if (name.startsWith("bs-card")) return "Cards";
  if (name.startsWith("bs-badge")) return "Badges";
  if (name.startsWith("bs-banner")) return "Banners";
  if (["bs-check", "bs-combobox", "bs-control", "bs-form", "bs-input", "bs-is", "bs-label", "bs-otp", "bs-select", "bs-switch", "bs-textarea"].some((prefix) => name.startsWith(prefix))) return "Forms";
  if (name.startsWith("bs-alert")) return "Alerts";
  if (name.startsWith("bs-code")) return "Code windows";
  if (name === "bs-collapse" || name.startsWith("bs-dropdown") || name.startsWith("bs-tab")) return "Interactions";
  if (name.startsWith("bs-gap") || /^bs-m[btxy-]/.test(name) || /^bs-p[xy-]/.test(name)) return "Spacing utilities";
  if (name.startsWith("bs-text") || name.startsWith("bs-font") || ["bs-italic", "bs-no-underline", "bs-sr-only"].includes(name)) return "Typography utilities";
  return "Layout utilities";
};

const tokenCategory = (name) => {
  if (name === "--bs-white" || name.startsWith("--bs-brand") || name.startsWith("--bs-plum")) return "Palette";
  if (name.startsWith("--bs-color")) return "Semantic colors";
  if (name.startsWith("--bs-font") || name.startsWith("--bs-line-height")) return "Typography";
  if (name.startsWith("--bs-space")) return "Spacing";
  if (name.startsWith("--bs-radius")) return "Radius";
  if (name.startsWith("--bs-shadow") || name.startsWith("--bs-gradient")) return "Effects";
  if (name.startsWith("--bs-container")) return "Containers";
  return "Motion";
};

const groupBy = (items, getCategory) => items.reduce((groups, item) => {
  const category = getCategory(typeof item === "string" ? item : item.name);
  if (!groups.has(category)) groups.set(category, []);
  groups.get(category).push(item);
  return groups;
}, new Map());

const renderReference = (target, groups, query, type) => {
  const normalizedQuery = query.trim().toLowerCase();
  const markup = [...groups.entries()].map(([category, items]) => {
    const visibleItems = items.filter((item) => {
      const name = typeof item === "string" ? item : item.name;
      const value = typeof item === "string" ? declarationsFor(item) : item.value;
      return `${name} ${value}`.toLowerCase().includes(normalizedQuery);
    });
    if (!visibleItems.length) return "";

    const rows = visibleItems.map((item) => {
      const name = typeof item === "string" ? item : item.name;
      const value = typeof item === "string" ? declarationsFor(item) : item.value;
      const swatch = type === "token" && /^(#|rgb|linear-gradient|var\(--bs-(brand|plum|color))/.test(value)
        ? `<span class="token-swatch token-swatch-${escapeHtml(name.replace("--bs-", ""))}"></span>`
        : "";
      return `<div class="reference-row bs-reference-row"><div class="reference-name bs-reference-name">${swatch}<code class="bs-code-inline">${escapeHtml(type === "class" ? `.${name}` : name)}</code></div><div class="reference-value bs-reference-value">${escapeHtml(value)}</div></div>`;
    }).join("");

    return `<section class="reference-group"><h3>${escapeHtml(category)}<span class="reference-count">${visibleItems.length}</span></h3><div class="reference-list bs-reference-list">${rows}</div></section>`;
  }).join("");

  target.innerHTML = markup || '<p class="reference-empty">No matching entries.</p>';
};

const classGroups = groupBy(classNames, classCategory);
const tokenGroups = groupBy(tokens, tokenCategory);
const classTarget = document.querySelector("[data-class-reference]");
const tokenTarget = document.querySelector("[data-token-reference]");

if (classTarget) renderReference(classTarget, classGroups, "", "class");
if (tokenTarget) renderReference(tokenTarget, tokenGroups, "", "token");

document.querySelector("[data-class-filter]")?.addEventListener("input", (event) => {
  if (classTarget) renderReference(classTarget, classGroups, event.target.value, "class");
});
document.querySelector("[data-token-filter]")?.addEventListener("input", (event) => {
  if (tokenTarget) renderReference(tokenTarget, tokenGroups, event.target.value, "token");
});

const spacingTarget = document.querySelector("[data-spacing-scale]");
const spacingTokens = tokens.filter(({ name }) => name.startsWith("--bs-space-"));
if (spacingTarget) spacingTarget.innerHTML = spacingTokens.map(({ name, value }) => {
  const rem = Number.parseFloat(value) || 0;
  const width = rem === 0 ? 0 : Math.max(4, Math.min(100, rem * 12.5));
  return `<div class="spacing-item"><code>${escapeHtml(name.replace("--bs-space-", ""))}</code><span class="spacing-bar spacing-bar-${Math.round(width)}"></span><span class="spacing-value">${escapeHtml(value)}</span></div>`;
}).join("");

const pageNav = document.querySelector("[data-page-nav]");
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
let outlineTargets;

if (routedSection?.classList.contains("docs-section")) {
  const subheadings = [...routedSection.querySelectorAll(":scope > h3, :scope > .docs-api > h3")];
  outlineTargets = [{ element: routedSection, id: routedSection.id, label: "Overview", heading: null }];
  subheadings.forEach((heading, index) => {
    heading.id ||= `${routedSection.id}-${slugify(heading.textContent) || index + 1}`;
    outlineTargets.push({ element: heading, id: heading.id, label: heading.textContent, heading });
  });
} else if (activeDocsPage?.sectionId === "introduction" && routedSection) {
  outlineTargets = [{ element: routedSection, id: routedSection.id, label: "Overview", heading: null }];
  routedSection.querySelectorAll("[data-introduction-details] > h2").forEach((heading, index) => {
    heading.id ||= `introduction-${slugify(heading.textContent) || index + 1}`;
    outlineTargets.push({ element: heading, id: heading.id, label: heading.textContent, heading });
  });
} else if (docsIndex && isDocsOverview) {
  outlineTargets = [{ element: docsIndex, id: docsIndex.id, label: "Browse documentation", heading: docsIndex.querySelector(":scope > h2") }];
} else {
  outlineTargets = [...document.querySelectorAll(".docs-section > h2")].map((heading) => ({
    element: heading.parentElement,
    id: heading.parentElement.id,
    label: heading.textContent,
    heading,
  }));
}

if (pageNav) {
  pageNav.classList.add("bs-nav");
  pageNav.innerHTML = outlineTargets.map(({ id, label }) => `<a class="bs-nav-link" href="#${id}">${escapeHtml(label)}</a>`).join("");
}

outlineTargets.forEach(({ heading, id, label }) => {
  if (!heading) return;
  const anchor = document.createElement("a");
  anchor.className = "docs-heading-anchor";
  anchor.href = `#${id}`;
  anchor.setAttribute("aria-label", `Link to ${label}`);
  anchor.textContent = "#";
  heading.append(anchor);
});

const sectionLinks = [...document.querySelectorAll('.docs-nav a[href^="#"], [data-page-nav] a[href^="#"]')];
const setActiveSection = (id) => {
  sectionLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

const trackedSections = outlineTargets.map(({ element }) => element);
let scrollUpdateQueued = false;

const updateActiveSection = () => {
  const headerHeight = document.querySelector(".docs-header")?.offsetHeight ?? 0;
  const readingLine = window.scrollY + headerHeight + 32;
  const atPageEnd = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2;
  let activeSection = trackedSections[0];

  if (atPageEnd) {
    activeSection = trackedSections.at(-1);
  } else {
    for (const section of trackedSections) {
      if (section.offsetTop > readingLine) break;
      activeSection = section;
    }
  }

  if (activeSection) setActiveSection(activeSection.id);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const readingProgress = document.querySelector("[data-reading-progress]");
  if (readingProgress) readingProgress.value = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  scrollUpdateQueued = false;
};

const queueActiveSectionUpdate = () => {
  if (scrollUpdateQueued) return;
  scrollUpdateQueued = true;
  window.requestAnimationFrame(updateActiveSection);
};

sectionLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveSection(link.hash.slice(1)));
});
window.addEventListener("scroll", queueActiveSectionUpdate, { passive: true });
window.addEventListener("resize", queueActiveSectionUpdate);
window.addEventListener("hashchange", queueActiveSectionUpdate);
window.addEventListener("load", queueActiveSectionUpdate);
updateActiveSection();

highlightCodeBlocks();
document.documentElement.classList.add("js-ready");
