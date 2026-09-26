"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/features/auth/client";
import type { CurrentUser } from "@/features/auth/contracts";

type AppHeaderClientProps = { user: CurrentUser | null };

export function AppHeaderClient({ user }: AppHeaderClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setAnchorElement(null);
    setIsSigningOut(true);

    try {
      const response = await authClient.signOut();

      if (response.error) {
        return;
      }

      queryClient.clear();
      router.replace("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 72 } }}>
          <Stack
            component={Link}
            href="/"
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              color: "primary.dark",
              textDecoration: "none",
              minWidth: 0,
            }}
          >
            <CurrencyExchangeIcon aria-hidden="true" />
            <Typography
              component="span"
              noWrap
              sx={{ fontSize: { xs: "1rem", sm: "1.15rem" }, fontWeight: 800 }}
            >
              Conversor de Moedas
            </Typography>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}
          >
            {user ? (
              <>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "center", mr: 1 }}
                >
                  <AccountCircleOutlinedIcon color="action" aria-hidden="true" />
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  onClick={signOut}
                  disabled={isSigningOut}
                  startIcon={isSigningOut ? <CircularProgress size={16} /> : null}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} href="/login" color="inherit">
                  Entrar
                </Button>
                <Button component={Link} href="/register" variant="contained">
                  Criar conta
                </Button>
              </>
            )}
          </Stack>

          <IconButton
            aria-label="Abrir menu da conta"
            aria-controls={anchorElement ? "account-menu" : undefined}
            aria-expanded={Boolean(anchorElement)}
            onClick={(event) => setAnchorElement(event.currentTarget)}
            sx={{ display: { xs: "inline-flex", sm: "none" }, ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={anchorElement}
            open={Boolean(anchorElement)}
            onClose={() => setAnchorElement(null)}
          >
            {user ? (
              <>
                <MenuItem disabled>{user.email}</MenuItem>
                <MenuItem onClick={signOut} disabled={isSigningOut}>
                  Sair
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem component={Link} href="/login">
                  Entrar
                </MenuItem>
                <MenuItem component={Link} href="/register">
                  Criar conta
                </MenuItem>
              </>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
