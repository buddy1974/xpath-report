ALTER TYPE "public"."audit_action" ADD VALUE 'content_restored' BEFORE 'account_edited';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'content_version_deleted' BEFORE 'account_edited';--> statement-breakpoint
CREATE TABLE "editable_content_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"content_key" text NOT NULL,
	"value" text NOT NULL,
	"director_note" text,
	"edited_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "editable_content" ADD COLUMN "current_version_id" uuid;--> statement-breakpoint
ALTER TABLE "editable_content_versions" ADD CONSTRAINT "editable_content_versions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editable_content_versions" ADD CONSTRAINT "editable_content_versions_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ecv_tenant_key_created_idx" ON "editable_content_versions" USING btree ("tenant_id","content_key","created_at");--> statement-breakpoint
ALTER TABLE "editable_content" ADD CONSTRAINT "editable_content_current_version_id_editable_content_versions_id_fk" FOREIGN KEY ("current_version_id") REFERENCES "public"."editable_content_versions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- DL-059 backfill: give every pre-existing override a version row so
-- its history isn't empty, then point current_version_id at it.
INSERT INTO "editable_content_versions" ("tenant_id", "content_key", "value", "director_note", "edited_by", "created_at")
SELECT "tenant_id", "content_key", "value", "director_note", "updated_by", "updated_at"
FROM "editable_content";
--> statement-breakpoint
UPDATE "editable_content" ec
SET "current_version_id" = ecv."id"
FROM "editable_content_versions" ecv
WHERE ecv."tenant_id" = ec."tenant_id" AND ecv."content_key" = ec."content_key" AND ec."current_version_id" IS NULL;