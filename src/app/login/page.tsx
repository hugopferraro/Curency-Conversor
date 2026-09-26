import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/features/auth/server/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <AuthPageShell
      title="Boas-vindas"
      description="Entre para acessar seu histórico de conversões."
    >
      <LoginForm />
    </AuthPageShell>
  );
}
