# Boobstrap Site

The official [Boobstrap website](https://boobstrap.org) for a cheeky CSS framework that still means business. The framework is available as [`@boobstrap/boobstrap` on npm](https://www.npmjs.com/package/@boobstrap/boobstrap).

This repository contains the marketing site, the complete browsable framework documentation, browser tests, and production hosting configuration. The reusable framework source and distributable CSS live in the separate [`mikeroq/boobstrap-framework`](https://github.com/mikeroq/boobstrap-framework) repository.

## Development

```bash
npm install
npm run dev
```

Day-to-day work is integrated through the `dev` branch and previewed with the framework's matching `dev` branch without publishing interim npm packages. See [DEVELOPMENT.md](DEVELOPMENT.md) for the branch, preview deployment, and release workflow.

The site imports `@boobstrap/boobstrap@0.4.0` from npm, keeping local development and production builds reproducible while exercising the same public package available to framework users.

Vite serves the landing page at `/`, the React documentation application at `/docs`, 49 focused documentation routes, and the playground at `/playground`. Route metadata and navigation live in `src/docs-pages.js`. Each guide is a separately loaded content module under `src/docs/content`, while the shared React shell, navigation, pagination, outline, and behavior live under `src/docs`.

The production build server-renders every documentation URL into its own HTML file. This preserves route-specific metadata, useful no-JavaScript content, and a fully styled current navigation state on first paint; React then hydrates the page and provides in-app routing without reloading the shell or its styles. The build also verifies that the class reference matches the installed framework stylesheet; after changing the framework pin, run `npm run docs:sync-reference` to regenerate that committed reference.

The same build generates a distinct 1200×630 PNG social card for the landing page, playground, docs overview, and every guide under `dist/og`. Each route receives matching absolute `og:image` and `twitter:image` metadata; `src/social-cards.js` is the shared URL and palette registry.

## Validation

```bash
npm run build
npm test
```

The smoke test visits every documentation route in Chromium at desktop and mobile viewport sizes. It verifies clean routing, visible preview/source pairs, copy controls, optional behavior tabs, keyboard interactions, horizontal overflow, console errors, and exact class and token coverage.

## Docker

Build and host the production landing page with Docker Compose:

```bash
docker compose up --build -d
```

The site is available at `http://localhost:3000`. Set `PORT` when the host needs a different public port:

```bash
PORT=8080 docker compose up --build -d
```

The runtime container serves the Vite production build from unprivileged Nginx on container port `3000`. It includes a health check, immutable asset caching, SPA fallback, and baseline security headers.

## Repository Boundary

- Site composition and illustration: `src/site.css`
- Site behavior: `src/main.js`
- Landing page markup: `index.html`
- Documentation HTML entry: `docs/index.html`
- Documentation React application: `src/docs/DocsApp.jsx`
- Documentation navigation: `src/docs/DocsNavigation.jsx`
- Route content modules: `src/docs/content/*.html`
- Documentation client and server entries: `src/docs/entry-client.jsx`, `src/docs/entry-server.jsx`
- Documentation route registry: `src/docs-pages.js`
- Documentation example behavior: `src/docs/runtime.js`
- Static route renderer: `scripts/generate-doc-route-pages.mjs`
- Social-card registry and image renderer: `src/social-cards.js`, `scripts/generate-social-images.mjs`
- Documentation presentation: `src/docs.css`
- Playground markup: `playground/index.html`
- Framework package: [mikeroq/boobstrap-framework](https://github.com/mikeroq/boobstrap-framework)

## License

MIT
