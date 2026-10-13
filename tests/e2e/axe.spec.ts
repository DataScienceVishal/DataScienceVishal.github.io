import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openEveryPanel } from "./open-panels";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const THEMES = ["light", "dark"] as const;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

type Theme = (typeof THEMES)[number];
type AxeRule = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];

/** One line per failing element, so a failure prints as a list and not as a JSON dump. */
function perElement(rules: AxeRule[]): string[] {
  return rules.flatMap((rule) =>
    rule.nodes.map((node) => {
      const fix = (node.failureSummary ?? "").replace(/\s*\n\s*/g, " ");
      return `${rule.id} (${rule.impact ?? "no impact given"}) at ${node.target.join(" ")}: ${rule.help}. ${fix}`;
    }),
  );
}

/** Stores the reader's choice before any page script runs, as a returning visitor would have it. */
async function loadInTheme(page: Page, theme: Theme) {
  await page.addInitScript((choice) => {
    try {
      localStorage.setItem("theme", choice);
    } catch {
      // about:blank has no storage. Only the site's own origin matters here.
    }
  }, theme);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

for (const theme of THEMES) {
  for (const viewport of VIEWPORTS) {
    test.describe(`${theme} page at ${viewport.width}px`, () => {
      test.use({ viewport });

      test.beforeEach(async ({ page }) => {
        await loadInTheme(page, theme);
      });

      test("has no axe violations with the working panels closed", async ({ page }) => {
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(perElement(results.violations)).toEqual([]);
      });

      test("has no axe violations with the working panels open", async ({ page }) => {
        await openEveryPanel(page);
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(perElement(results.violations)).toEqual([]);
      });
    });
  }
}

/*
  The scans above measure colour contrast for almost none of the text. axe marks
  nearly every text node "incomplete" rather than passing or failing it, for two
  reasons: the ruled grid on <body> is a background image, and the red margin
  rule is a ::before box drawn behind the text. axe will not guess a background
  through either, and incomplete results do not fail a scan.

  So this check swaps the grid for a flat fill in the grid's own line colour and
  removes the pseudo-element boxes. In both themes the line colour is the ground
  with less contrast against the text than the paper itself, so text that passes
  here passes wherever it crosses a grid line. Text on its own background, such
  as the ink button, is measured against that background as before.

  The highlighter stroke is a gradient too, so axe cannot read it either. It is
  one flat colour drawn as an image only so that it can sweep in, and here it
  becomes that colour as a fill, over the grid like everything else.

  Page one's specks are a canvas, which axe cannot read at all, and they are
  erased from every line of text, so the text over them is on bare paper. The
  specks tests check that erasure pixel by pixel; here the canvas goes.
*/
test.describe("text contrast", () => {
  for (const theme of THEMES) {
    test(`all text on the ${theme} page clears AA against the grid line colour`, async ({ page }) => {
      await loadInTheme(page, theme);
      await openEveryPanel(page);
      await page.addStyleTag({
        content: `
          body { background-image: none !important; background-color: var(--grid) !important; }
          *::before, *::after { content: none !important; }
          mark.hl { background-image: none !important; background-color: var(--highlight) !important; }
          canvas.specks { display: none !important; }
        `,
      });

      const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
      expect(perElement(results.violations)).toEqual([]);
      // A node axe could not judge is not a pass, so an unjudged node fails the test too.
      expect(perElement(results.incomplete)).toEqual([]);
      // And enough text was measured for the result to mean something.
      expect(results.passes.flatMap((rule) => rule.nodes).length).toBeGreaterThan(100);
    });
  }
});
