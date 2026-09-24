import { connection } from "next/server";

import { ClientGreeting } from "@/app/client-greeting";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default async function Home() {
  await connection();

  void getQueryClient().prefetchQuery(
    trpc.hello.queryOptions({ text: "tRPC" }),
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <section className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
          Currency Conversor
        </h1>
        <div className="mt-4 text-zinc-600 dark:text-zinc-400">
          <HydrateClient>
            <ClientGreeting />
          </HydrateClient>
        </div>
      </section>
    </main>
  );
}
