import "server-only";

import { notFound, redirect } from "next/navigation";

import { adminEmails } from "@/lib/env";
import { privateAreaReady } from "@/lib/features";
import { siteConfig } from "@/lib/site";
import { getCollectionByTokenHash, type CollectionOwner } from "@/server/dal/collections";
import { getGalleryById, getGalleryBySlug, getMemberRole } from "@/server/dal/galleries";
import { getGateByKey } from "@/server/dal/gates";
import type { Collection, Gallery, Gate } from "@/server/db/schema";

import { hashToken } from "./passcode";
import { getAuthProvider, type AuthUser } from "./provider";
import { readGrants, type Grant, type GrantKind } from "./session";

/**
 * Authorization for the private area, in one place. Every page, server action
 * and route handler under `(private)` starts with one of the `require*`
 * functions. They return the authorized resource and what the caller may do
 * with it, or they redirect. The data access layer is only ever called with
 * ids that came out of these functions.
 *
 * The decisions themselves are pure functions (`evaluate*`), so every allow
 * and deny path is unit tested without a database.
 */

/** What an authorized visitor may do. */
export interface Capabilities {
  canDownload: boolean;
  canManageCollections: boolean;
}

export type Decision =
  { allowed: true } | { allowed: false; reason: "missing" | "unavailable" | "expired" | "locked" };

const DENY = (reason: Exclude<Decision, { allowed: true }>["reason"]): Decision => ({
  allowed: false,
  reason,
});
const ALLOW: Decision = { allowed: true };

/** True when an expiry is set and has passed. */
export function isExpired(expiresAt: Date | null | undefined, now: Date = new Date()): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime());
}

/** True when the session holds an unexpired grant for the resource at its current version. */
export function hasValidGrant(
  grants: Grant[],
  kind: GrantKind,
  resource: { id: string; accessVersion: number },
  now: Date = new Date(),
): boolean {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  return grants.some(
    (grant) =>
      grant.kind === kind &&
      grant.id === resource.id &&
      grant.v === resource.accessVersion &&
      grant.exp > nowSeconds,
  );
}

/** Whether a visitor may open a gallery. */
export function evaluateGalleryAccess(input: {
  gallery: Gallery | undefined;
  grants: Grant[];
  isAdmin?: boolean;
  isMember?: boolean;
  now?: Date;
}): Decision {
  const { gallery, grants, isAdmin = false, isMember = false, now = new Date() } = input;
  if (!gallery) return DENY("missing");
  // The admin can preview drafts and expired galleries.
  if (isAdmin) return ALLOW;
  if (gallery.status !== "published") return DENY("unavailable");
  if (isExpired(gallery.expiresAt, now)) return DENY("expired");
  if (isMember) return ALLOW;
  // A gallery with no passcode set cannot be unlocked by passcode at all.
  if (gallery.passcodeHash && hasValidGrant(grants, "gallery", gallery, now)) return ALLOW;
  return DENY("locked");
}

/** Whether a visitor may open a shared collection. */
export function evaluateCollectionAccess(input: {
  collection: Collection | undefined;
  gallery: Gallery | undefined;
  grants: Grant[];
  now?: Date;
}): Decision {
  const { collection, gallery, grants, now = new Date() } = input;
  if (!collection || !gallery || !collection.shareTokenHash) return DENY("missing");
  if (gallery.status !== "published") return DENY("unavailable");
  if (isExpired(gallery.expiresAt, now) || isExpired(collection.expiresAt, now))
    return DENY("expired");
  if (!collection.passcodeHash) return ALLOW;
  return hasValidGrant(grants, "collection", collection, now) ? ALLOW : DENY("locked");
}

/** Whether a visitor may open a gated page. */
export function evaluateGateAccess(input: {
  gate: Gate | undefined;
  grants: Grant[];
  now?: Date;
}): Decision {
  const { gate, grants, now = new Date() } = input;
  if (!gate) return DENY("missing");
  if (isExpired(gate.expiresAt, now)) return DENY("expired");
  return hasValidGrant(grants, "gate", gate, now) ? ALLOW : DENY("locked");
}

/** Download permission for a shared collection can never exceed its gallery's. */
export function collectionCanDownload(collection: Collection, gallery: Gallery): boolean {
  return collection.allowDownloads && gallery.allowDownloads;
}

// ── Guards ──────────────────────────────────────────────────────────────────

