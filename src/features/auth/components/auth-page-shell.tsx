import { Box, Card, CardContent, Container, Stack, Typography } from "@mui/material";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <Box component="main" id="main-content" sx={{ py: { xs: 5, sm: 8 } }}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ boxShadow: "0 18px 60px rgba(23,49,44,.08)" }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack spacing={1} sx={{ mb: 4, textAlign: "center" }}>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 750 }}>
                {title}
              </Typography>
              <Typography color="text.secondary">{description}</Typography>
            </Stack>
            {children}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
