"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { BetDetailResponse } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
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
        <div className="grid gap-2 mb-6">
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
        <div
          role="switch"
          tabIndex={0}
          aria-checked={doubleDown}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-tooltip-trigger]")) return;
            setDoubleDown((d) => !d);
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setDoubleDown((d) => !d);
            }
          }}
          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary ${
            doubleDown
              ? "border-amber-400/35 bg-gradient-to-r from-amber-500/[0.12] via-amber-500/[0.06] to-transparent shadow-[inset_0_0_0_1px_rgba(251,191,36,0.12)]"
              : "border-border bg-bg-tertiary/40 hover:bg-bg-tertiary"
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-text-primary">Double down</p>
              <Tooltip
                side="bottom"
                content={
                  <>
                    If you win, you gain <strong className="text-green">+2</strong> points; if you lose, you lose{" "}
                    <strong className="text-red">−2</strong>. Normal picks are ±1.
                  </>
                }
              >
                <button
                  type="button"
                  data-tooltip-trigger
                  title="Double down scoring"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="-m-0.5 rounded-full p-0.5 text-text-muted transition hover:bg-bg-hover hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-1 focus-visible:ring-offset-bg-secondary"
                  aria-label="How double down affects your score"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <p className="text-xs text-text-muted mt-0.5">Higher stakes on your pick</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <span
              className={`font-mono text-[11px] font-bold tracking-tight tabular-nums px-2 py-1 rounded-md border transition ${
                doubleDown
                  ? "border-amber-400/45 bg-amber-500/25 text-amber-300 shadow-[0_0_12px_-2px_rgba(251,191,36,0.35)]"
                  : "border-border bg-bg-primary/80 text-text-muted"
              }`}
            >
              ×2
            </span>
            <span
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
                doubleDown ? "justify-end bg-amber-500/45" : "justify-start bg-bg-hover"
              }`}
              aria-hidden
            >
              <span className="h-6 w-6 rounded-full bg-white shadow-md" />
            </span>
          </div>
        </div>
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
