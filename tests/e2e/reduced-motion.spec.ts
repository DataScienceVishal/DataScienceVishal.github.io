import { expect, test, type Page } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

/**
 * Every animation still playing that lasts longer than the 0.01 ms the
 * reduced-motion rule in index.css allows. A scroll-linked animation has no
 * duration in milliseconds at all, so it counts as moving whenever it runs.
 */
const stillMoving = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => {
        if (animation.playState !== "running") return false;
        const duration = animation.effect?.getComputedTiming().duration;
        return typeof duration !== "number" || duration > 0.01;
      })
      .map((animation) => {
        const kind =
          animation instanceof CSSAnimation
            ? `animation ${animation.animationName}`
            : animation instanceof CSSTransition
              ? `transition of ${animation.transitionProperty}`
              : "script animation";
        const target = (animation.effect as KeyframeEffect | null)?.target;
        const on = target ? `${target.tagName.toLowerCase()}.${[...target.classList].join(".")}` : "no element";
        return `${kind} on ${on}`;
      }),
  );

test("nothing is animating once the page has loaded, or after scrolling it", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await stillMoving(page)).toEqual([]);

  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: "instant" }),
  );
  expect(await stillMoving(page)).toEqual([]);
});

test("no 3D model loads, even after the mouse moves and the wheel turns", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    if (/\/models\/|\/LiveModel-/.test(request.url())) requested.push(request.url());
  });

  await page.goto("/");
  await page.mouse.move(200, 200);
  await page.mouse.move(420, 360);
  await page.mouse.wheel(0, 600);
  for (const figure of await page.locator('figure:has(img[src^="/plates/"])').all()) {
    await figure.scrollIntoViewIfNeeded();
    await figure.hover();
  }

  // A live plate would have asked for its chunk well inside this window.
  await page.waitForTimeout(2_000);
  expect(requested).toEqual([]);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Load the 3D model/ })).toHaveCount(0);
});
