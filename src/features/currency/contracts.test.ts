import { describe, expect, it } from "vitest";

import {
  conversionInputSchema,
  normalizeAmountInput,
} from "@/features/currency/contracts";

describe("normalizeAmountInput", () => {
  it.each([
    ["10", "10"],
    ["10,25", "10.25"],
    ["0001.50", "1.5"],
    ["1000000000000000", "1000000000000000"],
    ["0,000000000000000001", "0.000000000000000001"],
  ])("normaliza %s", (input, expected) => {
    expect(normalizeAmountInput(input)).toBe(expected);
  });

  it.each([
    "",
    "zero",
    "0",
    "-1",
    "1,2.3",
    "1.",
    "1000000000000001",
    "0.0000000000000000001",
  ])("rejeita %s", (input) => {
    expect(normalizeAmountInput(input)).toBeNull();
  });
});

describe("conversionInputSchema", () => {
  it("valida e normaliza uma conversão", () => {
    const result = conversionInputSchema.parse({
      requestId: "00000000-0000-4000-8000-000000000000",
      amount: "12,50",
      sourceCurrency: "BRL",
      targetCurrency: "USD",
    });

    expect(result.amount).toBe("12.5");
  });

  it("rejeita códigos fora do padrão ISO", () => {
    expect(
      conversionInputSchema.safeParse({
        requestId: "00000000-0000-4000-8000-000000000000",
        amount: "1",
        sourceCurrency: "real",
        targetCurrency: "USD",
      }).success,
    ).toBe(false);
  });
});
