import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./no-live-server";

/*
  The live Find the Wrecker page as it ships: it offers Watch and connects to
  the configured server only when pressed, never falls back to the
  hand-written sample game (that feed exists only on the dev server), says so
  plainly when the server is down, and meets the home page's bar. The server
  itself is stubbed out in no-live-server.ts, so no test reaches it.
*/

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const viewport of [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
]) {
  test.describe(`the live page at ${viewport.width}px`, () => {
    test.use({ viewport });

    test("offers Watch, plays nothing made up, and says so when the server is down", async ({ page, liveCalls }) => {
      await page.goto("/find-the-wrecker/?feed=sample");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find the Wrecker, played live by LLM agents");
      await expect(page.locator("svg[aria-labelledby=island-title]")).toHaveCount(1);
      // Nothing connects before Watch is pressed.
      expect(liveCalls).toEqual([]);
      await page.getByRole("button", { name: "Watch a game" }).click();
      await expect(page.getByRole("status")).toContainText("Lost the line to the game server", { timeout: 15_000 });
      // It tried the configured server, which the stub answered, and no sample game appeared.
      expect(liveCalls.some((url) => url.endsWith("/live"))).toBe(true);
      await expect(page.getByText("Live game, played by")).toHaveCount(0);
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
        await expect(page.getByRole("button", { name: "Watch a game" })).toBeVisible();
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      });
    }
  });
}
