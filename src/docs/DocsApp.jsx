import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import parse from "html-react-parser";
import { initBanners } from "@boobstrap/boobstrap/js/banner";
import { initSidebars } from "@boobstrap/boobstrap/js/sidebar";
import { docsPages, normalizeDocsPath } from "../docs-pages.js";
import { DocsNavigation } from "./DocsNavigation.jsx";
import { docsRouteForPath, loadDocsContent, outlineForContent } from "./content.js";
import { initDocsPageRuntime } from "./runtime.js";

const contentCache = new Map();

const loadCachedContent = (sectionId) => {
  if (!contentCache.has(sectionId)) contentCache.set(sectionId, loadDocsContent(sectionId));
  return contentCache.get(sectionId);
};

const updateDocumentMetadata = (route) => {
  const pageTitle = route.path === "/docs" ? "Documentation — Boobstrap" : `${route.title} — Boobstrap`;
  const canonicalUrl = `https://boobstrap.org${route.path}`;
  document.title = pageTitle;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  document.querySelector('meta[name="description"]')?.setAttribute("content", route.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", route.description);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", pageTitle);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", route.description);
};

function DevelopmentBanner({ enabled }) {
  if (!enabled) return null;
  return (
    <div className="bs-banner bs-banner-warning" role="status" data-bs-banner data-dev-banner>
      <div className="bs-banner-inner">
        <svg className="bs-banner-icon bs-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20L12 3Z" /><path d="M12 9v5M12 18h.01" /></svg>
        <div className="bs-banner-content">
          <strong className="bs-banner-title">Development preview</strong>
          <span className="bs-banner-message">You are viewing dev.boobstrap.org, not the live Boobstrap site.</span>
        </div>
        <a className="bs-banner-action" href="https://boobstrap.org/">Visit live site</a>
        <button className="bs-banner-dismiss" type="button" data-bs-banner-dismiss aria-label="Dismiss development preview banner">
          <svg className="bs-icon bs-icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
    </div>
  );
}

function DocsHeader({ theme, onThemeToggle }) {
  const nextTheme = theme === "light" ? "dark" : "light";
  return (
    <header className="docs-header bs-navbar">
      <a className="docs-brand bs-navbar-brand bs-inline-flex bs-items-center bs-gap-3 bs-no-underline" href="/" aria-label="Boobstrap Docs home">
        <svg className="docs-brand-mark" width="38" height="30" viewBox="0 0 56 42" aria-hidden="true">
          <path d="M6 3c-8 9-7 25 4 33 5 4 11 5 17 3-8-4-14-12-14-21 0-6 2-11 6-15-5 0-9 0-13 0Z" fill="currentColor" />
          <path d="M50 3c8 9 7 25-4 33-5 4-11 5-17 3 8-4 14-12 14-21 0-6-2-11-6-15 5 0 9 0 13 0Z" fill="currentColor" />
          <path d="M28 30s-9-5.4-9-11a5.2 5.2 0 0 1 9-3.5 5.2 5.2 0 0 1 9 3.5c0 5.6-9 11-9 11Z" fill="#f28abb" />
        </svg>
        <span>Boobstrap</span>
        <span className="docs-brand-divider" aria-hidden="true">/</span>
        <span className="docs-brand-context">Docs</span>
      </a>
      <nav className="docs-header-links bs-flex bs-items-center bs-gap-2" aria-label="Primary navigation">
        <a href="/" className="docs-header-link bs-navbar-link">Home</a>
        <a href="/playground" className="docs-header-link bs-navbar-link">Playground</a>
        <a href="https://www.npmjs.com/package/@boobstrap/boobstrap" className="docs-header-link bs-navbar-link">npm</a>
        <a href="https://github.com/mikeroq/boobstrap-framework" className="docs-header-link bs-navbar-link">GitHub</a>
        <span className="docs-version">v0.3.1</span>
        <button className="docs-icon-button bs-navbar-toggle" type="button" data-theme-toggle aria-label={`Switch to ${nextTheme} theme`} title="Toggle color theme" onClick={onThemeToggle}>
          <svg className="theme-sun" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <svg className="theme-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </button>
        <button className="docs-menu-button docs-icon-button bs-navbar-toggle" type="button" data-bs-toggle="sidebar" aria-expanded="false" aria-controls="docs-sidebar" aria-label="Open documentation menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </nav>
    </header>
  );
}

function PagePagination({ route, onPreload }) {
  if (route.path === "/docs") return null;
  const activeIndex = docsPages.findIndex(({ path }) => path === route.path);
  const previous = docsPages[activeIndex - 1] ?? { path: "/docs", title: "Documentation overview", category: "Documentation", sectionId: "overview" };
  const next = docsPages[activeIndex + 1] ?? { path: "/docs", title: "Documentation overview", category: "Documentation", sectionId: "overview" };
  return (
    <nav className="docs-component-pagination bs-page-nav" aria-label="Documentation pagination">
      <Link className="bs-page-nav-link" to={previous.path} onMouseEnter={() => onPreload(previous.sectionId)} onFocus={() => onPreload(previous.sectionId)}>
        <span className="bs-page-nav-context">Previous · {previous.category}</span>
        <strong className="bs-page-nav-title">← {previous.title}</strong>
      </Link>
      <Link className="bs-page-nav-link" to={next.path} onMouseEnter={() => onPreload(next.sectionId)} onFocus={() => onPreload(next.sectionId)}>
        <span className="bs-page-nav-context">Next · {next.category}</span>
        <strong className="bs-page-nav-title">{next.title} →</strong>
      </Link>
    </nav>
  );
}

