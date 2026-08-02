ALTER TYPE "public"."audit_action" ADD VALUE 'account_claimed';--> statement-breakpoint
DROP INDEX "users_email_tenant_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_complete_setup" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_tenant_idx" ON "users" USING btree ("tenant_id","email");