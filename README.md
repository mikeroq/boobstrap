# Boobstrap Site

The official [Boobstrap website](https://boobstrap.org) for a cheeky CSS framework that still means business. The framework is available as [`@boobstrap/boobstrap` on npm](https://www.npmjs.com/package/@boobstrap/boobstrap).

This repository contains the marketing site, the complete browsable framework documentation, browser tests, and production hosting configuration. The reusable framework source and distributable CSS live in the separate [`mikeroq/boobstrap-framework`](https://github.com/mikeroq/boobstrap-framework) repository.

## Development

```bash
npm install
npm run dev
```

The site imports `@boobstrap/boobstrap@0.1.4` from npm, keeping local development and production builds reproducible while exercising the same public package available to framework users.

Vite serves the landing page at `/` and the framework documentation at `/docs.html`. The documentation's class and design-token reference is generated in the browser from the exact compiled stylesheet installed by the site, preventing the reference from drifting from the shipped CSS.

## Validation

```bash
npm run build
npm test
```

The smoke test exercises both production pages in Chromium at desktop and mobile viewport sizes, checks for horizontal overflow and console errors, verifies the landing-page signup interaction, and confirms that the documentation enumerates every framework class and token.

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
- Documentation markup: `docs.html`
- Documentation behavior and source-derived API reference: `src/docs.js`
- Documentation presentation: `src/docs.css`
- Framework package: [mikeroq/boobstrap-framework](https://github.com/mikeroq/boobstrap-framework)

## License

MIT
