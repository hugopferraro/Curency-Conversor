import "server-only";

import type { ConversionHistoryEntry } from "@/db/schema";
import {
  calculateConversion,
  canonicalizeDecimal,
} from "@/features/currency/calculation";
import type {
  ConversionInput,
  ConversionResultDto,
} from "@/features/currency/contracts";
import { currencyRateProvider } from "@/features/currency/server/free-currency-api";
import type { CurrencyRateProvider } from "@/features/currency/server/provider";
import {
  findHistoryByRequestId,
  saveHistoryEntry,
} from "@/features/history/server/repository";

export class UnsupportedCurrencyError extends Error {
  constructor() {
    super("Uma das moedas selecionadas não é suportada.");
    this.name = "UnsupportedCurrencyError";
  }
}

function historyToConversion(entry: ConversionHistoryEntry): ConversionResultDto {
  return {
    requestId: entry.requestId,
    sourceAmount: canonicalizeDecimal(entry.sourceAmount),
    sourceCurrency: entry.sourceCurrency,
    targetCurrency: entry.targetCurrency,
    exchangeRate: canonicalizeDecimal(entry.exchangeRate),
    convertedAmount: canonicalizeDecimal(entry.convertedAmount),
    rateProvider: entry.rateProvider,
    rateFetchedAt: entry.rateFetchedAt.toISOString(),
    savedToHistory: true,
    historyId: entry.id,
  };
}

export async function listSupportedCurrencies(
  provider: CurrencyRateProvider = currencyRateProvider,
) {
  return provider.listCurrencies();
}

export async function convertCurrency(
  input: ConversionInput,
  userId: string | null,
  provider: CurrencyRateProvider = currencyRateProvider,
): Promise<ConversionResultDto> {
  if (userId) {
    const existing = await findHistoryByRequestId(userId, input.requestId);

    if (existing) {
      return historyToConversion(existing);
    }
  }

  const matrix = await provider.getUsdRateMatrix();
  const sourceUsdRate = matrix.rates[input.sourceCurrency];
  const targetUsdRate = matrix.rates[input.targetCurrency];

  if (!sourceUsdRate || !targetUsdRate) {
    throw new UnsupportedCurrencyError();
  }

  const calculated =
    input.sourceCurrency === input.targetCurrency
      ? { exchangeRate: "1", convertedAmount: input.amount }
      : calculateConversion(input.amount, sourceUsdRate, targetUsdRate);

  const baseResult: ConversionResultDto = {
    requestId: input.requestId,
    sourceAmount: input.amount,
    sourceCurrency: input.sourceCurrency,
    targetCurrency: input.targetCurrency,
    exchangeRate: calculated.exchangeRate,
    convertedAmount: calculated.convertedAmount,
    rateProvider: matrix.provider,
    rateFetchedAt: matrix.fetchedAt,
    savedToHistory: false,
    historyId: null,
  };

  if (!userId) {
    return baseResult;
  }

  const saved = await saveHistoryEntry({
    userId,
    requestId: input.requestId,
    sourceCurrency: input.sourceCurrency,
    targetCurrency: input.targetCurrency,
    sourceAmount: input.amount,
    exchangeRate: calculated.exchangeRate,
    convertedAmount: calculated.convertedAmount,
    rateProvider: matrix.provider,
    rateFetchedAt: new Date(matrix.fetchedAt),
  });

  return historyToConversion(saved);
}
