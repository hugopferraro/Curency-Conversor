import "server-only";

import type { CurrencyOption } from "@/features/currency/contracts";

export type CurrencyRateMatrix = {
  rates: Record<string, string>;
  fetchedAt: string;
  provider: string;
};

export interface CurrencyRateProvider {
  listCurrencies(): Promise<CurrencyOption[]>;
  getUsdRateMatrix(): Promise<CurrencyRateMatrix>;
}

export type CurrencyProviderErrorKind =
  | "authentication"
  | "invalid-request"
  | "quota"
  | "timeout"
  | "invalid-response"
  | "unavailable";

export class CurrencyProviderError extends Error {
  constructor(
    public readonly kind: CurrencyProviderErrorKind,
    options?: ErrorOptions,
  ) {
    super("Não foi possível consultar o provedor de câmbio.", options);
    this.name = "CurrencyProviderError";
  }
}
