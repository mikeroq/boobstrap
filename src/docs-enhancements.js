const sectionFor = (id) => document.getElementById(id);

const insertNodes = (section, nodes, before = null) => {
  nodes.forEach((node) => section.insertBefore(node, before));
};

const createHeading = (title) => {
  const heading = document.createElement("h3");
  heading.textContent = title;
  return heading;
};

const createDescription = (description) => {
  if (!description) return null;
  const paragraph = document.createElement("p");
  paragraph.textContent = description;
  return paragraph;
};

const createCodeBlock = ({ label, source, language }) => {
  const block = document.createElement("div");
  block.className = "docs-code-block bs-code-window";

  const toolbar = document.createElement("div");
  toolbar.className = "docs-code-label bs-code-header";
  const title = document.createElement("span");
  title.textContent = label;
  const copy = document.createElement("button");
  copy.className = "bs-code-action";
  copy.type = "button";
  copy.dataset.copyCode = "";
  copy.textContent = "Copy";
  toolbar.append(title, copy);

  const pre = document.createElement("pre");
  pre.className = "bs-code-body";
  const code = document.createElement("code");
  if (language) code.dataset.language = language;
  code.textContent = source.trim();
  pre.append(code);
  block.append(toolbar, pre);
  return block;
};

const addExample = (sectionId, {
  id,
  title,
  description,
  preview,
  source = preview,
  label = "HTML · Complete example",
  demoClass = "",
  beforeSelector = ".docs-api",
}) => {
  const section = sectionFor(sectionId);
  if (!section || section.querySelector(`[data-component-example="${id}"]`)) return;

  const demo = document.createElement("div");
  demo.className = `docs-demo ${demoClass}`.trim();
  demo.dataset.componentExample = id;
  demo.innerHTML = preview.trim();

  const nodes = [createHeading(title), createDescription(description), demo, createCodeBlock({ label, source })].filter(Boolean);
  insertNodes(section, nodes, section.querySelector(beforeSelector));
};

const addCodeExample = (sectionId, {
  title,
  description,
  label,
  source,
  language,
  beforeSelector = ".docs-api",
}) => {
  const section = sectionFor(sectionId);
  if (!section) return;
  const nodes = [createHeading(title), createDescription(description), createCodeBlock({ label, source, language })].filter(Boolean);
  insertNodes(section, nodes, section.querySelector(beforeSelector));
};

const addGuidance = (sectionId, items, beforeSelector = ".docs-api") => {
  const section = sectionFor(sectionId);
  if (!section || section.querySelector(":scope > .docs-example-guidance")) return;

  const guidance = document.createElement("div");
  guidance.className = "docs-example-guidance";
  guidance.setAttribute("aria-label", `${sectionId.replaceAll("-", " ")} guidance`);
  items.forEach(({ title, body }) => {
    const item = document.createElement("div");
    const heading = createHeading(title);
    const paragraph = document.createElement("p");
    paragraph.innerHTML = body;
    item.append(heading, paragraph);
    guidance.append(item);
  });
  section.insertBefore(guidance, section.querySelector(beforeSelector));
};

const addIntroductionDetails = () => {
  const section = sectionFor("introduction");
  if (!section || section.querySelector("[data-introduction-details]")) return;

  const details = document.createElement("div");
  details.dataset.introductionDetails = "";
  details.innerHTML = `
    <h2>What ships in the framework</h2>
    <div class="docs-reference-grid">
      <article class="docs-reference-card bs-card bs-card-subtle bs-card-compact"><h3>CSS foundations</h3><p>A small reset, semantic theme tokens, responsive containers, a 12-column grid, typography, and composable utilities.</p></article>
      <article class="docs-reference-card bs-card bs-card-subtle bs-card-compact"><h3>UI components</h3><p>Buttons, cards, badges, alerts, banners, form controls, code windows, and interaction presentation classes.</p></article>
      <article class="docs-reference-card bs-card bs-card-subtle bs-card-compact"><h3>Optional behavior</h3><p>Dependency-free controllers plus official Alpine.js and React adapters for stateful components.</p></article>
      <article class="docs-reference-card bs-card bs-card-subtle bs-card-compact"><h3>Copy-ready docs</h3><p>Every visual example is paired with source and can be inspected independently in light or dark mode.</p></article>
    </div>
    <h2>Your first component</h2>
    <p>Import the stylesheet once, then compose semantic HTML with namespaced <code>bs-</code> classes.</p>
  `;

  const demo = document.createElement("div");
  demo.className = "docs-demo";
  demo.dataset.componentExample = "introduction-first-component";
  demo.innerHTML = `
    <article class="bs-card bs-card-raised">
      <div class="bs-card-body">
        <span class="bs-badge bs-badge-primary">Ready to ship</span>
        <h3 class="bs-card-title bs-mt-4">A composed interface</h3>
        <p class="bs-card-text bs-mb-4">Tokens, components, and utilities work together without changing the meaning of your markup.</p>
        <a class="bs-btn bs-btn-primary bs-btn-sm" href="/docs/components/buttons">Explore buttons</a>
      </div>
    </article>`;
  details.append(demo, createCodeBlock({
    label: "HTML · First component",
    source: `<article class="bs-card bs-card-raised">
  <div class="bs-card-body">
    <span class="bs-badge bs-badge-primary">Ready to ship</span>
    <h2 class="bs-card-title bs-mt-4">A composed interface</h2>
    <p class="bs-card-text bs-mb-4">Tokens, components, and utilities work together.</p>
    <a class="bs-btn bs-btn-primary bs-btn-sm" href="/docs">Explore the docs</a>
  </div>
</article>`,
  }));
  section.append(details);
};

