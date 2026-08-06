CREATE TYPE "public"."account_status" AS ENUM('active', 'suspended', 'blocked', 'deactivated');--> statement-breakpoint
CREATE TYPE "public"."announcement_category" AS ENUM('news', 'operational', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'content_edited';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'account_edited';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'account_suspended';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'account_blocked';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'account_reactivated';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'account_deactivated';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'announcement_edited';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'announcement_published';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'announcement_unpublished';--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"ticker_text_en" text NOT NULL,
	"ticker_text_fr" text NOT NULL,
	"body_en" text NOT NULL,
	"body_fr" text NOT NULL,
	"category" "announcement_category" DEFAULT 'news' NOT NULL,
	"link" text,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editable_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"content_key" text NOT NULL,
	"value" text NOT NULL,
	"director_note" text,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "account_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editable_content" ADD CONSTRAINT "editable_content_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editable_content" ADD CONSTRAINT "editable_content_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_tenant_idx" ON "announcements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "announcements_status_idx" ON "announcements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "editable_content_tenant_idx" ON "editable_content" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "editable_content_key_idx" ON "editable_content" USING btree ("tenant_id","content_key");