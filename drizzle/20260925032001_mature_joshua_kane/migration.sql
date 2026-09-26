CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"key" text NOT NULL UNIQUE,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversion_history" RENAME COLUMN "rate_updated_at" TO "rate_fetched_at";--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_token_hash_key";--> statement-breakpoint
DROP INDEX "conversion_history_user_created_at_idx";--> statement-breakpoint
ALTER TABLE "conversion_history" ADD COLUMN "request_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "conversion_history" ADD COLUMN "rate_provider" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "token" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "ip_address" varchar(255);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "token_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_token_key" UNIQUE("token");--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_unique" ON "accounts" ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversion_history_user_request_unique" ON "conversion_history" ("user_id","request_id");--> statement-breakpoint
CREATE INDEX "conversion_history_user_cursor_idx" ON "conversion_history" ("user_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;