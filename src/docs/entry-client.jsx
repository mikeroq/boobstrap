import "@boobstrap/boobstrap/dist/boobstrap.css";
import "../docs.css";
import { BrowserRouter } from "react-router-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { DocsApp } from "./DocsApp.jsx";
import { docsRouteForPath, loadDocsContent } from "./content.js";

const root = document.querySelector("#docs-root");
const initialPath = window.location.pathname;
const route = docsRouteForPath(initialPath);
const initialContent = await loadDocsContent(route.sectionId);
const development = import.meta.env.DEV || import.meta.env.VITE_SITE_ENV === "development";
const app = (
  <BrowserRouter>
    <DocsApp initialPath={initialPath} initialContent={initialContent} development={development} />
  </BrowserRouter>
);

if (root.childElementCount > 0) hydrateRoot(root, app);
else createRoot(root).render(app);
