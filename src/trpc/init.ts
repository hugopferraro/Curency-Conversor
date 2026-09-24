import { initTRPC } from "@trpc/server";

export async function createTRPCContext(opts: { headers: Headers }) {
  return {
    headers: opts.headers,
  };
}

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
