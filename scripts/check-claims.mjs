/*
 * The claims check, run weekly by .github/workflows/claims.yml.
 *
 * Every figure on the page is meant to trace to a public source, and
 * src/data/sources.ts records, for each source, the strings it has to keep
 * saying. This fetches every source and fails if any of those strings has gone.
 * The page has drifted before: it said 370 tests, 87 documents and Railway
 * after all three had changed upstream, and nothing flagged it.
 *
 * sources.ts is TypeScript and builds its strings from figures.ts, so
 * `npm run check:claims` compiles it with Vite's SSR build first and this
 * imports the output. The strings checked are then the ones the page renders
 * from, not a second copy that could drift on its own.
 */

import { appendFileSync, existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const built = resolve(root, "node_modules/.cache/claims/sources.js");

if (!existsSync(built)) {
  throw new Error(`missing ${built}. Run npm run check:claims, which builds it first.`);
}

const { SOURCES } = await import(pathToFileURL(built).href);

const TIMEOUT_MS = 20_000;

function headersFor(url) {
  const headers = { "User-Agent": "vishalkhan.me claims check" };
  if (new URL(url).hostname === "api.github.com") {
    headers.Accept = "application/vnd.github+json";
    // Unauthenticated, the API allows 60 requests an hour per IP address. In CI
    // the workflow passes its own token, so that limit cannot decide the result.
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
  }
  return headers;
}

async function request(url) {
  const res = await fetch(url, {
    headers: headersFor(url),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { status: res.status, body: await res.text() };
}

/*
 * A weekly job that fails on one dropped connection soon gets ignored, so a
 * network error, a timeout or a 5xx gets one more try after a short pause. A
 * 4xx does not: a file that has moved is still moved two seconds later.
 */
async function get(url) {
  try {
    const first = await request(url);
    if (first.status < 500) return first;
  } catch {
    // Falls through to the second try, which reports the error if it recurs.
  }
  await new Promise((wake) => setTimeout(wake, 2000));
  return request(url);
}

function describe(err) {
  if (err.name === "TimeoutError") return `no answer in ${TIMEOUT_MS / 1000} s`;
  // Node reports every network failure as "fetch failed" and puts the reason,
  // such as ENOTFOUND, on the cause.
  const reason = err.cause?.code ?? err.cause?.message;
  return reason ? `${err.message} (${reason})` : err.message;
}

async function check(id, source) {
  const url = source.check ?? source.href;
  let body;

  if (URL.canParse(url)) {
    let res;
    try {
      res = await get(url);
    } catch (err) {
      return { id, pass: false, missing: `${describe(err)}: ${url}` };
    }
    if (res.status >= 400) {
      return { id, pass: false, missing: `HTTP ${res.status}: ${url}` };
    }
    body = res.body;
  } else {
    /*
     * A path on this site, like the CV. It is served from public/, so check the
     * file in the checkout. The deployed copy can be a push behind it.
     */
    const file = join("public", decodeURIComponent(url.split(/[?#]/)[0]));
    if (!statSync(join(root, file), { throwIfNoEntry: false })?.isFile()) {
      return { id, pass: false, missing: `${file} does not exist` };
    }
    body = source.expect ? readFileSync(join(root, file), "utf8") : "";
  }

  /*
   * The READMEs are hard-wrapped, and Markdown renders a single line break as a
   * space. On 2026-10-12 the untrusted-rows README broke "It does not assert
   * that it works" after "it", which a plain substring search reported as
   * missing. Collapsing every run of whitespace on both sides stops a re-wrap
   * from reading as drift.
   */
  const squash = (s) => s.replace(/\s+/g, " ");
  const text = squash(body);
  const missing = (source.expect ?? []).filter((s) => !text.includes(squash(s)));
  return {
    id,
    pass: missing.length === 0,
    missing: missing.map((s) => `\`${s}\``).join(", "),
  };
}

const rows = await Promise.all(
  Object.entries(SOURCES).map(([id, source]) => check(id, source)),
);
const failed = rows.filter((row) => !row.pass).length;
const verdict = `${rows.length - failed} of ${rows.length} sources pass.`;

const head = ["id", "status", "missing"];
const cells = rows.map((row) => [row.id, row.pass ? "pass" : "FAIL", row.missing]);

const widths = head.map((h, i) => Math.max(h.length, ...cells.map((c) => c[i].length)));
const line = (c) => c.map((v, i) => v.padEnd(widths[i])).join("  ").trimEnd();
console.log(
  [line(head), line(widths.map((w) => "-".repeat(w))), ...cells.map(line), "", verdict].join("\n"),
);

if (process.env.GITHUB_STEP_SUMMARY) {
  // A bare | inside a cell would end the cell early.
  const md = (v) => v.replaceAll("|", "\\|");
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "## Claims check",
      "",
      `| ${head.join(" | ")} |`,
      `| ${head.map(() => "---").join(" | ")} |`,
      ...cells.map((c) => `| ${c.map(md).join(" | ")} |`),
      "",
      verdict,
      "",
    ].join("\n"),
  );
}

if (failed) process.exitCode = 1;
