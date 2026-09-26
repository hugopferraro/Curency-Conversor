"use client";

import { TextField } from "@mui/material";

type AmountFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
  inputRef: React.Ref<HTMLInputElement>;
};

export function AmountField({
  value,
  onChange,
  error,
  disabled,
  inputRef,
}: AmountFieldProps) {
  return (
    <TextField
      label="Valor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error ?? "Use ponto ou vírgula como separador decimal."}
      disabled={disabled}
      inputRef={inputRef}
      inputMode="decimal"
      autoComplete="off"
      fullWidth
    />
  );
}
