"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { siteConfig } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import { requireAdmin } from "@/server/auth/access";
import { generatePasscode, hashPasscode } from "@/server/auth/passcode";
import { getAuthProvider } from "@/server/auth/provider";
import {
  addMember,
  createGallery,
  deleteGallery,
  getGalleryById,
  getGalleryBySlug,
  removeMember,
  setGalleryPasscode,
  updateGallery,
} from "@/server/dal/galleries";
import { createGate, deleteGate, getGateByKey, setGatePasscode } from "@/server/dal/gates";
import {
  deleteCollection,
  getCollectionInGallery,
  revokeGalleryShares,
  revokeMemberShares,
  updateCollection,
} from "@/server/dal/collections";
import { deletePhoto, getPhotoInGallery, listAllPhotos, movePhoto } from "@/server/dal/photos";
import { getStorage, photoKeys } from "@/server/storage";

import {
  checkbox,
  emailSchema,
  optionalDate,
  parseForm,
  slugSchema,
  uuidSchema,
  type FormState,
} from "./shared";

/**
 * Admin actions. Each one calls `requireAdmin()` before anything else and
 * parses its input with Zod.
 */

/** Returned by actions that reveal a passcode, which is shown exactly once. */
export interface PasscodeState extends FormState {
  passcode?: string;
  link?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** Shortest passcode the admin may type. Generated ones are four words. */
const MIN_TYPED_PASSCODE = 12;
const optionalPasscode = z
  .string()
  .trim()
  .max(200)
  .optional()
  .refine(
    (value) => !value || value.length >= MIN_TYPED_PASSCODE,
    `Use at least ${MIN_TYPED_PASSCODE} characters, or leave it empty to generate one`,
  );

const galleryPath = (id: string) => `/admin/galleries/${id}`;

/** Creates a draft gallery and opens it. */
export async function createGalleryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(
    z.object({
      title: z.string().trim().min(1).max(140),
      slug: slugSchema,
      clientName: z.string().trim().max(140).default(""),
      shootDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .or(z.literal("")),
    }),
    formData,
  );
  if (!parsed.ok) return { error: parsed.error };
  const { title, slug, clientName, shootDate } = parsed.data;
  if (await getGalleryBySlug(slug))
    return { error: "A gallery with that link name already exists." };

  const gallery = await createGallery({
    title,
    slug,
    clientName,
    shootDate: shootDate || null,
    expiresAt: new Date(Date.now() + siteConfig.clientArea.defaultExpiryDays * DAY_MS),
  });
  redirect(galleryPath(gallery.id));
}

/** Saves a gallery's settings. */
export async function updateGalleryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(
    z.object({
      id: uuidSchema,
      title: z.string().trim().min(1).max(140),
      description: z.string().trim().max(2000).default(""),
      clientName: z.string().trim().max(140).default(""),
      shootDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .or(z.literal("")),
      status: z.enum(["draft", "published", "archived"]),
      allowDownloads: checkbox,
      allowCollections: checkbox,
      expiresAt: optionalDate,
    }),
    formData,
  );
  if (!parsed.ok) return { error: parsed.error };
  const { id, shootDate, ...values } = parsed.data;
  const found = await updateGallery(id, { ...values, shootDate: shootDate || null });
  if (!found) return { error: "Gallery not found." };
  revalidatePath(galleryPath(id));
  return { message: "Saved." };
}

/**
 * Sets a gallery's passcode (typed, or four generated words) and returns it
 * once. Changing it signs out everyone who used the old one and, unless the
 * admin unticks it, also stops every share link made in the gallery, so
 * nobody who was let in under the old passcode keeps a way back.
 */
export async function setGalleryPasscodeAction(
  _previous: PasscodeState,
  formData: FormData,
): Promise<PasscodeState> {
  await requireAdmin();
  const parsed = parseForm(
    z.object({ id: uuidSchema, passcode: optionalPasscode, revokeShares: checkbox }),
    formData,
  );
  if (!parsed.ok) return { error: parsed.error };
  const gallery = await getGalleryById(parsed.data.id);
  if (!gallery) return { error: "Gallery not found." };

  const passcode = parsed.data.passcode || generatePasscode();
  await setGalleryPasscode(gallery.id, await hashPasscode(passcode));
  const revoked = parsed.data.revokeShares ? await revokeGalleryShares(gallery.id) : 0;
  revalidatePath(galleryPath(gallery.id));
  return {
    passcode,
    link: absoluteUrl(`/clients/g/${gallery.slug}`),
    message:
      revoked > 0 ? `Stopped ${revoked} share ${revoked === 1 ? "link" : "links"}.` : undefined,
  };
}

