"use client";

import type { LeaderboardEntry } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { UserAvatar } from "@/components/ui/user-avatar";

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const userId = useAuthStore((s) => s.user?.id);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-tertiary text-text-muted text-xs">
            <th className="px-3 py-2 text-left w-10">#</th>
            <th className="px-3 py-2 text-left">Player</th>
            <th className="px-3 py-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.user_id}
              className={`border-t border-border ${entry.user_id === userId ? "bg-blue-dim" : ""}`}
            >
              <td className="px-3 py-2 font-mono text-text-muted">
                {entry.rank}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <UserAvatar name={entry.display_name} size="sm" />
                  <span className="font-medium">{entry.display_name}</span>
                  {entry.user_id === userId && (
                    <span className="text-xs text-blue">(you)</span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 text-right font-mono">
                ${formatCurrency(entry.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
