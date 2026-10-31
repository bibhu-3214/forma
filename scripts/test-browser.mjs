import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, resolve } from "node:path";

// Each suite gets its own ephemeral PostgreSQL cluster. A whole portfolio suite
// can otherwise exceed the real registration limit for one loopback address.
// Keep production throttling active and unchanged, including in browser tests.
const [mode = "connected", ...args] = process.argv.slice(2);
if (!["connected", "cross"].includes(mode))
  throw new Error("Unknown browser suite.");
const root = fileURLToPath(new URL("../", import.meta.url));
const cli = resolve(root, "node_modules/@playwright/test/cli.js");
const crossSuites = new Set([
  "premium.spec.ts",
  "reliability.spec.ts",
  "product-upgrades.spec.ts",
]);
const requested = args
  .filter((arg) => arg.endsWith(".spec.ts"))
  .map((arg) => basename(arg));
const forwarded = args.filter((arg) => !arg.endsWith(".spec.ts"));
const files = (await readdir(resolve(root, "acceptance")))
  .filter(
    (file) =>
      file.endsWith(".spec.ts") &&
      (!requested.length || requested.includes(file)) &&
      (mode !== "cross" || crossSuites.has(file)),
  )
  .sort();
if (!files.length) throw new Error("No matching browser suites.");
let stopped = false;
let child;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    stopped = true;
    child?.kill(signal);
  });
for (const file of files) {
  if (stopped) {
    process.exitCode = 130;
    break;
  }
  const code = await new Promise((done, reject) => {
    child = spawn(
      process.execPath,
      [
        cli,
        "test",
        "-c",
        `playwright.${mode}.config.ts`,
        file,
        "--output",
        `output/browser-results/${mode}/${file.replace(".spec.ts", "")}`,
        "--pass-with-no-tests",
        ...forwarded,
      ],
      { cwd: root, env: process.env, stdio: "inherit" },
    );
    child.once("error", reject);
    child.once("exit", (status) => done(status ?? 1));
  });
  child = undefined;
  if (code !== 0) {
    process.exitCode = code;
    break;
  }
}