/** Deletes a gallery and every file stored for it. The slug must be typed to confirm. */
export async function deleteGalleryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(z.object({ id: uuidSchema, confirm: z.string().trim() }), formData);
  if (!parsed.ok) return { error: parsed.error };
  const gallery = await getGalleryById(parsed.data.id);
  if (!gallery) return { error: "Gallery not found." };
  if (parsed.data.confirm !== gallery.slug) return { error: `Type "${gallery.slug}" to confirm.` };

  // Files first: if storage fails, the rows that locate the files still exist.
  const photos = await listAllPhotos(gallery.id);
  const keys = photos.flatMap((photo) => Object.values(photoKeys(photo)));
  if (gallery.archiveKey) keys.push(gallery.archiveKey);
  const storage = await getStorage("private");
  await storage.delete(keys);
  await deleteGallery(gallery.id);
  redirect("/admin");
}

/** Invites a client by email to one gallery, creating their account if needed. */
export async function inviteMemberAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(z.object({ id: uuidSchema, email: emailSchema }), formData);
  if (!parsed.ok) return { error: parsed.error };
  const { id, email } = parsed.data;
  try {
    const user = await getAuthProvider().ensureUser(email);
    await addMember(id, user.id, email);
  } catch (error) {
    console.error("Invite failed", error);
    return { error: "Could not invite that address." };
  }
  revalidatePath(galleryPath(id));
  return { message: `${email} can now sign in at ${absoluteUrl("/clients/sign-in")}.` };
}

/**
 * Removes a client's access to a gallery and stops the share links of the
 * collections they made there.
 */
export async function removeMemberAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const { id, userId } = z
    .object({ id: uuidSchema, userId: uuidSchema })
    .parse(Object.fromEntries(formData));
  if (!(await removeMember(id, userId))) notFound();
  await revokeMemberShares(id, userId);
  revalidatePath(galleryPath(id));
}

/** Admin control over a client's collection: stop its share link, or delete it. */
export async function collectionAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const { id, collectionId, op } = z
    .object({ id: uuidSchema, collectionId: uuidSchema, op: z.enum(["unshare", "delete"]) })
    .parse(Object.fromEntries(formData));
  const collection = await getCollectionInGallery(id, collectionId);
  if (!collection) notFound();
  if (op === "delete") await deleteCollection(collection.id);
  else await updateCollection(collection.id, { shareTokenHash: null });
  revalidatePath(galleryPath(id));
}

/** Per-photo admin operations: set as cover, move earlier or later, delete. */
export async function photoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const { id, photoId, op } = z
    .object({
      id: uuidSchema,
      photoId: uuidSchema,
      op: z.enum(["cover", "earlier", "later", "delete"]),
    })
    .parse(Object.fromEntries(formData));

  if (op === "cover") {
    // The cover must be one of this gallery's own photos.
    if (!(await getPhotoInGallery(id, photoId))) notFound();
    await updateGallery(id, { coverPhotoId: photoId });
  } else if (op === "delete") {
    const photo = await deletePhoto(id, photoId);
    if (photo) await (await getStorage("private")).delete(Object.values(photoKeys(photo)));
  } else {
    await movePhoto(id, photoId, op);
  }
  revalidatePath(galleryPath(id));
}

/** Creates a gate for an unlisted page and returns its passcode once. */
export async function createGateAction(
  _previous: PasscodeState,
  formData: FormData,
): Promise<PasscodeState> {
  await requireAdmin();
  const parsed = parseForm(
    z.object({
      key: slugSchema,
      label: z.string().trim().min(1).max(140),
      passcode: optionalPasscode,
      expiresAt: optionalDate,
    }),
    formData,
  );
  if (!parsed.ok) return { error: parsed.error };
  const { key, label, expiresAt } = parsed.data;
  if (await getGateByKey(key)) return { error: "A gate with that key already exists." };

  const passcode = parsed.data.passcode || generatePasscode();
  await createGate({ key, label, passcodeHash: await hashPasscode(passcode), expiresAt });
  revalidatePath("/admin/gates");
  return { passcode, link: absoluteUrl(`/p/${key}`) };
}

/** Replaces a gate's passcode with a generated one, or deletes the gate. */
export async function gateAction(
  _previous: PasscodeState,
  formData: FormData,
): Promise<PasscodeState> {
  await requireAdmin();
  const parsed = parseForm(
    z.object({ id: uuidSchema, key: slugSchema, op: z.enum(["rotate", "delete"]) }),
    formData,
  );
  if (!parsed.ok) return { error: parsed.error };
  const { id, key, op } = parsed.data;
  revalidatePath("/admin/gates");
  if (op === "delete") {
    if (!(await deleteGate(id))) return { error: "Gate not found." };
    return { message: `Deleted gate "${key}".` };
  }
  const passcode = generatePasscode();
  if (!(await setGatePasscode(id, await hashPasscode(passcode)))) {
    return { error: "Gate not found." };
  }
  return { passcode, link: absoluteUrl(`/p/${key}`) };
}
