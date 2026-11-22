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

test("holders come from every disproved wrecker claim, omissions included", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  const holders = await page.evaluate(async () => {
    const { holdersOf } = await import("/src/deadpan/notes.ts");
    const claim = (verdict: string, refuted_by: string[]) =>
      ({ tick: 1, room: "Yard", saw: [], verdict, refuted_by, left_out: [], real_room: "Yard" });
    return holdersOf(
      [
        { name: "Bram", claims: [claim("omission", ["Esme"]), claim("false_place", ["Dev"]), claim("invented_sighting", ["Ada"])], suspect: null, speech: "", fallback: false },
        { name: "Cleo", claims: [claim("false_place", ["Ada"])], suspect: null, speech: "", fallback: false },
      ],
      "Bram",
    );
  });
  expect(holders).toEqual(["Esme", "Dev", "Ada"]);
});

test("the sample marks all three holders and what each did", async ({ page }) => {
  await watchSample(page);
  await expect(page.getByText("Bram is sent ashore")).toBeVisible({ timeout: 15_000 });
  // The statements are list items that start with a name too, so look only at the vote's list.
  const vote = page.getByRole("heading", { name: "The vote" }).locator("xpath=following-sibling::ul[1]");
  for (const [name, used] of [["Dev", true], ["Esme", true], ["Ada", false]] as const) {
    await expect(vote.getByRole("listitem").filter({ hasText: new RegExp(`^${name} `) })).toContainText(
      used ? "held a disproof, used it" : "held a disproof, did not use it",
    );
  }
});

test("no emoji is drawn anywhere while the sample plays, and the legend shows fourteen marks", async ({ page }) => {
  await watchSample(page);
  const pictographs = /\p{Extended_Pictographic}/u;
  for (const moment of ["Tick 2", "Meeting 1", "Bram is sent ashore"]) {
    await expect(page.getByText(moment).first()).toBeVisible({ timeout: 15_000 });
    const text = await page.evaluate(() => document.body.innerText + [...document.querySelectorAll("svg text")].map((t) => t.textContent).join(""));
    expect(text).not.toMatch(pictographs);
  }
  await expect(page.locator("#legend-heading + dl svg[role=img]")).toHaveCount(14);
});
