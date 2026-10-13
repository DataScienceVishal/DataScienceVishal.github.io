import { expect, test, type Page } from "@playwright/test";

/*
  The scroll effects draw the figures and lay down the highlights as the reader
  arrives. The page ships already drawn, so the one way they can go wrong that
  matters is leaving something undrawn: a figure the reader is looking at taken
  away, or a figure scrolled past that never comes back. Each test compares the
  page with the effects running against the same page with reduced motion,
  where nothing runs and the markup is the drawing.
*/

type Box = [number, number, number, number];

interface Which {
  /** Only figures whose top is inside the first screen. */
  onlyOnScreen?: boolean;
  /** Include the travelling marks. */
  travel?: boolean;
}

/** Every inked part of every figure, as a box relative to its own figure. */
const drawing = (page: Page, { onlyOnScreen = false, travel = true }: Which = {}) =>
  page.evaluate(
    ({ onlyOnScreen, travel }) => {
      const result: Record<string, Box[]> = {};
      const parts = travel ? "[data-ink]" : '[data-ink]:not([data-ink="travel"])';
      document.querySelectorAll<HTMLElement>("[data-ink-figure]").forEach((figure, i) => {
        const f = figure.getBoundingClientRect();
        if (onlyOnScreen && f.top >= window.innerHeight) return;
        result[`${figure.closest("[id]")?.id ?? "page"} figure ${i}`] = [
          ...figure.querySelectorAll<HTMLElement>(parts),
        ].map((part) => {
          const r = part.getBoundingClientRect();
          return [r.left - f.left, r.top - f.top, r.width, r.height].map((v) => Math.round(v)) as Box;
        });
      });
      return result;
    },
    { onlyOnScreen, travel },
  );

const highlightSizes = (page: Page) =>
  page.locator("mark.hl").evaluateAll((marks) => marks.map((m) => getComputedStyle(m).backgroundSize));

/** The same viewport with reduced motion, where the markup is the finished drawing. */
async function staticDrawing(page: Page, which: Which = {}) {
  const context = await page.context().browser()!.newContext({
    viewport: page.viewportSize()!,
    reducedMotion: "reduce",
  });
  const still = await context.newPage();
  await still.goto("/");
  await still.waitForLoadState("networkidle");
  const result = await drawing(still, which);
  await context.close();
  return result;
}

/** Within a pixel, because a part scaled up from zero can land a subpixel off. */
function expectSameDrawing(actual: Record<string, Box[]>, expected: Record<string, Box[]>) {
  expect(Object.keys(actual)).toEqual(Object.keys(expected));
  for (const [figure, parts] of Object.entries(expected)) {
    parts.forEach((box, i) => {
      const off = box.map((v, k) => Math.abs(v - actual[figure][i][k]));
      expect(Math.max(...off), `${figure}, part ${i}: ${actual[figure][i]} against ${box}`).toBeLessThanOrEqual(1);
    });
  }
}

const started = (page: Page) =>
  page.waitForFunction(() => document.documentElement.classList.contains("fx"), undefined, {
    timeout: 10_000,
  });

