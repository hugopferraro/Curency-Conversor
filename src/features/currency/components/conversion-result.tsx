"use client";

import { Alert, Divider, Stack, Typography } from "@mui/material";

import type { ConversionResultDto } from "@/features/currency/contracts";
import {
  formatCurrencyAmount,
  formatDateTime,
  formatDecimal,
} from "@/features/currency/format";

export function ConversionResult({ result }: { result: ConversionResultDto }) {
  return (
    <Alert severity="success" variant="outlined" aria-live="polite">
      <Stack spacing={1.25}>
        <Typography variant="body2" color="text.secondary">
          {formatCurrencyAmount(result.sourceAmount, result.sourceCurrency)} equivale a
        </Typography>
        <Typography
          component="p"
          variant="h4"
          color="success.dark"
          sx={{ fontWeight: 750 }}
        >
          {formatCurrencyAmount(result.convertedAmount, result.targetCurrency)}
        </Typography>
        <Divider />
        <Typography variant="body2">
          1 {result.sourceCurrency} = {formatDecimal(result.exchangeRate)}{" "}
          {result.targetCurrency}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Taxa de fechamento consultada em {formatDateTime(result.rateFetchedAt)} via{" "}
          {result.rateProvider}.
        </Typography>
      </Stack>
    </Alert>
  );
}
