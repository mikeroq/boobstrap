import frameworkCss from "@boobstrap/boobstrap/dist/boobstrap.css?raw";
import "@boobstrap/boobstrap/dist/boobstrap.css";
import { initBoobstrap } from "@boobstrap/boobstrap/js";
import "./docs.css";

const root = document.documentElement;
const page = document.body;
const menuToggle = document.querySelector("[data-menu-toggle]");
const sidebar = document.querySelector("[data-sidebar]");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const closeMenu = () => {
  page.classList.remove("docs-menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = page.classList.toggle("docs-menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu);
sidebar?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

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

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const originalLabel = button.textContent;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select code";
    }
    window.setTimeout(() => { button.textContent = originalLabel; }, 1400);
  });
});

document.querySelectorAll("[data-component-example]").forEach((preview, index) => {
  const code = preview.nextElementSibling;
  if (!code?.classList.contains("docs-code-block")) return;

  const name = preview.dataset.componentExample;
  const label = name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
  const shell = document.createElement("div");
  const toolbar = document.createElement("div");
  const title = document.createElement("span");
  const tablist = document.createElement("div");
  const previewTab = document.createElement("button");
  const codeTab = document.createElement("button");
  const previewId = preview.id || `component-preview-${index}`;
  const codeId = `component-code-${index}`;

  preview.id = previewId;
  code.id = codeId;
  shell.className = "docs-example-shell";
  shell.dataset.exampleShell = name;
  toolbar.className = "docs-example-toolbar";
  title.className = "docs-example-title";
  title.textContent = `${label} example`;
  tablist.className = "docs-example-tabs";
  tablist.setAttribute("role", "tablist");
  tablist.setAttribute("aria-label", `${label} example view`);

  const configureTab = (tab, textContent, targetId, selected) => {
    tab.type = "button";
    tab.textContent = textContent;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", targetId);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.dataset.exampleView = textContent.toLowerCase();
  };

  configureTab(previewTab, "Preview", previewId, true);
  configureTab(codeTab, "Code", codeId, false);
  preview.setAttribute("role", "tabpanel");
  preview.setAttribute("aria-label", `${label} preview`);
  code.setAttribute("role", "tabpanel");
  code.setAttribute("aria-label", `${label} code`);

  const selectView = (view, moveFocus = false) => {
    const showPreview = view === "preview";
    previewTab.setAttribute("aria-selected", String(showPreview));
    codeTab.setAttribute("aria-selected", String(!showPreview));
    previewTab.tabIndex = showPreview ? 0 : -1;
    codeTab.tabIndex = showPreview ? -1 : 0;
    preview.hidden = !showPreview;
    code.hidden = showPreview;
    if (moveFocus) (showPreview ? previewTab : codeTab).focus();
  };

  previewTab.addEventListener("click", () => selectView("preview"));
  codeTab.addEventListener("click", () => selectView("code"));
  [previewTab, codeTab].forEach((tab) => {
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const showPreview = event.key === "ArrowLeft" || event.key === "Home";
      selectView(showPreview ? "preview" : "code", true);
    });
  });

  preview.before(shell);
  tablist.append(previewTab, codeTab);
  toolbar.append(title, tablist);
  shell.append(toolbar, preview, code);
  selectView("preview");
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
    group.querySelectorAll('a[href^="#"]').forEach((link) => {
      const visible = link.textContent.toLowerCase().includes(query);
      link.hidden = !visible;
      if (visible) groupCount += 1;
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

document.querySelector("[data-class-count]").textContent = String(classNames.length);
document.querySelector("[data-token-count]").textContent = String(tokens.length);

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
  if (["bs-form-group", "bs-label", "bs-input", "bs-select", "bs-textarea"].includes(name)) return "Forms";
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
      return `<div class="reference-row"><div class="reference-name">${swatch}<code>${escapeHtml(type === "class" ? `.${name}` : name)}</code></div><div class="reference-value">${escapeHtml(value)}</div></div>`;
    }).join("");

    return `<section class="reference-group"><h3>${escapeHtml(category)}<span class="reference-count">${visibleItems.length}</span></h3><div class="reference-list">${rows}</div></section>`;
  }).join("");

  target.innerHTML = markup || '<p class="reference-empty">No matching entries.</p>';
};

const classGroups = groupBy(classNames, classCategory);
const tokenGroups = groupBy(tokens, tokenCategory);
const classTarget = document.querySelector("[data-class-reference]");
const tokenTarget = document.querySelector("[data-token-reference]");

renderReference(classTarget, classGroups, "", "class");
renderReference(tokenTarget, tokenGroups, "", "token");

document.querySelector("[data-class-filter]")?.addEventListener("input", (event) => {
  renderReference(classTarget, classGroups, event.target.value, "class");
});
document.querySelector("[data-token-filter]")?.addEventListener("input", (event) => {
  renderReference(tokenTarget, tokenGroups, event.target.value, "token");
});

const spacingTarget = document.querySelector("[data-spacing-scale]");
const spacingTokens = tokens.filter(({ name }) => name.startsWith("--bs-space-"));
spacingTarget.innerHTML = spacingTokens.map(({ name, value }) => {
  const rem = Number.parseFloat(value) || 0;
  const width = rem === 0 ? 0 : Math.max(4, Math.min(100, rem * 12.5));
  return `<div class="spacing-item"><code>${escapeHtml(name.replace("--bs-space-", ""))}</code><span class="spacing-bar spacing-bar-${Math.round(width)}"></span><span class="spacing-value">${escapeHtml(value)}</span></div>`;
}).join("");

const headings = [...document.querySelectorAll(".docs-section > h2")];
const pageNav = document.querySelector("[data-page-nav]");
pageNav.innerHTML = headings.map((heading) => `<a href="#${heading.parentElement.id}">${escapeHtml(heading.textContent)}</a>`).join("");

headings.forEach((heading) => {
  const anchor = document.createElement("a");
  anchor.className = "docs-heading-anchor";
  anchor.href = `#${heading.parentElement.id}`;
  anchor.setAttribute("aria-label", `Link to ${heading.textContent}`);
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

const trackedSections = [...document.querySelectorAll(".docs-section[id], .docs-hero[id]")];
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

document.documentElement.classList.add("js-ready");
