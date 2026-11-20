// ## WRITTEN BY AI ##
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PUBLIC_PAGES = [
  "/",
  "/about",
  "/work",
  "/research",
  "/blog",
  "/blog/welcome",
  "/projects",
  "/photos",
  "/photos/sample-album",
  "/projects/sample-3d-print",
  "/research/sample-paper",
];

test("home page renders and sends baseline security headers", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const headers = response?.headers() ?? {};
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
});

for (const path of PUBLIC_PAGES) {
  test(`${path} renders with no serious accessibility violations`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(
      serious.map((violation) => `${violation.id}: ${violation.nodes[0]?.html ?? ""}`),
    ).toEqual([]);
  });
}

test("feeds, sitemap and machine-readable routes respond", async ({ request }) => {
  for (const path of [
    "/feed.xml",
    "/atom.xml",
    "/feed.json",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
    "/search.json",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("/clients");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toMatch(/\/clients|\/admin|\/p\//);
});

test("an unknown page is a 404", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
});

test("the photo album opens a lightbox", async ({ page }) => {
  await page.goto("/photos/sample-album");
  await page.getByRole("button", { name: /^Open photo 1/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
