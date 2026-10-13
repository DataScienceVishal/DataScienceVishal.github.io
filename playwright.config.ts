import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);

/**
 * Browser checks against the built site, not the dev server. The page ships as
 * prerendered HTML with an inlined stylesheet, and the dev server serves
 * neither, so a test that passed there would say little about what deploys.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI has just run the build as its own step, so it only needs serving.
    command: CI
      ? "npm run preview -- --port 4173 --strictPort"
      : "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !CI,
    // The full build runs before the server starts, and the default 60 s
    // leaves little room for it on a cold runner.
    timeout: 180_000,
  },
});
