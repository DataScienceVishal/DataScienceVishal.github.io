import { test as base, expect } from "@playwright/test";

/*
  The built live page calls the Find the Wrecker server on Azure when someone
  presses Watch, and a live game there costs real money. No test may reach it.
  Every page in the specs that open the live page gets this route first: any
  request to the server's host is answered here with a 503, so the browser
  sees a server that is down and nothing leaves the machine. `liveCalls`
  counts what the page tried to fetch, so a test can show it did try.
*/

export const LIVE_HOST = "find-the-wrecker-api.bravecoast-78fd612a.francecentral.azurecontainerapps.io";

export const test = base.extend<{ liveCalls: string[] }>({
  liveCalls: [
    async ({ page }, use) => {
      const calls: string[] = [];
      await page.route(`https://${LIVE_HOST}/**`, (route) => {
        calls.push(route.request().url());
        return route.fulfill({ status: 503, contentType: "text/plain", body: "stubbed in tests" });
      });
      await use(calls);
    },
    { auto: true },
  ],
});

export { expect };
