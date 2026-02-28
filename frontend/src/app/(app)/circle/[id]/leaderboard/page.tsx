"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCircle } from "@/hooks/use-circles";
import { useLeaderboard } from "@/hooks/use-portfolio";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: circle } = useCircle(id);
  const { data: leaderboard, isLoading } = useLeaderboard(id);

  const top3 = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      {/* Header */}
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
          <span className="bg-gradient-to-r from-green to-blue bg-clip-text text-transparent">
            Leaderboard
          </span>
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <>
          {/* Podium top 3 */}
          {top3.length >= 3 && (
            <div
              className="grid grid-cols-3 gap-4 animate-fade-in-up"
              style={{ "--delay": "0.05s" } as React.CSSProperties}
            >
              {/* 2nd place */}
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm text-center mt-8">
                <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3 text-lg font-bold font-mono text-text-muted">
                  2
                </div>
                <p className="font-semibold text-sm truncate">{top3[1].display_name}</p>
                <p className="font-mono text-sm text-text-secondary mt-1">${formatCurrency(top3[1].balance)}</p>
              </div>
              {/* 1st place */}
              <div className="bg-surface border border-blue/30 rounded-2xl p-5 shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-blue-dim border-2 border-blue flex items-center justify-center mx-auto mb-3 text-lg font-bold font-mono text-blue">
                  1
                </div>
                <p className="font-semibold truncate">{top3[0].display_name}</p>
                <p className="font-mono text-green font-medium mt-1">${formatCurrency(top3[0].balance)}</p>
              </div>
              {/* 3rd place */}
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm text-center mt-8">
                <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3 text-lg font-bold font-mono text-text-muted">
                  3
                </div>
                <p className="font-semibold text-sm truncate">{top3[2].display_name}</p>
                <p className="font-mono text-sm text-text-secondary mt-1">${formatCurrency(top3[2].balance)}</p>
              </div>
            </div>
          )}

          {/* Full table */}
          <div
            className="bg-surface border border-border rounded-2xl p-5 shadow-sm animate-fade-in-up"
            style={{ "--delay": "0.1s" } as React.CSSProperties}
          >
            <LeaderboardTable entries={top3.length >= 3 ? rest : leaderboard} />
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl shadow-sm">
          <p className="text-text-secondary">
            No leaderboard data yet.
          </p>
        </div>
      )}
    </div>
  );
}
