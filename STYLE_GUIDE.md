# Boobstrap Visual Style Guide

**Version 1.0 — Draft**

Boobstrap is a playful but professional CSS framework. Its visual identity combines polished developer-tool aesthetics with rounded forms, confident typography, and subtle tongue-in-cheek details.

The brand should feel:

- Modern
- Capable
- Approachable
- Slightly cheeky
- Visually distinctive
- Appropriate for real production software

The joke belongs primarily in the name and copy. The interface itself should remain credible, accessible, and useful.

## 1. Brand Foundation

### Brand Name

Always capitalize the first letter when referring to the product or framework:

```text
Boobstrap
```

Lowercase `boobstrap` may be used for package names, repositories, file names, and terminal commands.

```text
boobstrap
@boobstrap/core
boobstrap.css
```

### Tagline

Primary tagline:

> A cheeky CSS framework that still means business.

Supporting phrases:

- Built for every shape.
- Look good. Ship fast.
- Boobstrap has your front end covered.
- Responsive by design.
- Beautiful components without the usual struggle.
- Thoughtful defaults. Flexible foundations.
- Boobstrap has your back.

Humor should be subtle and limited.

### Brand Personality

The voice should be:

- Clear rather than clever
- Friendly rather than casual
- Confident rather than arrogant
- Playful rather than explicit
- Technical without being difficult to understand

## 2. Logo System

The primary logo consists of:

1. A rounded symmetrical symbol
2. A small centered heart or diamond shape
3. The Boobstrap wordmark

The symbol should suggest support, balance, curved forms, and the shape of a strap without becoming literal or explicit.

### Primary Lockup

```text
[Symbol] Boobstrap
```

Recommended spacing:

```css
gap: 0.625em;
```

### Minimum Size

```text
Full logo: 120px wide
Symbol only: 24px square
Favicon: 16px square
```

### Incorrect Usage

Do not:

- Stretch or distort the logo
- Rotate the wordmark
- Apply harsh shadows
- Place it on visually noisy backgrounds
- Add outlines around the wordmark
- Use novelty lettering
- Make the logo anatomically explicit
- Copy or modify the Bootstrap logo

## 3. Color Palette

### Primary Colors

```css
--bs-brand-400: #ea5a9f;
--bs-brand-500: #d83c87;
--bs-brand-600: #b92f72;

--bs-plum-800: #32172f;
--bs-plum-900: #211021;
--bs-plum-950: #140a15;
```

### Neutral Colors

```css
--bs-white: #ffffff;
--bs-gray-50: #faf7f9;
--bs-gray-100: #f3edf1;
--bs-gray-200: #e4dce1;
--bs-gray-300: #cbbfc6;
--bs-gray-400: #aa9ca5;
--bs-gray-500: #877984;
--bs-gray-600: #685b65;
--bs-gray-700: #4b4048;
--bs-gray-800: #30282e;
--bs-gray-900: #201a1f;
```

### Semantic Colors

```css
--bs-success: #36b37e;
--bs-warning: #e6a23c;
--bs-danger: #e05268;
--bs-info: #618ee8;
```

### Dark Theme Tokens

```css
:root,
[data-bs-theme="dark"] {
  --bs-color-background: #140a15;
  --bs-color-surface: #211021;
  --bs-color-surface-raised: #2b1529;
  --bs-color-surface-hover: #32172f;

  --bs-color-text: #fff9fc;
  --bs-color-text-muted: #b9aab4;
  --bs-color-text-subtle: #8d7d88;

  --bs-color-border: rgb(255 255 255 / 10%);
  --bs-color-border-strong: rgb(234 90 159 / 32%);

  --bs-color-primary: #d83c87;
  --bs-color-primary-hover: #ea5a9f;
  --bs-color-primary-active: #b92f72;
}
```

### Light Theme Tokens

```css
[data-bs-theme="light"] {
  --bs-color-background: #fffafd;
  --bs-color-surface: #ffffff;
  --bs-color-surface-raised: #ffffff;
  --bs-color-surface-hover: #f8edf3;

  --bs-color-text: #2b1725;
  --bs-color-text-muted: #715f6b;
  --bs-color-text-subtle: #93828d;

  --bs-color-border: #eadce4;
  --bs-color-border-strong: #dcb7ca;

  --bs-color-primary: #c93179;
  --bs-color-primary-hover: #ae2868;
  --bs-color-primary-active: #8f2057;
}
```

