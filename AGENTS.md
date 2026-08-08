# Repository Guide for Coding Agents

## Project overview

This repository contains the official Boobstrap marketing site, documentation, and browser playground. It is a static, dependency-light Vite site built with plain HTML, CSS, and JavaScript.

The reusable framework itself is not developed here. It is consumed from the pinned `@boobstrap/boobstrap` npm package. Framework source and distributable CSS belong in the separate `mikeroq/boobstrap-framework` repository.

## Getting started

- Install dependencies with `npm ci` when `package-lock.json` is present.
- Start the development server with `npm run dev`.
- Create a production build with `npm run build`.
- Run the full build and Playwright smoke suite with `npm test`.

The smoke suite launches Chromium. If the browser binary is missing, install the matching Playwright browser before retrying the suite.

## Branch workflow

- `dev` is the shared integration branch; `master` is production.
- Start task branches from the latest `origin/dev` and target pull requests to `dev` unless the user explicitly requests a production hotfix.
- Name agent-owned branches `agent/<description>`.
- Do not commit directly to `dev` or `master` and do not publish npm versions during ordinary development.
- Read `DEVELOPMENT.md` before work that crosses the site/framework boundary or changes deployment and release behavior.
- The dev preview consumes the framework commit pinned in `.framework-dev-ref`; production must continue using the npm version pinned in `package-lock.json`.
- After framework work merges to its `dev` branch, run `npm run framework:sync` here and include the pointer update in a site PR to `dev`.

## Repository map

- `index.html`: landing-page markup and metadata.
- `src/main.js`: landing-page behavior.
- `src/site.css`: landing-page layout, illustration, and responsive styling.
- `docs/index.html`: documentation overview and most documentation content.
- `docs/components/buttons/index.html`: standalone deep reference for buttons.
- `src/docs-pages.js`: canonical documentation route registry and metadata.
- `src/docs.js`: documentation routing behavior, navigation, examples, and generated framework references.
- `src/docs.css`: documentation presentation.
- `playground/index.html`: playground markup.
- `src/playground.js` and `src/playground.css`: sandboxed playground behavior and presentation.
- `vite.config.js`: development/preview clean routes and production entry points.
- `nginx.conf`: production routes, redirects, caching, and security headers.
- `tests/smoke.mjs`: desktop and mobile browser coverage for all public routes.
- `public/`: static assets copied unchanged into the build.

## Implementation conventions

- Use native browser APIs and ES modules; do not introduce a framework without an explicit requirement.
- Match the existing JavaScript style: two-space indentation, double quotes, semicolons, `const` by default, and small focused helpers.
- Keep markup semantic and accessible. Preserve keyboard behavior, visible focus, meaningful labels, ARIA state, reduced-motion support, and logical source order.
- Prefer Boobstrap classes and design tokens (`bs-*` and `--bs-*`) over one-off replacements. Put site-specific styles in the corresponding local stylesheet.
- Keep the light and dark themes, desktop and mobile layouts, canonical metadata, and clean no-trailing-slash URLs working.
- Do not edit generated output in `dist/`, installed dependencies in `node_modules/`, or browser artifacts in `artifacts/`.
- Do not copy framework implementation into this repository. If a required class, token, or behavior is missing from the pinned package, call out the repository boundary instead.

## Routes and documentation

`src/docs-pages.js` is the source of truth for documentation page metadata used by the client and tests. When adding or changing a public route, update every layer that must serve it:

1. Register documentation metadata in `src/docs-pages.js` when applicable.
2. Ensure Vite serves or rewrites the route in `vite.config.js`.
3. Mirror production routing and canonical redirects in `nginx.conf`.
4. Update page metadata, navigation, and relevant smoke assertions.

Keep route behavior consistent between the Vite development/preview servers and production Nginx.

## Validation expectations

- Run `npm run build` after changes to HTML, CSS, JavaScript, assets, routes, or build configuration.
- Run `npm test` for user-visible behavior, accessibility interactions, responsive layout, documentation, playground, or routing changes.
- For changes intended for `dev`, run `npm run framework:dev` before integration testing when they depend on unreleased framework work.
- The smoke suite is intentionally broad: it checks public assets, redirects, every docs route, desktop/mobile overflow, browser errors, keyboard interactions, copy controls, metadata, and framework class/token coverage.
- Add or update tests when behavior or public contracts change; do not weaken existing assertions merely to make a change pass.
- If validation cannot run, report the exact command and reason in the handoff.

## Change discipline

- Keep changes scoped to the request and preserve unrelated work in the tree.
- Update `README.md` when setup, architecture, repository boundaries, routes, or deployment behavior materially change.
- Never commit secrets or environment-specific credentials.
- Summarize changed files and validation results when handing work back.
