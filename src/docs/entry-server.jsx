import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { DocsApp } from "./DocsApp.jsx";
import { docsRouteForPath, loadDocsContent } from "./content.js";

export const renderDocs = async (path, options = {}) => {
  const route = docsRouteForPath(path);
  const content = await loadDocsContent(route.sectionId);
  return renderToString(
    <StaticRouter location={path}>
      <DocsApp initialPath={path} initialContent={content} development={options.development === true} />
    </StaticRouter>,
  );
};
