"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export function ClientGreeting() {
  const trpc = useTRPC();
  const greeting = useQuery(trpc.hello.queryOptions({ text: "tRPC" }));

  if (greeting.isPending) {
    return <p>Loading tRPC...</p>;
  }

  if (greeting.isError) {
    return <p>Could not load the tRPC greeting.</p>;
  }

  return <p>{greeting.data.greeting}</p>;
}
