import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  clearHistoryEntries: vi.fn(),
  deleteHistoryEntry: vi.fn(),
  listHistoryEntries: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/features/history/server/repository", () => repository);

import {
  clearUserHistory,
  deleteUserHistoryEntry,
  listUserHistory,
  toHistoryDto,
} from "@/features/history/server/service";

function entry(
  index: number,
  createdAt = new Date(
    `2026-09-25T12:${index.toString().padStart(2, "0")}:00.000Z`,
  ),
) {
  return {
    id: `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`,
    userId: "00000000-0000-4000-8000-000000000100",
    requestId: `10000000-0000-4000-8000-${index.toString().padStart(12, "0")}`,
    sourceCurrency: "BRL",
    targetCurrency: "USD",
    sourceAmount: `${index}.000000000000000000`,
    exchangeRate: "0.200000000000000000",
    convertedAmount: String(index / 5),
    rateProvider: "MockProvider",
    rateFetchedAt: new Date("2026-09-25T12:00:00.000Z"),
    createdAt,
  };
}

describe("serviço de histórico", () => {
  beforeEach(() => vi.clearAllMocks());

  it("transporta decimais como strings canônicas e datas ISO", () => {
    expect(toHistoryDto(entry(10))).toMatchObject({
      sourceAmount: "10",
      exchangeRate: "0.2",
      convertedAmount: "2",
      rateFetchedAt: "2026-09-25T12:00:00.000Z",
      createdAt: "2026-09-25T12:10:00.000Z",
    });
  });

  it("retorna a página solicitada e cria cursor pelo último item", async () => {
    repository.listHistoryEntries.mockResolvedValue([entry(3), entry(2), entry(1)]);

    const result = await listUserHistory("user-id", 2);

    expect(repository.listHistoryEntries).toHaveBeenCalledWith("user-id", 2, undefined);
    expect(result.items.map((item) => item.sourceAmount)).toEqual(["3", "2"]);
    expect(result.nextCursor).toEqual({
      createdAt: "2026-09-25T12:02:00.000Z",
      id: entry(2).id,
    });
  });

  it("encerra a paginação quando não há item excedente", async () => {
    repository.listHistoryEntries.mockResolvedValue([entry(1)]);

    await expect(listUserHistory("user-id", 20)).resolves.toMatchObject({
      nextCursor: null,
    });
  });

  it("sempre restringe exclusão e limpeza ao usuário recebido", async () => {
    repository.deleteHistoryEntry.mockResolvedValue(true);
    repository.clearHistoryEntries.mockResolvedValue(3);

    await expect(deleteUserHistoryEntry("user-a", "item-a")).resolves.toBe(true);
    await expect(clearUserHistory("user-a")).resolves.toBe(3);
    expect(repository.deleteHistoryEntry).toHaveBeenCalledWith("user-a", "item-a");
    expect(repository.clearHistoryEntries).toHaveBeenCalledWith("user-a");
  });
});
