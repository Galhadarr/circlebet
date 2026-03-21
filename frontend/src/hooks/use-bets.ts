"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  BetCreate,
  BetDetailResponse,
  BetEndRequest,
  BetEntryCreate,
  BetResponse,
} from "@/lib/types";

export type BetListFilter = "all" | "entered" | "created";
export type BetStatusFilter = "PENDING" | "ACTIVE" | "FINISHED" | "ALL";

export function useCircleBets(
  circleId: string,
  filter: BetListFilter = "all",
  status?: BetStatusFilter
) {
  return useQuery({
    queryKey: ["bets", "circle", circleId, filter, status ?? "ALL"],
    queryFn: () => {
      const qs = new URLSearchParams();
      qs.set("filter", filter);
      if (status && status !== "ALL") qs.set("status", status);
      return api.get<BetResponse[]>(
        `/bets/circle/${circleId}?${qs.toString()}`
      );
    },
    enabled: !!circleId,
  });
}

export function useBet(betId: string) {
  return useQuery({
    queryKey: ["bets", betId],
    queryFn: () => api.get<BetDetailResponse>(`/bets/${betId}`),
    enabled: !!betId,
  });
}

export function useCreateBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BetCreate) => api.post<BetResponse>("/bets", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bets", "circle", variables.circle_id] });
      queryClient.invalidateQueries({ queryKey: ["circles", variables.circle_id] });
      queryClient.invalidateQueries({ queryKey: ["circles"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useEnterBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      betId,
      data,
    }: {
      betId: string;
      data: BetEntryCreate;
    }) => api.post<BetResponse>(`/bets/${betId}/enter`, data),
    onSuccess: (bet) => {
      queryClient.invalidateQueries({ queryKey: ["bets", bet.id] });
      queryClient.invalidateQueries({ queryKey: ["bets", "circle", bet.circle_id] });
      queryClient.invalidateQueries({
        queryKey: ["circles", bet.circle_id, "leaderboard"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useEndBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      betId,
      data,
    }: {
      betId: string;
      data: BetEndRequest;
    }) => api.post<BetResponse>(`/bets/${betId}/end`, data),
    onSuccess: (bet) => {
      queryClient.invalidateQueries({ queryKey: ["bets", bet.id] });
      queryClient.invalidateQueries({ queryKey: ["bets", "circle", bet.circle_id] });
      queryClient.invalidateQueries({
        queryKey: ["circles", bet.circle_id, "leaderboard"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdateBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      betId,
      body,
    }: {
      betId: string;
      body: Record<string, unknown>;
    }) => api.patch<BetResponse>(`/bets/${betId}`, body),
    onSuccess: (bet) => {
      queryClient.invalidateQueries({ queryKey: ["bets", bet.id] });
      queryClient.invalidateQueries({ queryKey: ["bets", "circle", bet.circle_id] });
    },
  });
}

export function useUpdateBetImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      betId,
      image_url,
    }: {
      betId: string;
      image_url: string | null;
    }) => api.patch<BetResponse>(`/bets/${betId}/image`, { image_url }),
    onSuccess: (bet) => {
      queryClient.invalidateQueries({ queryKey: ["bets", bet.id] });
      queryClient.invalidateQueries({ queryKey: ["bets", "circle", bet.circle_id] });
    },
  });
}

export function useDeleteBet(circleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (betId: string) => api.delete(`/bets/${betId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets", "circle", circleId] });
      queryClient.invalidateQueries({ queryKey: ["circles", circleId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
