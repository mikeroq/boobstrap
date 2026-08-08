import { defineConfig } from "vite";
import { resolve } from "node:path";
import { docsPages } from "./src/docs-pages.js";

const cleanRoutes = () => {
  const routeFiles = new Map([
    ["/docs", "/docs/index.html"],
    ["/docs/components/buttons", "/docs/components/buttons/index.html"],
    ["/playground", "/playground/index.html"],
  ]);
  const legacyRoutes = new Map([
    ["/docs.html", "/docs"],
    ["/docs/", "/docs"],
    ["/playground.html", "/playground"],
    ["/playground/", "/playground"],
  ]);
  docsPages.forEach(({ path, standalone }) => {
    routeFiles.set(path, standalone ? "/docs/components/buttons/index.html" : "/docs/index.html");
    legacyRoutes.set(`${path}/`, path);
  });

  const middleware = (request, response, next) => {
    const url = new URL(request.url, "http://localhost");
    const redirect = legacyRoutes.get(url.pathname);
    if (redirect) {
      response.statusCode = 308;
      response.setHeader("Location", `${redirect}${url.search}`);
      response.end();
      return;
    }
    const file = routeFiles.get(url.pathname);
    if (file) request.url = `${file}${url.search}`;
    next();
  };

  return {
    name: "boobstrap-clean-routes",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};

export default defineConfig({
  plugins: [cleanRoutes()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        docs: resolve(import.meta.dirname, "docs/index.html"),
        buttons: resolve(import.meta.dirname, "docs/components/buttons/index.html"),
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
