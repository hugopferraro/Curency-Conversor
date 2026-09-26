import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getCurrentUser } from "@/features/auth/server/session";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegisterPage() {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <AuthPageShell
      title="Crie sua conta"
      description="Use somente seu e-mail e uma senha para salvar conversões."
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
