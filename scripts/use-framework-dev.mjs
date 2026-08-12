import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const repository = "https://github.com/mikeroq/boobstrap-framework.git";
const refFile = new URL("../.framework-dev-ref", import.meta.url);
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const shouldSync = process.argv.includes("--sync");

const validateRef = (value) => {
  const ref = value.trim();
  if (!/^[a-f0-9]{40}$/.test(ref)) {
    throw new Error(`Invalid framework commit in .framework-dev-ref: ${JSON.stringify(ref)}`);
  }
  return ref;
};

let ref;
if (shouldSync) {
  const remote = execFileSync("git", ["ls-remote", repository, "refs/heads/dev"], { encoding: "utf8" });
  ref = validateRef(remote.split(/\s+/)[0] ?? "");
  writeFileSync(refFile, `${ref}\n`);
  console.log(`Synced .framework-dev-ref to ${ref}.`);
} else {
  ref = validateRef(readFileSync(refFile, "utf8"));
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npmCommand, [
  "install",
  "--no-save",
  "--package-lock=false",
  "--foreground-scripts",
  `git+${repository}#${ref}`,
], {
  cwd: projectRoot,
  stdio: "inherit",
});

console.log(`Using boobstrap-framework dev commit ${ref}.`);
