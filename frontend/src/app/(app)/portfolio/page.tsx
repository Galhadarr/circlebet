"use client";

import { useRouter } from "next/navigation";
import { usePortfolio, useMyTrades } from "@/hooks/use-portfolio";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const { data: trades, isLoading: tradesLoading } = useMyTrades();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const holdings = portfolio?.holdings ?? [];
  const totalValue = holdings.reduce(
    (sum, h) => sum + parseFloat(h.current_value),
    0
  );

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Port<span className="bg-gradient-to-r from-green to-blue bg-clip-text text-transparent">folio</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Your holdings across all markets
        </p>
      </div>

      {/* Total value hero card */}
      <div
        className="relative overflow-hidden bg-surface border border-border rounded-2xl p-8 shadow-sm animate-fade-in-up"
        style={{ "--delay": "0.05s" } as React.CSSProperties}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green/5 to-transparent rounded-bl-full pointer-events-none" />
        <p className="text-sm text-text-muted font-medium">Total Holdings Value</p>
        <p className="text-4xl font-bold font-mono mt-2 tracking-tight">
          <span className="text-green">$</span>{formatCurrency(totalValue)}
        </p>
        <p className="text-xs text-text-muted font-mono mt-1">
          {holdings.length} active position{holdings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Chart */}
      {holdings.length > 0 && (
        <div
          className="bg-surface border border-border rounded-2xl p-5 shadow-sm animate-fade-in-up"
          style={{ "--delay": "0.1s" } as React.CSSProperties}
        >
          <h2 className="font-semibold mb-4">Holdings Overview</h2>
          <PortfolioChart holdings={holdings} />
        </div>
      )}

      {/* Holdings list */}
      <div
        className="animate-fade-in-up"
        style={{ "--delay": "0.15s" } as React.CSSProperties}
      >
        <h2 className="font-semibold mb-4">
          Positions <span className="text-text-muted font-mono text-sm">({holdings.length})</span>
        </h2>
        <HoldingsList holdings={holdings} />
      </div>

      {/* Trade history */}
      <div
        className="animate-fade-in-up"
        style={{ "--delay": "0.2s" } as React.CSSProperties}
      >
        <h2 className="font-semibold mb-4">
          Trade History{" "}
          {trades && <span className="text-text-muted font-mono text-sm">({trades.length})</span>}
        </h2>
        {tradesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : trades && trades.length > 0 ? (
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-tertiary text-text-muted text-xs">
                  <th className="px-4 py-3 text-left">Market</th>
                  <th className="px-4 py-3 text-left">Side</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Price</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-t border-border hover:bg-bg-tertiary/50 cursor-pointer transition"
                    onClick={() => router.push(`/market/${trade.market_id}`)}
                  >
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                      {trade.market_title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={trade.side === "YES" ? "green" : "red"}>
                        {trade.direction} {trade.side}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      ${formatCurrency(trade.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary">
                      {parseFloat(trade.shares).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary hidden sm:table-cell">
                      ${parseFloat(trade.price_at_trade).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted hidden sm:table-cell">
                      {formatDate(trade.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-surface border border-border rounded-2xl shadow-sm">
            <p className="text-text-secondary">No trades yet. Start trading!</p>
          </div>
        )}
      </div>
    </div>
  );
}
