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
      <div className="flex justify-center py-16">
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
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      {/* Back link */}
      <Link
        href={`/circle/${market.circle_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to circle
      </Link>

      {/* Title + status hero */}
      <div className="relative overflow-hidden bg-surface border border-border rounded-2xl shadow-sm">
        {market.image_url && (
          <div className="w-full h-52 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={market.image_url}
              alt={market.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold leading-snug">{market.title}</h1>
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
            <p className="text-sm text-text-secondary mt-1 max-w-lg">
              {market.description}
            </p>
          )}

          {/* Price hero cards */}
          <div className="flex gap-4 mt-6">
            <div className="flex-1 bg-green-dim border border-green/20 rounded-xl p-4 text-center">
              <p className="text-xs text-text-muted font-mono mb-1">YES</p>
              <p className="text-3xl font-bold font-mono text-green">
                {formatPrice(market.price_yes)}
              </p>
            </div>
            <div className="flex-1 bg-red-dim border border-red/20 rounded-xl p-4 text-center">
              <p className="text-xs text-text-muted font-mono mb-1">NO</p>
              <p className="text-3xl font-bold font-mono text-red">
                {formatPrice(market.price_no)}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Trade buttons */}
      {market.status === "OPEN" && (
        <div className="flex gap-4">
          <Button
            variant="green"
            size="lg"
            className="flex-1 rounded-xl py-4 text-base"
            onClick={() => openModal(market.id, "YES")}
          >
            Buy Yes
          </Button>
          <Button
            variant="red"
            size="lg"
            className="flex-1 rounded-xl py-4 text-base"
            onClick={() => openModal(market.id, "NO")}
          >
            Buy No
          </Button>
        </div>
      )}

      {/* Resolve */}
      {canResolve && (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
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
      <div
        className="bg-surface border border-border rounded-2xl p-5 shadow-sm animate-fade-in-up"
        style={{ "--delay": "0.1s" } as React.CSSProperties}
      >
        <h2 className="font-semibold mb-4">Price History</h2>
        <PriceChart
          trades={trades ?? []}
          currentPriceYes={market.price_yes}
        />
      </div>

      {/* Trade history */}
      <div
        className="animate-fade-in-up"
        style={{ "--delay": "0.15s" } as React.CSSProperties}
      >
        <h2 className="font-semibold mb-4">Recent Trades</h2>
        <TradeHistory trades={trades ?? []} />
      </div>

      <TradeModal />
    </div>
  );
}
