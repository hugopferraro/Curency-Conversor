CREATE TABLE "conversion_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"source_currency" char(3) NOT NULL,
	"target_currency" char(3) NOT NULL,
	"source_amount" numeric(38,18) NOT NULL,
	"exchange_rate" numeric(38,18) NOT NULL,
	"converted_amount" numeric(38,18) NOT NULL,
	"rate_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversion_history_source_currency_check" CHECK ("source_currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "conversion_history_target_currency_check" CHECK ("target_currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "conversion_history_source_amount_check" CHECK ("source_amount" > 0),
	CONSTRAINT "conversion_history_exchange_rate_check" CHECK ("exchange_rate" > 0),
	CONSTRAINT "conversion_history_converted_amount_check" CHECK ("converted_amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(320) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "conversion_history_user_created_at_idx" ON "conversion_history" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" (lower("email"));--> statement-breakpoint
ALTER TABLE "conversion_history" ADD CONSTRAINT "conversion_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;