"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HoldingResponse } from "@/lib/types";
import { formatCurrency, formatPrice } from "@/lib/utils";

export function HoldingsList({ holdings }: { holdings: HoldingResponse[] }) {
  const router = useRouter();

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        No holdings yet. Start trading!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {holdings.map((h) => {
        const yesShares = parseFloat(h.yes_shares);
        const noShares = parseFloat(h.no_shares);

        return (
          <Card
            key={h.market_id}
            onClick={() => router.push(`/market/${h.market_id}`)}
            className="space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm leading-snug">
                {h.market_title}
              </h3>
              <Badge
                variant={
                  h.status === "OPEN"
                    ? "green"
                    : h.status === "RESOLVED"
                      ? "blue"
                      : "gray"
                }
              >
                {h.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {yesShares > 0 && (
                <span className="font-mono">
                  <span className="text-green">{yesShares.toFixed(2)} YES</span>
                  <span className="text-text-muted ml-1">
                    @{formatPrice(h.current_price_yes)}
                  </span>
                </span>
              )}
              {noShares > 0 && (
                <span className="font-mono">
                  <span className="text-red">{noShares.toFixed(2)} NO</span>
                  <span className="text-text-muted ml-1">
                    @{formatPrice(h.current_price_no)}
                  </span>
                </span>
              )}
              <span className="ml-auto font-mono font-medium">
                ${formatCurrency(h.current_value)}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
