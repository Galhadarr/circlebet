"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useBet, useEndBet, useDeleteBet } from "@/hooks/use-bets";
import { useAuthStore } from "@/stores/auth-store";
import { BetImageBanner } from "@/components/bets/bet-image-banner";
import { EnterBetModal } from "@/components/bets/enter-bet-modal";
import { DoubleDownBadge } from "@/components/bets/double-down-badge";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import type { BetDetailResponse } from "@/lib/types";

export default function BetDetailPage() {
  const { id: circleId, betId } = useParams<{ id: string; betId: string }>();
  const { data: bet, isLoading, isError, refetch } = useBet(betId);
  const userId = useAuthStore((s) => s.user?.id);
  const [enterOpen, setEnterOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [endSelection, setEndSelection] = useState<string | "none" | null>(null);
  const endBet = useEndBet();
  const del = useDeleteBet(circleId ?? "");

  const isCreator = bet && userId === bet.creator_id;
  const canEnter =
    bet &&
    userId &&
    !bet.my_entry &&
    bet.status !== "FINISHED" &&
    (bet.status === "ACTIVE" || bet.status === "PENDING");

  async function resolveEnd() {
    if (!bet || endSelection === null) return;
    try {
      await endBet.mutateAsync({
        betId: bet.id,
        data: {
          result_option_id: endSelection === "none" ? null : endSelection,
        },
      });
      toast.success(endSelection === "none" ? "Bet closed with no result." : "Bet resolved!");
      setEndOpen(false);
      void refetch();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not end bet");
    }
  }

  async function onUpdateImage(file: File) {
    if (!bet) return;
    try {
      const { url } = await api.upload<{ url: string }>("/uploads/image", file);
      await api.patch(`/bets/${bet.id}/image`, { image_url: url });
      toast.success("Image updated");
      void refetch();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (isError || !bet) {
    return (
      <p className="text-text-secondary text-center py-20">
        Bet not found or you don&apos;t have access.
      </p>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl mx-auto">
      <Link
        href={`/circle/${circleId}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary"
      >
        ← Back to circle
      </Link>

      <BetImageBanner
        title={bet.title}
        imageUrl={bet.image_url}
        topRight={
          isCreator && bet.status !== "FINISHED" ? (
            <label className="cursor-pointer">
              <span className="sr-only">Change banner</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onUpdateImage(f);
                }}
              />
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-primary/90 border border-border backdrop-blur-sm shadow-sm hover:bg-bg-tertiary transition-colors">
                <svg className="w-2.5 h-2.5 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </span>
            </label>
          ) : undefined
        }
      />

      <div>
        <h1 className="text-2xl font-bold">{bet.title}</h1>
        <Badge variant={bet.status === "ACTIVE" ? "green" : bet.status === "PENDING" ? "blue" : "gray"}>
          {bet.status}
        </Badge>
        {bet.status === "PENDING" && (
          <p className="text-xs text-text-muted mt-1">
            Waiting for at least 1 more counter bet to go live
          </p>
        )}
        {bet.is_time_limited && bet.end_time && (
          <p className="text-sm text-text-muted mt-2">
            Entries close: {new Date(bet.end_time).toLocaleString()}
          </p>
        )}
      </div>

      {bet.description && (
        <p className="text-text-secondary">{bet.description}</p>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold">Options</h2>
        <ul className="space-y-2">
          {bet.options.map((o) => {
            const count = bet.option_counts[o.id] ?? 0;
            const isWinner =
              bet.status === "FINISHED" && bet.result_option_id === o.id;
            return (
              <li
                key={o.id}
                className={`flex justify-between rounded-xl border px-4 py-3 ${
                  isWinner ? "border-green bg-green-dim/30" : "border-border"
                }`}
              >
                <span className="font-medium">{o.label}</span>
                <span className="text-text-muted text-sm">{count} picks</span>
              </li>
            );
          })}
        </ul>
        {bet.status === "FINISHED" && bet.result_option_id === null && (
          <p className="text-sm text-text-muted">
            Ended with no winning option — no points were awarded or deducted.
          </p>
        )}
      </div>

      {bet.my_entry && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
          <span>
            Your pick:{" "}
            <span className="font-medium text-text-primary">
              {bet.options.find((o) => o.id === bet.my_entry?.option_id)?.label}
            </span>
          </span>
          {bet.my_entry.is_double_down && <DoubleDownBadge />}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {canEnter && (
          <Button onClick={() => setEnterOpen(true)}>Enter this bet</Button>
        )}
        {isCreator && bet.status === "ACTIVE" && (
          <Button
            className="cursor-pointer"
            onClick={() => {
              setEndSelection(bet.options[0]?.id ?? null);
              setEndOpen(true);
            }}
          >
            End &amp; pick result
          </Button>
        )}
        {isCreator && bet.status === "PENDING" && (
          <Button
            variant="red"
            className="cursor-pointer"
            onClick={() => {
              if (confirm("Delete this pending bet?")) {
                del.mutate(bet.id, {
                  onSuccess: () => {
                    toast.success("Deleted");
                    window.location.href = `/circle/${circleId}`;
                  },
                  onError: (e: Error) => toast.error(e.message),
                });
              }
            }}
          >
            Delete
          </Button>
        )}
      </div>

      <EnterBetModal
        bet={bet as BetDetailResponse}
        isOpen={enterOpen}
        onClose={() => {
          setEnterOpen(false);
          void refetch();
        }}
      />

      <Modal isOpen={endOpen} onClose={() => setEndOpen(false)} title="Pick winning option">
        <div className="space-y-4 pb-4">
          <div className="grid gap-2">
            {bet.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setEndSelection(o.id)}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-medium ${
                  endSelection === o.id ? "border-green bg-green-dim/20" : "border-border"
                }`}
              >
                {o.label}
              </button>
            ))}
            <div
              className={`flex w-full items-stretch overflow-hidden rounded-xl border text-sm font-medium ${
                endSelection === "none"
                  ? "border-blue bg-blue/10 text-blue"
                  : "border-border"
              }`}
            >
              <button
                type="button"
                onClick={() => setEndSelection("none")}
                className={`min-w-0 flex-1 cursor-pointer px-4 py-3 text-left font-medium transition ${
                  endSelection === "none"
                    ? "hover:bg-blue/15"
                    : "hover:bg-bg-tertiary/80"
                }`}
              >
                None
              </button>
              <div
                className={`flex shrink-0 items-center border-l py-1 pr-2 pl-1 ${
                  endSelection === "none" ? "border-blue/25" : "border-border/80"
                }`}
              >
                <Tooltip
                  side="bottom"
                  content="No winning side. Everyone keeps their score — no points gained or lost for this bet."
                >
                  <button
                    type="button"
                    data-tooltip-trigger
                    className="cursor-pointer rounded-full p-1.5 text-text-muted transition hover:bg-bg-hover hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-1 focus-visible:ring-offset-bg-secondary"
                    aria-label="What does None mean?"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={endSelection === null || endBet.isPending}
            onClick={() => void resolveEnd()}
          >
            Confirm result
          </Button>
        </div>
      </Modal>
    </div>
  );
}
