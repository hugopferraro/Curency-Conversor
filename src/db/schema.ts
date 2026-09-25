import { sql } from "drizzle-orm";
import {
  char,
  check,
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey(),
    email: varchar({ length: 320 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
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
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const conversionHistory = pgTable(
  "conversion_history",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    rateUpdatedAt: timestamp("rate_updated_at", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("conversion_history_user_created_at_idx").on(
      table.userId,
      table.createdAt.desc(),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type ConversionHistoryEntry = typeof conversionHistory.$inferSelect;
export type NewConversionHistoryEntry = typeof conversionHistory.$inferInsert;
