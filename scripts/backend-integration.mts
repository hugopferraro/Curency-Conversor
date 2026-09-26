import "dotenv/config";

import { inArray } from "drizzle-orm";

import type { CurrencyRateProvider } from "@/features/currency/server/provider";

const TEST_EMAILS = [
  "currency-integration-a@example.invalid",
  "currency-integration-b@example.invalid",
];

const [
  { db },
  { conversionHistory, users },
  { convertCurrency },
  { clearUserHistory, deleteUserHistoryEntry, listUserHistory },
] = await Promise.all([
  import("@/db/client"),
  import("@/db/schema"),
  import("@/features/currency/server/service"),
  import("@/features/history/server/service"),
]);

const mockProvider: CurrencyRateProvider = {
  async listCurrencies() {
    return [
      { code: "BRL", name: "Real brasileiro", symbol: "R$", decimalDigits: 2 },
      { code: "USD", name: "Dólar americano", symbol: "$", decimalDigits: 2 },
    ];
  },
  async getUsdRateMatrix() {
    return {
      rates: { USD: "1", BRL: "5", EUR: "0.8" },
      fetchedAt: "2026-09-25T00:00:00.000Z",
      provider: "MockProvider",
    };
  },
};

async function cleanup() {
  await db.delete(users).where(inArray(users.email, TEST_EMAILS));
}

try {
  await cleanup();
  const [userA, userB] = await db
    .insert(users)
    .values(
      TEST_EMAILS.map((email) => ({
        name: "User",
        email,
        emailVerified: false,
      })),
    )
    .returning({ id: users.id });

  if (!userA || !userB) throw new Error("Não foi possível criar usuários de teste.");

  const guestResult = await convertCurrency(
    {
      requestId: crypto.randomUUID(),
      amount: "10",
      sourceCurrency: "BRL",
      targetCurrency: "USD",
    },
    null,
    mockProvider,
  );

  if (guestResult.savedToHistory || guestResult.convertedAmount !== "2") {
    throw new Error("A conversão de visitante não respeitou o contrato.");
  }

  const requestId = crypto.randomUUID();
  const firstResult = await convertCurrency(
    {
      requestId,
      amount: "10",
      sourceCurrency: "BRL",
      targetCurrency: "USD",
    },
    userA.id,
    mockProvider,
  );
  const repeatedResult = await convertCurrency(
    {
      requestId,
      amount: "999",
      sourceCurrency: "USD",
      targetCurrency: "BRL",
    },
    userA.id,
    mockProvider,
  );

  if (
    !firstResult.savedToHistory ||
    firstResult.historyId !== repeatedResult.historyId ||
    repeatedResult.sourceAmount !== "10"
  ) {
    throw new Error("A idempotência por requestId falhou.");
  }

  const isolatedHistory = await listUserHistory(userB.id, 20);
  if (isolatedHistory.items.length !== 0) {
    throw new Error("O histórico vazou entre usuários.");
  }

  for (let index = 0; index < 21; index += 1) {
    await convertCurrency(
      {
        requestId: crypto.randomUUID(),
        amount: String(index + 1),
        sourceCurrency: "USD",
        targetCurrency: "BRL",
      },
      userA.id,
      mockProvider,
    );
  }

  const firstPage = await listUserHistory(userA.id, 20);
  if (firstPage.items.length !== 20 || !firstPage.nextCursor) {
    throw new Error("A primeira página do histórico está incorreta.");
  }

  const secondPage = await listUserHistory(userA.id, 20, firstPage.nextCursor);
  if (secondPage.items.length !== 2 || secondPage.nextCursor) {
    throw new Error("A segunda página do histórico está incorreta.");
  }

  const itemId = firstPage.items[0]?.id;
  if (!itemId) throw new Error("Não há item para validar a exclusão.");
  if (await deleteUserHistoryEntry(userB.id, itemId)) {
    throw new Error("Outro usuário conseguiu excluir o item.");
  }
  if (!(await deleteUserHistoryEntry(userA.id, itemId))) {
    throw new Error("O proprietário não conseguiu excluir o item.");
  }

  const deletedCount = await clearUserHistory(userA.id);
  if (deletedCount !== 21) {
    throw new Error(`A limpeza removeu ${deletedCount} itens em vez de 21.`);
  }

  const remainingRows = await db.select().from(conversionHistory);
  if (remainingRows.some((row) => row.userId === userA.id)) {
    throw new Error("A limpeza deixou itens do usuário no histórico.");
  }

  console.log("Integração de conversão e histórico validada com sucesso.");
} finally {
  await cleanup();
}
