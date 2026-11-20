import { defineConfig, devices } from "@playwright/test";

import { E2E_PORT, e2eEnv } from "./tests/e2e/env";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${E2E_PORT}`;
const isCI = Boolean(process.env.CI);
const SERVER_START_TIMEOUT_MS = 300_000;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
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
  // preview deployment), no local server is started. Only the public specs
  // make sense there, because the private ones rely on the seeded database.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // The production build runs with the private areas switched on, an
        // in-process database, local storage and the development sign-in
        // driver (see tests/e2e/env.ts). The database is seeded before the
        // server starts because only one process can open it.
        command: "pnpm build && pnpm e2e:seed && pnpm start",
        env: e2eEnv,
        url: baseURL,
        reuseExistingServer: false,
        timeout: SERVER_START_TIMEOUT_MS,
      },
});
