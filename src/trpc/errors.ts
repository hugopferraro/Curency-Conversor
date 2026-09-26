import "server-only";

import { TRPCError } from "@trpc/server";

import {
  CurrencyProviderError,
} from "@/features/currency/server/provider";
import { UnsupportedCurrencyError } from "@/features/currency/server/service";
import { currencyProviderMessages } from "@/features/currency/provider-error";


export function mapCurrencyError(error: unknown): TRPCError {
  if (error instanceof UnsupportedCurrencyError) {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  if (error instanceof CurrencyProviderError) {
    return new TRPCError({
      code: error.kind === "quota" ? "TOO_MANY_REQUESTS" : "BAD_GATEWAY",
      message: currencyProviderMessages[error.kind],
      cause: error,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Não foi possível concluir a operação de câmbio.",
    cause: error,
  });
}
