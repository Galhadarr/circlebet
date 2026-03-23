"use client";

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
}) {
  return (
    <span className="relative inline-flex shrink-0 items-center group/tooltip">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-[60] w-max max-w-[min(14rem,calc(100vw-3rem))] -translate-x-1/2 rounded-lg border border-border bg-bg-primary px-3 py-2 text-left text-xs leading-snug text-text-primary shadow-xl transition-all duration-150 invisible opacity-0 scale-95 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100 ${
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        }`}
      >
        {content}
      </span>
    </span>
  );
}
