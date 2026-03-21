"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCircle, useUpdateCircleIcon } from "@/hooks/use-circles";
import { useCircleBets, useBet } from "@/hooks/use-bets";
import type { BetListFilter, BetStatusFilter } from "@/hooks/use-bets";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAuthStore } from "@/stores/auth-store";
import { BetCard } from "@/components/bets/bet-card";
import { CreateBetModal } from "@/components/bets/create-bet-modal";
import { EnterBetModal } from "@/components/bets/enter-bet-modal";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { InviteLink } from "@/components/circles/invite-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { BetDetailResponse, BetResponse } from "@/lib/types";

export default function CirclePage() {
  const { id } = useParams<{ id: string }>();
  const { data: circle, isLoading: circleLoading } = useCircle(id);
  const [listFilter, setListFilter] = useState<BetListFilter>("all");
  const [statusTab, setStatusTab] = useState<BetStatusFilter>("ALL");
  const statusParam = statusTab === "ALL" ? undefined : statusTab;
  const { data: bets, isLoading: betsLoading } = useCircleBets(id, listFilter, statusParam);
  const { data: leaderboard } = useLeaderboard(id);
  const userId = useAuthStore((s) => s.user?.id);
  const updateIcon = useUpdateCircleIcon();
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [enterBetId, setEnterBetId] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const { data: enterBetDetail } = useBet(enterBetId ?? "");

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
      await updateIcon.mutateAsync({ circleId: id, iconUrl: url });
      toast.success("Icon updated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update icon.");
    } finally {
      setUploadingIcon(false);
      if (iconInputRef.current) iconInputRef.current.value = "";
    }
  }

  function openEnterForBet(b: BetResponse) {
    setEnterBetId(b.id);
  }

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      <Link
        href="/circles"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to circles
      </Link>

      <div className="relative bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
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
                    type="button"
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
                          type="button"
                          onClick={() => iconInputRef.current?.click()}
                          disabled={uploadingIcon}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary cursor-pointer hover:bg-bg-tertiary hover:text-blue transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Change icon
                        </button>
                        {circle.icon_url && (
                          <button
                            type="button"
                            onClick={() => {
                              updateIcon.mutate({ circleId: id, iconUrl: null });
                              setMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red cursor-pointer hover:bg-red/10 transition-colors duration-150"
                          >
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
            <Badge variant="purple">{circle.bet_count} bets</Badge>
          </div>
          {circle.description && (
            <p className="text-sm text-text-secondary max-w-lg">{circle.description}</p>
          )}
        </div>
      </div>

      <InviteLink inviteToken={circle.invite_token} />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1 bg-bg-tertiary rounded-xl p-1">
              {(["ALL", "PENDING", "ACTIVE", "FINISHED"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStatusTab(t)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    statusTab === t
                      ? "bg-surface text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + Bet
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-text-muted self-center mr-1">Show:</span>
            {(
              [
                ["all", "All bets"],
                ["entered", "My bets"],
                ["created", "Created by me"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setListFilter(val)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  listFilter === val
                    ? "border-blue bg-blue/10 text-blue"
                    : "border-border text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {betsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : bets && bets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bets.map((bet, i) => (
                <div
                  key={bet.id}
                  className="animate-fade-in-up"
                  style={{ "--delay": `${0.05 + i * 0.04}s` } as React.CSSProperties}
                >
                  <BetCard
                    bet={bet}
                    circleId={id}
                    onEnter={() => openEnterForBet(bet)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl shadow-sm">
              <p className="text-text-secondary">No bets match your filters.</p>
            </div>
          )}
        </div>

        <div className="lg:w-80 space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Scoreboard</h2>
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
              <p className="text-sm text-text-muted text-center py-4">No scores yet.</p>
            )}
          </div>
        </div>
      </div>

      <CreateBetModal circleId={id} isOpen={showCreate} onClose={() => setShowCreate(false)} />

      <EnterBetModal
        bet={enterBetDetail ? (enterBetDetail as BetDetailResponse) : null}
        isOpen={!!enterBetId}
        isLoading={!!enterBetId && !enterBetDetail}
        onClose={() => {
          setEnterBetId(null);
        }}
      />
    </div>
  );
}
