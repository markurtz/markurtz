/**
 * Database schema for the private area (client galleries, collections, gates).
 *
 * This is the one file under `src/server/` without `import "server-only"`:
 * drizzle-kit and the test harness load it outside of Next.js. It contains
 * table definitions only and no secrets.
 *
 * Row Level Security is enabled on every table with no policies, so Supabase's
 * public API (the `anon` and `authenticated` roles) can read and write nothing.
 * The application connects with the database connection string instead.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  uniqueIndex,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const galleryStatus = pgEnum("gallery_status", ["draft", "published", "archived"]);
export const memberRole = pgEnum("member_role", ["viewer", "owner"]);
export const accessEventKind = pgEnum("access_event_kind", [
  "unlock_ok",
  "unlock_fail",
  "view",
  "download",
  "share_create",
]);

export const galleries = pgTable("galleries", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  clientName: text("client_name").notNull().default(""),
  shootDate: date("shoot_date"),
  coverPhotoId: uuid("cover_photo_id"),
  status: galleryStatus("status").notNull().default("draft"),
  /** Salted scrypt hash. The passcode itself is never stored. */
  passcodeHash: text("passcode_hash"),
  /** Incremented when the passcode changes, which revokes every outstanding session. */
  accessVersion: integer("access_version").notNull().default(1),
  allowDownloads: boolean("allow_downloads").notNull().default(true),
  allowCollections: boolean("allow_collections").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  /** Storage key of a prebuilt zip of all originals, when one was uploaded. */
  archiveKey: text("archive_key"),
  ...timestamps,
}).enableRLS();

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    galleryId: uuid("gallery_id")
      .notNull()
      .references(() => galleries.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    /** Folder in the private bucket holding `original.*`, `preview.webp` and `thumb.webp`. */
    storagePrefix: text("storage_prefix").notNull(),
    /** File extension of the stored original, without the dot. */
    originalExt: text("original_ext").notNull(),
    /** SHA-256 of the original file, which makes uploads idempotent. */
    contentHash: text("content_hash").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    bytes: bigint("bytes", { mode: "number" }).notNull(),
    contentType: text("content_type").notNull(),
    takenAt: timestamp("taken_at", { withTimezone: true }),
    exif: jsonb("exif").$type<Record<string, string>>().notNull().default({}),
    thumbhash: text("thumbhash").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    index("photos_gallery_sort_idx").on(table.galleryId, table.sortOrder),
    unique("photos_gallery_hash_key").on(table.galleryId, table.contentHash),
    // Target of the composite foreign key on collection_photos.
    unique("photos_id_gallery_key").on(table.id, table.galleryId),
  ],
).enableRLS();

export const galleryMembers = pgTable(
  "gallery_members",
  {
    galleryId: uuid("gallery_id")
      .notNull()
      .references(() => galleries.id, { onDelete: "cascade" }),
    /** Id of the user in Supabase Auth (`auth.users`). */
    userId: uuid("user_id").notNull(),
    role: memberRole("role").notNull().default("viewer"),
    invitedEmail: text("invited_email").notNull(),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.galleryId, table.userId] }),
    index("gallery_members_user_idx").on(table.userId),
    index("gallery_members_email_idx").on(table.invitedEmail),
  ],
).enableRLS();

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    galleryId: uuid("gallery_id")
      .notNull()
      .references(() => galleries.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    /** The built-in collection behind the heart button. */
    isFavorites: boolean("is_favorites").notNull().default(false),
    /** Set for collections made by a signed-in client. Null means "owned by the gallery". */
    createdByUser: uuid("created_by_user"),
    createdByName: text("created_by_name"),
    /** SHA-256 of the share token. Null until the collection is shared. */
    shareTokenHash: text("share_token_hash").unique(),
    passcodeHash: text("passcode_hash"),
    accessVersion: integer("access_version").notNull().default(1),
    allowDownloads: boolean("allow_downloads").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("collections_gallery_idx").on(table.galleryId),
    // One Favorites collection per owner in a gallery (a null owner is the
    // gallery itself), so two quick taps on the heart cannot create two.
    uniqueIndex("collections_favorites_key")
      .on(
        table.galleryId,
        sql`coalesce(${table.createdByUser}, '00000000-0000-0000-0000-000000000000'::uuid)`,
      )
      .where(sql`${table.isFavorites}`),
    // Target of the composite foreign key on collection_photos.
    unique("collections_id_gallery_key").on(table.id, table.galleryId),
  ],
).enableRLS();

/**
 * Photos in a collection. `gallery_id` is repeated here so two composite
 * foreign keys can guarantee, in the database, that a collection only ever
 * contains photos from its own gallery.
 */
export const collectionPhotos = pgTable(
  "collection_photos",
  {
    collectionId: uuid("collection_id").notNull(),
    photoId: uuid("photo_id").notNull(),
    galleryId: uuid("gallery_id").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.photoId] }),
    foreignKey({
      name: "collection_photos_collection_fk",
      columns: [table.collectionId, table.galleryId],
      foreignColumns: [collections.id, collections.galleryId],
    }).onDelete("cascade"),
    foreignKey({
      name: "collection_photos_photo_fk",
      columns: [table.photoId, table.galleryId],
      foreignColumns: [photos.id, photos.galleryId],
    }).onDelete("cascade"),
  ],
).enableRLS();

/** Generic passcode pathways for unlisted pages at `/p/<key>`. */
export const gates = pgTable("gates", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  passcodeHash: text("passcode_hash").notNull(),
  accessVersion: integer("access_version").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamps.createdAt,
}).enableRLS();

/** Audit trail. IP addresses are stored only as salted hashes. */
export const accessEvents = pgTable(
  "access_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    kind: accessEventKind("kind").notNull(),
    // The log outlives what it describes: deleting a gallery must not erase
    // the record of who unlocked it or downloaded from it.
    galleryId: uuid("gallery_id").references(() => galleries.id, { onDelete: "set null" }),
    collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "set null" }),
    gateId: uuid("gate_id").references(() => gates.id, { onDelete: "set null" }),
    ipHash: text("ip_hash").notNull(),
    userAgent: text("user_agent").notNull().default(""),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("access_events_at_idx").on(sql`${table.at} desc`),
    index("access_events_gallery_idx").on(table.galleryId),
  ],
).enableRLS();

/** Fixed-window counters for the rate limiter. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.key, table.windowStart] })],
).enableRLS();

export type Gallery = typeof galleries.$inferSelect;
export type NewGallery = typeof galleries.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type Gate = typeof gates.$inferSelect;
export type GalleryMember = typeof galleryMembers.$inferSelect;
export type AccessEvent = typeof accessEvents.$inferSelect;
export type AccessEventKind = (typeof accessEventKind.enumValues)[number];
