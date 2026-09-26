"use client";

import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { AmountField } from "@/features/currency/components/amount-field";
import { ConversionResult } from "@/features/currency/components/conversion-result";
import { CurrencySelect } from "@/features/currency/components/currency-select";
import {
  normalizeAmountInput,
  type ConversionResultDto,
} from "@/features/currency/contracts";
import type { HistoryItemDto } from "@/features/history/contracts";
import { useTRPC } from "@/trpc/client";

const PAIR_STORAGE_KEY = "currency-converter:last-pair";

export type CurrencyConverterHandle = {
  reuse: (item: HistoryItemDto) => void;
};

type CurrencyConverterCardProps = { isAuthenticated: boolean };

export const CurrencyConverterCard = forwardRef<
  CurrencyConverterHandle,
  CurrencyConverterCardProps
>(function CurrencyConverterCard({ isAuthenticated }, ref) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("1");
  const [sourceCurrency, setSourceCurrency] = useState("BRL");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [amountError, setAmountError] = useState<string>();
  const [result, setResult] = useState<ConversionResultDto>();

  const currencies = useQuery(
    trpc.currency.list.queryOptions(undefined, {
      staleTime: 1000 * 60 * 60 * 24,
      retry: 1,
    }),
  );

  const conversion = useMutation(
    trpc.currency.convert.mutationOptions({
      retry: false,
      onSuccess: async (data) => {
        setResult(data);
        if (data.savedToHistory) {
          await queryClient.invalidateQueries(trpc.history.pathFilter());
        }
      },
    }),
  );

  useEffect(() => {
    try {
      const storedPair = window.localStorage.getItem(PAIR_STORAGE_KEY);
      if (!storedPair) return;
      const parsed = JSON.parse(storedPair) as { source?: string; target?: string };
      if (/^[A-Z]{3}$/.test(parsed.source ?? "")) {
        setSourceCurrency(parsed.source!);
      }
      if (/^[A-Z]{3}$/.test(parsed.target ?? "")) {
        setTargetCurrency(parsed.target!);
      }
    } catch {
      window.localStorage.removeItem(PAIR_STORAGE_KEY);
    }
  }, []);

  function storePair(source: string, target: string) {
    window.localStorage.setItem(
      PAIR_STORAGE_KEY,
      JSON.stringify({ source, target }),
    );
  }

  function changeSource(code: string) {
    setSourceCurrency(code);
    setResult(undefined);
    storePair(code, targetCurrency);
  }

  function changeTarget(code: string) {
    setTargetCurrency(code);
    setResult(undefined);
    storePair(sourceCurrency, code);
  }

  function runConversion(source = sourceCurrency, target = targetCurrency) {
    const normalizedAmount = normalizeAmountInput(amount);
    if (!normalizedAmount) {
      setAmountError(
        "Informe um valor positivo de até 10¹⁵, com no máximo 18 casas decimais.",
      );
      return;
    }

    setAmountError(undefined);
    conversion.mutate({
      requestId: crypto.randomUUID(),
      amount: normalizedAmount,
      sourceCurrency: source,
      targetCurrency: target,
    });
  }

  function swapCurrencies() {
    const nextSource = targetCurrency;
    const nextTarget = sourceCurrency;
    setSourceCurrency(nextSource);
    setTargetCurrency(nextTarget);
    storePair(nextSource, nextTarget);

    if (result) {
      runConversion(nextSource, nextTarget);
    }
  }

  useImperativeHandle(ref, () => ({
    reuse(item) {
      setAmount(item.sourceAmount);
      setSourceCurrency(item.sourceCurrency);
      setTargetCurrency(item.targetCurrency);
      setAmountError(undefined);
      setResult(undefined);
      storePair(item.sourceCurrency, item.targetCurrency);
      requestAnimationFrame(() => amountInputRef.current?.focus());
    },
  }));

  const options = currencies.data ?? [];
  const isBusy = conversion.isPending;

  return (
    <Card elevation={0} sx={{ boxShadow: "0 24px 70px rgba(23,49,44,.1)" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack
          component="form"
          spacing={3}
          onSubmit={(event) => {
            event.preventDefault();
            runConversion();
          }}
        >
          <AmountField
            value={amount}
            onChange={(value) => {
              setAmount(value);
              setAmountError(undefined);
              setResult(undefined);
            }}
            error={amountError}
            disabled={isBusy}
            inputRef={amountInputRef}
          />

          {currencies.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => currencies.refetch()}>
                  Tentar novamente
                </Button>
              }
            >
              Não foi possível carregar as moedas disponíveis.
            </Alert>
          ) : null}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: "stretch" }}
          >
            <Stack sx={{ flex: 1 }}>
              <CurrencySelect
                id="source-currency"
                label="Moeda de origem"
                value={sourceCurrency}
                options={options}
                loading={currencies.isLoading}
                disabled={isBusy || currencies.isError}
                onChange={changeSource}
              />
            </Stack>
            <IconButton
              type="button"
              aria-label="Inverter moedas"
              onClick={swapCurrencies}
              disabled={isBusy || options.length === 0}
              sx={{
                alignSelf: "center",
                border: 1,
                borderColor: "divider",
                transform: { xs: "none", sm: "rotate(90deg)" },
              }}
            >
              <SwapVertIcon />
            </IconButton>
            <Stack sx={{ flex: 1 }}>
              <CurrencySelect
                id="target-currency"
                label="Moeda de destino"
                value={targetCurrency}
                options={options}
                loading={currencies.isLoading}
                disabled={isBusy || currencies.isError}
                onChange={changeTarget}
              />
            </Stack>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isBusy || options.length === 0}
            startIcon={isBusy ? <CircularProgress color="inherit" size={18} /> : null}
          >
            {isBusy ? "Convertendo…" : "Converter"}
          </Button>

          {conversion.isError ? (
            <Alert severity="error" aria-live="assertive">
              {conversion.error.message ||
                "Não foi possível realizar a conversão. Tente novamente."}
            </Alert>
          ) : null}

          {result ? <ConversionResult result={result} /> : null}

          <Typography variant="caption" color="text.secondary">
            Valores meramente informativos. Instituições financeiras podem aplicar
            tarifas e taxas diferentes.
          </Typography>

          {isAuthenticated && result?.savedToHistory ? (
            <Typography variant="caption" color="success.main" aria-live="polite">
              Conversão salva no seu histórico.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
});
