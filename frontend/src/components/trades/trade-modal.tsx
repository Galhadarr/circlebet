"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TradePreview } from "@/components/trades/trade-preview";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import { useTradePreview, useExecuteTrade } from "@/hooks/use-trades";
import type { TradeRequest } from "@/lib/types";
import toast from "react-hot-toast";

const quickAmounts = [10, 50, 100, 500];

export function TradeModal() {
  const { isOpen, marketId, selectedSide, closeModal, setSide } =
    useTradeModalStore();
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const executeTrade = useExecuteTrade();

  // Debounced preview params
  const [debouncedAmount, setDebouncedAmount] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAmount(amount), 300);
    return () => clearTimeout(timer);
  }, [amount]);

  const previewParams: TradeRequest | null = useMemo(() => {
    const num = parseFloat(debouncedAmount);
    if (!num || num <= 0) return null;
    return { side: selectedSide, direction, amount: num };
  }, [debouncedAmount, selectedSide, direction]);

  const { data: preview, isLoading: previewLoading } = useTradePreview(
    marketId ?? "",
    previewParams
  );

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDebouncedAmount("");
      setDirection("BUY");
    }
  }, [isOpen]);

  function handleTrade() {
    const num = parseFloat(amount);
    if (!marketId || !num || num <= 0) return;
    executeTrade.mutate(
      { marketId, side: selectedSide, direction, amount: num },
      {
        onSuccess: (res) => {
          toast.success(
            `${direction === "BUY" ? "Bought" : "Sold"} ${parseFloat(res.shares).toFixed(2)} ${selectedSide} shares`
          );
          closeModal();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Trade">
      <div className="space-y-4">
        {/* Side selector */}
        <div className="flex gap-2">
          {(["YES", "NO"] as const).map((side) => (
            <button
              key={side}
              onClick={() => setSide(side)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                selectedSide === side
                  ? side === "YES"
                    ? "bg-green-dim text-green border border-green/30"
                    : "bg-red-dim text-red border border-red/30"
                  : "bg-bg-tertiary text-text-muted border border-border"
              }`}
            >
              {side}
            </button>
          ))}
        </div>

        {/* Direction toggle */}
        <div className="flex gap-2">
          {(["BUY", "SELL"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                direction === d
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Amount ($)
          </label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary font-mono text-lg placeholder:text-text-muted focus:outline-none focus:border-blue"
          />
          <div className="flex gap-2 mt-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="flex-1 py-1.5 bg-bg-tertiary rounded text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-bg-hover transition"
              >
                ${q}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <TradePreview
          preview={preview}
          isLoading={previewLoading}
          side={selectedSide}
        />

        {/* Confirm */}
        <Button
          className="w-full"
          size="lg"
          variant={selectedSide === "YES" ? "green" : "red"}
          onClick={handleTrade}
          loading={executeTrade.isPending}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          {direction} {selectedSide} — ${amount || "0"}
        </Button>
      </div>
    </Modal>
  );
}
