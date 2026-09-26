import Decimal from "decimal.js";

const PreciseDecimal = Decimal.clone({
  precision: 60,
  rounding: Decimal.ROUND_HALF_UP,
});

export type CalculatedConversion = {
  exchangeRate: string;
  convertedAmount: string;
};

export function canonicalizeDecimal(value: string) {
  return new PreciseDecimal(value).toFixed();
}

export function calculateConversion(
  amount: string,
  sourceUsdRate: string,
  targetUsdRate: string,
): CalculatedConversion {
  const sourceRate = new PreciseDecimal(sourceUsdRate);
  const targetRate = new PreciseDecimal(targetUsdRate);

  if (sourceRate.lte(0) || targetRate.lte(0)) {
    throw new Error("As taxas devem ser positivas.");
  }

  const exchangeRate = targetRate.dividedBy(sourceRate);
  const convertedAmount = new PreciseDecimal(amount).times(exchangeRate);

  return {
    exchangeRate: exchangeRate.toDecimalPlaces(18).toFixed(),
    convertedAmount: convertedAmount.toDecimalPlaces(18).toFixed(),
  };
}
