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
  demo.id = id;
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
    title: "Scope a complete theme to one region",
    description: "All three attributes inherit through a subtree, which is useful for embedded products, dashboards, and previews with a distinct visual identity.",
    preview: `<div class="bs-card" data-bs-theme="light" data-bs-palette="teal" data-bs-radius="square">
  <div class="bs-card-body">
    <span class="bs-badge bs-badge-primary">Light · Teal · Square</span>
    <h3 class="bs-card-title bs-mt-4">Scoped independently</h3>
    <p class="bs-card-text bs-mb-4">The surrounding page keeps its own mode, palette, and corners.</p>
    <button class="bs-btn bs-btn-primary bs-btn-sm" type="button">Continue</button>
  </div>
</div>`,
    label: "HTML · Scoped theme",
  });
  addCodeExample("theming", {
    title: "Persist a mode preference",
    description: "Mode can change without disturbing the selected palette or corner profile. Apply a stored preference before paint when possible to avoid a visual flash.",
    label: "JavaScript · Mode toggle",
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

  addCodeExample("sidebars", {
    title: "Anatomy",
    description: "The shell mirrors the way application sidebars are actually assembled. Header and footer remain fixed, content scrolls, and groups contain menu lists or custom controls.",
    label: "Text · Composition map",
    language: "text",
    source: `SidebarLayout
├── Sidebar
│   ├── SidebarHeader
│   ├── SidebarContent
│   │   └── SidebarGroup
│   │       ├── SidebarGroupLabel + SidebarGroupAction
│   │       └── SidebarGroupContent
│   │           └── SidebarMenu
│   │               └── SidebarMenuItem
│   │                   ├── SidebarMenuButton
│   │                   ├── SidebarMenuAction + SidebarMenuBadge
│   │                   └── SidebarMenuSub
│   ├── SidebarFooter
│   └── SidebarRail
└── SidebarMain + SidebarTrigger`,
  });

  addExample("sidebars", {
    id: "sidebar-shell",
    title: "Complete application shell",
    description: "Compose a fixed identity region, independently scrolling navigation, account footer, and primary surface. The source order stays meaningful when the layout stacks on a narrow viewport.",
    preview: `<div class="bs-sidebar-layout">
  <aside class="bs-sidebar bs-sidebar-start bs-p-0" aria-label="Acme workspace">
    <div class="bs-sidebar-header">
      <button class="bs-sidebar-menu-button bs-sidebar-menu-button-lg" type="button">
        <span aria-hidden="true">◆</span><span class="bs-sidebar-label">Acme, Inc.</span><span aria-hidden="true">⌄</span>
      </button>
    </div>
    <div class="bs-sidebar-content">
      <section class="bs-sidebar-group" aria-labelledby="shell-workspace-label">
        <div class="bs-sidebar-group-label" id="shell-workspace-label">Workspace</div>
        <div class="bs-sidebar-group-content">
          <ul class="bs-sidebar-menu">
            <li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-shell" aria-current="page"><span aria-hidden="true">⌂</span><span class="bs-sidebar-label">Dashboard</span></a></li>
            <li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-shell"><span aria-hidden="true">□</span><span class="bs-sidebar-label">Projects</span><span class="bs-sidebar-menu-badge">8</span></a></li>
            <li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-shell"><span aria-hidden="true">♧</span><span class="bs-sidebar-label">Team</span></a></li>
          </ul>
        </div>
      </section>
      <hr class="bs-sidebar-separator" />
      <section class="bs-sidebar-group" aria-labelledby="shell-tools-label">
        <div class="bs-sidebar-group-label" id="shell-tools-label">Tools</div>
        <div class="bs-sidebar-group-content">
          <ul class="bs-sidebar-menu"><li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-shell"><span aria-hidden="true">⚙</span><span class="bs-sidebar-label">Settings</span></a></li></ul>
        </div>
      </section>
    </div>
    <div class="bs-sidebar-footer"><button class="bs-sidebar-menu-button bs-sidebar-menu-button-lg" type="button"><span aria-hidden="true">●</span><span class="bs-sidebar-label">Ada Lovelace</span></button></div>
  </aside>
  <div class="bs-sidebar-main bs-p-6" role="region" aria-label="Example main content"><span class="bs-badge bs-badge-primary">Main content</span><h4 class="bs-mt-4">Project overview</h4><p class="bs-text-muted">Your application content lives in the flexible main region.</p></div>
</div>`,
    label: "HTML · Complete sidebar shell",
  });

  addExample("sidebars", {
    id: "sidebar-menu-anatomy",
    title: "Menu actions, badges, and nested destinations",
    description: "A menu item can combine one primary destination with an independently named action, count, or nested list. Keep links for navigation and buttons for commands.",
    preview: `<aside class="bs-sidebar bs-sidebar-start" style="position: relative; --bs-sidebar-height: auto; --bs-sidebar-width: 21rem" aria-label="Project navigation">
  <div class="bs-sidebar-content">
    <section class="bs-sidebar-group" aria-labelledby="projects-label">
      <div class="bs-sidebar-group-label" id="projects-label">Projects</div>
      <button class="bs-sidebar-group-action" type="button" aria-label="Add project">+</button>
      <div class="bs-sidebar-group-content">
        <ul class="bs-sidebar-menu">
          <li class="bs-sidebar-menu-item">
            <a class="bs-sidebar-menu-button" href="#sidebar-menu-anatomy" data-active="true"><span aria-hidden="true">◇</span><span class="bs-sidebar-label">Website redesign</span><span class="bs-sidebar-menu-badge">3</span></a>
            <button class="bs-sidebar-menu-action" type="button" aria-label="Website redesign actions">•••</button>
            <ul class="bs-sidebar-menu-sub">
              <li class="bs-sidebar-menu-sub-item"><a class="bs-sidebar-menu-sub-button" href="#sidebar-menu-anatomy" aria-current="page">Overview</a></li>
              <li class="bs-sidebar-menu-sub-item"><a class="bs-sidebar-menu-sub-button" href="#sidebar-menu-anatomy">Activity</a></li>
            </ul>
          </li>
          <li class="bs-sidebar-menu-item"><button class="bs-sidebar-menu-button" type="button" disabled><span aria-hidden="true">◇</span><span class="bs-sidebar-label">Archived project</span></button></li>
        </ul>
      </div>
    </section>
  </div>
</aside>`,
    label: "HTML · Rich menu anatomy",
  });

  addExample("sidebars", {
    id: "sidebar-variants",
    title: "Default, floating, and inset variants",
    description: "Use the default bordered rail for dense products, floating for an elevated panel, and inset when the main surface should read as a distinct workspace.",
    preview: `<div class="bs-grid bs-gap-6">
  <div class="bs-col-12 bs-col-lg-4"><aside class="bs-sidebar bs-sidebar-start" style="position: relative; --bs-sidebar-height: 12rem" aria-label="Default sidebar example"><div class="bs-sidebar-header"><strong>Default</strong></div><div class="bs-sidebar-content"><a class="bs-sidebar-menu-button" href="#sidebar-variants" aria-current="page">Overview</a></div></aside></div>
  <div class="bs-col-12 bs-col-lg-4"><aside class="bs-sidebar bs-sidebar-start bs-sidebar-floating" style="position: relative; --bs-sidebar-height: 12rem" aria-label="Floating sidebar example"><div class="bs-sidebar-header"><strong>Floating</strong></div><div class="bs-sidebar-content"><a class="bs-sidebar-menu-button" href="#sidebar-variants" aria-current="page">Overview</a></div></aside></div>
  <div class="bs-col-12 bs-col-lg-4"><div class="bs-sidebar-layout" style="min-block-size: 12rem"><aside class="bs-sidebar bs-sidebar-start bs-sidebar-inset" style="position: relative; --bs-sidebar-height: 12rem" aria-label="Inset sidebar example"><div class="bs-sidebar-header"><strong>Inset</strong></div><div class="bs-sidebar-content"><a class="bs-sidebar-menu-button" href="#sidebar-variants" aria-current="page">Overview</a></div></aside><div class="bs-sidebar-main bs-p-4">Content</div></div></div>
</div>`,
    label: "HTML · Sidebar variants",
  });

  addExample("sidebars", {
    id: "sidebar-icon-collapse",
    title: "Icon-collapse mode",
    description: "Use icon mode when destinations remain recognizable without labels. The edge rail and any external trigger share the same aria-controls target; Control/Command+B is enabled by the declared shortcut.",
    preview: `<button class="bs-sidebar-trigger bs-mb-4" type="button" data-bs-toggle="sidebar" aria-controls="collapse-example-sidebar" aria-label="Toggle example sidebar">☰</button>
<div class="bs-sidebar-layout" style="min-block-size: 22rem">
  <aside class="bs-sidebar bs-sidebar-start bs-sidebar-collapsible" id="collapse-example-sidebar" style="position: relative; --bs-sidebar-height: 22rem" data-bs-sidebar data-bs-sidebar-collapse="icon" data-bs-sidebar-media="(max-width: 0px)" data-bs-sidebar-shortcut="b" data-bs-state="expanded" aria-label="Collapsible example navigation">
    <div class="bs-sidebar-header"><strong class="bs-sidebar-label">Acme</strong></div>
    <div class="bs-sidebar-content"><ul class="bs-sidebar-menu"><li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-icon-collapse" aria-current="page"><span aria-hidden="true">⌂</span><span class="bs-sidebar-label">Dashboard</span></a></li><li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-icon-collapse"><span aria-hidden="true">□</span><span class="bs-sidebar-label">Projects</span><span class="bs-sidebar-menu-badge">8</span></a></li></ul></div>
    <button class="bs-sidebar-rail" type="button" data-bs-toggle="sidebar" aria-controls="collapse-example-sidebar" aria-label="Toggle example sidebar width"></button>
  </aside>
  <div class="bs-sidebar-main bs-p-5" role="region" aria-label="Collapse mode result">Toggle the rail to compare expanded and icon states.</div>
</div>`,
    label: "HTML · Collapsible icon rail",
  });

  addCodeExample("sidebars", {
    title: "Choose a collapse mode",
    description: "Icon retains the narrow rail, offcanvas removes it completely on desktop, and none keeps it persistent. Mobile drawer behavior remains independent when the drawer class is present.",
    label: "HTML · Collapse modes",
    source: `<aside class="bs-sidebar bs-sidebar-collapsible" data-bs-sidebar-collapse="icon">...</aside>
<aside class="bs-sidebar bs-sidebar-collapsible" data-bs-sidebar-collapse="offcanvas">...</aside>
<aside class="bs-sidebar" data-bs-sidebar-collapse="none">...</aside>`,
  });

  addExample("sidebars", {
    id: "sidebar-responsive",
    title: "Responsive navigation sidebar",
    description: "The sidebar remains a sticky rail at large widths and becomes an accessible off-canvas drawer below 64rem. The optional controller owns the backdrop, focus, Escape, ARIA state, and scroll lock.",
    preview: `<button class="bs-sidebar-trigger" type="button" data-bs-toggle="sidebar" aria-controls="example-sidebar" aria-label="Toggle documentation menu">☰</button>
<aside class="bs-sidebar bs-sidebar-start bs-sidebar-drawer" id="example-sidebar" style="--bs-sidebar-height: 20rem" data-bs-sidebar data-bs-state="closed" aria-label="Example documentation navigation">
  <div class="bs-sidebar-header"><div class="bs-flex bs-items-center bs-justify-between bs-gap-3"><strong>Documentation</strong><button class="bs-sidebar-trigger" type="button" data-bs-sidebar-dismiss aria-label="Close documentation menu">×</button></div></div>
  <div class="bs-sidebar-content">
    <nav class="bs-sidebar-group" aria-label="Documentation sections">
      <div class="bs-sidebar-group-label">Get started</div>
      <div class="bs-sidebar-group-content"><ul class="bs-sidebar-menu">
        <li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-responsive" data-bs-sidebar-close>Introduction</a></li>
        <li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-responsive" data-bs-sidebar-close>Installation</a></li>
      </ul></div>
    </nav>
  </div>
</aside>
<button class="bs-sidebar-backdrop" type="button" data-bs-sidebar-dismiss aria-controls="example-sidebar" aria-label="Close documentation menu"></button>`,
    label: "HTML · Responsive sidebar drawer",
  });
  addExample("sidebars", {
    id: "sidebar-toc",
    title: "Right-hand table of contents",
    description: "Use the end and table-of-contents modifiers for compact in-page navigation. The page layout decides when to hide the rail so the reading column keeps enough width.",
    preview: `<aside class="bs-sidebar bs-sidebar-end bs-sidebar-toc" style="--bs-sidebar-height: auto" aria-label="On this page">
  <p class="bs-nav-heading">On this page</p>
  <nav class="bs-nav">
    <a class="bs-nav-link" href="#sidebar-toc" aria-current="location">Overview</a>
    <a class="bs-nav-link" href="#sidebar-toc">Accessibility</a>
    <a class="bs-nav-link" href="#sidebar-toc">JavaScript API</a>
  </nav>
</aside>`,
    label: "HTML · Sticky table of contents",
  });
  addCodeExample("sidebars", {
    title: "Initialize and observe a sidebar",
    description: "The aggregate initializer discovers responsive sidebars, or import the component directly when you need imperative control.",
    label: "JavaScript · Sidebar lifecycle",
    language: "javascript",
    source: `import { initBoobstrap } from "@boobstrap/boobstrap/js";

const boobstrap = initBoobstrap(document);
const element = document.querySelector("[data-bs-sidebar]");

element.addEventListener("bs:sidebar:shown", () => {
  console.log("Navigation drawer opened");
});

// Later: boobstrap.destroy();`,
  });

  addExample("sidebars", {
    id: "sidebar-loading",
    title: "Loading state",
    description: "Skeleton rows preserve menu rhythm while destinations load. Change each placeholder's text width locally and let the framework disable pulsing when reduced motion is preferred.",
    preview: `<aside class="bs-sidebar bs-sidebar-start" style="position: relative; --bs-sidebar-height: auto; --bs-sidebar-width: 20rem" aria-label="Loading navigation">
  <div class="bs-sidebar-header"><strong>Loading workspace</strong></div>
  <div class="bs-sidebar-content">
    <div class="bs-sidebar-group"><div class="bs-sidebar-group-label">Projects</div><div class="bs-sidebar-group-content">
      <div class="bs-sidebar-skeleton" style="--bs-sidebar-skeleton-width: 72%" aria-hidden="true"></div>
      <div class="bs-sidebar-skeleton" style="--bs-sidebar-skeleton-width: 55%" aria-hidden="true"></div>
      <div class="bs-sidebar-skeleton" style="--bs-sidebar-skeleton-width: 63%" aria-hidden="true"></div>
    </div></div>
  </div>
</aside>`,
    label: "HTML · Loading placeholders",
  });

  addExample("sidebars", {
    id: "sidebar-rtl",
    title: "Right-to-left and end placement",
    description: "Start/end placement, borders, nested-menu indentation, actions, and badges use logical properties, so the same markup follows document direction without mirrored class names.",
    preview: `<div dir="rtl">
  <aside class="bs-sidebar bs-sidebar-end" style="position: relative; --bs-sidebar-height: auto; --bs-sidebar-width: 20rem" aria-label="التنقل في المشروع">
    <div class="bs-sidebar-header"><strong>مساحة العمل</strong></div>
    <div class="bs-sidebar-content"><ul class="bs-sidebar-menu">
      <li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-rtl" aria-current="page"><span aria-hidden="true">⌂</span><span class="bs-sidebar-label">لوحة التحكم</span><span class="bs-sidebar-menu-badge">٤</span></a></li>
      <li class="bs-sidebar-menu-item"><a class="bs-sidebar-menu-button" href="#sidebar-rtl"><span aria-hidden="true">□</span><span class="bs-sidebar-label">المشاريع</span></a></li>
    </ul></div>
  </aside>
</div>`,
    label: "HTML · Logical end sidebar",
  });

  addCodeExample("sidebars", {
    title: "Direct controller API",
    description: "Use the component entry point when application code needs imperative control. Toggle automatically selects mobile show/hide or desktop expand/collapse for the current media query.",
    label: "JavaScript · Controller methods",
    language: "javascript",
    source: `import { Sidebar } from "@boobstrap/boobstrap/js/sidebar";

const sidebar = Sidebar.getOrCreateInstance(
  document.querySelector("#app-sidebar"),
);

sidebar.show();       // mobile drawer
sidebar.hide();       // mobile drawer
sidebar.expand();     // desktop rail
sidebar.collapse();   // desktop rail
sidebar.toggle();     // active responsive mode

// During application teardown:
sidebar.destroy();`,
  });

  addCodeExample("sidebars", {
    title: "Cancelable lifecycle events",
    description: "Before-events can veto a transition. After-events are useful for analytics or layout work and include the controller, reason, and original source event in event.detail.",
    label: "JavaScript · Lifecycle events",
    language: "javascript",
    source: `const sidebar = document.querySelector("#app-sidebar");

sidebar.addEventListener("bs:sidebar:collapse", (event) => {
  if (document.body.dataset.editorBusy === "true") event.preventDefault();
});

sidebar.addEventListener("bs:sidebar:collapsed", (event) => {
  console.log(event.detail.reason); // trigger, shortcut, or api
});`,
  });

  addCodeExample("sidebars", {
    title: "Size customization",
    description: "Set sizing variables at the sidebar boundary. If an application overrides the controller media query, its own drawer media rules must use the same breakpoint so behavior and presentation remain aligned.",
    label: "HTML · Local configuration",
    source: `<aside
  class="bs-sidebar bs-sidebar-drawer"
  style="--bs-sidebar-offset: 4rem;
         --bs-sidebar-width: 19rem;
         --bs-sidebar-width-mobile: 22rem;
         --bs-sidebar-width-collapsed: 4rem"
  data-bs-sidebar
>...</aside>`,
  });

  addCodeExample("sidebars", {
    title: "Application-owned state",
    description: "React, Alpine, or another state layer can use the CSS presentation without the vanilla controller. Synchronize data-bs-state and aria-expanded together, and implement the same focus and dialog responsibilities for mobile drawers.",
    label: "JavaScript · Controlled presentation",
    language: "javascript",
    source: `const sidebar = document.querySelector("#app-sidebar");
const trigger = document.querySelector('[aria-controls="app-sidebar"]');

function renderSidebar(expanded) {
  sidebar.dataset.bsState = expanded ? "expanded" : "collapsed";
  trigger.setAttribute("aria-expanded", String(expanded));
}

trigger.addEventListener("click", () => {
  renderSidebar(sidebar.dataset.bsState === "collapsed");
});`,
  });

  addGuidance("sidebars", [
    { title: "Choose the shell", body: "Use <code>.bs-sidebar-layout</code> for product navigation beside a flexible main surface. A standalone <code>.bs-sidebar-end.bs-sidebar-toc</code> is enough for a compact article outline." },
    { title: "Choose collapse deliberately", body: "Use <code>icon</code> only when every destination has a recognizable icon and accessible name. Use <code>offcanvas</code> when content needs the full width. Use <code>none</code> for always-visible navigation." },
    { title: "Keep semantics native", body: "Use an <code>&lt;aside&gt;</code> landmark, labeled <code>&lt;nav&gt;</code> regions, links for destinations, buttons for actions, and <code>aria-current</code> for the active page." },
    { title: "One state owner", body: "Initialize the Boobstrap controller or let your application own state—never both on the same sidebar. Custom mobile behavior must reproduce focus trapping, Escape dismissal, inert state, and focus restoration." },
  ]);

  addExample("cards", {
    id: "card-basic",
    title: "Content-only card",
    description: "Header and footer are optional. Use the content region by itself when the card needs one uninterrupted block.",
    preview: `<article class="bs-card" aria-labelledby="basic-card-title">
  <div class="bs-card-content">
    <h4 class="bs-card-title" id="basic-card-title">Release notes</h4>
    <p class="bs-card-text bs-mb-0">A concise summary belongs inside the same content surface.</p>
  </div>
</article>`,
    label: "HTML · Content-only card",
  });
  addExample("cards", {
    id: "card-action",
    title: "Complete structured card",
    description: "Compose an optional header and footer around the content region. The header aligns its title and description with an independent action slot; the footer wraps related actions naturally.",
    preview: `<article class="bs-card bs-card-raised" aria-labelledby="workspace-card-title">
  <header class="bs-card-header">
    <h4 class="bs-card-title" id="workspace-card-title">Workspace usage</h4>
    <p class="bs-card-description">Review current storage and manage plan capacity.</p>
    <button class="bs-btn bs-btn-ghost bs-btn-sm bs-card-action" type="button">Manage</button>
  </header>
  <div class="bs-card-content">
    <strong>68 GB of 100 GB</strong>
    <p class="bs-card-text bs-mb-0">Storage resets on the first day of each month.</p>
  </div>
  <footer class="bs-card-footer">
    <button class="bs-btn bs-btn-primary bs-btn-sm" type="button">Upgrade plan</button>
    <button class="bs-btn bs-btn-secondary bs-btn-sm" type="button">View usage</button>
  </footer>
</article>`,
    label: "HTML · Header, content, and footer",
  });
  addExample("cards", {
    id: "card-header-content",
    title: "Header and content without a footer",
    description: "Omit the footer when the card has no bottom actions. Header actions remain real controls and descriptions stay associated with the card heading.",
    preview: `<article class="bs-card bs-card-subtle" aria-labelledby="deployment-card-title">
  <header class="bs-card-header">
    <h4 class="bs-card-title" id="deployment-card-title">Production deployment</h4>
    <p class="bs-card-description">Deployed from main 14 minutes ago.</p>
    <span class="bs-badge bs-badge-primary bs-card-action">Healthy</span>
  </header>
  <div class="bs-card-content">
    <p class="bs-card-text bs-mb-0">All regions are responding normally and the error rate is below the alert threshold.</p>
  </div>
</article>`,
    label: "HTML · Header and content",
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
    title: "Semantic headers, body, and footer",
    description: "A caption names the dataset, scoped headers expose its row-and-column relationships, and the footer summarizes values without pretending to be another record.",
    preview: `<div class="bs-table-responsive" role="region" tabindex="0" aria-label="Workspace usage by plan">
  <table class="bs-table">
    <caption>Workspace usage by plan</caption>
    <thead><tr><th scope="col">Plan</th><th class="bs-table-cell-numeric" scope="col">Workspaces</th><th class="bs-table-cell-numeric" scope="col">Members</th></tr></thead>
    <tbody>
      <tr><th scope="row">Starter</th><td class="bs-table-cell-numeric">18</td><td class="bs-table-cell-numeric">42</td></tr>
      <tr><th scope="row">Team</th><td class="bs-table-cell-numeric">12</td><td class="bs-table-cell-numeric">86</td></tr>
    </tbody>
    <tfoot><tr><th scope="row">Total</th><td class="bs-table-cell-numeric">30</td><td class="bs-table-cell-numeric">128</td></tr></tfoot>
  </table>
</div>`,
    label: "HTML · Table anatomy",
    beforeSelector: ".docs-table-topics",
  });
  addExample("table-styles", {
    id: "table-database-records",
    title: "Striped, hoverable data table",
    description: "Combine stripes with hover and focus-within feedback for operational records. Status remains readable as text, and each row’s action is a real control.",
    preview: `<div class="bs-table-responsive" role="region" tabindex="0" aria-label="Customer database records">
  <table class="bs-table bs-table-striped bs-table-hover">
    <caption>Recently active customer accounts</caption>
    <thead><tr><th scope="col">Customer</th><th scope="col">Status</th><th scope="col">Plan</th><th scope="col">Last active</th><th class="bs-table-cell-actions" scope="col">Action</th></tr></thead>
    <tbody>
      <tr><th scope="row">Avery Morgan</th><td><span class="bs-badge bs-badge-primary">Active</span></td><td>Team</td><td>2 min ago</td><td class="bs-table-cell-actions"><button class="bs-btn bs-btn-ghost bs-btn-sm" type="button">View</button></td></tr>
      <tr><th scope="row">Kai Patel</th><td><span class="bs-badge">Invited</span></td><td>Starter</td><td>Yesterday</td><td class="bs-table-cell-actions"><button class="bs-btn bs-btn-ghost bs-btn-sm" type="button">View</button></td></tr>
      <tr><th scope="row">Sam Rivera</th><td><span class="bs-badge bs-badge-primary">Active</span></td><td>Business</td><td>3 days ago</td><td class="bs-table-cell-actions"><button class="bs-btn bs-btn-ghost bs-btn-sm" type="button">View</button></td></tr>
    </tbody>
  </table>
</div>`,
    label: "HTML · Operational data table",
  });
  addExample("table-styles", {
    id: "table-bordered-compact",
    title: "Bordered and compact",
    description: "Use cell borders when readers need to trace values across a dense matrix. Compact spacing keeps repeated numeric data scannable.",
    preview: `<div class="bs-table-responsive" role="region" tabindex="0" aria-label="Quarterly revenue matrix">
  <table class="bs-table bs-table-bordered bs-table-compact">
    <caption>Revenue by region, USD thousands</caption>
    <thead><tr><th scope="col">Region</th><th class="bs-table-cell-numeric" scope="col">Q1</th><th class="bs-table-cell-numeric" scope="col">Q2</th><th class="bs-table-cell-numeric" scope="col">Q3</th><th class="bs-table-cell-numeric" scope="col">Q4</th></tr></thead>
    <tbody>
      <tr><th scope="row">North</th><td class="bs-table-cell-numeric">184</td><td class="bs-table-cell-numeric">201</td><td class="bs-table-cell-numeric">218</td><td class="bs-table-cell-numeric">236</td></tr>
      <tr><th scope="row">South</th><td class="bs-table-cell-numeric">142</td><td class="bs-table-cell-numeric">156</td><td class="bs-table-cell-numeric">164</td><td class="bs-table-cell-numeric">179</td></tr>
    </tbody>
  </table>
</div>`,
    label: "HTML · Bordered compact table",
  });
  addExample("table-styles", {
    id: "table-borderless",
    title: "Borderless comparison",
    description: "Remove internal rules when the dataset is short and spacing alone provides enough separation. A bottom caption works well for a source or freshness note.",
    preview: `<div class="bs-table-responsive" role="region" tabindex="0" aria-label="Package size comparison">
  <table class="bs-table bs-table-borderless bs-table-caption-bottom">
    <caption>Minified package sizes from the current release.</caption>
    <thead><tr><th scope="col">Entry</th><th class="bs-table-cell-numeric" scope="col">CSS</th><th class="bs-table-cell-numeric" scope="col">JavaScript</th></tr></thead>
    <tbody>
      <tr><th scope="row">Core</th><td class="bs-table-cell-numeric">70 kB</td><td class="bs-table-cell-numeric">14 kB</td></tr>
      <tr><th scope="row">React adapter</th><td class="bs-table-cell-numeric">—</td><td class="bs-table-cell-numeric">9 kB</td></tr>
    </tbody>
  </table>
</div>`,
    label: "HTML · Borderless table",
  });
  addExample("table-fundamentals", {
    id: "table-sticky-sortable",
    title: "Sticky and sortable columns",
    description: "Constrain a long result set with the sticky-header wrapper. Sorting remains application behavior: update the rows and move aria-sort to the active column after each sort.",
    preview: `<div class="bs-table-responsive bs-table-sticky-header" role="region" tabindex="0" aria-label="Deployment history" style="--bs-table-max-height: 16rem;">
  <table class="bs-table bs-table-hover">
    <caption>Deployment history</caption>
    <thead><tr><th scope="col" aria-sort="descending"><button class="bs-table-sort" type="button">Deployed</button></th><th scope="col"><button class="bs-table-sort" type="button">Environment</button></th><th scope="col">Commit</th><th scope="col">Result</th></tr></thead>
    <tbody>
      <tr><td>Aug 11, 14:32</td><td>Production</td><td><code class="bs-code-inline">a81f0d2</code></td><td>Passed</td></tr>
      <tr><td>Aug 11, 12:08</td><td>Preview</td><td><code class="bs-code-inline">7c29be1</code></td><td>Passed</td></tr>
      <tr><td>Aug 10, 18:41</td><td>Production</td><td><code class="bs-code-inline">663d420</code></td><td>Rolled back</td></tr>
      <tr><td>Aug 10, 16:05</td><td>Preview</td><td><code class="bs-code-inline">45fb118</code></td><td>Passed</td></tr>
      <tr><td>Aug 9, 09:27</td><td>Production</td><td><code class="bs-code-inline">31ad902</code></td><td>Passed</td></tr>
    </tbody>
  </table>
</div>`,
    label: "HTML · Sticky sortable table",
  });
  addExample("table-fundamentals", {
    id: "table-empty-state",
    title: "Empty dataset",
    description: "Keep the table structure and column context while data is empty. The message should explain the absence; place any recovery action in or immediately after the cell.",
    preview: `<div class="bs-table-responsive" role="region" tabindex="0" aria-label="Filtered invoices">
  <table class="bs-table">
    <caption>Invoices matching the current filters</caption>
    <thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th><th scope="col">Due date</th><th class="bs-table-cell-numeric" scope="col">Amount</th></tr></thead>
    <tbody><tr><td class="bs-table-empty" colspan="4">No invoices match these filters.</td></tr></tbody>
  </table>
</div>`,
    label: "HTML · Empty table state",
  });
  addExample("table-pagination", {
    id: "pagination-dataset",
    title: "Dataset pagination",
    description: "Use a labeled navigation landmark, mark exactly one page current, remove disabled links from the tab order, and allow optional middle pages to collapse on small screens.",
    preview: `<nav aria-label="Customer result pages">
  <ul class="bs-pagination">
    <li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-dataset" aria-disabled="true" tabindex="-1">Previous</a></li>
    <li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-dataset" aria-current="page" aria-label="Page 1, current page">1</a></li>
    <li class="bs-pagination-item bs-pagination-optional"><a class="bs-pagination-link" href="#pagination-dataset" aria-label="Page 2">2</a></li>
    <li class="bs-pagination-item bs-pagination-optional"><a class="bs-pagination-link" href="#pagination-dataset" aria-label="Page 3">3</a></li>
    <li class="bs-pagination-item"><span class="bs-pagination-ellipsis" aria-hidden="true">…</span></li>
    <li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-dataset" aria-label="Page 12">12</a></li>
    <li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-dataset" aria-label="Next page">Next</a></li>
  </ul>
</nav>`,
    label: "HTML · Pagination states",
  });
  addExample("table-pagination", {
    id: "pagination-sizes",
    title: "Pagination sizes",
    description: "The default size fits most product interfaces. Use the small modifier in dense toolbars and the large modifier only where pagination is a primary interaction.",
    preview: `<div class="bs-stack bs-gap-4">
  <nav aria-label="Compact result pages"><ul class="bs-pagination bs-pagination-sm"><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes">Previous</a></li><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes" aria-current="page">1</a></li><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes">2</a></li><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes">Next</a></li></ul></nav>
  <nav aria-label="Large result pages"><ul class="bs-pagination bs-pagination-lg"><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes">Previous</a></li><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes" aria-current="page">1</a></li><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes">2</a></li><li class="bs-pagination-item"><a class="bs-pagination-link" href="#pagination-sizes">Next</a></li></ul></nav>
</div>`,
    label: "HTML · Small and large pagination",
  });
  addExample("table-datatables", {
    id: "datatable-customer-directory",
    title: "Fully functional DataTables.net integration",
    description: "This live DataTables 3 example supports client-side search, column sorting, page-length changes, result counts, and pagination. Try every control: the generated interface is styled entirely by Boobstrap tokens.",
    preview: `<div class="bs-datatable">
  <table class="bs-table bs-table-striped bs-table-hover" id="customer-directory" data-datatables-demo>
    <caption>Customer directory</caption>
    <thead><tr><th scope="col">Customer</th><th scope="col">Role</th><th scope="col">Office</th><th scope="col">Joined</th><th scope="col">Status</th></tr></thead>
    <tbody>
      <tr><th scope="row">Avery Morgan</th><td>Engineering lead</td><td>London</td><td data-order="2026-07-28">Jul 28, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Kai Patel</th><td>Product designer</td><td>Toronto</td><td data-order="2026-07-22">Jul 22, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Sam Rivera</th><td>Support manager</td><td>Austin</td><td data-order="2026-07-19">Jul 19, 2026</td><td><span class="bs-badge">Invited</span></td></tr>
      <tr><th scope="row">Jordan Lee</th><td>Data analyst</td><td>Singapore</td><td data-order="2026-07-14">Jul 14, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Noor Hassan</th><td>Security engineer</td><td>Berlin</td><td data-order="2026-07-09">Jul 9, 2026</td><td><span class="bs-badge">Invited</span></td></tr>
      <tr><th scope="row">Taylor Brooks</th><td>Account executive</td><td>New York</td><td data-order="2026-06-30">Jun 30, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Emi Tanaka</th><td>Frontend engineer</td><td>Tokyo</td><td data-order="2026-06-24">Jun 24, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Robin Clarke</th><td>Content strategist</td><td>Dublin</td><td data-order="2026-06-18">Jun 18, 2026</td><td><span class="bs-badge">Invited</span></td></tr>
      <tr><th scope="row">Priya Shah</th><td>Product manager</td><td>Mumbai</td><td data-order="2026-06-11">Jun 11, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Casey Nguyen</th><td>QA engineer</td><td>Sydney</td><td data-order="2026-06-03">Jun 3, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Morgan Okafor</th><td>Finance director</td><td>Lagos</td><td data-order="2026-05-27">May 27, 2026</td><td><span class="bs-badge">Invited</span></td></tr>
      <tr><th scope="row">Alexis Martin</th><td>Solutions architect</td><td>Paris</td><td data-order="2026-05-16">May 16, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
      <tr><th scope="row">Drew Wilson</th><td>Operations lead</td><td>Chicago</td><td data-order="2026-05-08">May 8, 2026</td><td><span class="bs-badge bs-badge-primary">Active</span></td></tr>
    </tbody>
  </table>
</div>`,
    label: "HTML · DataTables customer directory",
  });
  addCodeExample("table-datatables", {
    title: "Install DataTables 3",
    description: "Install the dependency-free DataTables core. Do not import its default styling package—the Boobstrap adapter supplies the complete presentation layer.",
    label: "Terminal · Install DataTables",
    language: "bash",
    source: `npm install @boobstrap/boobstrap datatables.net`,
  });
  addCodeExample("table-datatables", {
    title: "Initialize the live table",
    description: "DataTables owns search, ordering, paging, and result updates. After initialization, name the generated overflow cell so keyboard users can reach columns beyond the viewport.",
    label: "JavaScript · DataTables initialization",
    language: "javascript",
    source: `import "@boobstrap/boobstrap/dist/boobstrap.css";
import DataTable from "datatables.net";

const table = document.querySelector("#customer-directory");

new DataTable(table, {
  pageLength: 5,
  lengthMenu: [5, 10, 25],
  order: [[3, "desc"]],
  layout: {
    topStart: { pageLength: { menu: [5, 10, 25] } },
    topEnd: { search: { placeholder: "Name, role, or office" } },
    bottomStart: "info",
    bottomEnd: { paging: { buttons: 3 } },
  },
  language: {
    entries: { _: "customers", 1: "customer" },
    search: "Search customers:",
    zeroRecords: "No customers match that search.",
  },
});

const region = table.closest(".dt-layout-table")
  ?.querySelector(":scope > .dt-layout-cell");

region?.setAttribute("role", "region");
region?.setAttribute("tabindex", "0");
region?.setAttribute("aria-label", "Customer directory results");`,
  });
  addGuidance("tables", [
    { title: "Structure", body: "Use <code>&lt;caption&gt;</code>, <code>&lt;thead&gt;</code>, <code>&lt;tbody&gt;</code>, and <code>&lt;tfoot&gt;</code> for their real purposes. Add <code>scope=\"col\"</code> or <code>scope=\"row\"</code> to unambiguous headers." },
    { title: "Choose a guide", body: "Start with fundamentals, add only the visual modifiers your dataset needs, then choose application-owned pagination or the DataTables.net integration." },
    { title: "Behavior ownership", body: "Boobstrap provides presentation. Your application or data library owns row ordering, filters, loading, current-page state, and result announcements." },
  ]);
  addGuidance("table-fundamentals", [
    { title: "Overflow", body: "Give scrollable wrappers <code>role=\"region\"</code>, <code>tabindex=\"0\"</code>, and an accessible name. This lets keyboard users reach columns beyond the viewport." },
    { title: "Sorting", body: "Put sorting on real buttons, move <code>aria-sort</code> to the active header, and update it only after the visible rows have been reordered." },
    { title: "Empty states", body: "Keep the caption and headers in place, then span one explanatory <code>.bs-table-empty</code> cell across the body so users retain column context." },
  ]);
  addGuidance("table-styles", [
    { title: "Row aids", body: "Stripes and hover feedback help scanning but do not communicate selection, status, or validation. Keep those meanings in text and controls." },
    { title: "Density", body: "Use compact cells for repeated operational values, not as a substitute for removing low-value columns or supporting responsive overflow." },
    { title: "Borders", body: "Use full borders for matrices that require tracing in two directions. Prefer default dividers or borderless treatment for shorter comparisons." },
  ]);
  addGuidance("table-pagination", [
    { title: "Control type", body: "Use links when each result page has a stable URL and buttons when the dataset changes in place." },
    { title: "Current state", body: "Mark exactly one control with <code>aria-current=\"page\"</code>. Remove disabled links from the tab order and keep an ellipsis non-interactive." },
    { title: "Async updates", body: "Announce loading and result-count changes, preserve a useful focus position, and update the URL when users need refresh or sharing to retain the page." },
  ]);
  addGuidance("table-datatables", [
    { title: "Version", body: "The adapter targets dependency-free DataTables 3. Import <code>datatables.net</code> and do not load the package’s default visual theme." },
    { title: "Class map", body: "Wrap the source table in <code>.bs-datatable</code> and keep <code>.bs-table</code> plus any table modifiers on the table itself." },
    { title: "Accessibility", body: "DataTables maintains control state and result information. Give its generated overflow cell a region role, keyboard target, and accessible name after initialization." },
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
