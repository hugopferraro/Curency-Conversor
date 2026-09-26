import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppHeaderClient } from "@/components/layout/app-header-client";

const mocks = vi.hoisted(() => ({
  clear: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => ({ clear: mocks.clear }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

vi.mock("@/features/auth/client", () => ({
  authClient: { signOut: mocks.signOut },
}));

describe("AppHeaderClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra marca e ações de autenticação para visitantes", () => {
    render(<AppHeaderClient user={null} />);

    expect(
      screen.getByRole("link", { name: "Conversor de Moedas" }),
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.queryByText(/perfil/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/histórico/i)).not.toBeInTheDocument();
  });

  it("mostra somente e-mail e saída para o usuário autenticado", () => {
    render(
      <AppHeaderClient
        user={{
          id: "00000000-0000-4000-8000-000000000000",
          email: "user@example.com",
        }}
      />,
    );

    expect(screen.getByText("user@example.com")).toBeVisible();
    expect(screen.getByRole("button", { name: "Sair" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Criar conta" }),
    ).not.toBeInTheDocument();
  });

  it("limpa dados privados e atualiza a navegação após o logout", async () => {
    const user = userEvent.setup();
    mocks.signOut.mockResolvedValue({ error: null });
    render(
      <AppHeaderClient
        user={{
          id: "00000000-0000-4000-8000-000000000000",
          email: "user@example.com",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => expect(mocks.clear).toHaveBeenCalledOnce());
    expect(mocks.replace).toHaveBeenCalledWith("/");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("preserva o cache e libera o botão quando o logout falha", async () => {
    const user = userEvent.setup();
    mocks.signOut.mockResolvedValue({ error: { message: "network" } });
    render(
      <AppHeaderClient
        user={{
          id: "00000000-0000-4000-8000-000000000000",
          email: "user@example.com",
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "Sair" });
    await user.click(button);

    await waitFor(() => expect(button).toBeEnabled());
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("encerra o estado de carregamento depois do logout", async () => {
    const user = userEvent.setup();
    let finishSignOut: (value: { error: null }) => void = () => undefined;

    mocks.signOut.mockReturnValue(
      new Promise((resolve) => {
        finishSignOut = resolve;
      }),
    );

    const { rerender } = render(
      <AppHeaderClient
        user={{ id: "00000000-0000-4000-8000-000000000000", email: "user@example.com" }}
      />,
    );

    const signOutButton = screen.getByRole("button", { name: "Sair" });
    await user.click(signOutButton);
    expect(signOutButton).toBeDisabled();

    finishSignOut({ error: null });
    await waitFor(() => expect(signOutButton).toBeEnabled());

    rerender(<AppHeaderClient user={null} />);
    rerender(
      <AppHeaderClient
        user={{ id: "00000000-0000-4000-8000-000000000000", email: "user@example.com" }}
      />,
    );

    expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();
  });
});
