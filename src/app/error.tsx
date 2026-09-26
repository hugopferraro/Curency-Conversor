"use client";

import { Alert, Box, Button, Container, Stack } from "@mui/material";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Falha inesperada na interface", error);
      return;
    }

    console.error("Falha inesperada na interface", error.digest ?? "sem digest");
  }, [error]);

  return (
    <Box component="main" sx={{ py: 8 }}>
      <Container maxWidth="sm">
        <Alert severity="error">
          <Stack spacing={2}>
            Não foi possível carregar esta página.
            <Button color="inherit" variant="outlined" onClick={reset}>
              Tentar novamente
            </Button>
          </Stack>
        </Alert>
      </Container>
    </Box>
  );
}
