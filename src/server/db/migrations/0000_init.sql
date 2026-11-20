CREATE TYPE "public"."access_event_kind" AS ENUM('unlock_ok', 'unlock_fail', 'view', 'download', 'share_create');--> statement-breakpoint
CREATE TYPE "public"."gallery_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('viewer', 'owner');--> statement-breakpoint
CREATE TABLE "access_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kind" "access_event_kind" NOT NULL,
	"gallery_id" uuid,
	"collection_id" uuid,
	"gate_id" uuid,
	"ip_hash" text NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collection_photos" (
	"collection_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"gallery_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "collection_photos_collection_id_photo_id_pk" PRIMARY KEY("collection_id","photo_id")
);
--> statement-breakpoint
ALTER TABLE "collection_photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_favorites" boolean DEFAULT false NOT NULL,
	"created_by_user" uuid,
	"created_by_name" text,
	"share_token_hash" text,
	"passcode_hash" text,
	"access_version" integer DEFAULT 1 NOT NULL,
	"allow_downloads" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_share_token_hash_unique" UNIQUE("share_token_hash"),
	CONSTRAINT "collections_id_gallery_key" UNIQUE("id","gallery_id")
);
--> statement-breakpoint
ALTER TABLE "collections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"client_name" text DEFAULT '' NOT NULL,
	"shoot_date" date,
	"cover_photo_id" uuid,
	"status" "gallery_status" DEFAULT 'draft' NOT NULL,
	"passcode_hash" text,
	"access_version" integer DEFAULT 1 NOT NULL,
	"allow_downloads" boolean DEFAULT true NOT NULL,
	"allow_collections" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"archive_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "galleries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "galleries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gallery_members" (
	"gallery_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'viewer' NOT NULL,
	"invited_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_members_gallery_id_user_id_pk" PRIMARY KEY("gallery_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "gallery_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"passcode_hash" text NOT NULL,
	"access_version" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "gates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"storage_prefix" text NOT NULL,
	"original_ext" text NOT NULL,
	"content_hash" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" bigint NOT NULL,
	"content_type" text NOT NULL,
	"taken_at" timestamp with time zone,
	"exif" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"thumbhash" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photos_gallery_hash_key" UNIQUE("gallery_id","content_hash"),
	CONSTRAINT "photos_id_gallery_key" UNIQUE("id","gallery_id")
);
--> statement-breakpoint
ALTER TABLE "photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_gate_id_gates_id_fk" FOREIGN KEY ("gate_id") REFERENCES "public"."gates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_photos" ADD CONSTRAINT "collection_photos_collection_fk" FOREIGN KEY ("collection_id","gallery_id") REFERENCES "public"."collections"("id","gallery_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_photos" ADD CONSTRAINT "collection_photos_photo_fk" FOREIGN KEY ("photo_id","gallery_id") REFERENCES "public"."photos"("id","gallery_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_members" ADD CONSTRAINT "gallery_members_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "access_events_at_idx" ON "access_events" USING btree ("at" desc);--> statement-breakpoint
CREATE INDEX "access_events_gallery_idx" ON "access_events" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "collections_gallery_idx" ON "collections" USING btree ("gallery_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_favorites_key" ON "collections" USING btree ("gallery_id",coalesce("created_by_user", '00000000-0000-0000-0000-000000000000'::uuid)) WHERE "collections"."is_favorites";--> statement-breakpoint
CREATE INDEX "gallery_members_user_idx" ON "gallery_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gallery_members_email_idx" ON "gallery_members" USING btree ("invited_email");--> statement-breakpoint
CREATE INDEX "photos_gallery_sort_idx" ON "photos" USING btree ("gallery_id","sort_order");