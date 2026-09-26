import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GuestHistoryCallout } from "@/features/history/components/guest-history-callout";

describe("GuestHistoryCallout", () => {
  it("convida visitantes a entrar ou criar conta sem mostrar histórico", () => {
    render(<GuestHistoryCallout />);

    expect(screen.getByText("Guarde suas conversões")).toBeVisible();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.queryByRole("heading", { name: "Histórico" })).not.toBeInTheDocument();
  });
});
