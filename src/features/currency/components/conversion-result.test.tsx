import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConversionResult } from "@/features/currency/components/conversion-result";

describe("ConversionResult", () => {
  it("apresenta valores, moedas, taxa, provedor e consulta em região anunciada", () => {
    render(
      <ConversionResult
        result={{
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceAmount: "10",
          sourceCurrency: "BRL",
          targetCurrency: "USD",
          exchangeRate: "0.2",
          convertedAmount: "2",
          rateProvider: "FreecurrencyAPI",
          rateFetchedAt: "2026-09-25T12:30:00.000Z",
          savedToHistory: false,
          historyId: null,
        }}
      />,
    );

    const result = screen.getByRole("alert");
    expect(result).toHaveAttribute("aria-live", "polite");
    expect(result).toHaveTextContent("10,00 BRL equivale a");
    expect(result).toHaveTextContent("2,00 USD");
    expect(result).toHaveTextContent("1 BRL = 0,20 USD");
    expect(result).toHaveTextContent("Taxa de fechamento consultada em");
    expect(result).toHaveTextContent("via FreecurrencyAPI");
  });
});
