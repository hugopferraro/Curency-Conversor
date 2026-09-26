import { describe, expect, it } from "vitest";

import {
  loginFormSchema,
  registerFormSchema,
} from "@/features/auth/contracts";

describe("contratos de autenticação", () => {
  it("aceita login válido", () => {
    expect(
      loginFormSchema.safeParse({ email: "user@example.com", password: "12345678" })
        .success,
    ).toBe(true);
  });

  it("rejeita e-mail inválido e senha curta", () => {
    expect(
      loginFormSchema.safeParse({ email: "inválido", password: "123" }).success,
    ).toBe(false);
  });

  it("rejeita confirmação de senha diferente", () => {
    const result = registerFormSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
      passwordConfirmation: "87654321",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["passwordConfirmation"]);
  });
});
