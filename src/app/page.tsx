import { Box, Container, Stack, Typography } from "@mui/material";

import { ConverterWorkspace } from "@/features/currency/components/converter-workspace";
import { getCurrentUser } from "@/features/auth/server/session";

export default async function ConverterPage() {
  const user = await getCurrentUser();

  return (
    <Box component="main" id="main-content" sx={{ py: { xs: 4, sm: 7 } }}>
      <Container maxWidth="md">
        <Stack spacing={{ xs: 3, sm: 4 }}>
          <Stack
            component="header"
            spacing={1}
            sx={{ alignItems: "center", textAlign: "center" }}
          >
          </Stack>
          <ConverterWorkspace isAuthenticated={Boolean(user)} />
        </Stack>
      </Container>
    </Box>
  );
}
