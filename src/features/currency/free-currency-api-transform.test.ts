import { describe, expect, it } from "vitest";

import {
  parseCurrencyResponse,
  parseRateResponse,
} from "@/features/currency/free-currency-api-transform";

describe("transformações da FreecurrencyAPI", () => {
  it("ordena e transforma moedas", () => {
    expect(
      parseCurrencyResponse({
        data: {
          USD: { name: "US Dollar", symbol: "$", decimal_digits: 2 },
          BRL: { name: "Brazilian Real", symbol: "R$", decimal_digits: 2 },
        },
      }),
    ).toEqual([
      { code: "BRL", name: "Brazilian Real", symbol: "R$", decimalDigits: 2 },
      { code: "USD", name: "US Dollar", symbol: "$", decimalDigits: 2 },
    ]);
  });

  it("transforma taxas numéricas em strings", () => {
    expect(parseRateResponse({ data: { BRL: 5.25, EUR: 0.8 } })).toEqual({
      BRL: "5.25",
      EUR: "0.8",
    });
  });

  it.each([{ data: { BRL: -1 } }, { data: null }, { invalid: true }])(
    "rejeita payload inválido: %j",
    (payload) => {
      expect(parseRateResponse(payload)).toBeNull();
    },
  );
});
