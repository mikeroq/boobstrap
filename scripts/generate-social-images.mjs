import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { socialCards } from "../src/social-cards.js";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const distRoot = resolve(projectRoot, "dist");

const palettes = {
  rose: { background: "#140a15", surface: "#2b1529", accent: "#f28abb", strong: "#d83c87", glow: "#6d284f" },
  violet: { background: "#0f0b1a", surface: "#21183a", accent: "#c4b5fd", strong: "#8b5cf6", glow: "#4c2b87" },
  blue: { background: "#071321", surface: "#112842", accent: "#93c5fd", strong: "#3b82f6", glow: "#174b7a" },
  teal: { background: "#061715", surface: "#10312d", accent: "#5eead4", strong: "#14b8a6", glow: "#12655d" },
  amber: { background: "#1a1005", surface: "#38240d", accent: "#fcd34d", strong: "#f59e0b", glow: "#81500c" },
};

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const wrapText = (value, maximumCharacters, maximumLines) => {
  const words = value.trim().split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maximumCharacters || !line) {
      line = candidate;
      continue;
    }
    if (lines.length < maximumLines - 1) {
      lines.push(line);
      line = word;
      continue;
    }
    line = `${line.replace(/[.,;:]?$/, "")}…`;
    break;
  }
  if (line && lines.length < maximumLines) lines.push(line);
  return lines;
};

const renderTextLines = ({ lines, x, y, lineHeight, fontSize, fill, weight = 400 }) => lines
  .map((line, index) => `<text x="${x}" y="${y + (index * lineHeight)}" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}">${escapeXml(line)}</text>`)
  .join("");

const cardSvg = (card) => {
  const palette = palettes[card.palette];
  const titleSize = card.title.length > 30 ? 58 : card.title.length > 21 ? 66 : 76;
  const titleLines = wrapText(card.title, Math.floor(850 / (titleSize * 0.54)), 2);
  const descriptionLines = wrapText(card.description, 78, titleLines.length > 1 ? 2 : 3);
  const descriptionY = titleLines.length > 1 ? 414 : 350;
  const routeLabel = card.path === "/" ? "boobstrap.org" : `boobstrap.org${card.path}`;
  const categoryWidth = Math.max(154, (card.category.length * 15) + 44);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.background}"/>
      <stop offset="0.58" stop-color="${palette.surface}"/>
      <stop offset="1" stop-color="${palette.background}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(1060 80) rotate(130) scale(560 510)" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.glow}" stop-opacity="0.92"/>
      <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${palette.accent}"/>
      <stop offset="1" stop-color="${palette.strong}"/>
    </linearGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#background)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect x="1" y="1" width="1198" height="628" rx="30" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>

  <circle cx="1078" cy="112" r="188" fill="none" stroke="${palette.accent}" stroke-opacity="0.13" stroke-width="42"/>
  <circle cx="1078" cy="112" r="110" fill="${palette.strong}" fill-opacity="0.11"/>
  <path d="M1010 57c-42 46-36 124 18 163 25 18 55 23 84 13-39-20-69-59-69-105 0-28 11-53 31-72-24 0-44 1-64 1Z" fill="${palette.accent}" fill-opacity="0.13"/>
  <path d="M1146 57c42 46 36 124-18 163-25 18-55 23-84 13 39-20 69-59 69-105 0-28-11-53-31-72 24 0 44 1 64 1Z" fill="${palette.accent}" fill-opacity="0.13"/>

  <g transform="translate(70 53)">
    <path d="M6 3c-8 9-7 25 4 33 5 4 11 5 17 3-8-4-14-12-14-21 0-6 2-11 6-15-5 0-9 0-13 0Z" fill="#fff9fc"/>
    <path d="M50 3c8 9 7 25-4 33-5 4-11 5-17 3 8-4 14-12 14-21 0-6-2-11-6-15 5 0 9 0 13 0Z" fill="#fff9fc"/>
    <path d="M28 30s-9-5.4-9-11a5.2 5.2 0 0 1 9-3.5 5.2 5.2 0 0 1 9 3.5c0 5.6-9 11-9 11Z" fill="${palette.accent}"/>
  </g>
  <text x="142" y="87" fill="#fff9fc" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="700">Boobstrap</text>
  <text x="306" y="87" fill="#ffffff" fill-opacity="0.42" font-family="Inter, Arial, sans-serif" font-size="26">v0.4.0</text>

  <rect x="70" y="137" width="${categoryWidth}" height="46" rx="23" fill="${palette.strong}" fill-opacity="0.2" stroke="${palette.accent}" stroke-opacity="0.48"/>
  <circle cx="94" cy="160" r="5" fill="${palette.accent}"/>
  <text x="110" y="168" fill="${palette.accent}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="0.4">${escapeXml(card.category.toUpperCase())}</text>

  ${renderTextLines({ lines: titleLines, x: 70, y: 266, lineHeight: 78, fontSize: titleSize, fill: "#fff9fc", weight: 760 })}
  ${renderTextLines({ lines: descriptionLines, x: 72, y: descriptionY, lineHeight: 36, fontSize: 25, fill: "#eadce4", weight: 400 })}

  <line x1="70" y1="535" x2="1130" y2="535" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="70" y="580" fill="#ffffff" fill-opacity="0.62" font-family="Inter, Arial, sans-serif" font-size="22">${escapeXml(routeLabel)}</text>
  <g transform="translate(1000 558)">
    <rect width="130" height="38" rx="19" fill="url(#accent)"/>
    <text x="65" y="26" text-anchor="middle" fill="${palette.background}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">OPEN DOCS</text>
  </g>
</svg>`;
};

for (const card of socialCards) {
  const outputPath = resolve(distRoot, card.imagePath.slice(1));
  await mkdir(dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(cardSvg(card)))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

console.log(`Generated ${socialCards.length} route-specific social images.`);
