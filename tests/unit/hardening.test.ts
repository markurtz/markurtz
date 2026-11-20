// ## WRITTEN BY AI ##
import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env";
import { signOgText, verifyOgText } from "@/lib/seo/og";
import { isAdminUser } from "@/server/auth/access";
import { clientIp } from "@/server/auth/request";
import { viewUrlBucket, VIEW_URL_BUCKET_SECONDS, VIEW_URL_SECONDS } from "@/server/media";
import { attachmentDisposition } from "@/server/storage";
import { createLocalStorage } from "@/server/storage/local";

const headersOf = (values: Record<string, string>) => new Headers(values);

describe("development drivers", () => {
  it("are refused in a production build unless explicitly allowed", () => {
    expect(() => parseEnv({ NODE_ENV: "production", AUTH_DRIVER: "dev" })).toThrow(/AUTH_DRIVER/);
    expect(() => parseEnv({ NODE_ENV: "production", STORAGE_DRIVER: "local" })).toThrow(
      /STORAGE_DRIVER/,
    );
    const allowed = parseEnv({
      NODE_ENV: "production",
      AUTH_DRIVER: "dev",
      STORAGE_DRIVER: "local",
      ALLOW_INSECURE_DEV_DRIVERS: "1",
    });
    expect(allowed.AUTH_DRIVER).toBe("dev");
  });

  it("are refused on Vercel even with the opt-in", () => {
    const vercel = { VERCEL: "1", ALLOW_INSECURE_DEV_DRIVERS: "1" };
    expect(() => parseEnv({ ...vercel, AUTH_DRIVER: "dev" })).toThrow(/Vercel/);
    expect(() => parseEnv({ ...vercel, STORAGE_DRIVER: "local" })).toThrow(/Vercel/);
  });

  it("stay available for local development", () => {
    expect(parseEnv({ NODE_ENV: "development", AUTH_DRIVER: "dev" }).AUTH_DRIVER).toBe("dev");
  });
});

describe("clientIp", () => {
  it("prefers the header the platform sets over one a client can send", () => {
    const headers = headersOf({
      "x-forwarded-for": "6.6.6.6, 10.0.0.1",
      "x-vercel-forwarded-for": "1.2.3.4",
    });
    expect(clientIp(headers)).toBe("1.2.3.4");
  });

  it("uses a configured edge header first", () => {
    const headers = headersOf({
      "cf-connecting-ip": "9.9.9.9",
      "x-vercel-forwarded-for": "1.2.3.4",
    });
    expect(clientIp(headers, "cf-connecting-ip")).toBe("9.9.9.9");
    // An unconfigured Cloudflare header is ignored, since anyone could send it.
    expect(clientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to the first forwarded address, then to one shared bucket", () => {
    expect(clientIp(headersOf({ "x-forwarded-for": "5.5.5.5, 10.0.0.1" }))).toBe("5.5.5.5");
    expect(clientIp(headersOf({}))).toBe("unknown");
  });
});

describe("isAdminUser", () => {
  const user = { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.com" };

  it("accepts an allowlisted email when no id is pinned", () => {
    expect(isAdminUser(user, { emails: ["admin@example.com"], userIds: [] })).toBe(true);
    expect(isAdminUser(user, { emails: ["other@example.com"], userIds: [] })).toBe(false);
    expect(isAdminUser(null, { emails: ["admin@example.com"], userIds: [] })).toBe(false);
  });

  it("requires the pinned id once one is set", () => {
    const emails = ["admin@example.com"];
    expect(isAdminUser(user, { emails, userIds: [user.id] })).toBe(true);
    // Same address, different account: not the admin.
    const impostor = { ...user, id: "22222222-2222-4222-8222-222222222222" };
    expect(isAdminUser(impostor, { emails, userIds: [user.id] })).toBe(false);
  });
});

describe("attachmentDisposition", () => {
  it("keeps the header ASCII and carries the real name in the RFC 5987 form", () => {
    const value = attachmentDisposition("Café-01.jpg");
    expect(value).toBe(`attachment; filename="Cafe-01.jpg"; filename*=UTF-8''Caf%C3%A9-01.jpg`);
    // A header value must be a ByteString, which is what broke before.
    expect(() => new Headers({ "Content-Disposition": value })).not.toThrow();
  });

  it("neutralizes quotes and line breaks and never leaves the name empty", () => {
    expect(attachmentDisposition('a"b\r\nc.jpg')).toContain('filename="a_b  c.jpg"');
    expect(attachmentDisposition("日本.jpg")).toContain('filename=".jpg"');
    expect(attachmentDisposition("日本")).toContain('filename="download"');
  });
});

describe("Open Graph signing", () => {
  it("accepts only text signed with the same key", () => {
    const signature = signOgText("Hello", "World", "key-a");
    expect(verifyOgText("Hello", "World", signature, "key-a")).toBe(true);
    expect(verifyOgText("Hello!", "World", signature, "key-a")).toBe(false);
    expect(verifyOgText("Hello", "", signature, "key-a")).toBe(false);
    expect(verifyOgText("Hello", "World", signature, "key-b")).toBe(false);
    expect(verifyOgText("Hello", "World", "", "key-a")).toBe(false);
  });
});

describe("signed image URLs", () => {
  it("are identical for every render within the same hour", async () => {
    const storage = createLocalStorage("private");
    const key = "galleries/g/p/thumb.webp";
    const sign = (now: string) =>
      storage.signedGetUrl(key, {
        expiresIn: VIEW_URL_SECONDS,
        signedAt: viewUrlBucket(new Date(now)),
      });
    expect(await sign("2030-01-01T10:05:00Z")).toBe(await sign("2030-01-01T10:55:00Z"));
    expect(await sign("2030-01-01T10:05:00Z")).not.toBe(await sign("2030-01-01T11:05:00Z"));
  });

  it("always have at least an hour left", () => {
    const now = new Date("2030-01-01T10:59:59Z");
    const expires = viewUrlBucket(now).getTime() + VIEW_URL_SECONDS * 1000;
    expect(expires - now.getTime()).toBeGreaterThan(VIEW_URL_BUCKET_SECONDS * 1000);
  });
});
