import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({
  unstableCache: vi.fn((callback: () => unknown) => callback),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: cacheMocks.unstableCache }));

describe("FreeCurrencyApiProvider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.FREECURRENCY_API_KEY = "secret-api-key";
    process.env.FREECURRENCY_API_BASE_URL = "https://currencies.example.test";
  });

  it("usa somente o servidor, header apikey e endpoints esperados", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              BRL: { name: "Real brasileiro", symbol: "R$", decimal_digits: 2 },
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { BRL: 5, USD: 1 } })),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { FreeCurrencyApiProvider } = await import(
      "@/features/currency/server/free-currency-api"
    );
    const provider = new FreeCurrencyApiProvider();

    await provider.listCurrencies();
    await provider.getUsdRateMatrix();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://currencies.example.test/v1/currencies",
      expect.objectContaining({ headers: { apikey: "secret-api-key" } }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://currencies.example.test/v1/latest?base_currency=USD",
      expect.objectContaining({ headers: { apikey: "secret-api-key" } }),
    );
  });

  it("configura cache de sete dias para moedas e doze horas para taxas", async () => {
    await import("@/features/currency/server/free-currency-api");

    expect(cacheMocks.unstableCache).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      ["freecurrencyapi", "currencies", "v1"],
      { revalidate: 60 * 60 * 24 * 7 },
    );
    expect(cacheMocks.unstableCache).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      ["freecurrencyapi", "latest", "usd", "v1"],
      { revalidate: 60 * 60 * 12 },
    );
  });

  it.each([
    [401, "authentication"],
    [403, "authentication"],
    [422, "invalid-request"],
    [429, "quota"],
    [500, "unavailable"],
  ] as const)("traduz HTTP %s para %s", async (status, kind) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status })),
    );
    const { FreeCurrencyApiProvider } = await import(
      "@/features/currency/server/free-currency-api"
    );

    await expect(new FreeCurrencyApiProvider().listCurrencies()).rejects.toMatchObject({
      kind,
    });
  });

  it("traduz timeout e indisponibilidade sem propagar o erro interno", async () => {
    const timeout = new DOMException("segredo interno", "TimeoutError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));
    let providerModule = await import("@/features/currency/server/free-currency-api");

    await expect(
      new providerModule.FreeCurrencyApiProvider().listCurrencies(),
    ).rejects.toMatchObject({
      kind: "timeout",
      message: "Não foi possível consultar o provedor de câmbio.",
    });

    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket secret")));
    providerModule = await import("@/features/currency/server/free-currency-api");
    await expect(
      new providerModule.FreeCurrencyApiProvider().listCurrencies(),
    ).rejects.toMatchObject({
      kind: "unavailable",
      message: "Não foi possível consultar o provedor de câmbio.",
    });
  });

  it("rejeita JSON e payload inválidos", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("not-json"))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: null }))),
    );
    const { FreeCurrencyApiProvider } = await import(
      "@/features/currency/server/free-currency-api"
    );
    const provider = new FreeCurrencyApiProvider();

    await expect(provider.listCurrencies()).rejects.toMatchObject({
      kind: "invalid-response",
    });
    await expect(provider.getUsdRateMatrix()).rejects.toMatchObject({
      kind: "invalid-response",
    });
  });

  it("falha de forma controlada quando a chave não está configurada", async () => {
    delete process.env.FREECURRENCY_API_KEY;
    vi.stubGlobal("fetch", vi.fn());
    const { FreeCurrencyApiProvider } = await import(
      "@/features/currency/server/free-currency-api"
    );

    await expect(new FreeCurrencyApiProvider().listCurrencies()).rejects.toMatchObject({
      kind: "authentication",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
