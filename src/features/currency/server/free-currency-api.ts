import "server-only";

import { unstable_cache } from "next/cache";

import type { CurrencyOption } from "@/features/currency/contracts";
import {
  parseCurrencyResponse,
  parseRateResponse,
} from "@/features/currency/free-currency-api-transform";
import {
  CurrencyProviderError,
  type CurrencyRateMatrix,
  type CurrencyRateProvider,
} from "@/features/currency/server/provider";

const API_BASE_URL =
  process.env.FREECURRENCY_API_BASE_URL ?? "https://api.freecurrencyapi.com";
const PROVIDER_NAME = "FreecurrencyAPI";
const REQUEST_TIMEOUT_MS = 8_000;

function getApiKey() {
  const apiKey = process.env.FREECURRENCY_API_KEY;

  if (!apiKey) {
    throw new CurrencyProviderError("authentication");
  }

  return apiKey;
}

async function request(path: string): Promise<unknown> {
  let response: Response;
  const apiKey = getApiKey();

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new CurrencyProviderError(
      error instanceof DOMException && error.name === "TimeoutError"
        ? "timeout"
        : "unavailable",
      { cause: error },
    );
  }

  if (!response.ok) {
    const kind =
      response.status === 401 || response.status === 403
        ? "authentication"
        : response.status === 422
          ? "invalid-request"
          : response.status === 429
            ? "quota"
            : "unavailable";

    throw new CurrencyProviderError(kind);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new CurrencyProviderError("invalid-response", { cause: error });
  }
}

export function transformCurrencyResponse(payload: unknown): CurrencyOption[] {
  const currencies = parseCurrencyResponse(payload);

  if (!currencies) {
    throw new CurrencyProviderError("invalid-response");
  }

  return currencies;
}

export function transformRateResponse(
  payload: unknown,
  fetchedAt = new Date(),
): CurrencyRateMatrix {
  const parsedRates = parseRateResponse(payload);

  if (!parsedRates) {
    throw new CurrencyProviderError("invalid-response");
  }

  const rates = { ...parsedRates };

  rates.USD = "1";

  return { rates, fetchedAt: fetchedAt.toISOString(), provider: PROVIDER_NAME };
}

const getCachedCurrencies = unstable_cache(
  async () => transformCurrencyResponse(await request("/v1/currencies")),
  ["freecurrencyapi", "currencies", "v1"],
  { revalidate: 60 * 60 * 24 * 7 },
);

const getCachedRates = unstable_cache(
  async () =>
    transformRateResponse(
      await request("/v1/latest?base_currency=USD"),
      new Date(),
    ),
  ["freecurrencyapi", "latest", "usd", "v1"],
  { revalidate: 60 * 60 * 12 },
);

export class FreeCurrencyApiProvider implements CurrencyRateProvider {
  listCurrencies() {
    return getCachedCurrencies();
  }

  getUsdRateMatrix() {
    return getCachedRates();
  }
}

export const currencyRateProvider = new FreeCurrencyApiProvider();
