// ## WRITTEN BY AI ##
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/** Architecture rules from AGENTS.md, enforced by reading the source tree. */

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "migrations" ? [] : walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const read = (file: string) => readFileSync(file, "utf8");
const src = walk("src");

describe("module boundaries", () => {
  it("imports the Velite output only inside src/lib/content", () => {
    const offenders = src.filter(
      (file) =>
        /from "#velite"|\.velite/.test(read(file)) &&
        !file.startsWith(path.join("src", "lib", "content")),
    );
    expect(offenders).toEqual([]);
  });

  it("marks every server module as server-only", () => {
    // schema.ts is loaded by drizzle-kit and migrate.ts is a standalone script.
    const exempt = new Set([
      path.join("src", "server", "db", "schema.ts"),
      path.join("src", "server", "db", "migrate.ts"),
    ]);
    const offenders = walk(path.join("src", "server")).filter((file) => {
      if (exempt.has(file)) return false;
      const text = read(file);
      return !text.includes('import "server-only"') && !text.startsWith('"use server"');
    });
    expect(offenders).toEqual([]);
  });

  it("never touches the database directly from a private page or route", () => {
    const offenders = [
      ...walk(path.join("src", "app", "(private)")),
      ...walk(path.join("src", "app", "api", "clients")),
    ].filter((file) =>
      /@\/server\/db\/(client|schema)"/.test(read(file).replace(/import type[^;]+;/g, "")),
    );
    expect(offenders).toEqual([]);
  });

  it("starts every private page with an access guard", () => {
    const pages = walk(path.join("src", "app", "(private)")).filter((file) =>
      file.endsWith("page.tsx"),
    );
    expect(pages.length).toBeGreaterThan(8);
    const offenders = pages.filter(
      (file) =>
        !/require(Admin|GalleryAccess|CollectionAccess|Gate|PrivateArea)\(|getGalleryAccess\(/.test(
          read(file),
        ),
    );
    expect(offenders).toEqual([]);
  });

  it("starts every admin action with requireAdmin", () => {
    const text = read(path.join("src", "server", "actions", "admin.ts"));
    const bodies = text.split(/export async function /).slice(1);
    expect(bodies.length).toBeGreaterThan(5);
    for (const body of bodies) {
      const firstStatement = body.slice(body.indexOf("{") + 1).trim();
      expect(firstStatement.startsWith("await requireAdmin();"), body.slice(0, 40)).toBe(true);
    }
  });

  it("keeps server code and storage keys out of client components", () => {
    const clients = src.filter((file) => read(file).startsWith('"use client"'));
    expect(clients.length).toBeGreaterThan(5);
    for (const file of clients) {
      const text = read(file);
      // Client components may call server actions, and nothing else from src/server.
      const serverImports = [...text.matchAll(/from "@\/server\/([^"]+)"/g)].map(
        (match) => match[1] ?? "",
      );
      expect(
        serverImports.filter((target) => !target.startsWith("actions/")),
        file,
      ).toEqual([]);
      expect(text, file).not.toMatch(/storagePrefix|photoKeys|from "[^"]*site\.config"/);
    }
  });

  it("never exposes a secret through NEXT_PUBLIC_", () => {
    const example = read(".env.example");
    const exposed = [...example.matchAll(/^#?\s*(NEXT_PUBLIC_[A-Z0-9_]+)=/gm)].map(
      (match) => match[1],
    );
    for (const name of exposed) expect(name).not.toMatch(/SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY/);
  });
});
