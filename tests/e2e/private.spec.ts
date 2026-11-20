// ## WRITTEN BY AI ##
import { expect, test, type Page } from "@playwright/test";

import {
  E2E_ADMIN_EMAIL,
  E2E_GALLERY,
  E2E_GATE,
  E2E_OTHER_GALLERY,
  E2E_ROTATE_GALLERY,
  E2E_SIGN_IN_CODE,
} from "./env";

const UNLOCK_LIMIT = 5;
/** The form error. Next.js adds its own empty `role="alert"` route announcer. */
const alert = (page: Page) => page.locator("p[role=alert]");
const galleryPath = (slug: string) => `/clients/g/${slug}`;

async function unlock(page: Page, slug: string, passcode: string) {
  await page.goto(`${galleryPath(slug)}/unlock`);
  await page.getByLabel("Passcode").fill(passcode);
  await page.getByRole("button", { name: "Open" }).click();
}

async function signInAsAdmin(page: Page) {
  await page.goto("/admin/sign-in");
  await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
  await page.getByRole("button", { name: "Send me a code" }).click();
  await page.getByLabel("Code").fill(E2E_SIGN_IN_CODE);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Galleries" })).toBeVisible();
}

test.describe("client gallery", () => {
  test("is closed without a passcode and never cached or indexed", async ({ page }) => {
    const response = await page.goto(galleryPath(E2E_GALLERY.slug));
    await expect(page).toHaveURL(new RegExp(`${galleryPath(E2E_GALLERY.slug)}/unlock$`));
    const headers = response?.headers() ?? {};
    expect(headers["cache-control"]).toContain("no-store");
    expect(headers["x-robots-tag"]).toContain("noindex");
    expect(headers["referrer-policy"]).toBe("no-referrer");
    await expect(page.getByText(E2E_GALLERY.title)).toHaveCount(0);
  });

  test("answers the same for a gallery that does not exist", async ({ page }) => {
    await unlock(page, "no-such-gallery", "wrong-wrong-wrong-wrong");
    await expect(alert(page)).toContainText("That passcode is not right");
  });

  test("opens with the passcode, shows only its own photos and downloads", async ({ page }) => {
    await unlock(page, E2E_GALLERY.slug, "not-the-right-passcode");
    await expect(alert(page)).toContainText("That passcode is not right");

    await unlock(page, E2E_GALLERY.slug, E2E_GALLERY.passcode);
    await expect(page).toHaveURL(new RegExp(`${galleryPath(E2E_GALLERY.slug)}$`));
    await expect(page.getByRole("heading", { level: 1, name: E2E_GALLERY.title })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Open photo/ })).toHaveCount(3);

    // Nothing about the database row or another gallery reaches the browser.
    const html = await page.content();
    expect(html).not.toMatch(/storagePrefix|contentHash|passcodeHash/);
    expect(html).not.toContain(E2E_OTHER_GALLERY.title);

    // This session does not open any other gallery.
    await page.goto(galleryPath(E2E_OTHER_GALLERY.slug));
    await expect(page).toHaveURL(new RegExp(`${galleryPath(E2E_OTHER_GALLERY.slug)}/unlock$`));

    await page.goto(galleryPath(E2E_GALLERY.slug));
    await page.getByRole("checkbox", { name: "Select photo 1" }).click();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download selected" }).click();
    expect((await download).suggestedFilename()).toMatch(/\.zip$/);
  });

  test("shares a collection that shows only its photos, until sharing stops", async ({
    page,
    browser,
  }) => {
    await unlock(page, E2E_GALLERY.slug, E2E_GALLERY.passcode);
    await page.getByRole("checkbox", { name: "Select photo 2" }).click();
    await page.getByRole("button", { name: "Add to collection" }).click();
    await page.getByLabel("Name of the new collection").fill("Album picks");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    await page.goto(`${galleryPath(E2E_GALLERY.slug)}/collections`);
    await page.getByRole("link", { name: /Album picks/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Album picks" })).toBeVisible();
    await page.getByRole("button", { name: "Create share link" }).click();
    const shareUrl = (await page.getByTestId("share-url").textContent()) ?? "";
    expect(shareUrl).toContain("/clients/c/");

    // A visitor with only the link sees that one photo and nothing else.
    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();
    await visitor.goto(new URL(shareUrl).pathname);
    await expect(visitor.getByRole("heading", { level: 1, name: "Album picks" })).toBeVisible();
    await expect(visitor.getByRole("button", { name: /^Open photo/ })).toHaveCount(1);
    await visitor.goto(galleryPath(E2E_GALLERY.slug));
    await expect(visitor).toHaveURL(/\/unlock$/);

    await page.getByRole("button", { name: "Stop sharing" }).click();
    await expect(page.getByRole("button", { name: "Create share link" })).toBeVisible();
    await visitor.goto(new URL(shareUrl).pathname);
    await expect(visitor.getByRole("button", { name: /^Open photo/ })).toHaveCount(0);
    await expect(visitor.getByRole("heading", { level: 1, name: "Album picks" })).toHaveCount(0);
    await visitorContext.close();
  });

  test("locks out repeated wrong passcodes, even for the right one", async ({ page }) => {
    for (let attempt = 0; attempt < UNLOCK_LIMIT; attempt += 1) {
      await unlock(page, E2E_OTHER_GALLERY.slug, `wrong-guess-number-${attempt}`);
      await expect(alert(page)).toContainText("That passcode is not right");
    }
    await unlock(page, E2E_OTHER_GALLERY.slug, E2E_OTHER_GALLERY.passcode);
    await expect(alert(page)).toContainText("Too many attempts");
  });
});

