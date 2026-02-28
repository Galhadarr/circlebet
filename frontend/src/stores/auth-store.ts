import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  _hasHydrated: boolean;
  setAuth: (token: string, user: UserResponse) => void;
  setUser: (user: UserResponse) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "circlebet-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