test.describe("with motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the effects leave alone whatever is already on screen", async ({ page }) => {
    // Tall enough that the first entry's figure and highlight are in the first view.
    await page.setViewportSize({ width: 1440, height: 1800 });
    // A mark already on screen keeps travelling with the reader's scroll on its
    // CSS timeline, before the effects start and after, so where it sits depends
    // on how far down the figure is, not on the effects. Every other part must match.
    const which = { onlyOnScreen: true, travel: false };
    const expected = await staticDrawing(page, which);
    expect(Object.keys(expected).length, "a figure in the first view").toBeGreaterThan(0);

    await page.goto("/");
    await started(page);
    expectSameDrawing(await drawing(page, which), expected);
    // And none of those figures was handed to the effects to be drawn again.
    const takenOver = await page.evaluate(
      () =>
        [...document.querySelectorAll("[data-ink-figure]")].filter(
          (figure) => figure.getBoundingClientRect().top < window.innerHeight && figure.hasAttribute("data-inked"),
        ).length,
    );
    expect(takenOver).toBe(0);

    const first = page.locator("mark.hl").first();
    await expect(first).toBeInViewport();
    expect(await first.evaluate((m) => getComputedStyle(m).backgroundSize)).toBe("100% 62%");
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    test(`every figure is fully drawn once read past, at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const expected = await staticDrawing(page);

      await page.goto("/");
      await started(page);
      // A reader's pace, so each trigger sees the page go past it.
      const end = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= end; y += viewport.height / 2) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await page.waitForTimeout(60);
      }
      // The longest scrub catches up in 0.4 s.
      await page.waitForTimeout(800);

      expectSameDrawing(await drawing(page), expected);
      expect(await highlightSizes(page)).toEqual(["100% 62%", "100% 62%", "100% 62%"]);

      // At the foot of the page the margin rule has filled all the way down.
      const progress = await page
        .locator(".sheet__progress")
        .evaluate((line) => new DOMMatrixReadOnly(getComputedStyle(line).transform).d);
      expect(progress).toBeCloseTo(1, 2);
    });
  }

  test("an entry's date stays in the margin while it is read", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const entry = page.locator("article#lesion-split");
    const date = entry.locator(".leaf__margin");

    // A quarter and then half of the way down the entry, as fractions of its
    // own height, so that neither stop is past its end.
    const into = (share: number) =>
      entry.evaluate(
        (el, share) =>
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * share,
            behavior: "instant",
          }),
        share,
      );

    await into(0.25);
    const before = await date.boundingBox();
    await into(0.5);
    const after = await date.boundingBox();

    expect(before, "the date is drawn").not.toBeNull();
    // On screen, under the contents bar, and it did not move with the page.
    expect(before!.y).toBeGreaterThan(60);
    expect(before!.y).toBeLessThan(140);
    expect(after!.y).toBeCloseTo(before!.y, 0);
  });
});

test.describe("page one's specks", () => {
  test.use({ reducedMotion: "no-preference" });

  /** Painted canvas pixels inside and outside the line boxes of page one's text. */
  const paint = (page: Page) =>
    page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("canvas.specks")!;
      const data = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      const dpr = canvas.width / canvas.clientWidth;
      const box = canvas.getBoundingClientRect();
      const text = new Uint8Array(canvas.width * canvas.height);
      const walk = document.createTreeWalker(document.getElementById("top")!, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let node = walk.nextNode(); node; node = walk.nextNode()) {
        if (!node.textContent?.trim()) continue;
        range.selectNodeContents(node);
        for (const line of range.getClientRects()) {
          const x1 = Math.min(canvas.width, Math.ceil((line.right - box.left) * dpr));
          const y1 = Math.min(canvas.height, Math.ceil((line.bottom - box.top) * dpr));
          for (let y = Math.max(0, Math.floor((line.top - box.top) * dpr)); y < y1; y++) {
            for (let x = Math.max(0, Math.floor((line.left - box.left) * dpr)); x < x1; x++) {
              text[y * canvas.width + x] = 1;
            }
          }
        }
      }
      let under = 0;
      let around = 0;
      for (let i = 0; i < text.length; i++) {
        if (data[i * 4 + 3] === 0) continue;
        if (text[i]) under++;
        else around++;
      }
      return { under, around };
    });

  /** A cheap fingerprint of what the canvas holds right now. */
  const frame = (page: Page) =>
    page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("canvas.specks")!;
      const data = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      let hash = 0;
      for (let i = 3; i < data.length; i += 4 * 13) hash = (hash * 31 + data[i]) >>> 0;
      return hash;
    });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`never draw under the writing, on the ${colorScheme} page`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      await page.locator("canvas.specks.is-on").waitFor({ timeout: 15_000 });
      const { under, around } = await paint(page);
      expect(around, "specks drawn around the text").toBeGreaterThan(0);
      expect(under, "painted pixels under page one's text").toBe(0);
    });
  }

  test("stop while page one is off screen", async ({ page }) => {
    await page.goto("/");
    await page.locator("canvas.specks.is-on").waitFor({ timeout: 15_000 });
    const a = await frame(page);
    await page.waitForTimeout(400);
    expect(await frame(page), "the specks move while page one is seen").not.toBe(a);

    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await page.waitForTimeout(300);
    const b = await frame(page);
    await page.waitForTimeout(400);
    expect(await frame(page), "nothing is drawn while page one is away").toBe(b);
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the effects are never fetched, and the page stays as drawn", async ({ page }) => {
    const fetched: string[] = [];
    page.on("request", (request) => {
      if (/\/assets\/(effects|specks)-[\w-]+\.js$/.test(new URL(request.url()).pathname)) {
        fetched.push(request.url());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.mouse.wheel(0, 2400);
    // Past the 2 s ceiling the loader gives the idle callback.
    await page.waitForTimeout(2_500);

    expect(fetched).toEqual([]);
    await expect(page.locator("canvas.specks")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/\bfx\b/);
    expect(await highlightSizes(page)).toEqual(["100% 62%", "100% 62%", "100% 62%"]);
  });
});
