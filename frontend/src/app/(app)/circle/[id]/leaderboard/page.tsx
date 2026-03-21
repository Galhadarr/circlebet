"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCircle } from "@/hooks/use-circles";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: circle } = useCircle(id);
  const { data: leaderboard, isLoading } = useLeaderboard(id);

  const top3 = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  const medals = ["🥇", "🥈", "🥉"] as const;

  return (
    <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto" style={{ "--delay": "0s" } as React.CSSProperties}>
      <div className="flex items-center gap-3">
        <Link
          href={`/circle/${id}`}
          className="text-text-muted hover:text-text-primary transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {circle?.name ?? "Circle"}{" "}
          <span className="bg-gradient-to-r from-amber-400 via-slate-200 to-amber-600 bg-clip-text text-transparent">
            Scoreboard
          </span>
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <>
          {top3.length >= 1 && (
            <div
              className="relative rounded-3xl border border-border overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-slate-900/40 via-bg-secondary to-blue-950/20 shadow-xl shadow-blue/5"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 min-h-[200px]">
                {top3.length >= 2 && (
                  <div className="order-2 sm:order-1 flex flex-col items-center flex-1 max-w-[200px] pb-2">
                    <div className="text-4xl mb-2 drop-shadow-lg">{medals[1]}</div>
                    <div className="w-full rounded-2xl border border-slate-400/30 bg-surface/90 p-4 text-center shadow-lg">
                      <div className="flex justify-center mb-2">
                        <UserAvatar name={top3[1].display_name} size="md" />
                      </div>
                      <p className="font-semibold text-sm truncate">{top3[1].display_name}</p>
                      <p className={`font-mono text-lg mt-1 ${top3[1].score >= 0 ? "text-green" : "text-red"}`}>
                        {top3[1].score > 0 ? "+" : ""}
                        {top3[1].score} <span className="text-xs text-text-muted">pts</span>
                      </p>
                    </div>
                  </div>
                )}
                <div className="order-1 sm:order-2 flex flex-col items-center flex-1 max-w-[220px] -mt-4 sm:-mt-8 z-10">
                  <div className="text-5xl mb-2 drop-shadow-lg filter drop-shadow-amber-500/20">{medals[0]}</div>
                  <div className="w-full rounded-2xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-500/15 to-surface p-5 text-center shadow-2xl shadow-amber-500/10">
                    <div className="flex justify-center mb-2">
                      <span className="inline-flex rounded-full ring-2 ring-amber-400/50 p-0.5">
                        <UserAvatar name={top3[0].display_name} size="md" />
                      </span>
                    </div>
                    <p className="font-bold truncate">{top3[0].display_name}</p>
                    <p className={`font-mono text-2xl font-bold mt-1 ${top3[0].score >= 0 ? "text-green" : "text-red"}`}>
                      {top3[0].score > 0 ? "+" : ""}
                      {top3[0].score}
                    </p>
                    <p className="text-xs text-amber-200/80 mt-1">Champion</p>
                  </div>
                </div>
                {top3.length >= 3 && (
                  <div className="order-3 flex flex-col items-center flex-1 max-w-[200px] pb-2">
                    <div className="text-4xl mb-2 drop-shadow-lg">{medals[2]}</div>
                    <div className="w-full rounded-2xl border border-amber-700/30 bg-surface/90 p-4 text-center shadow-lg">
                      <div className="flex justify-center mb-2">
                        <UserAvatar name={top3[2].display_name} size="md" />
                      </div>
                      <p className="font-semibold text-sm truncate">{top3[2].display_name}</p>
                      <p className={`font-mono text-lg mt-1 ${top3[2].score >= 0 ? "text-green" : "text-red"}`}>
                        {top3[2].score > 0 ? "+" : ""}
                        {top3[2].score} <span className="text-xs text-text-muted">pts</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className="animate-fade-in-up"
            style={{ "--delay": "0.1s" } as React.CSSProperties}
          >
            <LeaderboardTable entries={top3.length >= 3 ? rest : leaderboard} />
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl shadow-sm">
          <p className="text-text-secondary">No scoreboard data yet.</p>
        </div>
      )}
    </div>
  );
}
