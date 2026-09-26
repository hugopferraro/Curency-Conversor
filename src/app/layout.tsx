import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";

import { AppHeader } from "@/components/layout/app-header";
import theme from "@/theme";
import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Conversor de Moedas",
    template: "%s | Conversor de Moedas",
  },
  description:
    "Converta moedas com taxas de fechamento e guarde seu histórico em uma conta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <TRPCReactProvider>
              <AppHeader />
              {children}
            </TRPCReactProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
