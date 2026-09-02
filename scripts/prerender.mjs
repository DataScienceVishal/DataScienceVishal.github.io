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
 * The citation markers must ascend as the reader descends. sources.ts already
 * guarantees every source is numbered from one ordered list, but nothing there
 * can see the page: if a claim moves, or a section is inserted above another,
 * ORDER silently stops matching the order things are actually cited in and the
 * reader meets 1, 4, 2, 3. That is precisely the kind of quiet drift the
 * numbering exists to prevent, so check it against the rendered output.
 */
const markers = [...out.matchAll(/class="claim__marker"[^>]*>(\d+)</g)].map((m) =>
  Number(m[1]),
);
const firstCited = [];
for (const n of markers) if (!firstCited.includes(n)) firstCited.push(n);
const ascending = firstCited.every((n, i) => i === 0 || n > firstCited[i - 1]);
if (!ascending) {
  throw new Error(
    `citation markers are cited out of order: ${firstCited.join(", ")}. ` +
      `Reorder ORDER in src/data/sources.ts to match the page.`,
  );
}
const defined = (out.match(/id="ref-\d+"/g) ?? []).length;
if (defined !== firstCited.length) {
  throw new Error(
    `${defined} sources are listed but ${firstCited.length} are cited. ` +
      `Every source in the reference list must be cited by a claim.`,
  );
}
console.log(`citations: ${firstCited.length} sources, cited in order`);

/*
 * Every character on the page must exist in the font subset.
 *
 * subset_fonts.py asks for a fixed set of codepoints, and fontTools silently
 * drops any it cannot find in the source family. It was asking for U+2192 and
 * getting nothing, so the arrow in the trajectory rendered in whatever system
 * mono the browser fell back to: a different face, mid-sentence, in the accent
 * colour, three times over. Nothing failed and nothing warned.
 *
 * Keep this list in step with UNICODES in scripts/subset_fonts.py.
 */
const SUBSET = new Set([
  ...Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => 0x20 + i),
  0xa0, 0xa3, 0xb0, 0x2013, 0x2018, 0x2019, 0x201a, 0x201c, 0x201d, 0x2026,
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
