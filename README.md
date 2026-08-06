# Boobstrap Site

The official landing page for [Boobstrap](https://github.com/mikeroq/boobstrap-framework), a cheeky CSS framework that still means business.

This repository contains only the marketing site, its responsive product illustration, browser tests, and production hosting configuration. The reusable framework source and distributable CSS live in the separate [`mikeroq/boobstrap-framework`](https://github.com/mikeroq/boobstrap-framework) repository.

## Development

```bash
npm install
npm run dev
```

The site imports `boobstrap/dist/boobstrap.css` from a commit-pinned GitHub dependency, keeping local development and production builds reproducible.

## Validation

```bash
npm run build
npm test
```

The smoke test exercises the production build in Chromium at desktop and mobile viewport sizes, checks for horizontal overflow and console errors, and verifies the signup interaction.

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
- Framework package: [mikeroq/boobstrap-framework](https://github.com/mikeroq/boobstrap-framework)

## License

MIT
