import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CurrencyConverterCard,
  type CurrencyConverterHandle,
} from "@/features/currency/components/currency-converter-card";
import type { HistoryItemDto } from "@/features/history/contracts";

const mocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  mutationOptions: undefined as
    | { onSuccess?: (data: Record<string, unknown>) => Promise<void> }
    | undefined,
  mutation: {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null as Error | null,
  },
  query: {
    data: [
      { code: "BRL", name: "Real brasileiro", symbol: "R$", decimalDigits: 2 },
      { code: "USD", name: "Dólar americano", symbol: "$", decimalDigits: 2 },
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: (options: typeof mocks.mutationOptions) => {
    mocks.mutationOptions = options;
    return mocks.mutation;
  },
  useQuery: () => mocks.query,
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    currency: {
      list: { queryOptions: vi.fn(() => ({})) },
      convert: { mutationOptions: vi.fn((options) => options) },
    },
    history: { pathFilter: vi.fn(() => ({ queryKey: ["history"] })) },
  }),
}));

const result = {
  requestId: "00000000-0000-4000-8000-000000000000",
  sourceAmount: "10",
  sourceCurrency: "BRL",
  targetCurrency: "USD",
  exchangeRate: "0.2",
  convertedAmount: "2",
  rateProvider: "MockProvider",
  rateFetchedAt: "2026-09-25T12:30:00.000Z",
  savedToHistory: true,
  historyId: "00000000-0000-4000-8000-000000000001",
};

