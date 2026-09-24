import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: request.headers }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`[tRPC] Failed on ${path ?? "unknown"}:`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