### Brand Gradient

```css
--bs-gradient-brand:
  linear-gradient(
    135deg,
    #f06aa8 0%,
    #d83c87 48%,
    #a92869 100%
  );
```

Use pink for emphasis rather than everywhere.

## 4. Typography

### Interface Font

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### Display Font

```css
font-family:
  "Plus Jakarta Sans",
  Inter,
  ui-sans-serif,
  system-ui,
  sans-serif;
```

### Code Font

```css
font-family:
  "JetBrains Mono",
  "SFMono-Regular",
  Consolas,
  "Liberation Mono",
  monospace;
```

### Type Scale

```css
--bs-font-size-xs: 0.75rem;
--bs-font-size-sm: 0.875rem;
--bs-font-size-md: 1rem;
--bs-font-size-lg: 1.125rem;
--bs-font-size-xl: 1.25rem;
--bs-font-size-2xl: 1.5rem;
--bs-font-size-3xl: 2rem;
--bs-font-size-4xl: 2.75rem;
--bs-font-size-5xl: 4rem;
--bs-font-size-6xl: clamp(4rem, 8vw, 7rem);
```

### Line Height

```css
--bs-line-height-tight: 1.05;
--bs-line-height-heading: 1.2;
--bs-line-height-body: 1.6;
--bs-line-height-code: 1.7;
```

### Hero Typography

```css
.bs-hero-title {
  max-width: 11ch;
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.055em;
  background: var(--bs-gradient-brand);
  background-clip: text;
  color: transparent;
}
```

## 5. Spacing System

Boobstrap uses a four-pixel base spacing system.

```css
--bs-space-0: 0;
--bs-space-1: 0.25rem;
--bs-space-2: 0.5rem;
--bs-space-3: 0.75rem;
--bs-space-4: 1rem;
--bs-space-5: 1.25rem;
--bs-space-6: 1.5rem;
--bs-space-8: 2rem;
--bs-space-10: 2.5rem;
--bs-space-12: 3rem;
--bs-space-16: 4rem;
--bs-space-20: 5rem;
--bs-space-24: 6rem;
--bs-space-32: 8rem;
```

## 6. Borders and Radius

```css
--bs-radius-xs: 0.25rem;
--bs-radius-sm: 0.5rem;
--bs-radius-md: 0.75rem;
--bs-radius-lg: 1rem;
--bs-radius-xl: 1.5rem;
--bs-radius-2xl: 2rem;
--bs-radius-pill: 9999px;
```

Recommended usage:

```text
Inputs:             0.75rem
Buttons:            0.75rem
Cards:              1rem–1.5rem
Marketing panels:   1.5rem–2rem
Badges:             pill
```

Default dark border:

```css
border: 1px solid rgb(255 255 255 / 10%);
```

Brand-emphasis border:

```css
border: 1px solid rgb(216 60 135 / 35%);
```

## 7. Shadows and Depth

```css
--bs-shadow-sm:
  0 2px 8px rgb(8 2 9 / 18%);

--bs-shadow-md:
  0 12px 30px rgb(8 2 9 / 28%);

--bs-shadow-lg:
  0 24px 70px rgb(8 2 9 / 42%);

--bs-shadow-brand:
  0 10px 34px rgb(216 60 135 / 22%);
```

Dark elevated cards may use:

```css
box-shadow:
  inset 0 1px 0 rgb(255 255 255 / 6%),
  var(--bs-shadow-md);
```

## 8. Layout System

### Containers

```css
--bs-container-sm: 40rem;
--bs-container-md: 48rem;
--bs-container-lg: 64rem;
--bs-container-xl: 76rem;
--bs-container-2xl: 90rem;
```

```css
.bs-container {
  width: min(100% - 2rem, 90rem);
  margin-inline: auto;
}
```

### Grid

```css
.bs-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}
```

Recommended arrangements:

