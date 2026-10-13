import { expect, test } from "@playwright/test";

/*
  The page is prerendered at build, so a reader without JavaScript, and any
  crawler that does not run it, should get the whole text. These tests see
  exactly what the HTML file carries.
*/
test.use({ javaScriptEnabled: false });

const EMAIL = "vishalkhan251@gmail.com";
const ENTRIES = ["scorer-audit", "twicerun", "lesion-split", "twin"];

test("the HTML already has the page heading and all four entry headings", async ({ page }) => {
  await page.goto("/");
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toHaveCount(1);
  await expect(title).toBeVisible();
  await expect(title).toHaveText(/\w{3,}/);

  for (const id of ENTRIES) {
    const heading = page.locator(`article#${id}`).getByRole("heading", { level: 2 });
    await expect(heading, `entry ${id}`).toBeVisible();
    await expect(heading, `entry ${id}`).toHaveText(/\w{3,}/);
  }
});

test("page one says whose notebook it is before any entry starts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vishal Khan");
  await expect(page.getByRole("img", { name: "Vishal Khan, head and shoulders." })).toBeVisible();

  const bio = page.locator("#top p", { hasText: "I started in finance and tax" });
  await expect(bio).toBeVisible();
  const bioBox = await bio.boundingBox();
  const firstEntry = await page.locator("article#scorer-audit").boundingBox();
  expect(bioBox!.y + bioBox!.height).toBeLessThan(firstEntry!.y);
});

test("each entry's measured phrase is highlighted without script", async ({ page }) => {
  await page.goto("/");
  const marks = page.locator("article mark.hl");
  await expect(marks).toHaveCount(3);
  for (const mark of await marks.all()) {
    await expect(mark).toBeVisible();
    expect(await mark.evaluate((m) => getComputedStyle(m).backgroundSize)).toBe("100% 62%");
  }
});

test("controls that need script are hidden, and the address still works", async ({ page }) => {
  await page.goto("/");

  // includeHidden, because a hidden button is left out of the accessibility tree.
  const copy = page.getByRole("button", { name: "Copy email", includeHidden: true });
  await expect(copy).toHaveCount(2);
  for (const button of await copy.all()) await expect(button).toBeHidden();
  await expect(page.getByRole("button", { name: "Dark page", includeHidden: true })).toBeHidden();

  const address = page.getByRole("link", { name: EMAIL });
  await expect(address).toHaveCount(2);
  for (const link of await address.all()) {
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", `mailto:${EMAIL}`);
  }
});
