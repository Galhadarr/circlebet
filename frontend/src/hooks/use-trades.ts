"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  TradeRequest,
  TradeResponse,
  TradePreviewResponse,
  TradeHistoryEntry,
} from "@/lib/types";

export function useTradeHistory(marketId: string) {
  return useQuery({
    queryKey: ["markets", marketId, "trades"],
    queryFn: () =>
      api.get<TradeHistoryEntry[]>(`/markets/${marketId}/trades`),
    enabled: !!marketId,
  });
}

export function useTradePreview(
  marketId: string,
  params: TradeRequest | null
) {
  return useQuery({
    queryKey: ["trade-preview", marketId, params],
    queryFn: () =>
      api.post<TradePreviewResponse>(
        `/markets/${marketId}/trade-preview`,
        params
      ),
    enabled: !!marketId && !!params && params.amount > 0,
  });
}

export function useExecuteTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      marketId,
      ...data
    }: TradeRequest & { marketId: string }) =>
      api.post<TradeResponse>(`/markets/${marketId}/trade`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["markets", variables.marketId],
      });
      queryClient.invalidateQueries({
        queryKey: ["markets", variables.marketId, "trades"],
      });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      // Invalidate circle markets (we don't know circle ID here, so invalidate all)
      queryClient.invalidateQueries({ queryKey: ["markets", "circle"] });
      queryClient.invalidateQueries({ queryKey: ["circles"] });
    },
  });
}
