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
      <div className="flex justify-center py-12">
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">{circle.name}</h1>
          <Badge variant="blue">{circle.member_count} members</Badge>
        </div>
        {circle.description && (
          <p className="text-sm text-text-secondary">{circle.description}</p>
        )}
      </div>

      {/* Invite */}
      <InviteLink inviteToken={circle.invite_token} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Markets */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(["active", "resolved"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    tab === t
                      ? "bg-bg-tertiary text-text-primary"
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
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : displayed.length > 0 ? (
            <div className="space-y-3">
              {displayed.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              {tab === "active"
                ? "No active markets yet. Create one!"
                : "No resolved markets yet."}
            </div>
          )}
        </div>

        {/* Leaderboard sidebar */}
        <div className="lg:w-72 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Leaderboard</h2>
            <Link
              href={`/circle/${id}/leaderboard`}
              className="text-xs text-blue hover:underline"
            >
              View all
            </Link>
          </div>
          {leaderboard && leaderboard.length > 0 ? (
            <LeaderboardTable entries={leaderboard.slice(0, 5)} />
          ) : (
            <p className="text-sm text-text-muted">No data yet.</p>
          )}
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
