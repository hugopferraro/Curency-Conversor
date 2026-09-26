import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@/features/auth/components/register-form";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

vi.mock("@/features/auth/client", () => ({
  authClient: { signUp: { email: mocks.signUp } },
}));

describe("RegisterForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("solicita apenas e-mail, senha e confirmação e mostra o requisito", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("E-mail")).toBeVisible();
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("Confirmar senha")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByText("A senha deve ter entre 8 e 128 caracteres."),
    ).toBeVisible();
    expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("rejeita confirmação diferente sem enviar o cadastro", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.type(screen.getByLabelText("Senha"), "valid-password");
    await user.type(screen.getByLabelText("Confirmar senha"), "other-password");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("As senhas não coincidem.")).toBeVisible();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("normaliza o e-mail, usa o nome técnico e redireciona após cadastrar", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockResolvedValue({ error: null });
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("E-mail"), "  User@Example.COM  ");
    await user.type(screen.getByLabelText("Senha"), "valid-password");
    await user.type(screen.getByLabelText("Confirmar senha"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() =>
      expect(mocks.signUp).toHaveBeenCalledWith({
        name: "User",
        email: "user@example.com",
        password: "valid-password",
      }),
    );
    expect(mocks.replace).toHaveBeenCalledWith("/");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("não expõe detalhes internos quando o cadastro falha", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockResolvedValue({ error: { message: "duplicate key value" } });
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.type(screen.getByLabelText("Senha"), "valid-password");
    await user.type(screen.getByLabelText("Confirmar senha"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(
      await screen.findByText(
        "Não foi possível criar a conta. Verifique se o e-mail já está em uso.",
      ),
    ).toBeVisible();
    expect(screen.queryByText("duplicate key value")).not.toBeInTheDocument();
  });
});
