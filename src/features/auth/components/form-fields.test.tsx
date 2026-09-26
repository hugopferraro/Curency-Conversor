import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordField } from "@/features/auth/components/form-fields";

describe("PasswordField", () => {
  it("mostra e oculta a senha por uma ação acessível", async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Senha" defaultValue="segredo123" />);

    const input = screen.getByLabelText("Senha");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(input).toHaveAttribute("type", "password");
  });
});
