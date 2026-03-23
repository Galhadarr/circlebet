export function DoubleDownBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-mono text-[11px] font-bold tracking-tight tabular-nums rounded-md border border-amber-400/45 bg-amber-500/25 px-2 py-1 text-amber-300 shadow-[0_0_12px_-2px_rgba(251,191,36,0.35)] ${className}`}
      aria-label="Double down"
    >
      ×2
    </span>
  );
}
