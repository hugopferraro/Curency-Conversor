import { z } from "zod";

import type { CurrencyOption } from "@/features/currency/contracts";

export const currencyResponseSchema = z.object({
  data: z.record(
    z.string(),
    z.object({
      name: z.string(),
      symbol: z.string().nullable().optional(),
      decimal_digits: z.number().int().min(0).max(18).optional(),
    }),
  ),
});

export const rateResponseSchema = z.object({
  data: z.record(z.string(), z.number().positive().finite()),
});

export function parseCurrencyResponse(payload: unknown): CurrencyOption[] | null {
  const parsed = currencyResponseSchema.safeParse(payload);
  if (!parsed.success) return null;

  return Object.entries(parsed.data.data)
    .map(([code, currency]) => ({
      code,
      name: currency.name,
      symbol: currency.symbol ?? code,
      decimalDigits: currency.decimal_digits ?? 2,
    }))
    .sort((left, right) => left.code.localeCompare(right.code));
}

export function parseRateResponse(
  payload: unknown,
): Record<string, string> | null {
  const parsed = rateResponseSchema.safeParse(payload);
  if (!parsed.success) return null;

  return Object.fromEntries(
    Object.entries(parsed.data.data).map(([code, value]) => [
      code,
      value.toString(),
    ]),
  );
}
