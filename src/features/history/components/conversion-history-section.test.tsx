import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConversionHistorySection } from "@/features/history/components/conversion-history-section";
import type { HistoryItemDto } from "@/features/history/contracts";

const mocks = vi.hoisted(() => ({
  clearOptions: undefined as { onSuccess?: () => Promise<void> } | undefined,
  deleteOptions: undefined as { onSuccess?: () => Promise<void> } | undefined,
  invalidateQueries: vi.fn(),
  history: {
    data: undefined as
      | { pages: Array<{ items: HistoryItemDto[]; nextCursor: unknown }> }
      | undefined,
    isPending: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
  },
  deleteMutation: {
    mutate: vi.fn(),
    isPending: false,
    error: null as Error | null,
  },
  clearMutation: {
    mutate: vi.fn(),
    isPending: false,
    error: null as Error | null,
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: () => mocks.history,
  useMutation: (options: { kind: "delete" | "clear"; onSuccess: () => Promise<void> }) => {
    if (options.kind === "delete") {
      mocks.deleteOptions = options;
      return mocks.deleteMutation;
    }
    mocks.clearOptions = options;
    return mocks.clearMutation;
  },
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    history: {
      list: { infiniteQueryOptions: vi.fn(() => ({})) },
      delete: { mutationOptions: vi.fn((options) => ({ kind: "delete", ...options })) },
      clear: { mutationOptions: vi.fn((options) => ({ kind: "clear", ...options })) },
      pathFilter: vi.fn(() => ({ queryKey: ["history"] })),
    },
  }),
}));

const item: HistoryItemDto = {
  id: "00000000-0000-4000-8000-000000000001",
  requestId: "00000000-0000-4000-8000-000000000002",
  sourceCurrency: "BRL",
  targetCurrency: "USD",
  sourceAmount: "10",
  exchangeRate: "0.2",
  convertedAmount: "2",
  rateProvider: "MockProvider",
  rateFetchedAt: "2026-09-25T12:30:00.000Z",
  createdAt: "2026-09-25T12:31:00.000Z",
};

describe("ConversionHistorySection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.history.data = undefined;
    mocks.history.isPending = false;
    mocks.history.isError = false;
    mocks.history.hasNextPage = false;
    mocks.history.isFetchingNextPage = false;
    mocks.deleteMutation.isPending = false;
    mocks.deleteMutation.error = null;
    mocks.clearMutation.isPending = false;
    mocks.clearMutation.error = null;
  });

  it("distingue carregamento, falha recuperável e estado vazio", async () => {
    mocks.history.isPending = true;
    const { rerender } = render(<ConversionHistorySection onReuse={vi.fn()} />);
    expect(screen.getByText("Carregando histórico…")).toBeVisible();

    mocks.history.isPending = false;
    mocks.history.isError = true;
    rerender(<ConversionHistorySection onReuse={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(mocks.history.refetch).toHaveBeenCalledOnce();

    mocks.history.isError = false;
    mocks.history.data = { pages: [{ items: [], nextCursor: null }] };
    rerender(<ConversionHistorySection onReuse={vi.fn()} />);
    expect(screen.getByText(/histórico ainda está vazio/i)).toBeVisible();
  });

  it("acrescenta páginas sem navegação e encaminha a reutilização", async () => {
    const user = userEvent.setup();
    const onReuse = vi.fn();
    mocks.history.data = { pages: [{ items: [item], nextCursor: { id: item.id } }] };
    mocks.history.hasNextPage = true;
    render(<ConversionHistorySection onReuse={onReuse} />);

    await user.click(screen.getByRole("button", { name: "Reutilizar" }));
    await user.click(screen.getByRole("button", { name: "Carregar mais" }));

    expect(onReuse).toHaveBeenCalledWith(item);
    expect(mocks.history.fetchNextPage).toHaveBeenCalledOnce();
  });

  it("exige confirmação para excluir um item e atualiza o histórico", async () => {
    const user = userEvent.setup();
    mocks.history.data = { pages: [{ items: [item], nextCursor: null }] };
    render(<ConversionHistorySection onReuse={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    const dialog = screen.getByRole("dialog", { name: "Excluir esta conversão?" });
    expect(dialog).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(mocks.deleteMutation.mutate).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Excluir esta conversão?" }),
      ).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    await user.click(
      within(
        screen.getByRole("dialog", { name: "Excluir esta conversão?" }),
      ).getByRole("button", { name: "Excluir" }),
    );
    expect(mocks.deleteMutation.mutate).toHaveBeenCalledWith({ id: item.id });

    await act(async () => mocks.deleteOptions?.onSuccess?.());
    await waitFor(() => expect(mocks.invalidateQueries).toHaveBeenCalledOnce());
  });

  it("exige confirmação explícita antes de apagar todo o histórico", async () => {
    const user = userEvent.setup();
    mocks.history.data = { pages: [{ items: [item], nextCursor: null }] };
    render(<ConversionHistorySection onReuse={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Apagar histórico" }));
    const dialog = screen.getByRole("dialog", { name: "Apagar todo o histórico?" });
    expect(dialog).toHaveTextContent("Esta ação não pode ser desfeita.");
    await user.click(screen.getByRole("button", { name: "Apagar tudo" }));
    expect(mocks.clearMutation.mutate).toHaveBeenCalledOnce();

    await act(async () => mocks.clearOptions?.onSuccess?.());
    await waitFor(() => expect(mocks.invalidateQueries).toHaveBeenCalledOnce());
  });

  it("anuncia falhas de mutação sem remover os itens", () => {
    mocks.history.data = { pages: [{ items: [item], nextCursor: null }] };
    mocks.deleteMutation.error = new Error("Não foi possível excluir.");
    render(<ConversionHistorySection onReuse={vi.fn()} />);

    const alert = screen.getByText("Não foi possível excluir.").closest("[role=alert]");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText(/10,00 BRL/)).toBeVisible();
  });
});
