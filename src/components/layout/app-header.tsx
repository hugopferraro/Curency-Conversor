import { getCurrentUser } from "@/features/auth/server/session";
import { AppHeaderClient } from "@/components/layout/app-header-client";

export async function AppHeader() {
  return <AppHeaderClient user={await getCurrentUser()} />;
}
