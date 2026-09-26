import { describe, expect, it } from "vitest";

import theme from "@/theme";

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );

  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}

describe("tema e acessibilidade visual", () => {
  it("mantém o tema claro definido para a entrega", () => {
    expect(theme.palette.mode).toBe("light");
  });

  it("mantém contraste WCAG AA nos pares principais de texto", () => {
    expect(
      contrast(theme.palette.text.primary, theme.palette.background.default),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(theme.palette.primary.main, theme.palette.background.paper),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF", theme.palette.primary.main)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("define área mínima de toque para botões", () => {
    expect(theme.components?.MuiButton?.styleOverrides?.root).toMatchObject({
      minHeight: 44,
    });
  });
});
