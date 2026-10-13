import { expect, test, type Page } from "@playwright/test";

const EMAIL = "vishalkhan251@gmail.com";

const storedTheme = (page: Page) => page.evaluate(() => localStorage.getItem("theme"));
const groundColour = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("theme toggle", () => {
  test("switches to the dark page and back, and the choice survives a reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    const toggle = page.getByRole("button", { name: "Dark page" });

    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    const lightGround = await groundColour(page);

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await groundColour(page)).not.toBe(lightGround);
    expect(await storedTheme(page)).toBe("dark");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await groundColour(page)).toBe(lightGround);
    expect(await storedTheme(page)).toBe("light");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`with nothing stored, the page follows an OS set to ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      await expect(page.getByRole("button", { name: "Dark page" })).toHaveAttribute(
        "aria-pressed",
        String(scheme === "dark"),
      );
      expect(await storedTheme(page)).toBeNull();
    });
  }

  test("follows the OS while nothing is stored, and stops once the reader chooses", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Back to light by the reader's own hand. From here the OS should not move it.
    await page.getByRole("button", { name: "Dark page" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "light" });
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(html).toHaveAttribute("data-theme", "light");
  });
});

test.describe("copy email", () => {
  /*
    Reduced motion keeps the 3D plates out of this test. The click is also the
    first mouse move, which is what a plate waits for, and in this headless
    browser WebGL runs in software: a model compiling its shaders delayed the
    button's 2.8 s reset past the timeout. That is a plate cost, tested in
    plates.spec.ts, not a copy-button behaviour.
  */
  test.use({ permissions: ["clipboard-read", "clipboard-write"], reducedMotion: "reduce" });

  const PLACES = ["on page one", "in the contact section"];

  PLACES.forEach((place, index) => {
    test(`the copy button ${place} puts the address on the clipboard and says so`, async ({ page }) => {
      await page.goto("/");
      const button = page.getByRole("button", { name: "Copy email" }).nth(index);
      const statusId = await button.getAttribute("aria-describedby");
      expect(statusId).toBeTruthy();

      const status = page.locator(`[id="${statusId}"]`);
      await expect(status).toHaveAttribute("aria-live", "polite");
      await expect(status).toHaveText("");

      // The click renames the button, so hold on to it by what it points at.
      const same = page.locator(`button[aria-describedby="${statusId}"]`);
      await button.click();

      await expect(same).toHaveAccessibleName("Copied");
      await expect(status).toContainText(EMAIL);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);

      // And it settles back, so a second copy reads the same as the first.
      await expect(same).toHaveAccessibleName("Copy email", { timeout: 6_000 });
      await expect(status).toHaveText("");
    });
  });
});
