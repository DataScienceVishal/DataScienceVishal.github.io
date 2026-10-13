import { expect, test } from "@playwright/test";

/*
  With reduced motion the page scrolls instantly, so each focus move has landed
  by the time it is measured. It also keeps the 3D plates from loading part way
  through the walk: with motion allowed, the first key press counts as the input
  they wait for, and on a machine with WebGL one model held the main thread for
  about four seconds. The focus styles are the same under either setting.
*/
test.use({ reducedMotion: "reduce" });

const MAX_PRESSES = 80;

const VIEWPORTS = [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
];

interface Stop {
  name: string;
  ring: boolean;
  shown: number;
  coveredBy: string | null;
}

test("the first Tab lands on the skip link, and it appears", async ({ page }) => {
  await page.goto("/");
  const skip = page.getByRole("link", { name: "Skip to the entries" });

  // Hidden until focused: a one pixel box, the usual screen-reader-only pattern.
  expect((await skip.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1);

  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport({ ratio: 1 });
  const box = await skip.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(40);
  expect(box?.height ?? 0).toBeGreaterThan(16);
});

for (const viewport of VIEWPORTS) {
  test(`every Tab stop at ${viewport.width}px shows a focus ring and is fully on screen`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const reached: string[] = [];
    const problems: string[] = [];

    for (let press = 0; press < MAX_PRESSES; press++) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate((): Stop | null => {
        const el = document.activeElement as HTMLElement | null;
        // Focus has gone back to the browser, so every stop on the page has been visited.
        if (!el || el === document.body) return null;

        const label = (node: Element) =>
          `${node.tagName.toLowerCase()} "${(node.getAttribute("aria-label") ?? node.textContent ?? "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 50)}"`;

        const style = getComputedStyle(el);
        const ring =
          (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) ||
          style.boxShadow !== "none";

        // The screen, widened by a pixel each way so a sub-pixel overhang is not a failure.
        const { clientWidth, clientHeight } = document.documentElement;
        const box = el.getBoundingClientRect();
        const w = Math.max(0, Math.min(box.right, clientWidth + 1) - Math.max(box.left, -1));
        const h = Math.max(0, Math.min(box.bottom, clientHeight + 1) - Math.max(box.top, -1));
        const shown =
          box.width > 0 && box.height > 0 ? Math.min(1, (w * h) / (box.width * box.height)) : 0;

        // Probe the first line box, so a link that wraps is tested on its text
        // and not in the gap between its two lines. This is what catches a
        // focused element sitting under the sticky header.
        const line = el.getClientRects()[0] ?? box;
        const hit = document.elementFromPoint(line.left + line.width / 2, line.top + line.height / 2);
        const coveredBy = hit && hit !== el && !el.contains(hit) ? label(hit) : null;

        return { name: label(el), ring, shown, coveredBy };
      });

      if (!stop) break;
      reached.push(stop.name);
      if (!stop.ring) problems.push(`${stop.name} has no outline or box-shadow when focused`);
      if (stop.shown < 1) problems.push(`${stop.name} is only ${Math.round(stop.shown * 100)}% on screen`);
      if (stop.coveredBy) problems.push(`${stop.name} is covered by ${stop.coveredBy}`);
    }

    // The header, page one and the contact links alone are more than twenty stops.
    expect(reached.length).toBeGreaterThan(20);
    expect(problems).toEqual([]);
  });
}
