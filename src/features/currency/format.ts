import Decimal from "decimal.js";

export function formatDecimal(value: string, maximumFractionDigits = 18) {
  const decimal = new Decimal(value);
  const fractionDigits = Math.max(
    2,
    Math.min(maximumFractionDigits, decimal.decimalPlaces()),
  );
  const [integerPart, fractionPart = ""] = decimal
    .toDecimalPlaces(maximumFractionDigits, Decimal.ROUND_HALF_UP)
    .toFixed(fractionDigits)
    .split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${groupedInteger},${fractionPart}`;
}

export function formatCurrencyAmount(value: string, currency: string) {
  return `${formatDecimal(value)} ${currency}`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
