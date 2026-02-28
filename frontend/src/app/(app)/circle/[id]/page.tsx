"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCircle, useUpdateCircleIcon } from "@/hooks/use-circles";
import { useCircleMarkets } from "@/hooks/use-markets";
import { useLeaderboard } from "@/hooks/use-portfolio";
import { useAuthStore } from "@/stores/auth-store";
import { MarketCard } from "@/components/markets/market-card";
import { CreateMarketModal } from "@/components/markets/create-market-modal";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { InviteLink } from "@/components/circles/invite-link";
import { TradeModal } from "@/components/trades/trade-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type Tab = "active" | "resolved";

export default function CirclePage() {
  const { id } = useParams<{ id: string }>();
  const { data: circle, isLoading: circleLoading } = useCircle(id);
  const { data: markets, isLoading: marketsLoading } = useCircleMarkets(id);
  const { data: leaderboard } = useLeaderboard(id);
  const userId = useAuthStore((s) => s.user?.id);
  const updateIcon = useUpdateCircleIcon();
  const [tab, setTab] = useState<Tab>("active");
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  if (circleLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!circle) return <p className="text-text-secondary">Circle not found.</p>;

  const isCreator = circle.creator_id === userId;

  async function handleIconFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuOpen(false);
    setUploadingIcon(true);
    try {
      const { url } = await api.upload<{ url: string }>("/uploads/image", file);
      await updateIcon.mutateAsync({ circleId: id, iconUrl: `${api.baseUrl}${url}` });
      toast.success("Icon updated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update icon.");
    } finally {
      setUploadingIcon(false);
      if (iconInputRef.current) iconInputRef.current.value = "";
    }
  }

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
            {/* Circle icon with optional 3-dot edit menu for creator */}
            <div className="relative flex-shrink-0">
              {circle.icon_url ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-border shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              )}

              {isCreator && (
                <>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-bg-primary border border-border flex items-center justify-center hover:bg-bg-tertiary transition-colors shadow-sm"
                  >
                    {uploadingIcon ? (
                      <div className="w-3 h-3 border-[1.5px] border-blue border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-2.5 h-2.5 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    )}
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute left-0 top-14 z-20 w-44 bg-surface border border-border rounded-xl shadow-lg py-1 overflow-hidden">
                        <button
                          onClick={() => iconInputRef.current?.click()}
                          disabled={uploadingIcon}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary cursor-pointer hover:bg-bg-tertiary hover:text-blue transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          Change icon
                        </button>
                        {circle.icon_url && (
                          <button
                            onClick={() => {
                              updateIcon.mutate({ circleId: id, iconUrl: null });
                              setMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red cursor-pointer hover:bg-red/10 transition-colors duration-150"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Remove icon
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconFileSelected}
                  />
                </>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight">{circle.name}</h1>
            <Badge variant="blue">{circle.member_count} members</Badge>
            <Badge variant="purple">{circle.market_count} markets</Badge>
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    tab === t
                      ? "bg-surface text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {t === "active" ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Active
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resolved
                    </>
                  )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
