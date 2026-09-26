"use client";

import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import HistoryIcon from "@mui/icons-material/History";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { HistoryItemDto } from "@/features/history/contracts";
import { HistoryItem } from "@/features/history/components/history-item";
import { useTRPC } from "@/trpc/client";

type ConversionHistorySectionProps = {
  onReuse: (item: HistoryItemDto) => void;
};

export function ConversionHistorySection({
  onReuse,
}: ConversionHistorySectionProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [itemToDelete, setItemToDelete] = useState<HistoryItemDto | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const history = useInfiniteQuery(
    trpc.history.list.infiniteQueryOptions(
      { limit: 20 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    ),
  );

  async function refreshHistory() {
    await queryClient.invalidateQueries(trpc.history.pathFilter());
  }

  const deleteMutation = useMutation(
    trpc.history.delete.mutationOptions({
      onSuccess: async () => {
        setItemToDelete(null);
        await refreshHistory();
      },
    }),
  );

  const clearMutation = useMutation(
    trpc.history.clear.mutationOptions({
      onSuccess: async () => {
        setIsClearDialogOpen(false);
        await refreshHistory();
      },
    }),
  );

  const items = history.data?.pages.flatMap((page) => page.items) ?? [];
  const mutationError = deleteMutation.error ?? clearMutation.error;

  return (
    <Box component="section" aria-labelledby="history-title">
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          sx={{ gap: 2, justifyContent: "space-between", alignItems: "center" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <HistoryIcon color="primary" aria-hidden="true" />
            <Typography id="history-title" component="h2" variant="h5">
              Histórico
            </Typography>
          </Stack>
          {items.length > 0 ? (
            <Button
              color="error"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={() => setIsClearDialogOpen(true)}
            >
              Apagar histórico
            </Button>
          ) : null}
        </Stack>

        {mutationError ? (
          <Alert severity="error" aria-live="assertive">
            {mutationError.message || "Não foi possível atualizar o histórico."}
          </Alert>
        ) : null}

        {history.isPending ? (
          <Stack spacing={1} sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">Carregando histórico…</Typography>
          </Stack>
        ) : history.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => history.refetch()}>
                Tentar novamente
              </Button>
            }
          >
            Não foi possível carregar seu histórico.
          </Alert>
        ) : items.length === 0 ? (
          <Alert severity="info">
            Seu histórico ainda está vazio. A próxima conversão será salva aqui.
          </Alert>
        ) : (
          <Stack component="ul" spacing={1.5} sx={{ p: 0, m: 0 }}>
            {items.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onReuse={onReuse}
                onDelete={setItemToDelete}
              />
            ))}
          </Stack>
        )}

        {history.hasNextPage ? (
          <Button
            variant="outlined"
            onClick={() => history.fetchNextPage()}
            disabled={history.isFetchingNextPage}
          >
            {history.isFetchingNextPage ? "Carregando…" : "Carregar mais"}
          </Button>
        ) : null}
      </Stack>

      <Dialog open={Boolean(itemToDelete)} onClose={() => setItemToDelete(null)}>
        <DialogTitle>Excluir esta conversão?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Este item será removido permanentemente do seu histórico.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemToDelete(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() =>
              itemToDelete && deleteMutation.mutate({ id: itemToDelete.id })
            }
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isClearDialogOpen}
        onClose={() => setIsClearDialogOpen(false)}
      >
        <DialogTitle>Apagar todo o histórico?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Todas as suas conversões salvas serão removidas. Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsClearDialogOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={clearMutation.isPending}
            onClick={() => clearMutation.mutate()}
          >
            Apagar tudo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
