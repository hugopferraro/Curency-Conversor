import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não foi configurada.");
}

const globalForDatabase = globalThis as unknown as {
  databasePool?: Pool;
};

export const databasePool =
  globalForDatabase.databasePool ?? new Pool({ connectionString: databaseUrl });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.databasePool = databasePool;
}

export const db = drizzle({ client: databasePool });
