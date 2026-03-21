"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { BetDetailResponse } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEnterBet } from "@/hooks/use-bets";

export function EnterBetModal({
  bet,
  isOpen,
  onClose,
  isLoading,
}: {
  bet: BetDetailResponse | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}) {
  const [optionId, setOptionId] = useState<string | null>(null);
  const [doubleDown, setDoubleDown] = useState(false);
  const enter = useEnterBet();

  if (!isOpen) return null;
  if (isLoading || !bet) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Enter bet">
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      </Modal>
    );
  }

  const resolvedBet = bet;

  async function submit() {
    if (!optionId) {
      toast.error("Pick an option");
      return;
    }
    try {
      await enter.mutateAsync({
        betId: resolvedBet.id,
        data: { option_id: optionId, is_double_down: doubleDown },
      });
      toast.success("You're in!");
      onClose();
      setOptionId(null);
      setDoubleDown(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not enter bet");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter bet">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{resolvedBet.title}</p>
        <div className="grid gap-2">
          {resolvedBet.options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setOptionId(o.id)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                optionId === o.id
                  ? "border-blue bg-blue/10 text-blue"
                  : "border-border hover:bg-bg-tertiary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={doubleDown}
            onChange={(e) => setDoubleDown(e.target.checked)}
            className="rounded border-border"
          />
          <span>
            Double down <span className="text-text-muted">(±2 pts instead of ±1)</span>
          </span>
        </label>
        <Button
          className="w-full"
          disabled={enter.isPending || !optionId}
          onClick={() => void submit()}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