function DocsFooter() {
  return (
    <footer className="docs-footer">
      <p><span className="bs-text-primary" aria-hidden="true">♥</span> Boobstrap v0.3.1 · MIT licensed.</p>
      <div className="docs-footer-links">
        <a href="https://www.npmjs.com/package/@boobstrap/boobstrap">View on npm</a>
        <a href="https://github.com/mikeroq/boobstrap-framework">View source →</a>
      </div>
    </footer>
  );
}

function PageOutline({ outline }) {
  return (
    <aside className="docs-on-this-page bs-sidebar bs-sidebar-end bs-sidebar-toc" aria-label="On this page">
      <p className="docs-nav-label bs-nav-heading">On this page</p>
      <nav className="bs-nav" data-page-nav>
        {outline.map(({ id, label }) => <a className="bs-nav-link" href={`#${id}`} key={id}>{label}</a>)}
      </nav>
    </aside>
  );
}

export function DocsApp({ initialPath, initialContent, development = false }) {
  const location = useLocation();
  const pathname = normalizeDocsPath(location.pathname);
  const route = docsRouteForPath(pathname);
  const articleRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  const [loaded, setLoaded] = useState({ sectionId: docsRouteForPath(initialPath).sectionId, content: initialContent });
  const content = loaded.sectionId === route.sectionId ? loaded.content : "";
  const outline = useMemo(() => outlineForContent(content, route), [content, route]);

  useEffect(() => {
    let active = true;
    if (loaded.sectionId !== route.sectionId) {
      loadCachedContent(route.sectionId).then((nextContent) => {
        if (active) setLoaded({ sectionId: route.sectionId, content: nextContent });
      });
    }
    return () => { active = false; };
  }, [loaded.sectionId, route.sectionId]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("boobstrap-theme");
    const nextTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
    document.documentElement.dataset.bsTheme = nextTheme;
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    updateDocumentMetadata(route);
  }, [route]);

  useEffect(() => {
    const banner = development ? document.querySelector("[data-dev-banner]") : null;
    const bannerController = banner ? initBanners(banner)[0] : null;
    const sidebar = document.querySelector("#docs-sidebar");
    const controller = sidebar ? initSidebars(sidebar)[0] : null;
    return () => {
      controller?.destroy();
      bannerController?.destroy();
    };
  }, [development]);

  useEffect(() => {
    if (!content) return undefined;
    const cleanup = initDocsPageRuntime(articleRef.current, { route, outline });
    return cleanup;
  }, [content, outline, route]);

  useEffect(() => {
    if (!content) return;
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [content, location.hash, route.sectionId]);

  useEffect(() => {
    const documentRoot = document.documentElement;
    const updateSidebarOffset = () => {
      const header = document.querySelector(".docs-header");
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      documentRoot.style.setProperty("--docs-sidebar-offset", `${Math.max(header?.offsetHeight ?? 0, headerBottom)}px`);
    };
    let queued = false;
    const queueUpdate = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        updateSidebarOffset();
      });
    };
    updateSidebarOffset();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    document.addEventListener("bs:banner:dismissed", queueUpdate);
    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      document.removeEventListener("bs:banner:dismissed", queueUpdate);
    };
  }, []);

  useEffect(() => {
    if (!content) return undefined;
    const links = [...document.querySelectorAll("[data-page-nav] a")];
    const targets = outline.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const progress = document.querySelector("[data-reading-progress]");
    let queued = false;
    const update = () => {
      const readingLine = window.scrollY + (document.querySelector(".docs-header")?.offsetHeight ?? 0) + 32;
      const atPageEnd = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2;
      let active = targets[0];
      if (atPageEnd) active = targets.at(-1);
      else targets.forEach((target) => { if (target.offsetTop <= readingLine) active = target; });
      links.forEach((link) => {
        if (active && link.hash === `#${active.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.value = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      queued = false;
    };
    const queueUpdate = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    window.addEventListener("hashchange", queueUpdate);
    update();
    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      window.removeEventListener("hashchange", queueUpdate);
    };
  }, [content, outline]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.bsTheme = nextTheme;
    localStorage.setItem("boobstrap-theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <>
      <a className="docs-skip-link" href="#docs-content">Skip to documentation</a>
      <DevelopmentBanner enabled={development} />
      <DocsHeader theme={theme} onThemeToggle={toggleTheme} />
      <progress className="docs-reading-progress" max="100" value="0" aria-label="Documentation reading progress" data-reading-progress />
      <div className="docs-layout">
        <DocsNavigation pathname={pathname} onPreload={loadCachedContent} />
        <button className="docs-backdrop bs-sidebar-backdrop" type="button" data-bs-sidebar-dismiss aria-controls="docs-sidebar" aria-label="Close documentation menu" />
        <main className="docs-main" id="docs-content">
          <article className="docs-content" ref={articleRef} aria-busy={!content}>
            {content ? parse(content) : <div className="docs-route-loading" role="status">Loading documentation…</div>}
            {content && <PagePagination route={route} onPreload={loadCachedContent} />}
            <DocsFooter />
          </article>
        </main>
        <PageOutline outline={outline} />
      </div>
    </>
  );
}
