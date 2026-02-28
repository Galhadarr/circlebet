"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import type { MarketResponse } from "@/lib/types";
import { formatPrice, formatTimeRemaining, formatMultiplier } from "@/lib/utils";

const statusBadge: Record<string, "green" | "red" | "gray"> = {
  OPEN: "green",
  CLOSED: "gray",
  RESOLVED: "blue" as "gray",
};

export function MarketCard({ market }: { market: MarketResponse }) {
  const router = useRouter();
  const openModal = useTradeModalStore((s) => s.openModal);

  const yesVol = parseFloat(market.yes_volume);
  const noVol = parseFloat(market.no_volume);
  const totalVol = yesVol + noVol;
  const yesPct = totalVol > 0 ? (yesVol / totalVol) * 100 : 50;
  const hasVolume = totalVol > 0;

  return (
    <Card className="space-y-3">
      <div
        className="cursor-pointer"
        onClick={() => router.push(`/market/${market.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-snug">{market.title}</h3>
          <Badge
            variant={statusBadge[market.status] ?? "gray"}
          >
            {market.status}
          </Badge>
        </div>
        {market.status === "OPEN" && (
          <p className="text-xs text-text-muted mt-1">
            Ends in {formatTimeRemaining(market.end_date)}
          </p>
        )}
        {market.status === "RESOLVED" && market.outcome && (
          <p className="text-xs text-text-muted mt-1">
            Resolved: <span className={market.outcome === "YES" ? "text-green" : "text-red"}>{market.outcome}</span>
          </p>
        )}
      </div>

      {/* Compact ratio bar */}
      {hasVolume && (
        <div className="flex h-1.5 rounded-full overflow-hidden bg-bg-secondary">
          <div
            className="bg-green transition-all duration-300"
            style={{ width: `${yesPct}%` }}
          />
          <div
            className="bg-red transition-all duration-300"
            style={{ width: `${100 - yesPct}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <span className="text-sm font-mono">
            <span className="text-green">YES {formatPrice(market.price_yes)}</span>
            <span className="text-text-muted text-xs ml-1">({formatMultiplier(market.price_yes)})</span>
          </span>
          <span className="text-sm font-mono">
            <span className="text-red">NO {formatPrice(market.price_no)}</span>
            <span className="text-text-muted text-xs ml-1">({formatMultiplier(market.price_no)})</span>
          </span>
        </div>
        {market.status === "OPEN" && (
          <div className="flex gap-1.5">
            <Button
              variant="green"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openModal(market.id, "YES");
              }}
            >
              Buy Yes
            </Button>
            <Button
              variant="red"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openModal(market.id, "NO");
              }}
            >
              Buy No
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
