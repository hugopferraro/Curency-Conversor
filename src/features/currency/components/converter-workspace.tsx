"use client";

import { Stack } from "@mui/material";
import { useRef } from "react";

import {
  CurrencyConverterCard,
  type CurrencyConverterHandle,
} from "@/features/currency/components/currency-converter-card";
import { ConversionHistorySection } from "@/features/history/components/conversion-history-section";
import { GuestHistoryCallout } from "@/features/history/components/guest-history-callout";

export function ConverterWorkspace({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const converterRef = useRef<CurrencyConverterHandle>(null);

  return (
    <Stack spacing={4}>
      <CurrencyConverterCard ref={converterRef} isAuthenticated={isAuthenticated} />
      {isAuthenticated ? (
        <ConversionHistorySection
          onReuse={(item) => converterRef.current?.reuse(item)}
        />
      ) : (
        <GuestHistoryCallout />
      )}
    </Stack>
  );
}
