import { initTRPC, TRPCError } from "@trpc/server";

import { auth } from "@/features/auth/server/auth";

export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({ headers: opts.headers });

  return {
    headers: opts.headers,
    session,
  };
}

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Entre na sua conta para acessar este recurso.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
