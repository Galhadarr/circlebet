"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CircleResponse,
  CircleCreate,
  CircleMemberResponse,
} from "@/lib/types";

export function useCircles() {
  return useQuery({
    queryKey: ["circles"],
    queryFn: () => api.get<CircleResponse[]>("/circles"),
  });
}

export function useCircle(id: string) {
  return useQuery({
    queryKey: ["circles", id],
    queryFn: () => api.get<CircleResponse>(`/circles/${id}`),
    enabled: !!id,
  });
}

export function useCircleMembers(circleId: string) {
  return useQuery({
    queryKey: ["circles", circleId, "members"],
    queryFn: () =>
      api.get<CircleMemberResponse[]>(`/circles/${circleId}/members`),
    enabled: !!circleId,
  });
}

export function useCreateCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CircleCreate) =>
      api.post<CircleResponse>("/circles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
    },
  });
}

export function useUpdateCircleIcon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ circleId, iconUrl }: { circleId: string; iconUrl: string | null }) =>
      api.patch<CircleResponse>(`/circles/${circleId}/icon`, { icon_url: iconUrl }),
    onSuccess: (circle) => {
      queryClient.invalidateQueries({ queryKey: ["circles", circle.id] });
      queryClient.invalidateQueries({ queryKey: ["circles"] });
    },
  });
}

export function useJoinCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteToken: string) =>
      api.post<CircleResponse>(`/circles/join/${inviteToken}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
    },
  });
}
