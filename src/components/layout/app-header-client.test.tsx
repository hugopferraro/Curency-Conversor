import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
