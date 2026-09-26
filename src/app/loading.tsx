import { Box, CircularProgress, Stack, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Box component="main" sx={{ py: 10 }}>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <CircularProgress aria-label="Carregando página" />
        <Typography color="text.secondary">Carregando…</Typography>
      </Stack>
    </Box>
  );
}
