"use client";

import type { LeaderboardEntry } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { UserAvatar } from "@/components/ui/user-avatar";

function medalForRank(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function scoreClass(score: number) {
  if (score > 0) return "text-green font-semibold";
  if (score < 0) return "text-red font-semibold";
  return "text-text-secondary";
}

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const userId = useAuthStore((s) => s.user?.id);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface to-bg-secondary/80 shadow-inner">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-tertiary/80 text-text-muted text-xs uppercase tracking-wide">
            <th className="px-3 py-2.5 text-left w-14">#</th>
            <th className="px-3 py-2.5 text-left">Player</th>
            <th className="px-3 py-2.5 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const medal = medalForRank(entry.rank);
            const top = entry.rank <= 3;
            return (
              <tr
                key={entry.user_id}
                className={`border-t border-border/80 transition-colors ${
                  entry.user_id === userId
                    ? "bg-blue/10 ring-1 ring-inset ring-blue/25"
                    : top
                      ? "bg-gradient-to-r from-amber-500/5 via-transparent to-transparent"
                      : ""
                }`}
              >
                <td className="px-3 py-2.5 font-mono text-text-muted align-middle">
                  <span className="inline-flex items-center gap-1">
                    {medal && <span className="text-base leading-none" aria-hidden>{medal}</span>}
                    <span>{entry.rank}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 align-middle">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={entry.display_name} size="sm" />
                    <span className="font-medium">{entry.display_name}</span>
                    {entry.user_id === userId && (
                      <span className="text-xs text-blue font-medium">(you)</span>
                    )}
                  </div>
                </td>
                <td className={`px-3 py-2.5 text-right font-mono tabular-nums align-middle ${scoreClass(entry.score)}`}>
                  {entry.score > 0 ? "+" : ""}
                  {entry.score}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
