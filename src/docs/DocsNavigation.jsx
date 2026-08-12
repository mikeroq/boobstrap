import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { docsPages, normalizeDocsPath } from "../docs-pages.js";

const navLabels = {
  "/docs/foundations/layout": "Layout & grid",
  "/docs/components/lists": "Reference lists",
  "/docs/interactivity/overview": "JS, Alpine & React",
  "/docs/reference/classes": "All classes",
};

const labelFor = (page) => navLabels[page.path] ?? page.title;
const pagesIn = (category) => docsPages.filter((page) => page.category === category);
const disclosureFamilies = {
  Tables: {
    id: "docs-tables-submenu",
    prefix: "/docs/components/tables",
    parent: docsPages.find(({ path }) => path === "/docs/components/tables"),
    children: pagesIn("Tables"),
  },
  Forms: {
    id: "docs-forms-submenu",
    prefix: "/docs/components/forms",
    parent: docsPages.find(({ path }) => path === "/docs/components/forms"),
    children: pagesIn("Forms"),
  },
};

const topLevelGroups = [
  { label: "Get started", pages: pagesIn("Get started") },
  { label: "Foundations", pages: pagesIn("Foundations") },
  { label: "Components", pages: pagesIn("Components") },
  { label: "Interactivity", pages: pagesIn("Interactivity") },
  { label: "Reference", pages: pagesIn("Reference") },
];

const pathInFamily = (path, prefix) => path === prefix || path.startsWith(`${prefix}/`);

function DocsLink({ page, activePath, query, subitem = false, onPreload }) {
  const label = labelFor(page);
  const hidden = Boolean(query) && !label.toLowerCase().includes(query);
  return (
    <Link
      className={`bs-nav-link${subitem ? " docs-nav-subitem bs-nav-link-subitem" : ""}`}
      to={page.path}
      aria-current={activePath === page.path ? "page" : undefined}
      hidden={hidden}
      onMouseEnter={() => onPreload(page.sectionId)}
      onFocus={() => onPreload(page.sectionId)}
    >
      {label}
    </Link>
  );
}

