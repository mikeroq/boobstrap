import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "src", "boobstrap.css");
const destination = join(root, "dist", "boobstrap.css");
const importPattern = /@import\s+["'](.+?)["'];/g;

async function bundle(file, stack = []) {
  const absoluteFile = resolve(file);

  if (stack.includes(absoluteFile)) {
    throw new Error(`Circular CSS import: ${[...stack, absoluteFile].join(" -> ")}`);
  }

  const source = await readFile(absoluteFile, "utf8");
  const nextStack = [...stack, absoluteFile];
  let output = "";
  let cursor = 0;

  for (const match of source.matchAll(importPattern)) {
    output += source.slice(cursor, match.index);
    output += await bundle(resolve(dirname(absoluteFile), match[1]), nextStack);
    cursor = match.index + match[0].length;
  }

  return output + source.slice(cursor);
}

const banner = `/* Boobstrap v0.1.0 | MIT License | boobstrap.dev */\n`;
const css = await bundle(entry);

await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, `${banner}${css.trim()}\n`);

console.log(`Built ${destination.replace(`${root}/`, "")} (${Buffer.byteLength(css)} bytes)`);
