import { z } from "zod";

export const historyCursorSchema = z.object({
  createdAt: z.iso.datetime(),
  id: z.uuid(),
});

export const historyListInputSchema = z
  .object({
    cursor: historyCursorSchema.optional(),
    limit: z.number().int().min(1).max(50).default(20),
  })
  .default({ limit: 20 });

export const historyDeleteInputSchema = z.object({ id: z.uuid() });

export type HistoryCursor = z.infer<typeof historyCursorSchema>;

export type HistoryItemDto = {
  id: string;
  requestId: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: string;
  exchangeRate: string;
  convertedAmount: string;
  rateProvider: string;
  rateFetchedAt: string;
  createdAt: string;
};
