import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/*
  The live Find the Wrecker page as it ships before the game server has an
  address: it must say so plainly, never fall back to the hand-written sample
  game (that feed exists only on the dev server), and still meet the home
  page's bar.
*/

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const viewport of [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
]) {
  test.describe(`the live page at ${viewport.width}px`, () => {
    test.use({ viewport });

    test("says the server is not running, and plays nothing made up", async ({ page }) => {
      await page.goto("/find-the-wrecker/?feed=sample");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find the Wrecker, played live by LLM agents");
      await expect(page.getByRole("status")).toContainText("The game server is not running yet");
      // The island is drawn, but there is nothing to watch: no button, no players.
      await expect(page.locator("svg[aria-labelledby=island-title]")).toHaveCount(1);
      await expect(page.getByRole("button", { name: /Watch/ })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    });

    for (const theme of ["light", "dark"] as const) {
      test(`has no axe violations on the ${theme} page`, async ({ page }) => {
        await page.addInitScript((choice) => {
          try {
            localStorage.setItem("theme", choice);
          } catch {
            // about:blank has no storage.
          }
        }, theme);
        await page.goto("/find-the-wrecker/");
        await expect(page.getByRole("status")).toBeVisible();
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      });
    }
  });
}