test.describe("admin", () => {
  test("is closed to visitors and to the wrong sign-in code", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/sign-in$/);
    await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
    await page.getByRole("button", { name: "Send me a code" }).click();
    await page.getByLabel("Code").fill("123456");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(alert(page)).toContainText("That code is not right");
  });

  test("rotating a passcode signs clients out and stops share links, and an expired gallery closes", async ({
    page,
    browser,
  }) => {
    const { slug, passcode } = E2E_ROTATE_GALLERY;
    await unlock(page, slug, passcode);
    await expect(page).toHaveURL(new RegExp(`${galleryPath(slug)}$`));

    const adminContext = await browser.newContext();
    const admin = await adminContext.newPage();
    await signInAsAdmin(admin);
    await admin.getByRole("link", { name: E2E_ROTATE_GALLERY.title }).click();
    await admin.getByRole("button", { name: "Change passcode" }).click();
    const newPasscode = (await admin.getByTestId("new-passcode").textContent()) ?? "";
    expect(newPasscode.split("-")).toHaveLength(4);

    // The old session and the old passcode both stop working.
    await page.goto(galleryPath(slug));
    await expect(page).toHaveURL(/\/unlock$/);
    await unlock(page, slug, passcode);
    await expect(alert(page)).toContainText("That passcode is not right");
    await unlock(page, slug, newPasscode);
    await expect(page).toHaveURL(new RegExp(`${galleryPath(slug)}$`));

    // A share link made under the old passcode stops with it.
    await page.getByRole("checkbox", { name: "Select photo 1" }).click();
    await page.getByRole("button", { name: "Add to collection" }).click();
    await page.getByLabel("Name of the new collection").fill("Old guest picks");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.goto(`${galleryPath(slug)}/collections`);
    await page.getByRole("link", { name: /Old guest picks/ }).click();
    await page.getByRole("button", { name: "Create share link" }).click();
    const sharePath = new URL((await page.getByTestId("share-url").textContent()) ?? "").pathname;
    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();
    await visitor.goto(sharePath);
    await expect(visitor.getByRole("button", { name: /^Open photo/ })).toHaveCount(1);

    await admin.reload();
    await expect(admin.getByText("Old guest picks")).toBeVisible();
    await admin.getByRole("button", { name: "Change passcode" }).click();
    await expect(admin.getByText("Stopped 1 share link.")).toBeVisible();
    const response = await visitor.goto(sharePath);
    expect(response?.status()).toBe(404);
    await expect(visitor.getByRole("button", { name: /^Open photo/ })).toHaveCount(0);
    await visitorContext.close();
    await page.goto(galleryPath(slug));
    await expect(page).toHaveURL(/\/unlock$/);
    await unlock(page, slug, (await admin.getByTestId("new-passcode").textContent()) ?? "");
    await expect(page).toHaveURL(new RegExp(`${galleryPath(slug)}$`));

    await admin.getByLabel("Expires on").fill("2020-01-01");
    await admin.getByRole("button", { name: "Save settings" }).click();
    await expect(admin.getByText("Saved", { exact: false }).first()).toBeVisible();
    await page.goto(galleryPath(slug));
    await expect(page).toHaveURL(/\/unlock$/);
    await adminContext.close();
  });
});

test("a gated page opens only with its passcode", async ({ page }) => {
  await page.goto(`/p/${E2E_GATE.key}`);
  await expect(page.getByRole("heading", { level: 1, name: "This page is private" })).toBeVisible();
  await page.getByLabel("Passcode").fill(E2E_GATE.passcode);
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sample gated page" })).toBeVisible();
});
