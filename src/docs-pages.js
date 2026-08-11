export const docsPages = [
  { path: "/docs/getting-started/introduction", sectionId: "introduction", category: "Get started", title: "Introduction", description: "Learn what Boobstrap includes, how its CSS-first architecture works, and which optional behavior layer fits your project." },
  { path: "/docs/getting-started/installation", sectionId: "installation", category: "Get started", title: "Installation", description: "Install Boobstrap with npm, pnpm, Yarn, Bun, a CDN, or self-hosted assets." },
  { path: "/docs/getting-started/starter-template", sectionId: "starter", category: "Get started", title: "Starter template", description: "Download and run the minimal Vite starter with theme tokens, components, icons, and production validation." },
  { path: "/docs/getting-started/theming", sectionId: "theming", category: "Get started", title: "Theming", description: "Compose light and dark modes, five color palettes, rounded or square corners, and semantic design-token overrides." },
  { path: "/docs/foundations/typography", sectionId: "typography", category: "Foundations", title: "Typography", description: "Use Boobstrap’s type scale, display text, lead copy, and semantic text utilities." },
  { path: "/docs/foundations/layout", sectionId: "layout", category: "Foundations", title: "Layout and grid", description: "Build responsive page structures with containers, the 12-column grid, flex utilities, and gaps." },
  { path: "/docs/foundations/responsive-composition", sectionId: "responsive-composition", category: "Foundations", title: "Responsive composition", description: "Compose mobile-first layouts that preserve meaningful source order across breakpoints." },
  { path: "/docs/components/buttons", sectionId: "buttons", category: "Components", title: "Buttons", description: "Build accessible buttons, groups, toolbars, split actions, and loading states with Boobstrap.", standalone: true },
  { path: "/docs/components/navbar", sectionId: "navbar", category: "Components", title: "Navigation", description: "Build semantic headers, vertical navigation, breadcrumb trails, and previous/next page navigation with Boobstrap components." },
  { path: "/docs/components/sidebar", sectionId: "sidebars", category: "Components", title: "Sidebar", description: "Build composable application sidebars with fixed regions, nested menus, responsive drawers, variants, and desktop collapse modes." },
  { path: "/docs/components/badges", sectionId: "badges", category: "Components", title: "Badges", description: "Add compact labels for status, categories, counts, and metadata." },
  { path: "/docs/components/cards", sectionId: "cards", category: "Components", title: "Cards", description: "Group related content and actions with flexible card surfaces, bodies, titles, and text." },
  { path: "/docs/components/tables", sectionId: "tables", category: "Components", title: "Tables", description: "Present structured data in semantic, readable tables with a responsive overflow container for narrow screens." },
  { path: "/docs/components/lists", sectionId: "lists", category: "Components", title: "Reference lists and checklists", description: "Build dense key-value references and scannable completion checklists with accessible semantic markup." },
  { path: "/docs/components/alerts", sectionId: "alerts", category: "Components", title: "Alerts", description: "Communicate success, warning, danger, and informational messages with appropriate semantics." },
  { path: "/docs/components/banners", sectionId: "banners", category: "Components", title: "Banners", description: "Place full-width contextual notices at the top of a page with optional icons, actions, and dismiss behavior." },
  { path: "/docs/components/forms", sectionId: "forms", category: "Components", title: "Forms", description: "Choose a focused form guide with complete, copy-ready examples for every control family." },
  { path: "/docs/components/forms/inputs", sectionId: "form-inputs", category: "Forms", title: "Inputs and textareas", description: "Build labeled text controls with help text, validation feedback, disabled and read-only states, and three sizes." },
  { path: "/docs/components/forms/input-groups", sectionId: "form-input-groups", category: "Forms", title: "Input groups and icons", description: "Compose inputs with prefixed or suffixed text, buttons, selects, and inline icons." },
  { path: "/docs/components/forms/selects", sectionId: "form-selects", category: "Forms", title: "Native selects", description: "Style accessible native selects, option groups, disabled states, and compact or large controls." },
  { path: "/docs/components/forms/searchable-select", sectionId: "form-searchable-select", category: "Forms", title: "Searchable select", description: "Implement the searchable combobox with complete Boobstrap JS, Alpine.js, and React examples." },
  { path: "/docs/components/forms/date-time", sectionId: "form-date-time", category: "Forms", title: "Date and time inputs", description: "Use styled native date, time, datetime-local, month, and week pickers without JavaScript." },
  { path: "/docs/components/forms/passwords-masks", sectionId: "form-passwords-masks", category: "Forms", title: "Passwords and input masks", description: "Add an accessible password reveal control and declarative phone, date, and product-key masks." },
  { path: "/docs/components/forms/checks-radios", sectionId: "form-checks-radios", category: "Forms", title: "Checkboxes and radios", description: "Build checkboxes, descriptions, inline choices, radio groups, switches, and disabled states." },
  { path: "/docs/components/forms/otp", sectionId: "form-otp", category: "Forms", title: "One-time password", description: "Build a complete six-digit OTP control with paste, navigation, autocomplete, and a synchronized submitted value." },
  { path: "/docs/components/code-windows", sectionId: "code-windows", category: "Components", title: "Code windows", description: "Present terminal commands and source snippets in polished, readable code windows." },
  { path: "/docs/components/icons", sectionId: "icons", category: "Components", title: "Icons", description: "Use dependency-free inline SVGs or bring your preferred optional icon library." },
  { path: "/docs/interactivity/overview", sectionId: "behavior-layers", category: "Interactivity", title: "Behavior layers", description: "Choose CSS only, Boobstrap JS, Alpine, React, or your own application behavior." },
  { path: "/docs/interactivity/collapse", sectionId: "collapse", category: "Interactivity", title: "Collapse", description: "Reveal and hide content with synchronized state, lifecycle events, and keyboard-friendly controls." },
  { path: "/docs/interactivity/dropdown", sectionId: "dropdown", category: "Interactivity", title: "Dropdown", description: "Build accessible action menus with focus management and complete keyboard navigation." },
  { path: "/docs/interactivity/tabs", sectionId: "tabs", category: "Interactivity", title: "Tabs", description: "Organize related panels with automatic activation, roving focus, and synchronized ARIA state." },
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
