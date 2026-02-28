import type { MarketDetailResponse } from "@/lib/types";
import { formatCurrency, formatTimeRemaining, formatDate, formatMultiplier } from "@/lib/utils";

export function MarketStats({ market }: { market: MarketDetailResponse }) {
  const stats = [
    { label: "Volume", value: `$${formatCurrency(market.total_volume)}` },
    {
      label: market.status === "OPEN" ? "Ends in" : "Ended",
      value:
        market.status === "OPEN"
          ? formatTimeRemaining(market.end_date)
          : formatDate(market.end_date),
    },
    { label: "Liquidity", value: `b=${parseFloat(market.b).toFixed(0)}` },
    { label: "Status", value: market.status },
  ];

  const yesVol = parseFloat(market.yes_volume);
  const noVol = parseFloat(market.no_volume);
  const totalVol = yesVol + noVol;
  const yesPct = totalVol > 0 ? (yesVol / totalVol) * 100 : 50;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-bg-tertiary rounded-lg p-3">
            <p className="text-xs text-text-muted">{label}</p>
            <p className="text-sm font-medium mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Betting Ratio */}
      <div className="bg-bg-tertiary rounded-lg p-4 space-y-3">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Betting Ratio</p>

        {/* Ratio bar */}
        <div className="flex h-3 rounded-full overflow-hidden bg-bg-secondary">
          <div
            className="bg-green transition-all duration-300"
            style={{ width: `${yesPct}%` }}
          />
          <div
            className="bg-red transition-all duration-300"
            style={{ width: `${100 - yesPct}%` }}
          />
        </div>

        {/* YES / NO details */}
        <div className="flex justify-between text-sm">
          <div className="space-y-1">
            <p className="text-green font-medium">YES</p>
            <p className="text-text-muted text-xs">
              ${formatCurrency(yesVol)} &middot; {market.yes_bettors} bettor{market.yes_bettors !== 1 ? "s" : ""}
            </p>
            <p className="text-xs font-mono">
              Payout {formatMultiplier(market.price_yes)}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-red font-medium">NO</p>
            <p className="text-text-muted text-xs">
              ${formatCurrency(noVol)} &middot; {market.no_bettors} bettor{market.no_bettors !== 1 ? "s" : ""}
            </p>
            <p className="text-xs font-mono">
              Payout {formatMultiplier(market.price_no)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
