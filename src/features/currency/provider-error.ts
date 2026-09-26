import type { CurrencyProviderErrorKind } from "@/features/currency/server/provider";

export const currencyProviderMessages: Record<CurrencyProviderErrorKind, string> = {
  authentication: "O serviço de câmbio não está configurado corretamente.",
  "invalid-request": "O provedor não aceitou a consulta de câmbio.",
  quota: "O limite de consultas de câmbio foi atingido. Tente novamente depois.",
  timeout: "O serviço de câmbio demorou demais para responder.",
  "invalid-response": "O serviço de câmbio retornou dados inválidos.",
  unavailable: "O serviço de câmbio está indisponível no momento.",
};
