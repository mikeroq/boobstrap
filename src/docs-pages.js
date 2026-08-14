export const docsOverview = {
  path: "/docs",
  sectionId: "overview",
  category: "Documentation",
  title: "Documentation",
  description: "Complete Boobstrap documentation: CSS, optional JavaScript, Alpine, React, and Vue integrations, components, utilities, themes, and design tokens.",
};

export const docsPages = [
  { path: "/docs/getting-started/introduction", sectionId: "introduction", category: "Get started", title: "Introduction", description: "Learn what Boobstrap includes, how its CSS-first architecture works, and which optional behavior layer fits your project." },
  { path: "/docs/getting-started/whats-new", sectionId: "whats-new", category: "Get started", title: "What's new in v0.5", description: "Explore the v0.5 release: accordion, skeletons, token exports, TypeScript declarations, adapter parity, and stronger release validation." },
  { path: "/docs/getting-started/installation", sectionId: "installation", category: "Get started", title: "Installation", description: "Install Boobstrap with npm, pnpm, Yarn, Bun, a CDN, or self-hosted assets." },
  { path: "/docs/getting-started/starter-template", sectionId: "starter", category: "Get started", title: "Starter template", description: "Download and run the minimal Vite starter with theme tokens, components, icons, and production validation." },
  { path: "/docs/getting-started/theming", sectionId: "theming", category: "Get started", title: "Theming", description: "Compose light and dark modes, five color palettes, rounded or square corners, and semantic design-token overrides." },
  { path: "/docs/getting-started/typescript", sectionId: "typescript", category: "Get started", title: "TypeScript", description: "Use Boobstrap's built-in declarations for core JavaScript, Alpine, React, Vue, and design-token exports in strict TypeScript projects." },
  { path: "/docs/foundations/typography", sectionId: "typography", category: "Foundations", title: "Typography", description: "Use Boobstrap’s type scale, display text, lead copy, and semantic text utilities." },
  { path: "/docs/foundations/links", sectionId: "links", category: "Foundations", title: "Links", description: "Style semantic links with accessible defaults, muted and subtle variants, plain presentation, and reliable interaction states." },
  { path: "/docs/foundations/native-elements", sectionId: "native-elements", category: "Foundations", title: "Native HTML elements", description: "See Boobstrap’s baseline styles for lists, descriptions, quotations, code, disclosure, media, figures, addresses, and separators." },
  { path: "/docs/foundations/layout", sectionId: "layout", category: "Foundations", title: "Layout and grid", description: "Build responsive page structures with containers, the 12-column grid, flex utilities, and gaps." },
  { path: "/docs/foundations/responsive-composition", sectionId: "responsive-composition", category: "Foundations", title: "Responsive composition", description: "Compose mobile-first layouts that preserve meaningful source order across breakpoints." },
  { path: "/docs/components/buttons", sectionId: "buttons", category: "Components", title: "Buttons", description: "Build accessible buttons, groups, toolbars, split actions, and loading states with Boobstrap." },
  { path: "/docs/components/navbar", sectionId: "navbar", category: "Components", title: "Navigation", description: "Build semantic headers, vertical navigation, breadcrumb trails, and previous/next page navigation with Boobstrap components." },
  { path: "/docs/components/sidebar", sectionId: "sidebars", category: "Components", title: "Sidebar", description: "Build composable application sidebars with fixed regions, nested menus, responsive drawers, variants, and desktop collapse modes." },
  { path: "/docs/components/badges", sectionId: "badges", category: "Components", title: "Badges", description: "Add compact labels for status, categories, counts, and metadata." },
  { path: "/docs/components/avatars", sectionId: "avatars", category: "Components", title: "Avatars", description: "Represent people and entities with images, initials, sizes, presence indicators, groups, and overflow counts." },
  { path: "/docs/components/cards", sectionId: "cards", category: "Components", title: "Cards", description: "Compose related content and actions with optional headers, structured content, and flexible footers." },
  { path: "/docs/components/dialogs", sectionId: "dialogs", category: "Components", title: "Dialogs", description: "Build accessible modal dialogs with optional regions, flexible sizing, scrollable bodies, forms, triggers, and framework adapters." },
  { path: "/docs/components/drawers", sectionId: "drawers", category: "Components", title: "Drawers", description: "Open full-height panels from either logical edge with custom widths, fixed regions, scrollable bodies, and optional backdrop dismissal." },
  { path: "/docs/components/tables", sectionId: "tables", category: "Components", title: "Tables", description: "Choose a focused guide for semantic table structure, responsive behavior, visual styles, pagination, or DataTables.net." },
  { path: "/docs/components/tables/fundamentals", sectionId: "table-fundamentals", category: "Tables", title: "Table fundamentals", description: "Build semantic tables with captions, scoped headers, footers, responsive overflow, sticky headers, sorting controls, and empty states." },
  { path: "/docs/components/tables/styles", sectionId: "table-styles", category: "Tables", title: "Table styles", description: "Choose striped, hoverable, bordered, borderless, compact, and caption treatments that fit the shape of your dataset." },
  { path: "/docs/components/tables/pagination", sectionId: "table-pagination", category: "Tables", title: "Pagination", description: "Build accessible dataset pagination with current and disabled states, responsive ranges, and compact or large controls." },
  { path: "/docs/components/tables/datatables", sectionId: "table-datatables", category: "Tables", title: "DataTables.net", description: "Install and initialize the Boobstrap DataTables 3 adapter with a fully functional search, sorting, page-length, and pagination example." },
  { path: "/docs/components/lists", sectionId: "lists", category: "Components", title: "Reference lists and checklists", description: "Build dense key-value references and scannable completion checklists with accessible semantic markup." },
  { path: "/docs/components/alerts", sectionId: "alerts", category: "Components", title: "Alerts", description: "Communicate success, warning, danger, and informational messages with appropriate semantics." },
  { path: "/docs/components/accordion", sectionId: "accordion", category: "Components", title: "Accordion", description: "Group accessible disclosure panels with single-open or always-open behavior and adapters for Alpine, React, and Vue." },
  { path: "/docs/components/banners", sectionId: "banners", category: "Components", title: "Banners", description: "Place full-width contextual notices at the top of a page with optional icons, actions, and dismiss behavior." },
  { path: "/docs/components/progress", sectionId: "progress", category: "Components", title: "Progress", description: "Communicate determinate and indeterminate progress with accessible labels, contextual variants, sizes, and motion-safe animation." },
  { path: "/docs/components/skeletons", sectionId: "skeletons", category: "Components", title: "Skeletons", description: "Compose accessible, content-shaped loading placeholders with text, circle, media, pulse, wave, and reduced-motion variants." },
  { path: "/docs/components/empty-state", sectionId: "empty-state", category: "Components", title: "Empty states", description: "Explain an empty collection or first-use surface with a clear title, helpful description, icon, and recovery action." },
  { path: "/docs/components/toasts", sectionId: "toasts", category: "Components", title: "Toasts", description: "Deliver temporary status notifications with contextual styles, pause-aware autohide, dismissal, and lifecycle events." },
  { path: "/docs/components/forms", sectionId: "forms", category: "Components", title: "Forms", description: "Choose a focused form guide with complete, copy-ready examples for every control family." },
  { path: "/docs/components/forms/inputs", sectionId: "form-inputs", category: "Forms", title: "Inputs and textareas", description: "Build labeled text controls with help text, validation feedback, disabled and read-only states, and three sizes." },
  { path: "/docs/components/forms/input-groups", sectionId: "form-input-groups", category: "Forms", title: "Input groups and icons", description: "Compose inputs with prefixed or suffixed text, buttons, selects, and inline icons." },
  { path: "/docs/components/forms/selects", sectionId: "form-selects", category: "Forms", title: "Native selects", description: "Style accessible native selects, option groups, disabled states, and compact or large controls." },
  { path: "/docs/components/forms/searchable-select", sectionId: "form-searchable-select", category: "Forms", title: "Searchable select", description: "Implement the searchable combobox with complete Boobstrap JS, Alpine.js, and React examples." },
  { path: "/docs/components/forms/date-time", sectionId: "form-date-time", category: "Forms", title: "Date and time inputs", description: "Use styled native date, time, datetime-local, month, and week pickers without JavaScript." },
  { path: "/docs/components/forms/native-controls", sectionId: "form-native-controls", category: "Forms", title: "File, range, and color controls", description: "Use styled native file uploads, range sliders, and color pickers with labels, states, sizes, and accessible values." },
  { path: "/docs/components/forms/passwords-masks", sectionId: "form-passwords-masks", category: "Forms", title: "Passwords and input masks", description: "Add an accessible password reveal control and declarative phone, date, and product-key masks." },
  { path: "/docs/components/forms/checks-radios", sectionId: "form-checks-radios", category: "Forms", title: "Checkboxes and radios", description: "Build checkboxes, descriptions, inline choices, radio groups, switches, and disabled states." },
  { path: "/docs/components/forms/otp", sectionId: "form-otp", category: "Forms", title: "One-time password", description: "Build a complete six-digit OTP control with paste, navigation, autocomplete, and a synchronized submitted value." },
  { path: "/docs/components/code-windows", sectionId: "code-windows", category: "Components", title: "Code windows", description: "Present terminal commands and source snippets in polished, readable code windows." },
  { path: "/docs/components/icons", sectionId: "icons", category: "Components", title: "Icons", description: "Use dependency-free inline SVGs or bring your preferred optional icon library." },
  { path: "/docs/interactivity/overview", sectionId: "behavior-layers", category: "Interactivity", title: "Behavior layers", description: "Choose CSS only, Boobstrap JS, Alpine, React, or your own application behavior." },
  { path: "/docs/interactivity/collapse", sectionId: "collapse", category: "Interactivity", title: "Collapse", description: "Reveal and hide content with synchronized state, lifecycle events, and keyboard-friendly controls." },
  { path: "/docs/interactivity/dropdown", sectionId: "dropdown", category: "Interactivity", title: "Dropdown", description: "Build accessible action menus with focus management and complete keyboard navigation." },
  { path: "/docs/interactivity/tabs", sectionId: "tabs", category: "Interactivity", title: "Tabs", description: "Organize related panels with automatic activation, roving focus, and synchronized ARIA state." },
  { path: "/docs/interactivity/tooltips-popovers", sectionId: "tooltips-popovers", category: "Interactivity", title: "Tooltips and popovers", description: "Add automatically positioned supplemental labels and click-triggered contextual content with accessible state." },
  { path: "/docs/interactivity/react", sectionId: "react-adapter", category: "Interactivity", title: "React adapter", description: "Install the React adapter and compose SSR-safe, controlled or uncontrolled Boobstrap components with headless hooks." },
  { path: "/docs/interactivity/vue", sectionId: "vue-adapter", category: "Interactivity", title: "Vue adapter", description: "Own Boobstrap interaction state in Vue 3 with SSR-safe headless composables and consumer-controlled markup." },
  { path: "/docs/reference/utilities", sectionId: "utilities", category: "Reference", title: "Utilities", description: "Use composable layout, spacing, typography, display, and accessibility utilities." },
  { path: "/docs/reference/tokens", sectionId: "tokens", category: "Reference", title: "Design tokens", description: "Browse the semantic color, type, spacing, radius, shadow, container, and motion tokens." },
  { path: "/docs/reference/classes", sectionId: "class-reference", category: "Reference", title: "Class reference", description: "Search every public Boobstrap class generated from the exact installed stylesheet." },
  { path: "/docs/reference/accessibility", sectionId: "accessibility", category: "Reference", title: "Accessibility", description: "Review the semantic, focus, motion, contrast, and accessible-name responsibilities for your interface." },
];

export const normalizeDocsPath = (pathname) => {
  if (pathname === "/docs/") return "/docs";
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
};

export const docsPageForPath = (pathname) => {
  const normalizedPath = normalizeDocsPath(pathname);
  return docsPages.find(({ path }) => path === normalizedPath);
};
