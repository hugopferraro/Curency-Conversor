import "server-only";

import { and, desc, eq, lt, or } from "drizzle-orm";

import { db } from "@/db/client";
import {
  conversionHistory,
  type ConversionHistoryEntry,
  type NewConversionHistoryEntry,
} from "@/db/schema";
import type { HistoryCursor } from "@/features/history/contracts";

export async function findHistoryByRequestId(
  userId: string,
  requestId: string,
) {
  const [entry] = await db
    .select()
    .from(conversionHistory)
    .where(
      and(
        eq(conversionHistory.userId, userId),
        eq(conversionHistory.requestId, requestId),
      ),
    )
    .limit(1);

  return entry ?? null;
}

export async function saveHistoryEntry(
  entry: NewConversionHistoryEntry,
): Promise<ConversionHistoryEntry> {
  const [inserted] = await db
    .insert(conversionHistory)
    .values(entry)
    .onConflictDoNothing({
      target: [conversionHistory.userId, conversionHistory.requestId],
    })
    .returning();

  if (inserted) {
    return inserted;
  }

  const existing = await findHistoryByRequestId(entry.userId, entry.requestId);

  if (!existing) {
    throw new Error("Não foi possível confirmar o histórico da conversão.");
  }

  return existing;
}

export async function listHistoryEntries(
  userId: string,
  limit: number,
  cursor?: HistoryCursor,
) {
  const cursorCondition = cursor
    ? or(
        lt(conversionHistory.createdAt, new Date(cursor.createdAt)),
        and(
          eq(conversionHistory.createdAt, new Date(cursor.createdAt)),
          lt(conversionHistory.id, cursor.id),
        ),
      )
    : undefined;

  return db
    .select()
    .from(conversionHistory)
    .where(and(eq(conversionHistory.userId, userId), cursorCondition))
    .orderBy(desc(conversionHistory.createdAt), desc(conversionHistory.id))
    .limit(limit + 1);
}

export async function deleteHistoryEntry(userId: string, id: string) {
  const [deleted] = await db
    .delete(conversionHistory)
    .where(
      and(
        eq(conversionHistory.id, id),
        eq(conversionHistory.userId, userId),
      ),
    )
    .returning({ id: conversionHistory.id });

  return Boolean(deleted);
}

export async function clearHistoryEntries(userId: string) {
  const deleted = await db
    .delete(conversionHistory)
    .where(eq(conversionHistory.userId, userId))
    .returning({ id: conversionHistory.id });

  return deleted.length;
}
