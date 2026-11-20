import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

const alias = {
  "@": path("./src"),
  "#velite": path("./.velite"),
  // `server-only` throws outside a React Server Components bundle.
  "server-only": path("./tests/setup/server-only.ts"),
};

export default defineConfig({
  test: {
    passWithNoTests: true,
    // Builds the content collections (.velite) before any test imports them.
    globalSetup: ["tests/setup/content.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.{ts,tsx}"],
          environment: "node",
        },
      },
      {
        resolve: { alias },
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.{ts,tsx}"],
          environment: "node",
          // PGlite starts a WASM Postgres per test file.
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
