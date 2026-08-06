# Boobstrap

**A cheeky CSS framework that still means business.**

Boobstrap is a lightweight, component-focused CSS framework designed to simplify front-end development. It provides sensible defaults, reusable interface components, responsive layouts, and practical utility classes so developers can build polished websites without repeatedly writing the same CSS from scratch.

Boobstrap is playful in name, but serious about usability, accessibility, consistency, and maintainable code.

## Why Boobstrap?

Modern CSS is powerful, but building a consistent interface still requires a lot of repetitive work.

Every new project seems to need the same things:

- Buttons
- Form controls
- Navigation
- Cards
- Alerts
- Modals
- Responsive grids
- Spacing utilities
- Typography rules
- Accessible interaction states

Boobstrap gives you those foundations out of the box while remaining easy to customize.

> Spend less time fighting CSS and more time building your application.

## Core Features

### Component Library

Boobstrap includes a collection of reusable, responsive interface components.

Planned components include:

- Alerts
- Badges
- Breadcrumbs
- Buttons
- Cards
- Dropdowns
- Forms
- Modals
- Navigation bars
- Pagination
- Progress indicators
- Tables
- Tabs
- Toast notifications
- Tooltips

```html
<div class="bs-card">
  <div class="bs-card-body">
    <h2 class="bs-card-title">Built for every shape.</h2>
    <p class="bs-card-text">
      Reusable components with thoughtful defaults.
    </p>

    <button class="bs-btn bs-btn-primary">
      Get Started
    </button>
  </div>
</div>
```

### Responsive Grid

Boobstrap includes a mobile-first, Flexbox-based grid system for building responsive page layouts.

```html
<div class="bs-container">
  <div class="bs-row bs-gap-4">
    <div class="bs-col-12 bs-col-md-6">
      First column
    </div>

    <div class="bs-col-12 bs-col-md-6">
      Second column
    </div>
  </div>
</div>
```

### Utility Classes

Use focused utility classes for common layout and styling needs.

```html
<section class="bs-flex bs-items-center bs-justify-between bs-p-4">
  <h2 class="bs-m-0">Dashboard</h2>
  <button class="bs-btn bs-btn-primary">Create</button>
</section>
```

Planned utility categories include:

- Display
- Flexbox
- Grid
- Spacing
- Sizing
- Positioning
- Borders
- Colors
- Typography
- Visibility
- Shadows
- Responsive behavior

### Thoughtful Defaults

Boobstrap provides consistent defaults for typography, spacing, forms, buttons, and common HTML elements.

The defaults are intended to look polished without making every Boobstrap website look identical.

### Easy Customization

Boobstrap uses CSS custom properties for its design tokens.

```css
:root {
  --bs-color-primary: #d83c87;
  --bs-color-primary-hover: #bd2f73;
  --bs-color-background: #ffffff;
  --bs-color-surface: #f7f3f6;
  --bs-color-text: #241a22;

  --bs-radius-sm: 0.375rem;
  --bs-radius-md: 0.75rem;
  --bs-radius-lg: 1.25rem;

  --bs-space-1: 0.25rem;
  --bs-space-2: 0.5rem;
  --bs-space-3: 0.75rem;
  --bs-space-4: 1rem;
}
```

Override the variables in your own stylesheet:

```css
:root {
  --bs-color-primary: #6d4aff;
  --bs-radius-md: 0.5rem;
}
```

## Installation

Boobstrap is currently under development.

### npm

```bash
npm install boobstrap
```

Import the complete framework:

```css
@import "boobstrap/dist/boobstrap.css";
```

Or import it in JavaScript:

```js
import "boobstrap/dist/boobstrap.css";
```

### CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.example.com/boobstrap/boobstrap.min.css"
/>
```

The CDN address above is a placeholder until the first public release.

## Quick Start

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Boobstrap Example</title>

    <link
      rel="stylesheet"
      href="https://cdn.example.com/boobstrap/boobstrap.min.css"
    />
  </head>

  <body>
    <main class="bs-container bs-py-5">
      <div class="bs-card">
        <div class="bs-card-body">
          <span class="bs-badge bs-badge-primary">
            Boobstrap
          </span>

          <h1 class="bs-mt-3">
            Look good. Ship fast.
          </h1>

          <p class="bs-text-muted">
            Build responsive interfaces with reusable components and practical
            utility classes.
          </p>

          <div class="bs-flex bs-gap-2 bs-mt-4">
            <button class="bs-btn bs-btn-primary">
              Get Started
            </button>

            <button class="bs-btn bs-btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
  </body>
</html>
```

## Naming Convention

All framework classes use the `bs-` prefix.

```html
<button class="bs-btn bs-btn-primary">
  Primary
</button>
```

The prefix reduces the chance of collisions with application-specific styles or other libraries.

Boobstrap class names should be:

- Predictable
- Readable
- Composable
- Consistent across components
- Easy to recognize in HTML

## Example Components

### Buttons

