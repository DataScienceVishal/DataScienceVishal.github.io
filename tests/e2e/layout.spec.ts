import { expect, test, type Page } from "@playwright/test";
import { openEveryPanel } from "./open-panels";

const WIDTHS = [320, 375, 768, 1024, 1280, 1440];

/**
 * Two measurements, because the first cannot fail on its own. <body> has
 * overflow-x: clip, so anything wider than the screen is cut off instead of
 * making the page scroll, and scrollWidth never sees it. The second looks for
 * an element whose box runs past either edge without a scrolling or clipping
 * container of its own to hold it.
 */
async function expectNoOverflow(page: Page, where: string) {
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.scrollWidth, `the page scrolls sideways ${where}`).toBe(sizes.clientWidth);

  const cut = await page.evaluate(() => {
    const edge = document.documentElement.clientWidth;
    const contained = (el: Element) => {
      for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
        if (getComputedStyle(up).overflowX !== "visible") return true;
      }
      return false;
    };
    const found: string[] = [];
    for (const el of document.body.querySelectorAll("*")) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.left >= -1 && box.right <= edge + 1) continue;
      if (contained(el)) continue;
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
      found.push(
        `${el.tagName.toLowerCase()} "${text}" spans ${Math.round(box.left)} to ${Math.round(box.right)}px of ${edge}px`,
      );
    }
    return found;
  });
  expect(cut, `content runs past the edge of the screen ${where}`).toEqual([]);
}

for (const width of WIDTHS) {
  test(`nothing scrolls sideways or runs off the screen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expectNoOverflow(page, "at the top of the page");

    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    // Two frames, so scroll-linked marks have moved to where this position puts them.
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    await expectNoOverflow(page, "at the bottom of the page");

    await openEveryPanel(page);
    await expectNoOverflow(page, "with every working panel open");
  });
}
