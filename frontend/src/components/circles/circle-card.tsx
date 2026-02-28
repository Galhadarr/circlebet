"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CircleResponse } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CircleCard({ circle }: { circle: CircleResponse }) {
  const router = useRouter();

  return (
    <Card onClick={() => router.push(`/circle/${circle.id}`)} className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg">{circle.name}</h3>
        <Badge variant="blue">{circle.member_count} members</Badge>
      </div>
      {circle.description && (
        <p className="text-sm text-text-secondary line-clamp-2">
          {circle.description}
        </p>
      )}
      <p className="text-xs text-text-muted">
        Created {formatDate(circle.created_at)}
      </p>
    </Card>
  );
}
