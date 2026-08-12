import { docsOverview, docsPages, normalizeDocsPath } from "./docs-pages.js";

const siteOrigin = "https://boobstrap.org";

const paletteForCategory = (category) => ({
  Documentation: "rose",
  "Get started": "rose",
  Foundations: "violet",
  Components: "blue",
  Tables: "teal",
  Forms: "rose",
  Interactivity: "amber",
  Reference: "violet",
}[category] ?? "rose");

export const socialImagePathFor = (path) => {
  if (path === "/") return "/og/home.png";
  return `/og${path}.png`;
};

const createCard = (page) => ({
  ...page,
  palette: page.palette ?? paletteForCategory(page.category),
  imagePath: socialImagePathFor(page.path),
  imageUrl: `${siteOrigin}${socialImagePathFor(page.path)}`,
  imageAlt: `${page.title} — Boobstrap ${page.category.toLowerCase()}`,
});

export const socialCards = [
  createCard({
    path: "/",
    category: "CSS framework",
    title: "Look good. Ship fast.",
    description: "A CSS-first framework with polished components, thoughtful defaults, and optional behavior for JavaScript, Alpine, and React.",
    palette: "rose",
  }),
  createCard({
    path: "/playground",
    category: "Playground",
    title: "Shape your next interface.",
    description: "Edit Boobstrap HTML and CSS in a safe, responsive live preview.",
    palette: "teal",
  }),
  createCard(docsOverview),
  ...docsPages.map(createCard),
];

export const socialCardForPath = (pathname) => {
  const normalizedPath = pathname === "/" ? "/" : normalizeDocsPath(pathname);
  return socialCards.find(({ path }) => path === normalizedPath);
};
