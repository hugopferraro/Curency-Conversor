import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/features/auth/server/auth";
import type { CurrentUser } from "@/features/auth/contracts";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  return { id: session.user.id, email: session.user.email };
});
