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

  it("aceita espaços externos no e-mail para normalização no envio", () => {
    expect(
      loginFormSchema.safeParse({
        email: "  User@Example.COM  ",
        password: "12345678",
      }).success,
    ).toBe(true);
  });

  it("aceita senhas nos limites de 8 e 128 caracteres", () => {
    expect(
      loginFormSchema.safeParse({
        email: "user@example.com",
        password: "a".repeat(8),
      }).success,
    ).toBe(true);
    expect(
      loginFormSchema.safeParse({
        email: "user@example.com",
        password: "a".repeat(128),
      }).success,
    ).toBe(true);
  });

  it("rejeita senha acima de 128 caracteres", () => {
    expect(
      loginFormSchema.safeParse({
        email: "user@example.com",
        password: "a".repeat(129),
      }).success,
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

  it("exige a confirmação da senha no cadastro", () => {
    const result = registerFormSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
      passwordConfirmation: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["passwordConfirmation"]);
  });
});
