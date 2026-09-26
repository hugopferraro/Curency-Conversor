"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import { Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import {
  formatCurrencyAmount,
  formatDateTime,
  formatDecimal,
} from "@/features/currency/format";
import type { HistoryItemDto } from "@/features/history/contracts";

type HistoryItemProps = {
  item: HistoryItemDto;
  onReuse: (item: HistoryItemDto) => void;
  onDelete: (item: HistoryItemDto) => void;
};

export function HistoryItem({ item, onReuse, onDelete }: HistoryItemProps) {
  return (
    <Card component="li" elevation={0} sx={{ listStyle: "none" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              gap: 1,
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <div>
              <Typography sx={{ fontWeight: 750 }}>
                {formatCurrencyAmount(item.sourceAmount, item.sourceCurrency)} →{" "}
                {formatCurrencyAmount(item.convertedAmount, item.targetCurrency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1 {item.sourceCurrency} = {formatDecimal(item.exchangeRate)}{" "}
                {item.targetCurrency}
              </Typography>
            </div>
            <Chip label={formatDateTime(item.createdAt)} size="small" variant="outlined" />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Taxa de fechamento consultada em {formatDateTime(item.rateFetchedAt)} via{" "}
            {item.rateProvider}.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Button
              size="small"
              startIcon={<ReplayIcon />}
              onClick={() => onReuse(item)}
            >
              Reutilizar
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => onDelete(item)}
            >
              Excluir
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
