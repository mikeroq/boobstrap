# Boobstrap Site

The official [Boobstrap website](https://boobstrap.org) for a cheeky CSS framework that still means business. The framework is available as [`@boobstrap/boobstrap` on npm](https://www.npmjs.com/package/@boobstrap/boobstrap).

This repository contains the marketing site, the complete browsable framework documentation, browser tests, and production hosting configuration. The reusable framework source and distributable CSS live in the separate [`mikeroq/boobstrap-framework`](https://github.com/mikeroq/boobstrap-framework) repository.

## Development

```bash
npm install
npm run dev
```

Day-to-day work is integrated through the `dev` branch and previewed with the framework's matching `dev` branch without publishing interim npm packages. See [DEVELOPMENT.md](DEVELOPMENT.md) for the branch, preview deployment, and release workflow.

The site imports `@boobstrap/boobstrap@0.3.1` from npm, keeping local development and production builds reproducible while exercising the same public package available to framework users.

Vite serves the landing page at `/`, the documentation directory at `/docs`, 23 focused documentation routes, and the playground at `/playground`. Route metadata and navigation live in `src/docs-pages.js`; the class and design-token references are generated in the browser from the exact compiled stylesheet installed by the site, preventing them from drifting from the shipped CSS.

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
- Documentation markup: `docs/index.html`
- Deep button reference markup: `docs/components/buttons/index.html`
- Documentation route registry: `src/docs-pages.js`
- Documentation behavior and source-derived API reference: `src/docs.js`
- Documentation presentation: `src/docs.css`
- Playground markup: `playground/index.html`
- Framework package: [mikeroq/boobstrap-framework](https://github.com/mikeroq/boobstrap-framework)

## License

MIT
