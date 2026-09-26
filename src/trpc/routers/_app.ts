import { createTRPCRouter } from "@/trpc/init";
import { currencyRouter } from "@/trpc/routers/currency";
import { historyRouter } from "@/trpc/routers/history";

export const appRouter = createTRPCRouter({
  currency: currencyRouter,
  history: historyRouter,
});

export type AppRouter = typeof appRouter;
