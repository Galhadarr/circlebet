"use client";

export function BetImageBanner({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      <div className="relative h-36 w-full overflow-hidden rounded-t-2xl bg-bg-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    );
  }
  return (
    <div className="relative h-28 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue/20 via-purple/15 to-green/10 border-b border-border">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue/40 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-4 right-4">
        <p className="text-sm font-medium text-text-secondary line-clamp-2">{title}</p>
      </div>
    </div>
  );
}
