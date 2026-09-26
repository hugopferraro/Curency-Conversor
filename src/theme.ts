"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#176B5B", dark: "#0F4C41", light: "#D9F2EC" },
    secondary: { main: "#C46B2E" },
    background: { default: "#F5F8F7", paper: "#FFFFFF" },
    text: { primary: "#17312C", secondary: "#536762" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    h1: { fontWeight: 750, letterSpacing: "-0.035em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, borderRadius: 10 } },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid rgba(23, 107, 91, 0.12)" },
      },
    },
  },
});

export default theme;
