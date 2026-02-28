"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { CircleResponse } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CircleCard({ circle }: { circle: CircleResponse }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/circle/${circle.id}`)}
      className="group relative bg-surface border border-border rounded-2xl p-6 shadow-sm cursor-pointer hover:border-blue/30 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{circle.name}</h3>
          <Badge variant="blue">{circle.member_count} members</Badge>
        </div>
        {circle.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {circle.description}
          </p>
        )}
        <p className="text-xs text-text-muted font-mono">
          Created {formatDate(circle.created_at)}
        </p>
      </div>
    </div>
  );
}
