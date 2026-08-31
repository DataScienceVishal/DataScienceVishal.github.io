import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const template = resolve(root, "dist/index.html");
const serverEntry = resolve(root, "dist-ssr/entry-server.js");

if (!existsSync(serverEntry)) {
  throw new Error(`missing ${serverEntry}. Run the ssr build first.`);
}

const { render } = await import(pathToFileURL(serverEntry).href);
const html = render();

let out = readFileSync(template, "utf8");
if (!out.includes('<div id="root"></div>')) {
  throw new Error("dist/index.html no longer has an empty #root to fill");
}
out = out.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

/*
 * One stylesheet, 7 kB over the wire, and it blocks the first paint of a page
 * whose markup is already in this file. Inlining it removes a round trip on a
 * slow connection. The fonts stay as separate preloaded requests, because those
 * are large and genuinely worth caching on their own.
 */
const cssLink = out.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const cssPath = resolve(root, "dist", cssLink[1].replace(/^\//, ""));
  const css = readFileSync(cssPath, "utf8");
  out = out.replace(cssLink[0], `<style>${css}</style>`);
  rmSync(cssPath, { force: true });
  console.log(`inlined ${(css.length / 1024).toFixed(1)} kB of css`);
}

writeFileSync(template, out);

// The server bundle is a build artefact, not something to deploy.
rmSync(resolve(root, "dist-ssr"), { recursive: true, force: true });

const kb = (Buffer.byteLength(out, "utf8") / 1024).toFixed(1);
console.log(`prerendered dist/index.html, ${kb} kB of markup`);
