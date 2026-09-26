import { describe, expect, it } from "vitest";

import { calculateConversion } from "@/features/currency/calculation";

describe("calculateConversion", () => {
  it("calcula uma taxa cruzada usando a matriz em USD", () => {
    expect(calculateConversion("10", "5", "4")).toEqual({
      exchangeRate: "0.8",
      convertedAmount: "8",
    });
  });

  it("retorna taxa um quando as taxas são iguais", () => {
    expect(calculateConversion("123.45", "5", "5")).toEqual({
      exchangeRate: "1",
      convertedAmount: "123.45",
    });
  });

  it("arredonda half-up na décima oitava casa", () => {
    expect(calculateConversion("1", "3", "2").exchangeRate).toBe(
      "0.666666666666666667",
    );
  });

  it("mantém precisão em valores grandes", () => {
    expect(
      calculateConversion("1000000000000000", "1", "1.000000000000000001")
        .convertedAmount,
    ).toBe("1000000000000000.001");
  });
});