function DocsDisclosure({ family, activePath, query, open, onToggle, onPreload }) {
  const parentMatches = labelFor(family.parent).toLowerCase().includes(query);
  const childMatches = family.children.some((page) => labelFor(page).toLowerCase().includes(query));
  const filterOpen = Boolean(query) && childMatches;
  const expanded = filterOpen || open;
  const hidden = Boolean(query) && !parentMatches && !childMatches;

  return (
    <div className="docs-nav-disclosure" data-nav-disclosure data-nav-prefix={family.prefix} hidden={hidden}>
      <div className="docs-nav-disclosure-row" hidden={Boolean(query) && !parentMatches}>
        <DocsLink page={family.parent} activePath={activePath} query={query} onPreload={onPreload} />
        <button
          type="button"
          data-nav-disclosure-toggle
          aria-expanded={expanded}
          aria-controls={family.id}
          aria-label={`${expanded ? "Hide" : "Show"} ${family.parent.title} pages`}
          onClick={() => onToggle(!open)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m5 6 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div className="docs-nav-submenu" id={family.id} data-nav-submenu hidden={!expanded}>
        {family.children.map((page) => (
          <DocsLink key={page.path} page={page} activePath={activePath} query={query} subitem onPreload={onPreload} />
        ))}
      </div>
    </div>
  );
}

export function DocsNavigation({ pathname, onPreload }) {
  const activePath = normalizeDocsPath(pathname);
  const [filter, setFilter] = useState("");
  const [openFamilies, setOpenFamilies] = useState(() => Object.fromEntries(
    Object.entries(disclosureFamilies).map(([name, family]) => [name, pathInFamily(activePath, family.prefix)]),
  ));
  const query = filter.trim().toLowerCase();

  useEffect(() => {
    setOpenFamilies(Object.fromEntries(
      Object.entries(disclosureFamilies).map(([name, family]) => [name, pathInFamily(activePath, family.prefix)]),
    ));
  }, [activePath]);

  useEffect(() => {
    const focusFilter = (event) => {
      const target = event.target;
      if (event.key !== "/" || target.matches("input, textarea, select") || target.isContentEditable) return;
      event.preventDefault();
      document.querySelector("[data-nav-filter]")?.focus();
    };
    document.addEventListener("keydown", focusFilter);
    return () => document.removeEventListener("keydown", focusFilter);
  }, []);

  const visibleGroupLabels = useMemo(() => new Set(topLevelGroups.filter((group) => {
    if (!query) return true;
    return group.pages.some((page) => {
      if (page.path === disclosureFamilies.Tables.parent.path) {
        return [disclosureFamilies.Tables.parent, ...disclosureFamilies.Tables.children]
          .some((candidate) => labelFor(candidate).toLowerCase().includes(query));
      }
      if (page.path === disclosureFamilies.Forms.parent.path) {
        return [disclosureFamilies.Forms.parent, ...disclosureFamilies.Forms.children]
          .some((candidate) => labelFor(candidate).toLowerCase().includes(query));
      }
      return labelFor(page).toLowerCase().includes(query);
    });
  }).map(({ label }) => label)), [query]);

  const handleFilterKeyDown = (event) => {
    if (event.key !== "Escape") return;
    setFilter("");
    event.currentTarget.blur();
  };

  return (
    <aside className="docs-sidebar bs-sidebar bs-sidebar-start bs-sidebar-drawer" id="docs-sidebar" data-bs-sidebar data-bs-sidebar-media="(max-width: 60rem)" data-bs-state="expanded" aria-label="Documentation navigation">
      <div className="bs-sidebar-header">
        <div className="docs-sidebar-mobile-header">
          <strong>Documentation</strong>
          <button className="docs-sidebar-close docs-icon-button" type="button" data-bs-sidebar-dismiss aria-controls="docs-sidebar" aria-label="Close documentation menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="docs-nav-search">
          <svg className="bs-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <label className="bs-sr-only" htmlFor="docs-nav-filter">Filter documentation sections</label>
          <input id="docs-nav-filter" type="search" placeholder="Filter docs…" autoComplete="off" data-nav-filter value={filter} onChange={(event) => setFilter(event.target.value)} onKeyDown={handleFilterKeyDown} />
          <kbd>/</kbd>
        </div>
      </div>
      <nav className="docs-nav bs-nav bs-sidebar-content" aria-label="Documentation sections" data-bs-sidebar-close>
        {topLevelGroups.map((group) => (
          <div className="docs-nav-group bs-nav-group" data-nav-group key={group.label} hidden={!visibleGroupLabels.has(group.label)}>
            <p className="docs-nav-label bs-nav-heading">{group.label}</p>
            {group.pages.map((page) => {
              if (page.path === disclosureFamilies.Tables.parent.path) {
                return <DocsDisclosure key={page.path} family={disclosureFamilies.Tables} activePath={activePath} query={query} open={openFamilies.Tables} onToggle={(open) => setOpenFamilies((current) => ({ ...current, Tables: open }))} onPreload={onPreload} />;
              }
              if (page.path === disclosureFamilies.Forms.parent.path) {
                return <DocsDisclosure key={page.path} family={disclosureFamilies.Forms} activePath={activePath} query={query} open={openFamilies.Forms} onToggle={(open) => setOpenFamilies((current) => ({ ...current, Forms: open }))} onPreload={onPreload} />;
              }
              return <DocsLink key={page.path} page={page} activePath={activePath} query={query} onPreload={onPreload} />;
            })}
          </div>
        ))}
        <p className="docs-nav-empty" data-nav-empty hidden={visibleGroupLabels.size !== 0}>No matching sections.</p>
      </nav>
    </aside>
  );
}