/** 404s unless the private area is switched on and configured. */
export function requirePrivateArea(
  feature: "clientGalleries" | "gatedPages" | "any" = "any",
): void {
  const on = feature === "any" ? true : siteConfig.features[feature];
  if (!on || !privateAreaReady()) notFound();
}

/** The signed-in account for this request, or null. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return getAuthProvider().getUser();
}

/** True when the account is on the admin allowlist. */
export function isAdminUser(user: AuthUser | null): boolean {
  return Boolean(user && adminEmails().includes(user.email.toLowerCase()));
}

/** Requires the admin. Signed-out visitors go to sign-in; other accounts see a 404. */
export async function requireAdmin(): Promise<AuthUser> {
  requirePrivateArea();
  const user = await getCurrentUser();
  if (!user) redirect("/admin/sign-in");
  if (!isAdminUser(user)) notFound();
  return user;
}

/** An authorized gallery and what the visitor may do in it. */
export interface GalleryAccess {
  gallery: Gallery;
  capabilities: Capabilities;
  /** Who owns collections created in this session. */
  owner: CollectionOwner;
  isAdmin: boolean;
}

/** Resolves gallery access without redirecting. Used by actions and route handlers. */
export async function getGalleryAccess(slug: string): Promise<GalleryAccess | null> {
  requirePrivateArea("clientGalleries");
  const [gallery, grants, user] = await Promise.all([
    getGalleryBySlug(slug),
    readGrants(),
    getCurrentUser(),
  ]);
  const isAdmin = isAdminUser(user);
  const isMember = Boolean(gallery && user && (await getMemberRole(gallery.id, user.id)));
  const decision = evaluateGalleryAccess({ gallery, grants, isAdmin, isMember });
  if (!decision.allowed || !gallery) return null;
  return {
    gallery,
    isAdmin,
    capabilities: {
      canDownload: gallery.allowDownloads || isAdmin,
      canManageCollections: gallery.allowCollections,
    },
    // Members own their collections. Passcode sessions share gallery-owned ones.
    owner: isMember && user ? { userId: user.id, name: user.email } : {},
  };
}

/**
 * Requires access to a gallery. Everyone else is sent to the unlock page,
 * which looks the same whether or not the gallery exists.
 */
export async function requireGalleryAccess(slug: string): Promise<GalleryAccess> {
  const access = await getGalleryAccess(slug);
  if (!access) redirect(`/clients/g/${encodeURIComponent(slug)}/unlock`);
  return access;
}

/** An authorized shared collection, or the fact that it needs a passcode. */
export type CollectionAccess =
  | { status: "ok"; collection: Collection; gallery: Gallery; capabilities: Capabilities }
  | { status: "locked" }
  | { status: "denied" };

/** Resolves access to a shared collection from its share token. */
export async function getCollectionAccess(token: string): Promise<CollectionAccess> {
  requirePrivateArea("clientGalleries");
  const collection = await getCollectionByTokenHash(hashToken(token));
  const gallery = collection ? await getGalleryById(collection.galleryId) : undefined;
  const decision = evaluateCollectionAccess({ collection, gallery, grants: await readGrants() });
  if (decision.allowed && collection && gallery) {
    return {
      status: "ok",
      collection,
      gallery,
      capabilities: {
        canDownload: collectionCanDownload(collection, gallery),
        canManageCollections: false,
      },
    };
  }
  return decision.allowed === false && decision.reason === "locked"
    ? { status: "locked" }
    : { status: "denied" };
}

/** Requires access to a shared collection, or 404s. A locked collection is returned as such. */
export async function requireCollectionAccess(
  token: string,
): Promise<Exclude<CollectionAccess, { status: "denied" }>> {
  const access = await getCollectionAccess(token);
  if (access.status === "denied") notFound();
  return access;
}

/** Resolves access to a gate: the gate when unlocked, "locked" otherwise. */
export async function requireGate(
  key: string,
): Promise<{ status: "ok"; gate: Gate } | { status: "locked" }> {
  requirePrivateArea("gatedPages");
  const gate = await getGateByKey(key);
  const decision = evaluateGateAccess({ gate, grants: await readGrants() });
  // Missing and expired gates look exactly like a locked one, so keys cannot be enumerated.
  return decision.allowed && gate ? { status: "ok", gate } : { status: "locked" };
}
