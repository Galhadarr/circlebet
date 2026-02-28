"use client";

import { useRouter } from "next/navigation";
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
    <div
      className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:border-blue/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={() => router.push(`/market/${market.id}`)}
    >
      {market.image_url && (
        <div className="w-full h-32 overflow-hidden bg-bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={market.image_url}
            alt={market.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-snug">{market.title}</h3>
        <Badge variant={statusBadge[market.status] ?? "gray"}>
          {market.status}
        </Badge>
      </div>
      {market.status === "OPEN" && (
        <p className="text-xs text-text-muted font-mono">
          Ends in {formatTimeRemaining(market.end_date)}
        </p>
      )}
      {market.status === "RESOLVED" && market.outcome && (
        <p className="text-xs text-text-muted">
          Resolved: <span className={market.outcome === "YES" ? "text-green" : "text-red"}>{market.outcome}</span>
        </p>
      )}

      {/* Ratio bar */}
      <div className="flex h-2 rounded-full overflow-hidden">
        {hasVolume ? (
          <>
            <div
              className="bg-green transition-all duration-300"
              style={{ width: `${yesPct}%` }}
            />
            <div
              className="bg-red transition-all duration-300"
              style={{ width: `${100 - yesPct}%` }}
            />
          </>
        ) : (
          <div className="w-full bg-border rounded-full" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <span className="text-sm font-mono">
            <span className="text-green font-medium">YES {formatPrice(market.price_yes)}</span>
            <span className="text-text-muted text-xs ml-1">({formatMultiplier(market.price_yes)})</span>
          </span>
          <span className="text-sm font-mono">
            <span className="text-red font-medium">NO {formatPrice(market.price_no)}</span>
            <span className="text-text-muted text-xs ml-1">({formatMultiplier(market.price_no)})</span>
          </span>
        </div>
        {market.status === "OPEN" && (
          <div className="flex gap-2">
            <Button
              variant="green"
              size="sm"
              className="flex-1"
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
              className="flex-1"
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

      <div className="flex items-center gap-1 text-xs text-text-muted group-hover:text-blue transition-colors duration-200 pt-0.5">
        <span>View details</span>
        <svg
          className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      </div>
    </div>
  );
}
