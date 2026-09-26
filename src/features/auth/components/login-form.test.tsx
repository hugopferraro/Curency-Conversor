import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/features/auth/components/login-form";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

vi.mock("@/features/auth/client", () => ({
  authClient: { signIn: { email: mocks.signIn } },
}));

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("solicita somente e-mail e senha e mantém a senha mascarada", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("valida os campos antes de enviar", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "inválido");
    await user.type(screen.getByLabelText("Senha"), "curta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeVisible();
    expect(
      screen.getByText("A senha deve ter pelo menos 8 caracteres."),
    ).toBeVisible();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("normaliza o e-mail e redireciona depois do sucesso", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockResolvedValue({ error: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "  User@Example.COM  ");
    await user.type(screen.getByLabelText("Senha"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(mocks.signIn).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "valid-password",
      }),
    );
    expect(mocks.replace).toHaveBeenCalledWith("/");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("mostra erro genérico sem revelar se a conta existe", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockResolvedValue({ error: { message: "User not found" } });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "missing@example.com");
    await user.type(screen.getByLabelText("Senha"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText(
        "E-mail ou senha inválidos. Verifique os dados e tente novamente.",
      ),
    ).toBeVisible();
    expect(screen.queryByText("User not found")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
