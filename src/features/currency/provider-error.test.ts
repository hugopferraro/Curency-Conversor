import { describe, expect, it } from "vitest";

import { currencyProviderMessages } from "@/features/currency/provider-error";

describe("mensagens de falha do provedor", () => {
  it("não expõe detalhes de autenticação", () => {
    expect(currencyProviderMessages.authentication).toBe(
      "O serviço de câmbio não está configurado corretamente.",
    );
  });

  it("diferencia quota, timeout e resposta inválida", () => {
    expect(currencyProviderMessages.quota).toContain("limite");
    expect(currencyProviderMessages.timeout).toContain("demorou");
    expect(currencyProviderMessages["invalid-response"]).toContain("dados inválidos");
  });
});
