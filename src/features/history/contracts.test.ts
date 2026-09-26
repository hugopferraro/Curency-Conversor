import { describe, expect, it } from "vitest";

import {
  historyDeleteInputSchema,
  historyListInputSchema,
} from "@/features/history/contracts";

describe("contratos do histórico", () => {
  it("usa páginas de 20 itens por padrão", () => {
    expect(historyListInputSchema.parse(undefined)).toEqual({ limit: 20 });
    expect(historyListInputSchema.parse({})).toEqual({ limit: 20 });
  });

  it("aceita no máximo 50 itens e cursor estável", () => {
    const cursor = {
      createdAt: "2026-09-25T12:30:00.000Z",
      id: "00000000-0000-4000-8000-000000000000",
    };

    expect(historyListInputSchema.parse({ limit: 50, cursor })).toEqual({
      limit: 50,
      cursor,
    });
    expect(historyListInputSchema.safeParse({ limit: 51 }).success).toBe(false);
  });

  it("exige UUID para exclusão", () => {
    expect(
      historyDeleteInputSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000000",
      }).success,
    ).toBe(true);
    expect(historyDeleteInputSchema.safeParse({ id: "outro-usuário" }).success).toBe(
      false,
    );
  });
});
