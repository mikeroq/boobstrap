import frameworkCss from "@mikeroq/boobstrap/dist/boobstrap.css?raw";
import "@mikeroq/boobstrap/dist/boobstrap.css";
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
  if (name.startsWith("bs-btn")) return "Buttons";
  if (name.startsWith("bs-card")) return "Cards";
  if (name.startsWith("bs-badge")) return "Badges";
  if (["bs-form-group", "bs-label", "bs-input", "bs-select", "bs-textarea"].includes(name)) return "Forms";
  if (name.startsWith("bs-alert")) return "Alerts";
  if (name.startsWith("bs-code")) return "Code windows";
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

const sectionLinks = [...document.querySelectorAll('.docs-nav a[href^="#"], [data-page-nav] a[href^="#"]')];
const setActiveSection = (id) => {
  sectionLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
};

const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
  if (visible[0]) setActiveSection(visible[0].target.id);
}, { rootMargin: "-20% 0px -70%", threshold: 0 });

document.querySelectorAll(".docs-section[id], .docs-hero[id]").forEach((section) => observer.observe(section));
setActiveSection("introduction");

document.documentElement.classList.add("js-ready");
