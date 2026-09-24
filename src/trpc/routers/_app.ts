import { z } from "zod";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(({ input }) => ({
      greeting: `Hello, ${input.text}!`,
    })),
});

export type AppRouter = typeof appRouter;
