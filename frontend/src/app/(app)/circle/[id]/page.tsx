"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCircle } from "@/hooks/use-circles";
import { useCircleMarkets } from "@/hooks/use-markets";
import { useLeaderboard } from "@/hooks/use-portfolio";
import { MarketCard } from "@/components/markets/market-card";
import { CreateMarketModal } from "@/components/markets/create-market-modal";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { InviteLink } from "@/components/circles/invite-link";
import { TradeModal } from "@/components/trades/trade-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type Tab = "active" | "resolved";

export default function CirclePage() {
  const { id } = useParams<{ id: string }>();
  const { data: circle, isLoading: circleLoading } = useCircle(id);
  const { data: markets, isLoading: marketsLoading } = useCircleMarkets(id);
  const { data: leaderboard } = useLeaderboard(id);
  const [tab, setTab] = useState<Tab>("active");
  const [showCreate, setShowCreate] = useState(false);

  if (circleLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!circle) return <p className="text-text-secondary">Circle not found.</p>;

  const activeMarkets =
    markets?.filter((m) => m.status === "OPEN" || m.status === "CLOSED") ?? [];
  const resolvedMarkets =
    markets?.filter((m) => m.status === "RESOLVED") ?? [];
  const displayed = tab === "active" ? activeMarkets : resolvedMarkets;

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      {/* Back navigation */}
      <Link
        href="/circles"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to circles
      </Link>

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{circle.name}</h1>
            <Badge variant="blue">{circle.member_count} members</Badge>
          </div>
          {circle.description && (
            <p className="text-sm text-text-secondary max-w-lg">{circle.description}</p>
          )}
        </div>
      </div>

      {/* Invite */}
      <InviteLink inviteToken={circle.invite_token} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Markets */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-bg-tertiary rounded-xl p-1">
              {(["active", "resolved"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    tab === t
                      ? "bg-surface text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {t === "active" ? "Active" : "Resolved"}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + Market
            </Button>
          </div>

          {marketsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : displayed.length > 0 ? (
            <div className="space-y-4">
              {displayed.map((market, i) => (
                <div
                  key={market.id}
                  className="animate-fade-in-up"
                  style={{ "--delay": `${0.05 + i * 0.04}s` } as React.CSSProperties}
                >
                  <MarketCard market={market} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl shadow-sm">
              <p className="text-text-secondary">
                {tab === "active"
                  ? "No active markets yet. Create one!"
                  : "No resolved markets yet."}
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard sidebar */}
        <div className="lg:w-80 space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Leaderboard</h2>
              <Link
                href={`/circle/${id}/leaderboard`}
                className="text-xs text-blue hover:underline font-medium"
              >
                View all
              </Link>
            </div>
            {leaderboard && leaderboard.length > 0 ? (
              <LeaderboardTable entries={leaderboard.slice(0, 5)} />
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      <CreateMarketModal
        circleId={id}
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <TradeModal />
    </div>
  );
}
