"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMarket, useResolveMarket } from "@/hooks/use-markets";
import { useTradeHistory } from "@/hooks/use-trades";
import { useAuthStore } from "@/stores/auth-store";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import { PriceChart } from "@/components/markets/price-chart";
import { MarketStats } from "@/components/markets/market-stats";
import { TradeHistory } from "@/components/trades/trade-history";
import { TradeModal } from "@/components/trades/trade-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const { data: market, isLoading } = useMarket(id);
  const { data: trades } = useTradeHistory(id);
  const userId = useAuthStore((s) => s.user?.id);
  const openModal = useTradeModalStore((s) => s.openModal);
  const resolveMarket = useResolveMarket();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!market)
    return <p className="text-text-secondary">Market not found.</p>;

  const isCreator = market.creator_id === userId;
  const canResolve =
    isCreator && (market.status === "CLOSED" || market.status === "OPEN");

  function handleResolve(outcome: "YES" | "NO") {
    resolveMarket.mutate(
      { marketId: id, outcome },
      {
        onSuccess: () => toast.success(`Market resolved: ${outcome}`),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/circle/${market.circle_id}`}
        className="text-sm text-text-muted hover:text-text-primary transition"
      >
        &larr; Back to circle
      </Link>

      {/* Title + prices */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{market.title}</h1>
          <Badge
            variant={
              market.status === "OPEN"
                ? "green"
                : market.status === "RESOLVED"
                  ? "blue"
                  : "gray"
            }
          >
            {market.status}
          </Badge>
        </div>
        {market.description && (
          <p className="text-sm text-text-secondary mt-1">
            {market.description}
          </p>
        )}
        <div className="flex gap-6 mt-3">
          <div>
            <p className="text-xs text-text-muted">YES</p>
            <p className="text-2xl font-bold font-mono text-green">
              {formatPrice(market.price_yes)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">NO</p>
            <p className="text-2xl font-bold font-mono text-red">
              {formatPrice(market.price_no)}
            </p>
          </div>
        </div>
      </div>

      {/* Trade buttons */}
      {market.status === "OPEN" && (
        <div className="flex gap-3">
          <Button
            variant="green"
            size="lg"
            className="flex-1"
            onClick={() => openModal(market.id, "YES")}
          >
            Buy Yes
          </Button>
          <Button
            variant="red"
            size="lg"
            className="flex-1"
            onClick={() => openModal(market.id, "NO")}
          >
            Buy No
          </Button>
        </div>
      )}

      {/* Resolve */}
      {canResolve && (
        <div className="bg-bg-secondary border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium">Resolve this market</p>
          <div className="flex gap-3">
            <Button
              variant="green"
              onClick={() => handleResolve("YES")}
              loading={resolveMarket.isPending}
            >
              Resolve YES
            </Button>
            <Button
              variant="red"
              onClick={() => handleResolve("NO")}
              loading={resolveMarket.isPending}
            >
              Resolve NO
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <MarketStats market={market} />

      {/* Chart */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Price History</h2>
        <PriceChart
          trades={trades ?? []}
          currentPriceYes={market.price_yes}
        />
      </div>

      {/* Trade history */}
      <div>
        <h2 className="font-semibold mb-3">Recent Trades</h2>
        <TradeHistory trades={trades ?? []} />
      </div>

      <TradeModal />
    </div>
  );
}
