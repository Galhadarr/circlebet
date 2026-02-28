interface Props {
  imageUrl: string | null;
  title: string;
  marketId: string;
  className?: string;
}

const gradients: [string, string][] = [
  ["#3b82f6", "#8b5cf6"],
  ["#10b981", "#3b82f6"],
  ["#f59e0b", "#ef4444"],
  ["#ec4899", "#8b5cf6"],
  ["#14b8a6", "#3b82f6"],
  ["#f97316", "#ec4899"],
  ["#6366f1", "#14b8a6"],
];

function pickGradient(id: string): [string, string] {
  const hash = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export function MarketImageBanner({ imageUrl, title, marketId, className = "h-32" }: Props) {
  if (imageUrl) {
    return (
      <div className={`w-full ${className} overflow-hidden bg-bg-secondary`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  const [from, to] = pickGradient(marketId);

  return (
    <div
      className={`w-full ${className} flex items-center justify-center overflow-hidden`}
      style={{ background: `linear-gradient(135deg, ${from}26 0%, ${to}26 100%)` }}
    >
      <svg
        className="w-10 h-10 opacity-30"
        style={{ color: from }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
        />
      </svg>
    </div>
  );
}
