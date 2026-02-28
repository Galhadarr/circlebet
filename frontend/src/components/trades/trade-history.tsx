"use client";

import type { TradeHistoryEntry } from "@/lib/types";
import { formatCurrency, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function TradeHistory({ trades }: { trades: TradeHistoryEntry[] }) {
  if (trades.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-4">
        No trades yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="flex items-center gap-3 bg-bg-tertiary rounded-lg px-3 py-2 text-sm"
        >
          <Badge variant={trade.side === "YES" ? "green" : "red"}>
            {trade.direction} {trade.side}
          </Badge>
          <span className="flex-1 text-text-secondary truncate">
            {trade.display_name}
          </span>
          <span className="font-mono text-xs">
            ${formatCurrency(trade.amount)}
          </span>
          <span className="font-mono text-xs text-text-muted">
            @{formatPrice(trade.price_at_trade)}
          </span>
        </div>
      ))}
    </div>
  );
}
