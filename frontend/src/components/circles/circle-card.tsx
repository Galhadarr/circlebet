"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { CircleResponse } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function CircleIcon({ iconUrl, name }: { iconUrl: string | null; name: string }) {
  if (iconUrl) {
    return (
      <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
        <Image src={iconUrl} alt={name} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex-shrink-0 bg-blue/10 border border-blue/20 flex items-center justify-center">
      <svg className="w-4.5 h-4.5 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    </div>
  );
}

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
          <div className="flex items-center gap-2.5 min-w-0">
            <CircleIcon iconUrl={circle.icon_url} name={circle.name} />
            <h3 className="font-semibold text-lg truncate">{circle.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <Badge variant="blue">{circle.member_count} members</Badge>
            <Badge variant="purple">{circle.market_count} markets</Badge>
          </div>
        </div>
        {circle.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3 pl-11">
            {circle.description}
          </p>
        )}
        <p className="text-xs text-text-muted font-mono pl-11">
          Created {formatDate(circle.created_at)}
        </p>
      </div>
    </div>
  );
}
