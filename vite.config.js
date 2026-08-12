import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { docsPages } from "./src/docs-pages.js";

const routeFiles = (useGeneratedDocs) => {
  const routeFiles = new Map([
    ["/docs", "/docs/index.html"],
    ["/playground", "/playground/index.html"],
  ]);
  docsPages.forEach(({ path }) => {
    const file = useGeneratedDocs ? `${path}/index.html` : "/docs/index.html";
    routeFiles.set(path, file);
  });
  return routeFiles;
};

const cleanRoutes = () => {
  const legacyRoutes = new Map([
    ["/docs.html", "/docs"],
    ["/docs/", "/docs"],
    ["/playground.html", "/playground"],
    ["/playground/", "/playground"],
  ]);
  docsPages.forEach(({ path }) => {
    legacyRoutes.set(`${path}/`, path);
  });

  const middleware = (files) => (request, response, next) => {
    const url = new URL(request.url, "http://localhost");
    const redirect = legacyRoutes.get(url.pathname);
    if (redirect) {
      response.statusCode = 308;
      response.setHeader("Location", `${redirect}${url.search}`);
      response.end();
      return;
    }
    const file = files.get(url.pathname);
    if (file) request.url = `${file}${url.search}`;
    next();
  };

  return {
    name: "boobstrap-clean-routes",
    configureServer(server) {
      server.middlewares.use(middleware(routeFiles(false)));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(routeFiles(true)));
    },
  };
};

export default defineConfig({
  plugins: [react(), cleanRoutes()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        docs: resolve(import.meta.dirname, "docs/index.html"),
        playground: resolve(import.meta.dirname, "playground/index.html"),
      },
    },
  },
  server: {
    host: "0.0.0.0",
  },
  preview: {
    host: "0.0.0.0",
  },
});
