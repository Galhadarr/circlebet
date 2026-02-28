"use client";

import { usePortfolio } from "@/hooks/use-portfolio";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-text-secondary text-sm mt-1">
          Your holdings across all markets
        </p>
      </div>

      {/* Total value */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <p className="text-sm text-text-muted">Total Holdings Value</p>
        <p className="text-3xl font-bold font-mono mt-1">
          ${formatCurrency(totalValue)}
        </p>
      </div>

      {/* Chart */}
      {holdings.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Holdings Overview</h2>
          <PortfolioChart holdings={holdings} />
        </div>
      )}

      {/* Holdings list */}
      <div>
        <h2 className="font-semibold mb-3">
          Positions ({holdings.length})
        </h2>
        <HoldingsList holdings={holdings} />
      </div>
    </div>
  );
}
