"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  TokenResponse,
  UserResponse,
  LoginRequest,
  RegisterRequest,
} from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get<UserResponse>("/auth/me"),
    enabled: !!token,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const token = await api.post<TokenResponse>("/auth/login", data);
      // Temporarily set token so the /me call works
      useAuthStore.getState().setAuth(token.access_token, {} as UserResponse);
      const user = await api.get<UserResponse>("/auth/me");
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token.access_token, user);
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const token = await api.post<TokenResponse>("/auth/register", data);
      useAuthStore.getState().setAuth(token.access_token, {} as UserResponse);
      const user = await api.get<UserResponse>("/auth/me");
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token.access_token, user);
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useGoogleAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idToken: string) => {
      const token = await api.post<TokenResponse>("/auth/google", { id_token: idToken });
      useAuthStore.getState().setAuth(token.access_token, {} as UserResponse);
      const user = await api.get<UserResponse>("/auth/me");
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token.access_token, user);
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}
