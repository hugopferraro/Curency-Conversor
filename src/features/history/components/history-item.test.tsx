import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HistoryItem } from "@/features/history/components/history-item";
import type { HistoryItemDto } from "@/features/history/contracts";

const item: HistoryItemDto = {
  id: "00000000-0000-4000-8000-000000000001",
  requestId: "00000000-0000-4000-8000-000000000002",
  sourceCurrency: "BRL",
  targetCurrency: "USD",
  sourceAmount: "10",
  exchangeRate: "0.2",
  convertedAmount: "2",
  rateProvider: "FreecurrencyAPI",
  rateFetchedAt: "2026-09-25T12:30:00.000Z",
  createdAt: "2026-09-25T12:31:00.000Z",
};

describe("HistoryItem", () => {
  it("exibe todos os dados persistidos da conversão", () => {
    render(<HistoryItem item={item} onReuse={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(/10,00 BRL/)).toHaveTextContent("2,00 USD");
    expect(screen.getByText("1 BRL = 0,20 USD")).toBeVisible();
    expect(screen.getByText(/via FreecurrencyAPI/)).toBeVisible();
  });

  it("entrega o item correto às ações de reutilizar e excluir", async () => {
    const user = userEvent.setup();
    const onReuse = vi.fn();
    const onDelete = vi.fn();
    render(<HistoryItem item={item} onReuse={onReuse} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Reutilizar" }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onReuse).toHaveBeenCalledWith(item);
    expect(onDelete).toHaveBeenCalledWith(item);
  });
});
