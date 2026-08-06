CREATE TYPE "public"."reagent_item_type" AS ENUM('antibody', 'equipment');--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'reagent_item_added';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'reagent_item_updated';--> statement-breakpoint
CREATE TABLE "reagent_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"register_key" text,
	"type" "reagent_item_type" NOT NULL,
	"name" text NOT NULL,
	"clone" text,
	"catalogue_ref" text,
	"vendor" text,
	"current_stock" integer,
	"low_stock_threshold" integer DEFAULT 5,
	"last_restocked_at" timestamp with time zone,
	"last_calibrated_at" timestamp with time zone,
	"calibration_interval_days" integer,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reagent_items" ADD CONSTRAINT "reagent_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reagent_items" ADD CONSTRAINT "reagent_items_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reagent_items_tenant_idx" ON "reagent_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reagent_items_key_idx" ON "reagent_items" USING btree ("tenant_id","register_key");