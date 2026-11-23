import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./no-live-server";

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

test("no emoji is drawn anywhere while the sample plays, and the legend shows fourteen marks", async ({ page }) => {
  await watchSample(page);
  const pictographs = /\p{Extended_Pictographic}/u;
  for (const moment of ["Tick 2", "Meeting 1", "Bram is sent ashore"]) {
    await expect(page.getByText(moment).first()).toBeVisible({ timeout: 15_000 });
    const text = await page.evaluate(() => document.body.innerText + [...document.querySelectorAll("svg text")].map((t) => t.textContent).join(""));
    expect(text).not.toMatch(pictographs);
    // Dashes in the players' words are set as commas: none may reach the page.
    expect(text).not.toMatch(/[\u2012-\u2015]/);
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

test("the vote is drawn as lines, holders ringed, solid when they used the proof", async ({ page }) => {
  await watchSample(page);
  await expect(page.getByText("Bram is sent ashore").first()).toBeVisible({ timeout: 15_000 });
  const lines = page.locator("[data-vote-lines]");
  await expect(lines.locator("[data-holder=true]")).toHaveCount(3);
  await expect(lines.locator("[data-from=Dev][data-to=Bram][data-used=true]")).toHaveCount(1);
  await expect(lines.locator("[data-from=Esme][data-to=Bram][data-used=true]")).toHaveCount(1);
  await expect(lines.locator("[data-from=Ada][data-to=skip][data-used=false]")).toHaveCount(1);
  await expect(lines).toContainText("I was in the Workshop at tick 2 and he was not.");
  await expect(lines).toContainText("Red solid: held proof and voted for the wrecker. Red dashed: held proof and did not. Grey: everyone else.");
  await expect(lines.locator(".sr-only")).toContainText("Dev voted for Bram");
  await expect(lines.locator(".sr-only")).toContainText("Ada skipped");
});

test("at 375px the vote lines fit the meeting column", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await watchSample(page);
  await expect(page.getByText("Bram is sent ashore").first()).toBeVisible({ timeout: 15_000 });
  const fits = await page.locator("[data-vote-lines]").evaluate((el) => el.scrollWidth <= el.clientWidth);
  expect(fits).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("proofUsed counts each holder once per meeting, and nothing when nobody holds proof", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  const counts = await page.evaluate(async () => {
    const { proofUsed } = await import("/src/deadpan/notes.ts");
    const lie = (refuted_by: string[]) => ({ tick: 2, room: "Workshop", saw: [], verdict: "false_place", refuted_by, left_out: [], real_room: "Boathouse" });
    const said = [{ name: "Bram", suspect: null, speech: "", fallback: false, claims: [lie(["Dev", "Ada"]), lie(["Dev"])] }];
    const votes = [{ name: "Dev", choice: "Bram", reason: "" }, { name: "Ada", choice: "skip", reason: "" }];
    const quiet = [{ name: "Bram", suspect: null, speech: "", fallback: false, claims: [] }];
    return [proofUsed(said, votes, "Bram"), proofUsed(quiet, votes, "Bram")];
  });
  expect(counts).toEqual([{ held: 2, used: 1 }, { held: 0, used: 0 }]);
});

test("the vote and the end screen show the proof used this game", async ({ page }) => {
  await watchSample(page);
  await expect(page.getByText("Proof used this game: 2 of 3")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("The keepers win")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Proof used this game: 2 of 3")).toBeVisible();
});

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const theme of ["light", "dark"] as const) {
  test(`the meeting has no axe violations on the ${theme} page`, async ({ page }) => {
    // At normal speed: at ?fast=1 the notes are up for about a second, less
    // than an axe pass takes.
    test.setTimeout(150_000);
    await page.addInitScript((choice) => {
      try {
        localStorage.setItem("theme", choice);
      } catch {
        // about:blank has no storage.
      }
    }, theme);
    await page.goto("/find-the-wrecker/?feed=sample");
    await page.getByRole("button", { name: "Watch a game" }).last().click();
    const island = page.locator("svg[aria-labelledby=island-title]");
    await expect(island.getByText("Bram: here, alone, tick 2.")).toBeVisible({ timeout: 60_000 });
    const withNotes = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(withNotes.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    // The notes are hidden from assistive technology, so axe never checks their
    // contrast. They sit on bare paper, so check each line against the paper.
    const ratios = await island.locator("g[aria-hidden=true] text").evaluateAll((texts) => {
      const rgb = (c: string) => (c.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
      const lum = ([r, g, b]: number[]) =>
        [r, g, b]
          .map((v) => v / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const probe = document.createElement("span");
      probe.style.color = "var(--paper)";
      document.body.append(probe);
      const paper = lum(rgb(getComputedStyle(probe).color));
      probe.remove();
      return texts.map((t) => {
        const ink = lum(rgb(getComputedStyle(t).fill));
        const [hi, lo] = ink > paper ? [ink, paper] : [paper, ink];
        return { text: t.textContent, ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100 };
      });
    });
    expect(ratios.length).toBeGreaterThan(0);
    expect(ratios.filter((r) => r.ratio < 4.5)).toEqual([]);

    await expect(page.locator("[data-vote-lines] polyline").first()).toBeAttached({ timeout: 60_000 });
    const atResult = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(atResult.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

test("notes on a room with players in it go beside the room, clear of every room and tag", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  const placed = await page.evaluate(async () => {
    const { placeNotes, roomBox, ROOM } = await import("/src/deadpan/Island.tsx");
    const { ISLAND } = await import("/src/deadpan/map.ts");
    const place = placeNotes(ISLAND, ["Cottage", "Kitchen"], ["Cottage"]);
    const boxes = Object.keys(ISLAND.layout).map((name) => ({ name, ...roomBox(ISLAND, name) }));
    const overlaps = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      a.x < b.x + ROOM.w && b.x < a.x + ROOM.w && a.y < b.y + ROOM.h && b.y < a.y + ROOM.h;
    return {
      cottageOutside: place.Cottage.outside,
      cottageHits: boxes.filter((b) => overlaps(place.Cottage, b)).map((b) => b.name),
      kitchenInside: !place.Kitchen.outside,
      kitchenAt: place.Kitchen.x === roomBox(ISLAND, "Kitchen").x && place.Kitchen.y === roomBox(ISLAND, "Kitchen").y,
    };
  });
  expect(placed).toEqual({ cottageOutside: true, cottageHits: [], kitchenInside: true, kitchenAt: true });
});

test("an invented sighting's claim line says where the named player really was", async ({ page }) => {
  await watchSample(page);
  // The map's note for this is hidden from assistive technology, so the claim line must carry it.
  // The statement's own list item contains the claim's too; take the innermost.
  await expect(page.getByRole("listitem").filter({ hasText: "Tick 4, Boathouse, saw Ada" }).last()).toContainText(
    "Ada was in the Kitchen",
    { timeout: 15_000 },
  );
});

test("dashes in the players' words become commas, and a range between digits reads 'to'", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  const out = await page.evaluate(async () => {
    const { commaDashes } = await import("/src/deadpan/dashes.ts");
    const em = "\u2014";
    const en = "\u2013";
    return [
      commaDashes(`taken ${em} I suspect Bram.`),
      commaDashes(`taken${em}I suspect Bram.`),
      commaDashes(`${em} I was in the Yard.`),
      commaDashes(`I was in the Yard ${em}`),
      commaDashes(`I was in the Yard ${em}.`),
      commaDashes(`taken, ${em} I suspect Bram.`),
      commaDashes(`tick 4${en}6 in the Yard`),
      commaDashes(`tick 4 ${en} 6 in the Yard`),
      commaDashes("gpt-5-mini is the odd-one-out"),
      commaDashes(`a\u2012b c\u2015d`),
      // gpt-5-mini writes ticks as "tick4", so a range can end in a word.
      commaDashes(`from tick4${en}tick6 I was in the Yard`),
      commaDashes(`tick 4${en}tick 6`),
      commaDashes(`at tick4 ${em} Bram at tick6`),
      // Only commas the swap itself would make may go; the players' own stay.
      commaDashes("Ada, Bram, Cleo, ..."),
      commaDashes(`I was alone${em}.`),
      commaDashes(`taken, ${em} I suspect Bram.`),
      commaDashes(`word ${em}, word`),
    ];
  });
  expect(out).toEqual([
    "taken, I suspect Bram.",
    "taken, I suspect Bram.",
    "I was in the Yard.",
    "I was in the Yard",
    "I was in the Yard.",
    "taken, I suspect Bram.",
    "tick 4 to 6 in the Yard",
    "tick 4 to 6 in the Yard",
    "gpt-5-mini is the odd-one-out",
    "a, b c, d",
    "from tick4 to tick6 I was in the Yard",
    "tick 4 to tick 6",
    "at tick4, Bram at tick6",
    "Ada, Bram, Cleo, ...",
    "I was alone.",
    "taken, I suspect Bram.",
    "word, word",
  ]);
});

test("the page says that dashes in the players' words are set as commas", async ({ page }) => {
  await page.goto("/find-the-wrecker/?feed=sample&fast=1");
  await expect(page.getByText("The players' words are shown as the model wrote them, except that dashes are set as commas.")).toBeVisible();
});
