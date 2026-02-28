import { create } from "zustand";

interface TradeModalState {
  isOpen: boolean;
  marketId: string | null;
  selectedSide: "YES" | "NO";
  openModal: (marketId: string, side?: "YES" | "NO") => void;
  closeModal: () => void;
  setSide: (side: "YES" | "NO") => void;
}

export const useTradeModalStore = create<TradeModalState>((set) => ({
  isOpen: false,
  marketId: null,
  selectedSide: "YES",
  openModal: (marketId, side = "YES") =>
    set({ isOpen: true, marketId, selectedSide: side }),
  closeModal: () => set({ isOpen: false, marketId: null }),
  setSide: (side) => set({ selectedSide: side }),
}));
