import { describe, expect, it } from "vitest";

import {
  formatCurrencyAmount,
  formatDateTime,
  formatDecimal,
} from "@/features/currency/format";

describe("formatação monetária", () => {
  it.each([
    ["1", "1,00"],
    ["1.2", "1,20"],
    ["1234.567", "1.234,567"],
  ])("exibe %s com no mínimo duas casas", (value, expected) => {
    expect(formatDecimal(value)).toBe(expected);
  });

  it("arredonda a apresentação em half-up", () => {
    expect(formatDecimal("1.235", 2)).toBe("1,24");
    expect(formatDecimal("1.234", 2)).toBe("1,23");
  });

  it("mantém o código da moeda explícito", () => {
    expect(formatCurrencyAmount("10", "BRL")).toBe("10,00 BRL");
  });

  it("formata datas no padrão brasileiro somente na apresentação", () => {
    const formatted = formatDateTime("2026-09-25T12:30:00.000Z");

    expect(formatted).toMatch(/25\/09\/2026/);
    expect(formatted).not.toContain("T12:30:00.000Z");
  });
});
