import { conversionInputSchema } from "@/features/currency/contracts";
import {
  convertCurrency,
  listSupportedCurrencies,
} from "@/features/currency/server/service";
import { mapCurrencyError } from "@/trpc/errors";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

export const currencyRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    try {
      return await listSupportedCurrencies();
    } catch (error) {
      throw mapCurrencyError(error);
    }
  }),

  convert: publicProcedure
    .input(conversionInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await convertCurrency(input, ctx.session?.user.id ?? null);
      } catch (error) {
        throw mapCurrencyError(error);
      }
    }),
});