- Hero: `5/7` or `6/6`
- Documentation: `3/9`
- Component gallery: `4/4/4`
- Feature row: four equal columns
- Mobile: one column

## 9. Iconography

Icons should be outlined, rounded, geometric, and simple enough to work at 16 pixels.

```css
--bs-icon-sm: 1rem;
--bs-icon-md: 1.25rem;
--bs-icon-lg: 1.5rem;
--bs-icon-xl: 2rem;
```

```css
.bs-feature-icon {
  display: inline-grid;
  width: 4rem;
  height: 4rem;
  place-items: center;
  color: var(--bs-color-primary);
  background: rgb(216 60 135 / 10%);
  border: 1px solid rgb(216 60 135 / 24%);
  border-radius: var(--bs-radius-lg);
}
```

## 10. Buttons

### Primary

```css
.bs-btn-primary {
  color: #ffffff;
  background: var(--bs-gradient-brand);
  border: 1px solid transparent;
  box-shadow: var(--bs-shadow-brand);
}
```

### Secondary

```css
.bs-btn-secondary {
  color: var(--bs-color-text);
  background: var(--bs-color-surface-raised);
  border: 1px solid var(--bs-color-border);
}
```

### Base Button

```css
.bs-btn {
  min-height: 2.75rem;
  padding-inline: 1.25rem;
  border-radius: var(--bs-radius-md);
  font-weight: 600;
}
```

### Interaction

```css
.bs-btn:hover {
  transform: translateY(-1px);
}

.bs-btn:active {
  transform: translateY(0);
}
```

## 11. Cards

```css
.bs-card {
  color: var(--bs-color-text);
  background: var(--bs-color-surface);
  border: 1px solid var(--bs-color-border);
  border-radius: var(--bs-radius-xl);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 5%),
    var(--bs-shadow-sm);
}

.bs-card-body {
  padding: clamp(1.25rem, 3vw, 2rem);
}
```

## 12. Forms

```css
.bs-input {
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
  color: var(--bs-color-text);
  background: var(--bs-color-surface-raised);
  border: 1px solid var(--bs-color-border);
  border-radius: var(--bs-radius-md);
}

.bs-input:focus {
  outline: 3px solid rgb(216 60 135 / 24%);
  border-color: var(--bs-color-primary);
}
```

## 13. Alerts

```css
.bs-alert {
  display: flex;
  gap: 0.875rem;
  padding: 1rem;
  border: 1px solid var(--bs-color-border);
  border-radius: var(--bs-radius-lg);
}

.bs-alert-primary {
  background: rgb(216 60 135 / 9%);
  border-color: rgb(216 60 135 / 28%);
}
```

## 14. Code Blocks

```css
.bs-code-window {
  overflow: hidden;
  color: #f8edf4;
  background: #1c0d1c;
  border: 1px solid rgb(255 255 255 / 9%);
  border-radius: var(--bs-radius-xl);
  box-shadow: var(--bs-shadow-lg);
}
```

Syntax colors:

```css
--bs-code-tag: #ec669f;
--bs-code-attribute: #d6abff;
--bs-code-string: #c8db69;
--bs-code-keyword: #ff8a7a;
--bs-code-comment: #81727c;
--bs-code-text: #f7edf3;
```

## 15. Decorative Language

Boobstrap uses curved, strap-like visual accents as a supporting brand device.

Use:

- Curved ribbons
- Stitched lines
- Soft arcs
- Looping connectors
- Rounded bands
- Symmetrical curved patterns

These should frame content rather than dominate it.

Avoid using decorative straps inside dense application interfaces or behind body text.

## 16. Motion

