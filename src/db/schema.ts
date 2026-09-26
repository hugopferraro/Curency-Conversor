import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  char,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 320 }).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(sql`lower(${table.email})`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid().defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ipAddress: varchar("ip_address", { length: 255 }),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid().defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid().defaultRandom().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const rateLimits = pgTable("rate_limits", {
  id: uuid().defaultRandom().primaryKey(),
  key: text().notNull().unique(),
  count: integer().notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const conversionHistory = pgTable(
  "conversion_history",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestId: uuid("request_id").notNull(),
    sourceCurrency: char("source_currency", { length: 3 }).notNull(),
    targetCurrency: char("target_currency", { length: 3 }).notNull(),
    sourceAmount: numeric("source_amount", {
      precision: 38,
      scale: 18,
    }).notNull(),
    exchangeRate: numeric("exchange_rate", {
      precision: 38,
      scale: 18,
    }).notNull(),
    convertedAmount: numeric("converted_amount", {
      precision: 38,
      scale: 18,
    }).notNull(),
    rateProvider: varchar("rate_provider", { length: 64 }).notNull(),
    rateFetchedAt: timestamp("rate_fetched_at", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("conversion_history_user_request_unique").on(
      table.userId,
      table.requestId,
    ),
    index("conversion_history_user_cursor_idx").on(
      table.userId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    check(
      "conversion_history_source_currency_check",
      sql`${table.sourceCurrency} ~ '^[A-Z]{3}$'`,
    ),
    check(
      "conversion_history_target_currency_check",
      sql`${table.targetCurrency} ~ '^[A-Z]{3}$'`,
    ),
    check(
      "conversion_history_source_amount_check",
      sql`${table.sourceAmount} > 0`,
    ),
    check(
      "conversion_history_exchange_rate_check",
      sql`${table.exchangeRate} > 0`,
    ),
    check(
      "conversion_history_converted_amount_check",
      sql`${table.convertedAmount} > 0`,
    ),
  ],
);

export const authSchema = {
  users,
  sessions,
  accounts,
  verifications,
  rateLimits,
};

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ConversionHistoryEntry = typeof conversionHistory.$inferSelect;
export type NewConversionHistoryEntry = typeof conversionHistory.$inferInsert;
