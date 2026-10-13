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

/*
 * The whole point of this script is that the markup ships in the file. If the
 * render came back empty or near-empty it would still be injected, the log
 * line below would still print a size, the build would still exit 0, and a
 * client-render-only page would deploy looking exactly like a success. Fail
 * loudly instead: this page is never smaller than about 100 kB.
 */
if (html.length < 20000) {
  throw new Error(
    `render() returned ${html.length} bytes, which is not a rendered page. ` +
      `Refusing to prerender an empty shell.`,
  );
}

let out = readFileSync(template, "utf8");
if (!out.includes('<div id="root"></div>')) {
  throw new Error("dist/index.html no longer has an empty #root to fill");
}
/*
 * Replacer functions, not strings. String.replace reads $&, $` and $' in the
 * replacement as substitution patterns, and both the rendered markup and the
 * compiled CSS can contain a literal $. React escapes < > & " ' but not the
 * backtick, so a $` in the page copy would splice the whole preceding document
 * into #root. A function replacement is never scanned for those sequences.
 */
out = out.replace('<div id="root"></div>', () => `<div id="root">${html}</div>`);

/*
 * One stylesheet, 7 kB over the wire, and it blocks the first paint of a page
 * whose markup is already in this file. Inlining it removes a round trip on a
 * slow connection. The fonts stay as separate preloaded requests, because those
 * are large and genuinely worth caching on their own.
 */
const cssLink = out.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
// This build always emits exactly one stylesheet, so a miss is a bug in the
// pattern rather than a branch to skip. Silently shipping a render-blocking
// stylesheet is the failure this would otherwise hide.
if (!cssLink) {
  throw new Error("no stylesheet link found in dist/index.html to inline");
}
const cssPath = resolve(root, "dist", cssLink[1].replace(/^\//, ""));
const css = readFileSync(cssPath, "utf8");
out = out.replace(cssLink[0], () => `<style>${css}</style>`);
console.log(`inlined ${(css.length / 1024).toFixed(1)} kB of css`);

// Write first, delete second. The other order leaves dist/index.html pointing
// at a stylesheet that has already been removed if the write throws.
writeFileSync(template, out);
rmSync(cssPath, { force: true });

// The server bundle is a build artefact, not something to deploy.
rmSync(resolve(root, "dist-ssr"), { recursive: true, force: true });

/*
 * Every in-page link must land somewhere. The contents row, the skip link and
 * the entry anchors are all fragment links, and a renamed id breaks one with
 * no error anywhere: the click scrolls nowhere and nothing reports it.
 */
const ids = new Set([...out.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const fragments = [...out.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]);
const dangling = [...new Set(fragments.filter((f) => !ids.has(f)))];
if (dangling.length) {
  throw new Error(`in-page links with no target: ${dangling.map((f) => `#${f}`).join(", ")}`);
}

/*
 * A link that opens a new tab without rel=noopener hands the opened page a
 * handle on this one. Every outbound link here opens a new tab, so check them
 * all rather than trusting each component to remember.
 */
const unsafe = [...out.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)]
  .map((m) => m[0])
  .filter((tag) => !/rel="[^"]*noopener[^"]*"/.test(tag));
if (unsafe.length) {
  throw new Error(`${unsafe.length} links open a new tab without rel=noopener: ${unsafe[0]}`);
}
console.log(`links: ${fragments.length} in-page, all resolve; new-tab links all carry noopener`);

/*
 * Every character on the page must exist in the font subset.
 *
 * subset_fonts.py asks for a fixed set of codepoints, and fontTools silently
 * drops any it cannot find in the source family. An earlier version of this
 * page asked for an arrow and got nothing, so it rendered in whatever system
 * face the browser fell back to, mid-sentence. Nothing failed and nothing
 * warned. This also catches an en or em dash slipping into the copy, since the
 * writing rules keep both out of the subset.
 *
 * Keep this list in step with UNICODES in scripts/subset_fonts.py.
 */
const SUBSET = new Set([
  ...Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => 0x20 + i),
  0xa0, 0xa3, 0xb0, 0x2018, 0x2019, 0x201a, 0x201b, 0x201c, 0x201d, 0x2026,
]);
const visible = out
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z]+;|&#\d+;/gi, " ");
const missing = new Set(
  [...visible].filter(
    (c) => !/\s/.test(c) && c.codePointAt(0) > 0x7e && !SUBSET.has(c.codePointAt(0)),
  ),
);
if (missing.size) {
  const list = [...missing]
    .map((c) => `${c} (U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")})`)
    .join(", ");
  throw new Error(
    `these characters are on the page but not in the font subset, so they ` +
      `render in a fallback face: ${list}. Add them to UNICODES in ` +
      `scripts/subset_fonts.py, or replace them with drawn glyphs.`,
  );
}

const kb = (Buffer.byteLength(out, "utf8") / 1024).toFixed(1);
console.log(`prerendered dist/index.html, ${kb} kB of markup`);
