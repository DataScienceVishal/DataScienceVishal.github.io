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
  await expect(page.getByText("Bram is sent ashore").first()).toBeVisible({ timeout: 15_000 });
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

test("lieNotes writes each kind of lie in the claim's own terms", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  const notes = await page.evaluate(async () => {
    const { lieNotes } = await import("/src/deadpan/notes.ts");
    const trail = {
      2: { Bram: "Boathouse", Dev: "Workshop", Ada: "Oil Store" },
      4: { Bram: "Boathouse", Ada: "Kitchen" },
    };
    const bram = {
      name: "Bram",
      suspect: null,
      speech: "",
      fallback: false,
      claims: [
        { tick: 1, room: "Yard", saw: ["Finn"], verdict: "omission", refuted_by: ["Esme"], left_out: ["Esme"], real_room: "Yard" },
        { tick: 2, room: "Workshop", saw: [], verdict: "false_place", refuted_by: ["Dev"], left_out: [], real_room: "Boathouse" },
        { tick: 4, room: "Boathouse", saw: ["Ada"], verdict: "invented_sighting", refuted_by: ["Ada"], left_out: [], real_room: "Boathouse" },
      ],
    };
    return lieNotes([bram], "Bram", trail);
  });
  expect(notes).toEqual([
    { room: "Yard", tick: 1, lines: ["Bram: here, saw Finn, tick 1.", "Esme was here too."] },
    { room: "Workshop", tick: 2, lines: ["Bram: here, alone, tick 2.", "False.", "Dev was here alone."] },
    { room: "Boathouse", tick: 2, lines: ["Bram was here at tick 2."] },
    { room: "Boathouse", tick: 4, lines: ["Bram: saw Ada here, tick 4.", "False."] },
    { room: "Kitchen", tick: 4, lines: ["Ada was here at tick 4."] },
  ]);
});

test("lieNotes keeps the claimed room's note when the trail lacks that tick", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  const notes = await page.evaluate(async () => {
    const { lieNotes } = await import("/src/deadpan/notes.ts");
    const claim = { tick: 4, room: "Boathouse", saw: ["Ada"], verdict: "invented_sighting", refuted_by: ["Ada"], left_out: [], real_room: "Boathouse" };
    return lieNotes([{ name: "Bram", suspect: null, speech: "", fallback: false, claims: [claim] }], "Bram", {});
  });
  expect(notes).toEqual([{ room: "Boathouse", tick: 4, lines: ["Bram: saw Ada here, tick 4.", "False."] }]);
});

test("lieNotes is empty when the wrecker says nothing disprovable", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  const notes = await page.evaluate(async () => {
    const { lieNotes } = await import("/src/deadpan/notes.ts");
    const claim = { tick: 2, room: "Yard", saw: [], verdict: "true", refuted_by: [], left_out: [], real_room: "Yard" };
    return lieNotes([{ name: "Bram", suspect: null, speech: "", fallback: false, claims: [claim] }], "Bram", {});
  });
  expect(notes).toEqual([]);
});

test("the map carries the sample's notes from Bram's statement until the result", async ({ page }) => {
  await watchSample(page);
  const island = page.locator("svg[aria-labelledby=island-title]");
  await expect(island.getByText("Bram: here, alone, tick 2.")).toBeVisible({ timeout: 15_000 });
  await expect(island.getByText("Ada was here at tick 4.")).toBeVisible();
  await expect(island.getByText("Bram: saw Ada here, tick 4.")).toBeVisible();
  await expect(page.getByText("Bram is sent ashore").first()).toBeVisible({ timeout: 15_000 });
  await expect(island.getByText("Bram: here, alone, tick 2.")).toHaveCount(0);
});
