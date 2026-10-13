import { expect, test, type Page } from "@playwright/test";

const LOAD_BUTTON = /^Load the 3D model, [\d.]+ (kB|MB)$/;

const allPlates = (page: Page) =>
  page.locator("figure").filter({ has: page.locator('img[src^="/plates/"]') });
const plate = (page: Page, still: "head" | "brain" | "chess") =>
  page.locator("figure").filter({ has: page.locator(`img[src="/plates/${still}.webp"]`) });

/** The lazily loaded 3D chunk and the model files. Nothing else on the page matches. */
const isModelRequest = (url: string) => /\/models\/|\/LiveModel-/.test(url);

/** The same probe the site makes before it offers a live model at all. */
async function webglAvailable(page: Page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  });
}

test.describe("plates with a mouse", () => {
  test("load nothing before the first input, then mount near the reader", async ({ page }) => {
    test.setTimeout(60_000);
    const requested: string[] = [];
    page.on("request", (request) => {
      if (isModelRequest(request.url())) requested.push(request.url());
    });

    await page.goto("/");
    await expect(allPlates(page)).toHaveCount(3);
    await page.waitForLoadState("networkidle");
    await expect(allPlates(page).locator("canvas")).toHaveCount(0);
    expect(requested).toEqual([]);

    if (!(await webglAvailable(page))) {
      // Without WebGL the still is the whole plate: no canvas, and no button offering one.
      await page.mouse.move(200, 200);
      await plate(page, "brain").scrollIntoViewIfNeeded();
      await expect(allPlates(page).locator("canvas")).toHaveCount(0);
      await expect(page.getByRole("button", { name: LOAD_BUTTON })).toHaveCount(0);
      test.skip(true, "WebGL is not available in this browser, so no live model can mount");
    }

    await page.mouse.move(200, 200);
    await expect(plate(page, "head").locator("canvas")).toHaveCount(1, { timeout: 20_000 });
    // Plate 2 is several screens down, so one mouse move at the top must not load it.
    await expect(plate(page, "brain").locator("canvas")).toHaveCount(0);

    await plate(page, "brain").scrollIntoViewIfNeeded();
    await expect(plate(page, "brain").locator("canvas")).toHaveCount(1, { timeout: 20_000 });
  });

  test("a live plate moves on its own while seen, and stops drawing once scrolled away", async ({ page }) => {
    // Software GL draws the head and its sparks slowly: about 50 s locally, and
    // nearly two minutes on a CI runner.
    test.setTimeout(240_000);
    await page.goto("/");
    if (!(await webglAvailable(page))) test.skip(true, "WebGL is not available, so no live model can mount");

    // The input only counts once the plate is listening for it. On a CI runner a
    // mouse move straight after load arrived first and was missed.
    await page.waitForLoadState("networkidle");
    const head = plate(page, "head");
    await head.scrollIntoViewIfNeeded();
    await page.mouse.move(200, 200);
    await page.mouse.move(260, 240);
    const stage = head.locator("[data-motion]");
    await expect(stage).toHaveAttribute("data-motion", "running", { timeout: 90_000 });
    // The still goes once the model has painted. Before that the canvas is
    // empty, and two empty frames would match for the wrong reason.
    await expect(head.locator("img.plate__still")).toHaveAttribute("data-gone", "true", { timeout: 60_000 });

    // No input and no scroll between the two frames: anything that changed, the
    // plate changed by itself, which is what "static" was about.
    await page.waitForTimeout(1_500);
    const first = await head.locator("canvas").screenshot();
    await page.waitForTimeout(1_500);
    const second = await head.locator("canvas").screenshot();
    expect(first.equals(second), "two frames 1.5 s apart are identical").toBe(false);

    // Two and a half screens down: past plate 1, and not yet near plate 2, whose
    // load would hold a software-rendered main thread for seconds.
    await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 2.5, behavior: "instant" }));
    await expect(stage).toHaveAttribute("data-motion", "still");
    await expect(plate(page, "brain").locator("canvas")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(stage).toHaveAttribute("data-motion", "running");
  });
});

test.describe("plates on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("each plate offers a button with its size, and mounts only when tapped", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/");
    await expect(allPlates(page)).toHaveCount(3);

    if (!(await webglAvailable(page))) {
      await expect(page.getByRole("button", { name: LOAD_BUTTON })).toHaveCount(0);
      await expect(allPlates(page).locator("canvas")).toHaveCount(0);
      test.skip(true, "WebGL is not available in this browser, so no button is offered");
    }

    // A touch on the page and a scroll to the bottom are not a request for a model.
    await page.getByRole("heading", { level: 1 }).tap();
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await expect(page.getByRole("button", { name: LOAD_BUTTON })).toHaveCount(3);
    await expect(allPlates(page).locator("canvas")).toHaveCount(0);

    for (const figure of await allPlates(page).all()) {
      const button = figure.getByRole("button", { name: LOAD_BUTTON });
      await expect(button).toBeVisible();
      await expect(figure.locator("canvas")).toHaveCount(0);

      await button.tap();
      await expect(figure.locator("canvas")).toHaveCount(1, { timeout: 20_000 });
      await expect(button).toHaveCount(0);
    }
  });
});
