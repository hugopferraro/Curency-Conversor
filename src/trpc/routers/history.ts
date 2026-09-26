import { TRPCError } from "@trpc/server";

import {
  historyDeleteInputSchema,
  historyListInputSchema,
} from "@/features/history/contracts";
import {
  clearUserHistory,
  deleteUserHistoryEntry,
  listUserHistory,
} from "@/features/history/server/service";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const historyRouter = createTRPCRouter({
  list: protectedProcedure
    .input(historyListInputSchema)
    .query(({ ctx, input }) =>
      listUserHistory(ctx.session.user.id, input.limit, input.cursor),
    ),

  delete: protectedProcedure
    .input(historyDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const deleted = await deleteUserHistoryEntry(
        ctx.session.user.id,
        input.id,
      );

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversão não encontrada.",
        });
      }

      return { deleted: true };
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => ({
    deletedCount: await clearUserHistory(ctx.session.user.id),
  })),
});
