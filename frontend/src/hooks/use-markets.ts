"use client";

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  MarketResponse,
  MarketDetailResponse,
  MarketCreate,
  ResolveRequest,
} from "@/lib/types";

export function useCircleMarkets(circleId: string) {
  return useQuery({
    queryKey: ["markets", "circle", circleId],
    queryFn: () => api.get<MarketResponse[]>(`/markets/circle/${circleId}`),
    enabled: !!circleId,
  });
}

export function useMarket(marketId: string) {
  return useQuery({
    queryKey: ["markets", marketId],
    queryFn: () => api.get<MarketDetailResponse>(`/markets/${marketId}`),
    enabled: !!marketId,
  });
}

export function useCreateMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarketCreate) =>
      api.post<MarketResponse>("/markets", data),
    onSuccess: (market) => {
      queryClient.invalidateQueries({
        queryKey: ["markets", "circle", market.circle_id],
      });
    },
  });
}

export function useUpdateMarketImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ marketId, imageUrl }: { marketId: string; imageUrl: string | null }) =>
      api.patch<MarketResponse>(`/markets/${marketId}/image`, { image_url: imageUrl }),
    onSuccess: (market) => {
      queryClient.invalidateQueries({ queryKey: ["markets", market.id] });
      queryClient.invalidateQueries({ queryKey: ["markets", "circle", market.circle_id] });
    },
  });
}

export function useResolveMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      marketId,
      outcome,
    }: {
      marketId: string;
      outcome: ResolveRequest["outcome"];
    }) => api.post<MarketResponse>(`/markets/${marketId}/resolve`, { outcome }),
    onSuccess: (market) => {
      queryClient.invalidateQueries({ queryKey: ["markets", market.id] });
      queryClient.invalidateQueries({
        queryKey: ["markets", "circle", market.circle_id],
      });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}

export function useDeleteMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ marketId, circleId }: { marketId: string; circleId: string }) =>
      api.delete(`/markets/${marketId}`).then(() => ({ marketId, circleId })),
    onSuccess: ({ marketId, circleId }) => {
      queryClient.removeQueries({ queryKey: ["markets", marketId] });
      queryClient.invalidateQueries({ queryKey: ["markets", "circle", circleId] });
    },
  });
}