```css
--bs-duration-fast: 120ms;
--bs-duration-normal: 200ms;
--bs-duration-slow: 360ms;

--bs-ease-standard: cubic-bezier(0.2, 0, 0, 1);
--bs-ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 17. Accessibility

Target:

- WCAG AA for normal text
- At least `4.5:1` contrast for regular text
- At least `3:1` for large text
- At least `3:1` for important component boundaries and focus states

Recommended focus ring:

```css
outline: 3px solid rgb(234 90 159 / 35%);
outline-offset: 2px;
```

Recommended touch target:

```text
44 × 44 CSS pixels
```

Recommended body width:

```css
max-width: 68ch;
```

## 18. Illustration and Imagery

Preferred imagery:

- UI previews
- Component examples
- Code snippets
- Abstract geometry
- Developer workflows
- Framework structure

Avoid:

- Stock photographs
- Overly sexualized imagery
- Meme-style graphics in primary documentation
- Cartoon anatomy
- Generic corporate handshakes
- Excessive neon cyberpunk effects

## 19. Brand Voice

Preferred:

> Build responsive interfaces with reusable components.

Avoid bloated or corporate wording.

Good humor:

- Built for every shape.
- Boobstrap has your back.
- Your front end deserves better support.
- A framework with a little more lift.

Avoid explicit jokes, especially in error messages, accessibility guidance, or professional documentation.

## 20. Documentation Style

Documentation should primarily use a light theme for long-form readability, with dark branded areas for:

- Homepage hero
- Code examples
- Navigation
- Component demonstrations
- Release announcements

Recommended component page structure:

1. Page title
2. One-paragraph summary
3. Working example
4. Markup
5. API or class reference
6. Accessibility guidance
7. Customization guidance
8. Related components

## 21. CSS Token Foundation

```css
:root {
  color-scheme: dark;

  --bs-brand-400: #ea5a9f;
  --bs-brand-500: #d83c87;
  --bs-brand-600: #b92f72;

  --bs-plum-800: #32172f;
  --bs-plum-900: #211021;
  --bs-plum-950: #140a15;

  --bs-color-background: var(--bs-plum-950);
  --bs-color-surface: var(--bs-plum-900);
  --bs-color-surface-raised: #2b1529;
  --bs-color-surface-hover: var(--bs-plum-800);

  --bs-color-text: #fff9fc;
  --bs-color-text-muted: #b9aab4;
  --bs-color-text-subtle: #8d7d88;

  --bs-color-primary: var(--bs-brand-500);
  --bs-color-primary-hover: var(--bs-brand-400);
  --bs-color-primary-active: var(--bs-brand-600);

  --bs-color-success: #36b37e;
  --bs-color-warning: #e6a23c;
  --bs-color-danger: #e05268;
  --bs-color-info: #618ee8;

  --bs-color-border: rgb(255 255 255 / 10%);
  --bs-color-border-strong: rgb(216 60 135 / 35%);

  --bs-font-sans:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  --bs-font-mono:
    "JetBrains Mono",
    "SFMono-Regular",
    Consolas,
    monospace;

  --bs-radius-sm: 0.5rem;
  --bs-radius-md: 0.75rem;
  --bs-radius-lg: 1rem;
  --bs-radius-xl: 1.5rem;
  --bs-radius-2xl: 2rem;
  --bs-radius-pill: 9999px;

  --bs-shadow-sm:
    0 2px 8px rgb(8 2 9 / 18%);

  --bs-shadow-md:
    0 12px 30px rgb(8 2 9 / 28%);

  --bs-shadow-lg:
    0 24px 70px rgb(8 2 9 / 42%);

  --bs-shadow-brand:
    0 10px 34px rgb(216 60 135 / 22%);

  --bs-gradient-brand:
    linear-gradient(
      135deg,
      var(--bs-brand-400),
      var(--bs-brand-500) 48%,
      var(--bs-brand-600)
    );

  --bs-duration-fast: 120ms;
  --bs-duration-normal: 200ms;
  --bs-duration-slow: 360ms;

  --bs-ease-standard:
    cubic-bezier(0.2, 0, 0, 1);
}
```

## 22. Design Checklist

Before shipping a Boobstrap-branded page or component, confirm that:

- The primary action is visually obvious.
- Pink is used for emphasis rather than everywhere.
- Text remains readable on dark surfaces.
- Cards use consistent radius and spacing.
- Focus indicators are visible.
- Interactive elements meet touch-size recommendations.
- Decorative curves do not interfere with content.
- Humor is subtle and workplace-appropriate.
- Components remain useful without the brand decoration.
- The page still looks professional when the joke is ignored.

## Guiding Principle

Boobstrap should look like a framework someone initially notices because of the name, but continues using because the design system is genuinely good.

**Playful brand. Serious framework.**
