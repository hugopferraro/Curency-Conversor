"use client";

import { Autocomplete, CircularProgress, TextField } from "@mui/material";

import type { CurrencyOption } from "@/features/currency/contracts";

type CurrencySelectProps = {
  id: string;
  label: string;
  value: string;
  options: CurrencyOption[];
  loading: boolean;
  disabled: boolean;
  onChange: (code: string) => void;
};

export function CurrencySelect({
  id,
  label,
  value,
  options,
  loading,
  disabled,
  onChange,
}: CurrencySelectProps) {
  const selected = options.find((currency) => currency.code === value) ?? {
    code: value,
    name: value,
    symbol: value,
    decimalDigits: 2,
  };
  const availableOptions = options.some((option) => option.code === selected.code)
    ? options
    : [selected, ...options];

  return (
    <Autocomplete
      id={id}
      value={selected}
      options={availableOptions}
      loading={loading}
      loadingText="Carregando moedas…"
      noOptionsText="Nenhuma moeda encontrada"
      openText="Abrir"
      closeText="Fechar"
      clearText="Limpar"
      disabled={disabled}
      disableClearable
      isOptionEqualToValue={(option, selected) => option.code === selected.code}
      getOptionLabel={(option) => `${option.code} — ${option.name}`}
      onChange={(_, option) => onChange(option.code)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          slotProps={{
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={18} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
            htmlInput: params.slotProps.htmlInput,
            inputLabel: params.slotProps.inputLabel,
          }}
        />
      )}
    />
  );
}
