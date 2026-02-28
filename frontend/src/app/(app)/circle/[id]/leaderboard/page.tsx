"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCircle } from "@/hooks/use-circles";
import { useLeaderboard } from "@/hooks/use-portfolio";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Spinner } from "@/components/ui/spinner";

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: circle } = useCircle(id);
  const { data: leaderboard, isLoading } = useLeaderboard(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/circle/${id}`}
          className="text-text-muted hover:text-text-primary transition"
        >
          &larr;
        </Link>
        <h1 className="text-2xl font-bold">
          {circle?.name ?? "Circle"} Leaderboard
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <LeaderboardTable entries={leaderboard} />
      ) : (
        <p className="text-text-secondary text-center py-12">
          No leaderboard data yet.
        </p>
      )}
    </div>
  );
}
