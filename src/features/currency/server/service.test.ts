import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ConversionInput } from "@/features/currency/contracts";
import type { CurrencyRateProvider } from "@/features/currency/server/provider";

const repository = vi.hoisted(() => ({
  findHistoryByRequestId: vi.fn(),
  saveHistoryEntry: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/features/history/server/repository", () => repository);
vi.mock("@/features/currency/server/free-currency-api", () => ({
  currencyRateProvider: {},
}));

import {
  convertCurrency,
  listSupportedCurrencies,
  UnsupportedCurrencyError,
} from "@/features/currency/server/service";

const input: ConversionInput = {
  requestId: "00000000-0000-4000-8000-000000000001",
  amount: "10",
  sourceCurrency: "BRL",
  targetCurrency: "USD",
};

function createProvider(): CurrencyRateProvider {
  return {
    listCurrencies: vi.fn().mockResolvedValue([
      { code: "BRL", name: "Real brasileiro", symbol: "R$", decimalDigits: 2 },
    ]),
    getUsdRateMatrix: vi.fn().mockResolvedValue({
      rates: { BRL: "5", USD: "1" },
      fetchedAt: "2026-09-25T12:30:00.000Z",
      provider: "MockProvider",
    }),
  };
}

function persistedEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: "00000000-0000-4000-8000-000000000010",
    userId: "00000000-0000-4000-8000-000000000020",
    requestId: input.requestId,
    sourceCurrency: "BRL",
    targetCurrency: "USD",
    sourceAmount: "10.000000000000000000",
    exchangeRate: "0.200000000000000000",
    convertedAmount: "2.000000000000000000",
    rateProvider: "MockProvider",
    rateFetchedAt: new Date("2026-09-25T12:30:00.000Z"),
    createdAt: new Date("2026-09-25T12:31:00.000Z"),
    ...overrides,
  };
}

describe("serviço de conversão", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository.findHistoryByRequestId.mockResolvedValue(null);
  });

  it("lista moedas pelo provedor abstraído", async () => {
    const provider = createProvider();

    await expect(listSupportedCurrencies(provider)).resolves.toEqual([
      { code: "BRL", name: "Real brasileiro", symbol: "R$", decimalDigits: 2 },
    ]);
    expect(provider.listCurrencies).toHaveBeenCalledOnce();
  });

  it("converte para visitante sem persistir e mantém valores como strings", async () => {
    const provider = createProvider();

    await expect(convertCurrency(input, null, provider)).resolves.toEqual({
      requestId: input.requestId,
      sourceAmount: "10",
      sourceCurrency: "BRL",
      targetCurrency: "USD",
      exchangeRate: "0.2",
      convertedAmount: "2",
      rateProvider: "MockProvider",
      rateFetchedAt: "2026-09-25T12:30:00.000Z",
      savedToHistory: false,
      historyId: null,
    });
    expect(repository.saveHistoryEntry).not.toHaveBeenCalled();
  });

  it("salva automaticamente a conversão do usuário autenticado", async () => {
    const provider = createProvider();
    const entry = persistedEntry();
    repository.saveHistoryEntry.mockResolvedValue(entry);

    const result = await convertCurrency(input, entry.userId, provider);

    expect(repository.saveHistoryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: entry.userId,
        requestId: input.requestId,
        sourceAmount: "10",
        exchangeRate: "0.2",
        convertedAmount: "2",
      }),
    );
    expect(result).toMatchObject({ savedToHistory: true, historyId: entry.id });
  });

  it("é idempotente por usuário e requestId sem consultar novamente o provedor", async () => {
    const provider = createProvider();
    const entry = persistedEntry();
    repository.findHistoryByRequestId.mockResolvedValue(entry);

    const result = await convertCurrency(input, entry.userId, provider);

    expect(result).toMatchObject({ historyId: entry.id, sourceAmount: "10" });
    expect(provider.getUsdRateMatrix).not.toHaveBeenCalled();
    expect(repository.saveHistoryEntry).not.toHaveBeenCalled();
  });

  it("retorna taxa 1 e o mesmo valor ao converter a mesma moeda", async () => {
    const provider = createProvider();
    const sameCurrency = {
      ...input,
      targetCurrency: "BRL",
      amount: "123.45",
    };

    await expect(convertCurrency(sameCurrency, null, provider)).resolves.toMatchObject({
      exchangeRate: "1",
      convertedAmount: "123.45",
    });
  });

  it("rejeita moedas ausentes da matriz", async () => {
    const provider = createProvider();

    await expect(
      convertCurrency({ ...input, sourceCurrency: "EUR" }, null, provider),
    ).rejects.toBeInstanceOf(UnsupportedCurrencyError);
  });
});
