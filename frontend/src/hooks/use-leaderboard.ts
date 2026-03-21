"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LeaderboardEntry } from "@/lib/types";

export function useLeaderboard(circleId: string) {
  return useQuery({
    queryKey: ["circles", circleId, "leaderboard"],
    queryFn: () =>
      api.get<LeaderboardEntry[]>(`/circles/${circleId}/leaderboard`),
    enabled: !!circleId,
  });
}