export function enhanceDocumentation() {
  if (!document.querySelector("[data-docs-index]")) return;

  addIntroductionDetails();

  addCodeExample("installation", {
    title: "Add optional behavior",
    description: "CSS is enough for visual components. Import the initializer only when the page uses controllers such as collapse, dropdown, tabs, masks, OTP, or dismissible banners.",
    label: "JavaScript · Application entry",
    language: "javascript",
    source: `import "@boobstrap/boobstrap/dist/boobstrap.css";
import { initBoobstrap } from "@boobstrap/boobstrap/js";

const boobstrap = initBoobstrap(document);

// Call when your application is torn down.
boobstrap.destroy();`,
  });
  addCodeExample("installation", {
    title: "Use a framework adapter",
    description: "Choose one owner for interactive state. Alpine and React adapters are separate packages so CSS-only projects do not download code they never execute.",
    label: "Terminal · Adapter packages",
    language: "bash",
    source: `npm install @boobstrap/boobstrap @boobstrap/alpine alpinejs
# or
npm install @boobstrap/boobstrap @boobstrap/react react`,
  });
  addGuidance("installation", [
    { title: "CSS first", body: "Import <code>dist/boobstrap.css</code> once. Component and utility classes work without JavaScript." },
    { title: "Versioning", body: "Pin an exact version for CDN URLs and production lockfiles so a deploy cannot silently change its visual contract." },
    { title: "Behavior", body: "Use the core initializer, a direct controller import, or one official adapter. Do not initialize two behavior layers on the same element." },
  ]);

  addCodeExample("starter", {
    title: "Application entry",
    description: "The starter keeps framework setup explicit and exposes the returned cleanup function for hot reloads or application teardown.",
    label: "JavaScript · src/main.js",
    language: "javascript",
    source: `import "@boobstrap/boobstrap/dist/boobstrap.css";
import { initBoobstrap } from "@boobstrap/boobstrap/js";
import "./styles.css";

const boobstrap = initBoobstrap(document);

if (import.meta.hot) {
  import.meta.hot.dispose(() => boobstrap.destroy());
}`,
  });
  addCodeExample("starter", {
    title: "Project-level customization",
    description: "Load overrides after the framework stylesheet and change semantic tokens instead of reaching into component selectors.",
    label: "CSS · src/styles.css",
    language: "css",
    source: `:root {
  --bs-color-primary: #7c3aed;
  --bs-color-primary-hover: #8b5cf6;
  --bs-container-xl: 72rem;
}

.site-shell {
  min-height: 100vh;
}`,
  });
  addGuidance("starter", [
    { title: "Run", body: "Use <code>npm run dev</code> while building and <code>npm run validate</code> before shipping the generated bundle." },
    { title: "Customize", body: "Keep application CSS after the framework import. Prefer semantic tokens and composition utilities for system-wide changes." },
    { title: "Replace", body: "The sample content is disposable. The package setup, theme boundary, validation script, and accessible document structure are the useful starting points." },
  ]);

  addExample("theming", {
    id: "theming-scoped-preview",
    title: "Scope a theme to one region",
    description: "A theme attribute remaps inherited semantic tokens only inside its subtree, which is useful for embedded panels and previews.",
    preview: `<div class="bs-card" data-bs-theme="light">
  <div class="bs-card-body">
    <span class="bs-badge bs-badge-primary">Light region</span>
    <h4 class="bs-card-title bs-mt-4">Scoped independently</h4>
    <p class="bs-card-text bs-mb-4">The surrounding documentation can remain dark.</p>
    <button class="bs-btn bs-btn-primary bs-btn-sm" type="button">Continue</button>
  </div>
</div>`,
    label: "HTML · Scoped light theme",
  });
  addCodeExample("theming", {
    title: "Build a persistent theme toggle",
    description: "Apply the stored preference before paint when possible, then keep the control label synchronized with the next available action.",
    label: "JavaScript · Theme toggle",
    language: "javascript",
    source: `const root = document.documentElement;
const toggle = document.querySelector("[data-theme-toggle]");

toggle.addEventListener("click", () => {
  const next = root.dataset.bsTheme === "light" ? "dark" : "light";
  root.dataset.bsTheme = next;
  localStorage.setItem("theme", next);
});`,
  });
  addGuidance("theming", [
    { title: "Boundary", body: "Place <code>data-bs-theme</code> on <code>&lt;html&gt;</code> for an application theme or on a smaller ancestor for a scoped region." },
    { title: "Tokens", body: "Override semantic tokens such as <code>--bs-color-primary</code>; leave component selectors alone so states remain consistent." },
    { title: "Contrast", body: "Test text, borders, form controls, focus rings, and contextual colors in both built-in themes after every palette change." },
  ]);

  addExample("typography", {
    id: "typography-scale",
    title: "Text size utilities",
    description: "Use the named type scale when text size is presentational and keep the semantic element appropriate to the content hierarchy.",
    preview: `<div class="bs-stack bs-gap-3">
  <p class="bs-text-xs bs-mb-0">Extra-small supporting text</p>
  <p class="bs-text-sm bs-mb-0">Small metadata text</p>
  <p class="bs-text-md bs-mb-0">Default body text</p>
  <p class="bs-text-xl bs-mb-0">Large introductory text</p>
  <p class="bs-text-3xl bs-font-bold bs-mb-0">Section statement</p>
</div>`,
    label: "HTML · Type scale",
  });
  addExample("typography", {
    id: "typography-treatment",
    title: "Color, weight, and alignment",
    description: "Combine single-purpose utilities for emphasis without changing the underlying semantic element.",
    preview: `<div class="bs-stack bs-gap-3">
  <p class="bs-text-primary bs-font-semibold bs-mb-0">Primary emphasized text</p>
  <p class="bs-text-muted bs-mb-0">Muted supporting copy</p>
  <p class="bs-text-subtle bs-italic bs-mb-0">Subtle editorial note</p>
  <p class="bs-text-right bs-font-bold bs-mb-0">Right-aligned total: $128</p>
</div>`,
    label: "HTML · Text treatments",
  });
  addGuidance("typography", [
    { title: "Hierarchy", body: "Choose heading levels from the document outline. Use size classes to change appearance without skipping semantic levels." },
    { title: "Readability", body: "Reserve <code>.bs-display</code> for short hero copy. Body and lead text keep more generous line height for sustained reading." },
    { title: "Emphasis", body: "Weight, color, and italic utilities are presentational. Do not rely on color alone to convey a warning, error, or required state." },
  ]);

  addExample("layout", {
    id: "layout-flex-toolbar",
    title: "Flex alignment and wrapping",
    description: "Compose a responsive action row that keeps its label and controls aligned and wraps safely when space runs out.",
    preview: `<div class="bs-flex bs-flex-wrap bs-items-center bs-justify-between bs-gap-4">
  <div><strong>Project settings</strong><p class="bs-text-muted bs-text-sm bs-mb-0">Last saved two minutes ago</p></div>
  <div class="bs-flex bs-flex-wrap bs-gap-2">
    <button class="bs-btn bs-btn-secondary bs-btn-sm" type="button">Cancel</button>
    <button class="bs-btn bs-btn-primary bs-btn-sm" type="button">Save changes</button>
  </div>
</div>`,
    label: "HTML · Wrapping action row",
  });
  addExample("layout", {
    id: "layout-responsive-display",
    title: "Responsive display",
    description: "The md display utilities apply from 48rem upward. Keep essential content available at every size.",
    preview: `<div class="bs-stack bs-gap-3">
  <div class="docs-utility-sample bs-block bs-md-hidden">Visible below the md breakpoint</div>
  <div class="docs-utility-sample bs-hidden bs-md-block">Visible from the md breakpoint</div>
</div>`,
    label: "HTML · Responsive visibility",
  });
  addGuidance("layout", [
    { title: "Container", body: "Use one container to establish page gutters and a readable maximum width. Nesting containers usually creates uneven alignment." },
    { title: "Grid", body: "Start with <code>.bs-col-12</code>, then add only the breakpoint spans that materially change the composition." },
    { title: "Source order", body: "Keep the DOM in its meaningful mobile reading order. Layout utilities should not create a visual order that disagrees with reading or focus order." },
  ]);

  addExample("badges", {
    id: "badge-variants",
    title: "Default and primary badges",
    description: "Use the default badge for neutral metadata and the primary variant when a label needs brand emphasis.",
    preview: `<div class="bs-flex bs-flex-wrap bs-items-center bs-gap-3">
  <span class="bs-badge">Draft</span>
  <span class="bs-badge bs-badge-primary">New release</span>
</div>`,
    label: "HTML · Badge variants",
  });
  addExample("badges", {
    id: "badge-context",
    title: "Badges in context",
    description: "Place badges beside a clear label or heading; the badge should supplement the surrounding text rather than replace it.",
    preview: `<article class="bs-card">
  <div class="bs-card-body">
    <div class="bs-flex bs-flex-wrap bs-items-center bs-justify-between bs-gap-3">
      <h4 class="bs-card-title bs-mb-0">API deployment</h4>
      <span class="bs-badge bs-badge-primary">3 changes</span>
    </div>
    <p class="bs-card-text bs-mt-3 bs-mb-0">Ready for review by the infrastructure team.</p>
  </div>
</article>`,
    label: "HTML · Badge with card heading",
  });
  addGuidance("badges", [
    { title: "Meaning", body: "Use short nouns, counts, or states. A badge is supporting metadata, not a substitute for an actionable control." },
    { title: "Context", body: "Make the surrounding sentence or heading understandable without depending on the badge color." },
    { title: "Semantics", body: "A plain <code>&lt;span&gt;</code> is appropriate for static metadata. Use a button or link only when the label itself is interactive." },
  ]);

  addExample("navbar", {
    id: "nav-vertical",
    title: "Grouped vertical navigation",
    description: "Use grouped navigation for persistent sidebars. Mark the current destination with aria-current and indent only true child destinations.",
    preview: `<nav class="bs-nav" aria-label="Project navigation">
  <div class="bs-nav-group">
    <p class="bs-nav-heading">Workspace</p>
    <a class="bs-nav-link" href="#navbar" aria-current="page">Overview</a>
    <a class="bs-nav-link bs-nav-link-subitem" href="#navbar">Members</a>
    <a class="bs-nav-link bs-nav-link-subitem" href="#navbar">Settings</a>
  </div>
  <div class="bs-nav-group">
    <p class="bs-nav-heading">Resources</p>
    <a class="bs-nav-link" href="#navbar">Documentation</a>
  </div>
</nav>`,
    label: "HTML · Grouped vertical navigation",
  });
  addExample("navbar", {
    id: "nav-breadcrumb",
    title: "Breadcrumb trail",
    description: "Breadcrumbs show the current page's position in a hierarchy. Keep the final item as plain text and identify the landmark with an accessible label.",
    preview: `<nav class="bs-breadcrumb" aria-label="Breadcrumb">
  <a href="/docs">Docs</a>
  <span aria-hidden="true">/</span>
  <a href="/docs/components">Components</a>
  <span aria-hidden="true">/</span>
  <span aria-current="page">Navigation</span>
</nav>`,
    label: "HTML · Breadcrumb",
  });
  addExample("navbar", {
    id: "nav-page",
    title: "Previous and next page navigation",
    description: "Place page navigation after the article so readers can continue in either direction without returning to the sidebar.",
    preview: `<nav class="bs-page-nav" aria-label="Documentation pages">
  <a class="bs-page-nav-link" href="/docs/components/cards">
    <span class="bs-page-nav-context">Previous</span>
    <span class="bs-page-nav-title">Cards</span>
  </a>
  <a class="bs-page-nav-link" href="/docs/components/tables">
    <span class="bs-page-nav-context">Next</span>
    <span class="bs-page-nav-title">Tables</span>
  </a>
</nav>`,
    label: "HTML · Previous and next pages",
  });

  addExample("cards", {
    id: "card-basic",
    title: "Basic card",
    description: "Use a card body to establish consistent inset spacing around one coherent piece of content.",
    preview: `<article class="bs-card" aria-labelledby="basic-card-title">
  <div class="bs-card-body">
    <h4 class="bs-card-title" id="basic-card-title">Release notes</h4>
    <p class="bs-card-text bs-mb-0">A concise summary belongs inside the same content surface.</p>
  </div>
</article>`,
    label: "HTML · Basic card",
  });
  addExample("cards", {
    id: "card-action",
    title: "Card with an action",
    description: "Keep the action explicit and use a real link when it navigates to another resource.",
    preview: `<article class="bs-card bs-card-raised" aria-labelledby="action-card-title">
  <div class="bs-card-body">
    <span class="bs-badge bs-badge-primary">Recommended</span>
    <h4 class="bs-card-title bs-mt-4" id="action-card-title">Production checklist</h4>
    <p class="bs-card-text bs-mb-4">Review accessibility, responsive layout, and deployment validation.</p>
    <a class="bs-btn bs-btn-primary bs-btn-sm" href="/docs/reference/accessibility">Open checklist</a>
  </div>
</article>`,
    label: "HTML · Raised action card",
  });
  addExample("cards", {
    id: "card-compact-link",
    title: "Compact linked card",
    description: "Use the link modifier when the entire card has one destination. The subtle and compact modifiers create a quiet, dense navigation surface.",
    preview: `<a class="bs-card bs-card-subtle bs-card-compact bs-card-link" href="/docs/components/tables">
  <span class="bs-text-xs bs-text-muted">Component guide</span>
  <strong>Responsive tables</strong>
  <span class="bs-text-sm bs-text-muted">Present structured data without widening the page.</span>
</a>`,
    label: "HTML · Compact linked card",
  });

  addExample("tables", {
    id: "table-comparison",
    title: "Feature comparison",
    description: "Use a caption to name the dataset, column headers for the compared properties, and row headers for the item being compared.",
    preview: `<div class="bs-table-responsive">
  <table class="bs-table">
    <caption class="bs-sr-only">Plan feature comparison</caption>
    <thead><tr><th scope="col">Plan</th><th scope="col">Projects</th><th scope="col">Support</th></tr></thead>
    <tbody>
      <tr><th scope="row">Starter</th><td>3</td><td>Community</td></tr>
      <tr><th scope="row">Team</th><td>Unlimited</td><td>Priority</td></tr>
    </tbody>
  </table>
</div>`,
    label: "HTML · Semantic comparison table",
  });
  addExample("tables", {
    id: "table-responsive",
    title: "Responsive API data",
    description: "The wrapper owns horizontal overflow, keeping long values readable without forcing the document wider than the viewport.",
    preview: `<div class="bs-table-responsive">
  <table class="bs-table">
    <caption class="bs-sr-only">API endpoints</caption>
    <thead><tr><th scope="col">Method</th><th scope="col">Endpoint</th><th scope="col">Description</th><th scope="col">Authentication</th></tr></thead>
    <tbody>
      <tr><td><code class="bs-code-inline">GET</code></td><td><code class="bs-code-inline">/v1/workspaces/{workspace_id}/deployments</code></td><td>List recent deployments</td><td>Bearer token</td></tr>
      <tr><td><code class="bs-code-inline">POST</code></td><td><code class="bs-code-inline">/v1/workspaces/{workspace_id}/deployments</code></td><td>Create a deployment</td><td>Bearer token</td></tr>
    </tbody>
  </table>
</div>`,
    label: "HTML · Responsive data table",
  });
  addGuidance("tables", [
    { title: "Semantics", body: "Use a table only when both rows and columns carry meaning. Add a caption, then identify column and row headers with <code>scope</code>." },
    { title: "Responsive behavior", body: "Wrap the table in <code>.bs-table-responsive</code>. On narrow screens the table scrolls within its own border instead of widening the page." },
    { title: "Content", body: "Keep labels concise and align data consistently. Do not encode meaning by color alone, and provide text for every status or action." },
  ]);

  addExample("lists", {
    id: "reference-list",
    title: "Key-value reference",
    description: "A description list preserves the relationship between each name and value while the reference classes provide a compact responsive layout.",
    preview: `<dl class="bs-reference-list">
  <div class="bs-reference-row">
    <dt class="bs-reference-name">Package</dt>
    <dd class="bs-reference-value bs-m-0">@boobstrap/boobstrap</dd>
  </div>
  <div class="bs-reference-row">
    <dt class="bs-reference-name">CSS entry</dt>
    <dd class="bs-reference-value bs-m-0">dist/boobstrap.css</dd>
  </div>
  <div class="bs-reference-row">
    <dt class="bs-reference-name">JavaScript entry</dt>
    <dd class="bs-reference-value bs-m-0">dist/js/index.js</dd>
  </div>
</dl>`,
    label: "HTML · Description-list reference",
  });
  addExample("lists", {
    id: "checklist",
    title: "Completion checklist",
    description: "Use a checklist for a short set of satisfied requirements. Include status in the text because the decorative check marker is hidden from assistive technology.",
    preview: `<ul class="bs-checklist">
  <li>Keyboard focus remains visible</li>
  <li>Controls have accessible names</li>
  <li>Content works at narrow widths</li>
</ul>`,
    label: "HTML · Completion checklist",
  });
  addGuidance("lists", [
    { title: "Reference data", body: "Prefer <code>&lt;dl&gt;</code>, <code>&lt;dt&gt;</code>, and <code>&lt;dd&gt;</code> for name/value pairs. Add <code>.bs-m-0</code> to each <code>&lt;dd&gt;</code> to remove its browser default margin." },
    { title: "Responsive rows", body: "Reference rows collapse from two columns to one at narrow widths. Keep the name before the value so the reading order remains clear." },
    { title: "Checklist meaning", body: "Use checklist text that states what is complete. The visual marker is decorative and should never be the only source of status." },
  ]);

  addExample("alerts", {
    id: "alert-primary-focused",
    title: "Informational alert",
    description: "Use status for helpful information that should not interrupt the user.",
    preview: `<div class="bs-alert bs-alert-primary" role="status">
  <span><strong class="bs-alert-title">Deployment queued</strong>Your change will start after the active build completes.</span>
</div>`,
    label: "HTML · Informational status",
  });
  addExample("alerts", {
    id: "alert-success-focused",
    title: "Success alert",
    description: "Pair the contextual surface with explicit text so success is not communicated by color alone.",
    preview: `<div class="bs-alert bs-alert-success" role="status">
  <span><strong class="bs-alert-title">Changes saved</strong>Your notification settings are up to date.</span>
</div>`,
    label: "HTML · Success status",
  });

  addExample("code-windows", {
    id: "code-window-terminal",
    title: "Terminal window",
    description: "Use the header for a short context label and an optional action, then keep command output inside the scrollable code body.",
    preview: `<div class="bs-code-window">
  <div class="bs-code-header"><span>Terminal</span><button class="bs-code-action" type="button">Copy</button></div>
  <pre class="bs-code-body bs-m-0"><code>npm install @boobstrap/boobstrap
npm run build</code></pre>
</div>`,
    label: "HTML · Terminal window",
  });
  addExample("code-windows", {
    id: "code-window-source",
    title: "Tabbed source window",
    description: "Use code tabs and panels for equivalent implementations or languages. The tab controller keeps selection, focus, and panel visibility synchronized.",
    preview: `<div class="bs-code-window">
  <div class="bs-code-header"><span>Install</span><button class="bs-code-action" type="button">Copy</button></div>
  <div class="bs-code-tabs" role="tablist" aria-label="Package manager" data-bs-tabs>
    <button class="bs-code-tab" id="code-npm-tab" type="button" role="tab" aria-controls="code-npm-panel" aria-selected="true">npm</button>
    <button class="bs-code-tab" id="code-pnpm-tab" type="button" role="tab" aria-controls="code-pnpm-panel">pnpm</button>
  </div>
  <div class="bs-code-panel" id="code-npm-panel" role="tabpanel" aria-labelledby="code-npm-tab"><pre class="bs-code-body"><code>npm install @boobstrap/boobstrap</code></pre></div>
  <div class="bs-code-panel" id="code-pnpm-panel" role="tabpanel" aria-labelledby="code-pnpm-tab" hidden><pre class="bs-code-body"><code>pnpm add @boobstrap/boobstrap</code></pre></div>
</div>`,
    source: `<div class="bs-code-window">
  <div class="bs-code-header">
    <span>Install</span>
    <button class="bs-code-action" type="button">Copy</button>
  </div>
  <div class="bs-code-tabs" role="tablist" aria-label="Package manager" data-bs-tabs>
    <button class="bs-code-tab" id="npm-tab" type="button" role="tab"
      aria-controls="npm-panel" aria-selected="true">npm</button>
    <button class="bs-code-tab" id="pnpm-tab" type="button" role="tab"
      aria-controls="pnpm-panel">pnpm</button>
  </div>
  <div class="bs-code-panel" id="npm-panel" role="tabpanel" aria-labelledby="npm-tab">
    <pre class="bs-code-body"><code>npm install @boobstrap/boobstrap</code></pre>
  </div>
  <div class="bs-code-panel" id="pnpm-panel" role="tabpanel" aria-labelledby="pnpm-tab" hidden>
    <pre class="bs-code-body"><code>pnpm add @boobstrap/boobstrap</code></pre>
  </div>
</div>`,
    label: "HTML · Tabbed code window",
  });
  addGuidance("code-windows", [
    { title: "Structure", body: "Keep the header, optional tabs, panels, and code bodies inside <code>.bs-code-window</code>. A <code>&lt;pre&gt;&lt;code&gt;</code> pair preserves whitespace and code semantics." },
    { title: "Overflow", body: "Long lines scroll inside <code>.bs-code-body</code>; avoid wrapping commands when line breaks would change what users copy." },
    { title: "Highlighting", body: "The included token classes cover static snippets. Dynamic highlighters can render their own spans without changing the window structure." },
  ]);

  addExample("icons", {
    id: "icon-sizes",
    title: "Icon sizes",
    description: "Icons size relative to surrounding text by default; use a modifier when the icon needs deliberate visual emphasis.",
    preview: `<div class="bs-flex bs-flex-wrap bs-items-center bs-gap-6">
  <span class="bs-inline-flex bs-items-center bs-gap-2"><svg class="bs-icon bs-icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Small</span>
  <span class="bs-inline-flex bs-items-center bs-gap-2"><svg class="bs-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Default</span>
  <span class="bs-inline-flex bs-items-center bs-gap-2"><svg class="bs-icon bs-icon-xl" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Extra large</span>
</div>`,
    label: "HTML · Icon sizes",
  });
  addExample("icons", {
    id: "icon-accessible-button",
    title: "Icons inside controls",
    description: "Hide a decorative SVG from assistive technology and put the control's accessible name on the button.",
    preview: `<div class="bs-flex bs-flex-wrap bs-gap-3">
  <button class="bs-btn bs-btn-primary" type="button"><svg class="bs-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Create</button>
  <button class="bs-btn bs-btn-secondary bs-btn-icon" type="button" aria-label="Add to favorites"><svg class="bs-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg></button>
</div>`,
    label: "HTML · Accessible icon buttons",
  });
  addGuidance("icons", [
    { title: "Source", body: "Boobstrap styles inline SVG; it does not bundle an icon set. Paste only trusted SVG or use the library already chosen by your application." },
    { title: "Sizing", body: "The base icon is <code>1em</code>. Size modifiers stay aligned with text and buttons without hard-coded pixel dimensions." },
    { title: "Names", body: "Decorative icons use <code>aria-hidden=\"true\"</code>. Icon-only controls need an accessible name on the interactive element." },
  ]);

  addGuidance("behavior-layers", [
    { title: "CSS only", body: "Choose CSS only for static components and when your application already owns all state and accessibility behavior." },
    { title: "One owner", body: "Use Boobstrap JS, Alpine, React, or custom application code for a component—not multiple controllers on the same markup." },
    { title: "Progressive enhancement", body: "Start from meaningful HTML and a readable initial state. Add behavior after the content remains usable without script execution." },
  ]);

  addCodeExample("collapse", {
    title: "Initialize and observe collapse",
    description: "The aggregate initializer discovers declarative collapse markup. Lifecycle events let application code observe or cancel a transition.",
    label: "JavaScript · Initialization and events",
    language: "javascript",
    source: `import { initBoobstrap } from "@boobstrap/boobstrap/js";

const boobstrap = initBoobstrap(document);
const panel = document.querySelector("#details-panel");

panel.addEventListener("bs:collapse:shown", () => {
  panel.querySelector("a, button, input")?.focus();
});

// Later: boobstrap.destroy();`,
  });
  addCodeExample("dropdown", {
    title: "Initialize and observe dropdown",
    description: "The controller manages outside clicks, Escape, focus restoration, and action-menu keyboard navigation.",
    label: "JavaScript · Initialization and events",
    language: "javascript",
    source: `import { initBoobstrap } from "@boobstrap/boobstrap/js";

const boobstrap = initBoobstrap(document);
const menu = document.querySelector("#save-menu");

menu.addEventListener("bs:dropdown:shown", (event) => {
  console.log("Menu opened", event.detail.controller);
});

// Later: boobstrap.destroy();`,
  });
  addExample("tabs", {
    id: "tabs-pills",
    title: "Pill tabs",
    description: "Use the pills modifier for a compact view switcher. It changes presentation only; the same tab roles, relationships, and controller behavior still apply.",
    preview: `<div class="bs-tabs bs-tabs-pills" role="tablist" aria-label="Report period" data-bs-tabs>
  <button class="bs-tab" id="pill-week-tab" type="button" role="tab" aria-controls="pill-week-panel" aria-selected="true">Week</button>
  <button class="bs-tab" id="pill-month-tab" type="button" role="tab" aria-controls="pill-month-panel">Month</button>
</div>
<div class="bs-tab-panel" id="pill-week-panel" role="tabpanel" aria-labelledby="pill-week-tab">7-day report</div>
<div class="bs-tab-panel" id="pill-month-panel" role="tabpanel" aria-labelledby="pill-month-tab" hidden>30-day report</div>`,
    label: "HTML · Pill tabs",
  });
  addExample("tabs", {
    id: "tabs-contained",
    title: "Contained tabs and panels",
    description: "Pair contained tabs with contained panels when the selector and content should read as one bordered surface.",
    preview: `<section aria-label="Deployment details">
  <div class="bs-tabs bs-tabs-contained" role="tablist" aria-label="Deployment detail" data-bs-tabs>
    <button class="bs-tab" id="contained-summary-tab" type="button" role="tab" aria-controls="contained-summary-panel" aria-selected="true">Summary</button>
    <button class="bs-tab" id="contained-log-tab" type="button" role="tab" aria-controls="contained-log-panel">Build log</button>
  </div>
  <div class="bs-tab-panel bs-tab-panel-contained" id="contained-summary-panel" role="tabpanel" aria-labelledby="contained-summary-tab">Deployment completed successfully.</div>
  <div class="bs-tab-panel bs-tab-panel-contained" id="contained-log-panel" role="tabpanel" aria-labelledby="contained-log-tab" hidden>Build finished in 42 seconds.</div>
</section>`,
    label: "HTML · Contained tabs",
  });
  addCodeExample("tabs", {
    title: "Initialize and observe tabs",
    description: "The tabs controller synchronizes selection, panel visibility, roving focus, and change events.",
    label: "JavaScript · Initialization and events",
    language: "javascript",
    source: `import { initBoobstrap } from "@boobstrap/boobstrap/js";

const boobstrap = initBoobstrap(document);
const tablist = document.querySelector("[data-bs-tabs]");

tablist.addEventListener("bs:tabs:changed", (event) => {
  console.log("Selected tab", event.detail.tab.id);
});

// Later: boobstrap.destroy();`,
  });

  addExample("utilities", {
    id: "utilities-flex",
    title: "Flex and alignment utilities",
    description: "Combine display, alignment, wrapping, and gap helpers to build common interface rows.",
    preview: `<div class="bs-flex bs-flex-wrap bs-items-center bs-justify-between bs-gap-4">
  <span class="bs-font-semibold">Team members</span>
  <div class="bs-flex bs-gap-2"><span class="bs-badge">12 active</span><button class="bs-btn bs-btn-primary bs-btn-sm" type="button">Invite</button></div>
</div>`,
    label: "HTML · Flex utilities",
    beforeSelector: ".docs-reference-grid",
  });
  addExample("utilities", {
    id: "utilities-spacing",
    title: "Spacing utilities",
    description: "Use token-backed margin, padding, and gap helpers to keep rhythm aligned with the design system.",
    preview: `<div class="bs-card bs-p-4">
  <div class="bs-stack bs-gap-3">
    <strong>Spacing stays systematic</strong>
    <p class="bs-text-muted bs-mb-0">The card has token-backed padding and the stack owns spacing between its children.</p>
  </div>
</div>`,
    label: "HTML · Spacing utilities",
    beforeSelector: ".docs-reference-grid",
  });
  addExample("utilities", {
    id: "utilities-text",
    title: "Typography utilities",
    description: "Apply size, alignment, weight, and semantic color helpers independently.",
    preview: `<div class="bs-stack bs-gap-2">
  <p class="bs-text-lg bs-font-bold bs-mb-0">Quarterly report</p>
  <p class="bs-text-sm bs-text-muted bs-mb-0">Updated five minutes ago</p>
  <p class="bs-text-primary bs-font-semibold bs-mb-0">Revenue increased 18%</p>
</div>`,
    label: "HTML · Typography utilities",
    beforeSelector: ".docs-reference-grid",
  });
  addGuidance("utilities", [
    { title: "Composition", body: "Utilities do one job. Combine only the classes that communicate a visible layout or type decision." },
    { title: "Consistency", body: "Spacing helpers map to the public token scale, keeping one-off margins and padding out of application stylesheets." },
    { title: "Responsive use", body: "Only the documented <code>md</code> display helpers are responsive. Grid column classes provide separate responsive composition controls." },
  ], ".docs-reference-grid");

  addExample("tokens", {
    id: "tokens-semantic-override",
    title: "Override semantic tokens",
    description: "Theme a subtree by redefining public semantic variables on its boundary. Components inside consume the new values automatically.",
    preview: `<div class="docs-token-preview" style="--bs-color-primary: #7c3aed; --bs-color-primary-hover: #8b5cf6; --bs-color-border-strong: rgb(124 58 237 / 38%);">
  <article class="bs-card"><div class="bs-card-body"><span class="bs-badge bs-badge-primary">Customized</span><h4 class="bs-card-title bs-mt-4">Semantic override</h4><p class="bs-card-text bs-mb-4">The button and badge inherit the local primary color.</p><button class="bs-btn bs-btn-primary bs-btn-sm" type="button">Continue</button></div></article>
</div>`,
    source: `<section class="campaign" style="--bs-color-primary: #7c3aed; --bs-color-primary-hover: #8b5cf6;">
  <span class="bs-badge bs-badge-primary">Customized</span>
  <button class="bs-btn bs-btn-primary" type="button">Continue</button>
</section>`,
    label: "HTML · Scoped token override",
    beforeSelector: ".docs-filter-row",
  });
  addGuidance("tokens", [
    { title: "Semantic first", body: "Prefer <code>--bs-color-primary</code> and other semantic variables over raw palette tokens when customizing components." },
    { title: "Scope", body: "Override on <code>:root</code> for the whole application, a theme attribute for one palette, or a component ancestor for a local treatment." },
    { title: "Fallbacks", body: "Keep every required state token—default, hover, active, focus, border, and text—legible in both light and dark contexts." },
  ], ".docs-filter-row");

  addExample("class-reference", {
    id: "class-reference-composition",
    title: "Compose classes by responsibility",
    description: "Start with a component class, add a variant, then use the smallest set of utilities needed by the surrounding layout.",
    preview: `<div class="bs-flex bs-flex-wrap bs-items-center bs-gap-3">
  <button class="bs-btn bs-btn-primary bs-btn-sm" type="button">Save</button>
  <span class="bs-badge">Autosaved</span>
  <span class="bs-text-sm bs-text-muted">No pending changes</span>
</div>`,
    label: "HTML · Component and utility composition",
    beforeSelector: ".docs-filter-row",
  });
  addGuidance("class-reference", [
    { title: "Search", body: "Filter by a component name such as <code>btn</code>, a purpose such as <code>gap</code>, or a declaration value." },
    { title: "Layering", body: "Component classes establish structure; variants change intent; utilities handle local composition and spacing." },
    { title: "Stability", body: "Only classes beginning with <code>bs-</code> are public framework selectors. Documentation-only classes are not part of the package API." },
  ], ".docs-filter-row");

  addExample("accessibility", {
    id: "accessibility-name",
    title: "Name icon-only controls",
    description: "The SVG is decorative; the button carries the action name announced by assistive technology.",
    preview: `<button class="bs-btn bs-btn-secondary bs-btn-icon" type="button" aria-label="Delete attachment"><svg class="bs-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" /></svg></button>`,
    label: "HTML · Accessible icon button",
  });
  addExample("accessibility", {
    id: "accessibility-description",
    title: "Connect descriptions and errors",
    description: "Use IDs and aria-describedby so helper and validation text are announced with the control.",
    preview: `<div class="bs-form-group"><label class="bs-label" for="a11y-email">Email address</label><input class="bs-input" id="a11y-email" type="email" aria-invalid="true" aria-describedby="a11y-email-help a11y-email-error" value="not-an-email" /><span class="bs-form-text" id="a11y-email-help">Used for account recovery.</span><span class="bs-form-feedback bs-form-feedback-invalid" id="a11y-email-error">Enter a complete email address.</span></div>`,
    label: "HTML · Described invalid control",
  });
  addExample("accessibility", {
    id: "accessibility-status",
    title: "Choose the right live-region role",
    description: "Use status for polite updates and reserve alert for urgent information that needs immediate announcement.",
    preview: `<div class="bs-stack bs-gap-3"><div class="bs-alert bs-alert-success" role="status"><span><strong class="bs-alert-title">Draft saved</strong>Your work is up to date.</span></div><div class="bs-alert bs-alert-primary" role="alert"><span><strong class="bs-alert-title">Session expiring</strong>Save your work within two minutes.</span></div></div>`,
    label: "HTML · Status and alert roles",
  });
  addGuidance("accessibility", [
    { title: "Native first", body: "Start with the correct element and input type. Native semantics, keyboard behavior, and form participation are difficult to recreate accurately." },
    { title: "State", body: "Keep <code>aria-expanded</code>, <code>aria-selected</code>, <code>aria-pressed</code>, <code>aria-invalid</code>, and <code>hidden</code> synchronized with visible state." },
    { title: "Test", body: "Check keyboard-only operation, visible focus, zoom, reduced motion, both themes, and at least one screen reader for critical workflows." },
  ]);
}
