"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { hashToken, verifyPasscode } from "@/server/auth/passcode";
import { getRequestInfo } from "@/server/auth/request";
import { addGrant, newGrant, type GrantKind } from "@/server/auth/session";
import { evaluateCollectionAccess, isExpired, requirePrivateArea } from "@/server/auth/access";
import { getCollectionByTokenHash } from "@/server/dal/collections";
import { recordEvent } from "@/server/dal/events";
import { getGalleryById, getGalleryBySlug } from "@/server/dal/galleries";
import { getGateByKey } from "@/server/dal/gates";
import {
  consumeAttempt,
  resetRateLimit,
  UNLOCK_RESOURCE_RULE,
  UNLOCK_RULE,
} from "@/server/rate-limit";

import { parseForm, passcodeSchema, slugSchema, type FormState } from "./shared";

/**
 * Passcode entry for galleries, shared collections and gated pages.
 *
 * Every failure returns the same message whether the resource is missing,
 * unpublished, expired or the passcode is wrong, so names cannot be enumerated.
 */

const GENERIC_ERROR = "That passcode is not right, or this link is no longer available.";
const LOCKED_OUT = "Too many attempts. Please wait 15 minutes and try again.";

interface Target {
  kind: GrantKind;
  /** Rate limit and log identity, present even when the resource does not exist. */
  name: string;
  /** The resource, only if it currently accepts passcodes. */
  resource?: { id: string; accessVersion: number; passcodeHash: string | null };
  event: { galleryId?: string; collectionId?: string; gateId?: string };
}

async function attemptUnlock(target: Target, passcode: string): Promise<FormState | undefined> {
  const request = await getRequestInfo();
  const rateKey = `unlock:${target.kind}:${target.name}:${request.ipHash}`;
  const resourceKey = `unlock-all:${target.kind}:${target.name}`;
  // Count the attempt before checking the passcode. Counting afterwards would
  // let parallel requests all pass the check before any of them is recorded.
  const [visitorOk, resourceOk] = await Promise.all([
    consumeAttempt(rateKey, UNLOCK_RULE),
    consumeAttempt(resourceKey, UNLOCK_RESOURCE_RULE),
  ]);
  if (!visitorOk || !resourceOk) return { error: LOCKED_OUT };

  // Always run the hash comparison, so timing does not reveal whether the resource exists.
  const matches = await verifyPasscode(passcode, target.resource?.passcodeHash ?? null);
  if (!matches || !target.resource) {
    await recordEvent({ kind: "unlock_fail", ...target.event, ...request });
    return { error: GENERIC_ERROR };
  }

  await resetRateLimit(rateKey);
  await addGrant(newGrant(target.kind, target.resource.id, target.resource.accessVersion));
  await recordEvent({ kind: "unlock_ok", ...target.event, ...request });
  return undefined;
}

/** Unlocks a client gallery with its passcode. */
export async function unlockGallery(_previous: FormState, formData: FormData): Promise<FormState> {
  requirePrivateArea("clientGalleries");
  const parsed = parseForm(z.object({ slug: slugSchema, passcode: passcodeSchema }), formData);
  if (!parsed.ok) return { error: GENERIC_ERROR };
  const { slug, passcode } = parsed.data;

  const gallery = await getGalleryBySlug(slug);
  const open = gallery && gallery.status === "published" && !isExpired(gallery.expiresAt);
  const failure = await attemptUnlock(
    {
      kind: "gallery",
      name: slug,
      resource: open ? gallery : undefined,
      event: { galleryId: gallery?.id },
    },
    passcode,
  );
  if (failure) return failure;
  redirect(`/clients/g/${slug}`);
}

/** Unlocks a shared collection that has its own passcode. */
export async function unlockCollection(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  requirePrivateArea("clientGalleries");
  const parsed = parseForm(
    z.object({ token: z.string().min(20).max(200), passcode: passcodeSchema }),
    formData,
  );
  if (!parsed.ok) return { error: GENERIC_ERROR };
  const { token, passcode } = parsed.data;

  const tokenHash = hashToken(token);
  const collection = await getCollectionByTokenHash(tokenHash);
  const gallery = collection ? await getGalleryById(collection.galleryId) : undefined;
  // "locked" is the only state in which entering a passcode can help.
  const decision = evaluateCollectionAccess({ collection, gallery, grants: [] });
  const open = decision.allowed === false && decision.reason === "locked";
  const failure = await attemptUnlock(
    {
      kind: "collection",
      name: tokenHash,
      resource: open ? collection : undefined,
      event: { galleryId: gallery?.id, collectionId: collection?.id },
    },
    passcode,
  );
  if (failure) return failure;
  redirect(`/clients/c/${token}`);
}

/** Unlocks a gated page. */
export async function unlockGate(_previous: FormState, formData: FormData): Promise<FormState> {
  requirePrivateArea("gatedPages");
  const parsed = parseForm(z.object({ key: slugSchema, passcode: passcodeSchema }), formData);
  if (!parsed.ok) return { error: GENERIC_ERROR };
  const { key, passcode } = parsed.data;

  const gate = await getGateByKey(key);
  const open = gate && !isExpired(gate.expiresAt);
  const failure = await attemptUnlock(
    { kind: "gate", name: key, resource: open ? gate : undefined, event: { gateId: gate?.id } },
    passcode,
  );
  if (failure) return failure;
  redirect(`/p/${key}`);
}
