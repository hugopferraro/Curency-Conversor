import HistoryIcon from "@mui/icons-material/History";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";

export function GuestHistoryCallout() {
  return (
    <Card elevation={0} sx={{ bgcolor: "primary.light" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            gap: 2,
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <HistoryIcon color="primary" aria-hidden="true" />
            <div>
              <Typography sx={{ fontWeight: 700 }}>Guarde suas conversões</Typography>
              <Typography variant="body2" color="text.secondary">
                Entre ou crie uma conta para habilitar seu histórico neste dispositivo e
                nos próximos acessos.
              </Typography>
            </div>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button component={Link} href="/login" color="inherit">
              Entrar
            </Button>
            <Button component={Link} href="/register" variant="contained">
              Criar conta
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
