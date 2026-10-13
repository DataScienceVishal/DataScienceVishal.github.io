import { expect, type Page } from "@playwright/test";

/**
 * Opens every entry's working panel and waits for it to finish unrolling.
 *
 * Done through the DOM rather than by clicking each summary. Any real input is
 * also what lets the 3D plates start loading, and the scans that call this are
 * about the page's text, not about a model compiling shaders mid-scan.
 */
export async function openEveryPanel(page: Page) {
  await page.locator("details").evaluateAll((panels) => {
    for (const panel of panels) (panel as HTMLDetailsElement).open = true;
  });
  await expect(page.locator("details:not([open])")).toHaveCount(0);

  // The body unrolls with a height transition where the browser supports it.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}