describe("CurrencyConverterCard", () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.mutation.isPending = false;
    mocks.mutation.isError = false;
    mocks.mutation.error = null;
    mocks.query.isLoading = false;
    mocks.query.isError = false;
    mocks.query.data = [
      { code: "BRL", name: "Real brasileiro", symbol: "R$", decimalDigits: 2 },
      { code: "USD", name: "Dólar americano", symbol: "$", decimalDigits: 2 },
    ];
  });

  it("inicia em BRL para USD e apresenta o aviso informativo", () => {
    render(<CurrencyConverterCard isAuthenticated={false} />);

    expect(screen.getByLabelText("Valor")).toHaveValue("1");
    expect(screen.getByLabelText("Moeda de origem")).toHaveValue(
      "BRL — Real brasileiro",
    );
    expect(screen.getByLabelText("Moeda de destino")).toHaveValue(
      "USD — Dólar americano",
    );
    expect(
      screen.getByText(/Instituições financeiras podem aplicar tarifas/),
    ).toBeVisible();
  });

  it("restaura o último par válido do localStorage", async () => {
    window.localStorage.setItem(
      "currency-converter:last-pair",
      JSON.stringify({ source: "USD", target: "BRL" }),
    );
    render(<CurrencyConverterCard isAuthenticated={false} />);

    await waitFor(() =>
      expect(screen.getByLabelText("Moeda de origem")).toHaveValue(
        "USD — Dólar americano",
      ),
    );
    expect(screen.getByLabelText("Moeda de destino")).toHaveValue(
      "BRL — Real brasileiro",
    );
  });

  it("remove preferência corrompida e mantém o par padrão", async () => {
    window.localStorage.setItem("currency-converter:last-pair", "invalid-json");
    render(<CurrencyConverterCard isAuthenticated={false} />);

    await waitFor(() =>
      expect(window.localStorage.getItem("currency-converter:last-pair")).toBeNull(),
    );
    expect(screen.getByLabelText("Moeda de origem")).toHaveValue(
      "BRL — Real brasileiro",
    );
  });

  it("rejeita entrada inválida sem chamar a API e preserva o valor", async () => {
    const user = userEvent.setup();
    render(<CurrencyConverterCard isAuthenticated={false} />);
    const amount = screen.getByLabelText("Valor");

    await user.clear(amount);
    await user.type(amount, "-1");
    await user.click(screen.getByRole("button", { name: "Converter" }));

    expect(await screen.findByText(/Informe um valor positivo/)).toBeVisible();
    expect(amount).toHaveValue("-1");
    expect(mocks.mutation.mutate).not.toHaveBeenCalled();
  });

  it("normaliza vírgula e envia valores como strings com requestId", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000099",
    );
    render(<CurrencyConverterCard isAuthenticated={false} />);
    const amount = screen.getByLabelText("Valor");

    await user.clear(amount);
    await user.type(amount, "10,50");
    await user.click(screen.getByRole("button", { name: "Converter" }));

    expect(mocks.mutation.mutate).toHaveBeenCalledWith({
      requestId: "00000000-0000-4000-8000-000000000099",
      amount: "10.5",
      sourceCurrency: "BRL",
      targetCurrency: "USD",
    });
  });

  it("inverte moedas e recalcula quando já existe resultado", async () => {
    const user = userEvent.setup();
    render(<CurrencyConverterCard isAuthenticated />);
    await act(async () => mocks.mutationOptions?.onSuccess?.(result));
    mocks.mutation.mutate.mockClear();

    await user.click(screen.getByRole("button", { name: "Inverter moedas" }));

    expect(screen.getByLabelText("Moeda de origem")).toHaveValue(
      "USD — Dólar americano",
    );
    expect(screen.getByLabelText("Moeda de destino")).toHaveValue(
      "BRL — Real brasileiro",
    );
    expect(mocks.mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ sourceCurrency: "USD", targetCurrency: "BRL" }),
    );
  });

  it("desabilita campos e ações durante a conversão", () => {
    mocks.mutation.isPending = true;
    render(<CurrencyConverterCard isAuthenticated={false} />);

    expect(screen.getByLabelText("Valor")).toBeDisabled();
    expect(screen.getByLabelText("Moeda de origem")).toBeDisabled();
    expect(screen.getByLabelText("Moeda de destino")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Inverter moedas" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Convertendo…" })).toBeDisabled();
  });

  it("reutiliza um histórico, persiste o par e move o foco para o valor", async () => {
    const ref = createRef<CurrencyConverterHandle>();
    const historyItem: HistoryItemDto = {
      id: result.historyId,
      requestId: result.requestId,
      sourceAmount: result.sourceAmount,
      sourceCurrency: result.sourceCurrency,
      targetCurrency: result.targetCurrency,
      exchangeRate: result.exchangeRate,
      convertedAmount: result.convertedAmount,
      rateProvider: result.rateProvider,
      rateFetchedAt: result.rateFetchedAt,
      createdAt: "2026-09-25T12:31:00.000Z",
    };
    render(<CurrencyConverterCard ref={ref} isAuthenticated />);

    act(() => {
      ref.current?.reuse(historyItem);
    });

    await waitFor(() => expect(screen.getByLabelText("Valor")).toHaveFocus());
    expect(screen.getByLabelText("Valor")).toHaveValue("10");
    expect(window.localStorage.getItem("currency-converter:last-pair")).toBe(
      JSON.stringify({ source: "BRL", target: "USD" }),
    );
  });

  it("distingue erro de sucesso e anuncia as atualizações", async () => {
    const { rerender } = render(<CurrencyConverterCard isAuthenticated />);
    mocks.mutation.isError = true;
    mocks.mutation.error = new Error("Serviço temporariamente indisponível.");
    rerender(<CurrencyConverterCard isAuthenticated />);

    const error = screen.getByText("Serviço temporariamente indisponível.");
    expect(error.closest("[role=alert]")).toHaveAttribute("aria-live", "assertive");

    mocks.mutation.isError = false;
    mocks.mutation.error = null;
    await act(async () => mocks.mutationOptions?.onSuccess?.(result));

    expect(screen.getByText("2,00 USD")).toBeVisible();
    expect(screen.getByText("Conversão salva no seu histórico.")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(mocks.invalidateQueries).toHaveBeenCalledOnce();
  });
});
