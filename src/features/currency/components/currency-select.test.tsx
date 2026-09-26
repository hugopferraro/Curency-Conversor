import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CurrencySelect } from "@/features/currency/components/currency-select";

const options = [
  { code: "BRL", name: "Real brasileiro", symbol: "R$", decimalDigits: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimalDigits: 2 },
  { code: "USD", name: "Dólar americano", symbol: "$", decimalDigits: 2 },
];

describe("CurrencySelect", () => {
  it("exibe código ISO e nome e permite pesquisar a moeda", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CurrencySelect
        id="currency"
        label="Moeda"
        value="BRL"
        options={options}
        loading={false}
        disabled={false}
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText("Moeda");
    expect(input).toHaveValue("BRL — Real brasileiro");
    await user.click(input);
    await user.clear(input);
    await user.type(input, "dólar");
    await user.click(await screen.findByRole("option", { name: "USD — Dólar americano" }));

    expect(onChange).toHaveBeenCalledWith("USD");
  });

  it("mantém a seleção visível enquanto o catálogo carrega", () => {
    render(
      <CurrencySelect
        id="currency"
        label="Moeda"
        value="BRL"
        options={[]}
        loading
        disabled={false}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Moeda")).toHaveValue("BRL — BRL");
    expect(screen.getByRole("progressbar")).toBeVisible();
  });
});
