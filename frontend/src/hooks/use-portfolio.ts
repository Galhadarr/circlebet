"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PortfolioResponse, LeaderboardEntry, UserTradeHistoryEntry } from "@/lib/types";

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.get<PortfolioResponse>("/portfolio"),
  });
}

export function useMyTrades() {
  return useQuery({
    queryKey: ["portfolio", "trades"],
    queryFn: () => api.get<UserTradeHistoryEntry[]>("/portfolio/trades"),
  });
}

export function useLeaderboard(circleId: string) {
  return useQuery({
    queryKey: ["circles", circleId, "leaderboard"],
    queryFn: () =>
      api.get<LeaderboardEntry[]>(`/circles/${circleId}/leaderboard`),
    enabled: !!circleId,
  });
}