```html
<button class="bs-btn bs-btn-primary">Primary</button>
<button class="bs-btn bs-btn-secondary">Secondary</button>
<button class="bs-btn bs-btn-outline">Outline</button>
<button class="bs-btn bs-btn-danger">Delete</button>
```

### Alert

```html
<div class="bs-alert bs-alert-success" role="alert">
  Your changes were saved successfully.
</div>
```

### Form

```html
<form class="bs-stack bs-gap-3">
  <div class="bs-form-group">
    <label class="bs-label" for="email">
      Email address
    </label>

    <input
      class="bs-input"
      id="email"
      name="email"
      type="email"
      placeholder="you@example.com"
    />
  </div>

  <button class="bs-btn bs-btn-primary" type="submit">
    Subscribe
  </button>
</form>
```

### Card

```html
<article class="bs-card">
  <div class="bs-card-body">
    <h2 class="bs-card-title">
      A reusable card
    </h2>

    <p class="bs-card-text">
      Cards can contain text, actions, forms, media, or other components.
    </p>
  </div>
</article>
```

## Design Principles

### Simple by Default

Common interfaces should be easy to build with a small amount of understandable HTML.

### Composable

Components and utilities should work together without requiring complicated overrides.

### Accessible

Components should use semantic HTML, visible focus states, sufficient contrast, and appropriate ARIA attributes where necessary.

### Responsive

Components should work across phones, tablets, laptops, and larger displays.

### Customizable

Developers should be able to change colors, spacing, typography, borders, shadows, and component behavior without forking the framework.

### Lightweight

Boobstrap should avoid unnecessary JavaScript and excessive CSS.

### Framework-Agnostic

Boobstrap should work with plain HTML as well as frameworks such as:

- React
- Vue
- Svelte
- Angular
- Astro
- Solid
- Server-rendered applications

## JavaScript Components

The core framework is CSS-first.

Interactive components such as modals, dropdowns, tabs, and tooltips may be provided through an optional JavaScript package.

```bash
npm install @boobstrap/core
```

```js
import { Modal } from "@boobstrap/core";

const modal = new Modal("#example-modal");

modal.open();
```

## Browser Support

The initial release will target current stable versions of major browsers.

Planned support includes:

- Chrome
- Edge
- Firefox
- Safari
- Current mobile browsers

Legacy browser support is not a primary goal.

## Project Structure

```text
boobstrap/
├── src/
│   ├── base/
│   │   ├── reset.css
│   │   ├── typography.css
│   │   └── tokens.css
│   ├── components/
│   │   ├── alert.css
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── form.css
│   │   ├── modal.css
│   │   └── navbar.css
│   ├── layout/
│   │   ├── container.css
│   │   └── grid.css
│   ├── utilities/
│   │   ├── display.css
│   │   ├── flex.css
│   │   ├── spacing.css
│   │   └── typography.css
│   └── boobstrap.css
├── dist/
│   ├── boobstrap.css
│   └── boobstrap.min.css
├── docs/
├── examples/
├── package.json
├── LICENSE
└── README.md
```

## Initial Roadmap

### Version 0.1

- Design tokens
- CSS reset
- Typography
- Containers
- Responsive grid
- Spacing utilities
- Display utilities
- Flexbox utilities
- Buttons
- Cards
- Alerts
- Badges
- Basic form controls

### Version 0.2

- Navigation
- Dropdowns
- Tables
- Tabs
- Progress indicators
- Toast notifications
- Expanded responsive utilities

### Version 0.3

- Modals
- Tooltips
- Popovers
- Optional JavaScript package
- Dark mode
- Theme generator

### Version 1.0

- Stable component API
- Complete documentation
- Accessibility review
- Browser compatibility testing
- Optimized production build
- CDN distribution
- Migration and upgrade guides

## Development

```bash
git clone https://github.com/boobstrap/boobstrap.git
cd boobstrap
npm install
npm run dev
```

Build the framework:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Repository addresses and commands may change before the project is published.

## Contributing

Contributions are welcome.

Good first contributions may include:

- New components
- Accessibility improvements
- Documentation corrections
- Browser testing
- Example layouts
- Utility classes
- Bug fixes
- Build-size improvements

Before submitting a pull request:

1. Open or locate a relevant issue.
2. Keep changes focused.
3. Include documentation for new features.
4. Add tests where appropriate.
5. Verify that existing components still work.
6. Follow the project's naming and formatting conventions.

## Status

Boobstrap is currently in early development and should not yet be considered production-ready.

The public API, class names, build process, and component structure may change before version 1.0.

## License

Boobstrap is released under the MIT License.

See `LICENSE` for details.

## Disclaimer

Boobstrap is an independent open-source project and is not affiliated with, endorsed by, or maintained by the Bootstrap project or its contributors.

The name is intentionally playful. The framework itself is intended to be useful, professional, and suitable for real software projects.

---

Made with care by developers, for developers.

**Boobstrap has your front end covered.**
