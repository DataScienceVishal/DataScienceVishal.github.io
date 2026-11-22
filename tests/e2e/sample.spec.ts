import { expect, test, type Page } from "@playwright/test";

/*
  The live page's meeting visuals can only be watched with the hand-written
  sample game, which exists only on the dev server. ?fast=1 plays it at twenty
  times speed so a test sees the whole game in a few seconds.
*/

export async function watchSample(page: Page) {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  await page.getByRole("button", { name: "Watch a game" }).last().click();
}

test("the sample game plays to its end in a few seconds", async ({ page }) => {
  await watchSample(page);
  await expect(page.getByText("The keepers win")).toBeVisible({ timeout: 15_000 });
});
