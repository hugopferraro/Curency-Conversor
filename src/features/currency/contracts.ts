import Decimal from "decimal.js";
import { z } from "zod";

export const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
export const MAX_AMOUNT = new Decimal("1000000000000000");

export function normalizeAmountInput(value: string): string | null {
  const trimmed = value.trim();

  if (!/^\d+(?:[.,]\d{1,18})?$/.test(trimmed)) {
    return null;
  }

  const normalized = trimmed.replace(",", ".");
  const amount = new Decimal(normalized);

  if (!amount.isFinite() || amount.lte(0) || amount.gt(MAX_AMOUNT)) {
    return null;
  }

  return amount.toFixed();
}

export const amountSchema = z
  .string()
  .transform((value, context) => {
    const normalized = normalizeAmountInput(value);

    if (!normalized) {
      context.addIssue({
        code: "custom",
        message:
          "Informe um valor positivo de até 10¹⁵, com no máximo 18 casas decimais.",
      });
      return z.NEVER;
    }

    return normalized;
  });

export const currencyCodeSchema = z
  .string()
  .regex(CURRENCY_CODE_PATTERN, "Selecione uma moeda válida.");

export const conversionInputSchema = z.object({
  requestId: z.uuid(),
  amount: amountSchema,
  sourceCurrency: currencyCodeSchema,
  targetCurrency: currencyCodeSchema,
});

export type ConversionInput = z.infer<typeof conversionInputSchema>;

export type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
};

export type ConversionResultDto = {
  requestId: string;
  sourceAmount: string;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: string;
  convertedAmount: string;
  rateProvider: string;
  rateFetchedAt: string;
  savedToHistory: boolean;
  historyId: string | null;
};
