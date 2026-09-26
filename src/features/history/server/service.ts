import "server-only";

import type { ConversionHistoryEntry } from "@/db/schema";
import { canonicalizeDecimal } from "@/features/currency/calculation";
import type {
  HistoryCursor,
  HistoryItemDto,
} from "@/features/history/contracts";
import {
  clearHistoryEntries,
  deleteHistoryEntry,
  listHistoryEntries,
} from "@/features/history/server/repository";

export function toHistoryDto(entry: ConversionHistoryEntry): HistoryItemDto {
  return {
    id: entry.id,
    requestId: entry.requestId,
    sourceCurrency: entry.sourceCurrency,
    targetCurrency: entry.targetCurrency,
    sourceAmount: canonicalizeDecimal(entry.sourceAmount),
    exchangeRate: canonicalizeDecimal(entry.exchangeRate),
    convertedAmount: canonicalizeDecimal(entry.convertedAmount),
    rateProvider: entry.rateProvider,
    rateFetchedAt: entry.rateFetchedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function listUserHistory(
  userId: string,
  limit: number,
  cursor?: HistoryCursor,
) {
  const entries = await listHistoryEntries(userId, limit, cursor);
  const hasMore = entries.length > limit;
  const pageEntries = hasMore ? entries.slice(0, limit) : entries;
  const lastEntry = pageEntries.at(-1);

  return {
    items: pageEntries.map(toHistoryDto),
    nextCursor:
      hasMore && lastEntry
        ? {
            createdAt: lastEntry.createdAt.toISOString(),
            id: lastEntry.id,
          }
        : null,
  };
}

export async function deleteUserHistoryEntry(userId: string, id: string) {
  return deleteHistoryEntry(userId, id);
}

export async function clearUserHistory(userId: string) {
  return clearHistoryEntries(userId);
}
