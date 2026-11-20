import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // When PLAYWRIGHT_BASE_URL points at an already running site (for example a
  // preview deployment), no local server is started.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // CI tests the production build; locally the dev server is faster.
        command: isCI ? "pnpm start" : "pnpm dev",
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
