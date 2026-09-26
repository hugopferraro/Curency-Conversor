import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/currency/server/free-currency-api", () => ({
  currencyRateProvider: {},
}));
vi.mock("@/features/history/server/repository", () => ({
  findHistoryByRequestId: vi.fn(),
  saveHistoryEntry: vi.fn(),
}));

import { CurrencyProviderError } from "@/features/currency/server/provider";
import { UnsupportedCurrencyError } from "@/features/currency/server/service";
import { mapCurrencyError } from "@/trpc/errors";

describe("contrato público de erros tRPC", () => {
  it("traduz moeda não suportada como entrada inválida", () => {
    expect(mapCurrencyError(new UnsupportedCurrencyError())).toMatchObject({
      code: "BAD_REQUEST",
      message: "Uma das moedas selecionadas não é suportada.",
    });
  });

  it("traduz quota sem expor status ou chave", () => {
    const error = mapCurrencyError(new CurrencyProviderError("quota"));

    expect(error.code).toBe("TOO_MANY_REQUESTS");
    expect(error.message).toContain("limite");
    expect(error.message).not.toMatch(/429|apikey/i);
  });

  it("oculta detalhes de erros inesperados", () => {
    const error = mapCurrencyError(new Error("password=secret stack trace"));

    expect(error).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível concluir a operação de câmbio.",
    });
    expect(error.message).not.toContain("secret");
  });
});
