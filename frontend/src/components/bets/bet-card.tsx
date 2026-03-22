"use client";

import Link from "next/link";
import type { BetResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BetImageBanner } from "@/components/bets/bet-image-banner";
import { useAuthStore } from "@/stores/auth-store";

function statusVariant(
  s: BetResponse["status"]
): "green" | "blue" | "purple" | "gray" {
  if (s === "ACTIVE") return "green";
  if (s === "PENDING") return "blue";
  if (s === "FINISHED") return "gray";
  return "purple";
}

export function BetCard({
  bet,
  circleId,
  onEnter,
}: {
  bet: BetResponse;
  circleId: string;
  onEnter?: () => void;
}) {
  const userId = useAuthStore((s) => s.user?.id);
  const canEnter =
    bet.status === "ACTIVE" &&
    !bet.my_entry &&
    bet.creator_id !== userId;
  const needsSecond =
    bet.status === "PENDING" &&
    userId &&
    userId !== bet.creator_id;

  const timeLeft =
    bet.is_time_limited && bet.end_time
      ? new Date(bet.end_time).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div className="group bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue/30 hover:-translate-y-1 hover:bg-bg-tertiary transition-all duration-200">
      <BetImageBanner title={bet.title} imageUrl={bet.image_url} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/circle/${circleId}/bet/${bet.id}`}
            className="font-semibold text-text-primary line-clamp-2 group-hover:text-blue transition-colors"
          >
            {bet.title}
          </Link>
          <Badge variant={statusVariant(bet.status)}>{bet.status}</Badge>
        </div>
        {bet.description && (
          <p className="text-sm text-text-secondary line-clamp-2">{bet.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-text-muted">
          <span>{bet.options.length} options</span>
          <span>·</span>
          <span>{bet.entries_count} in</span>
          {bet.is_time_limited && (
            <>
              <span>·</span>
              <span className="text-amber">Closes {timeLeft}</span>
            </>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Link href={`/circle/${circleId}/bet/${bet.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              View
            </Button>
          </Link>
          {(canEnter || needsSecond) && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onEnter?.()}
            >
              Enter bet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
