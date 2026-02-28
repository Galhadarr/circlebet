const palette = [
  "bg-blue/20 text-blue",
  "bg-purple-500/20 text-purple-400",
  "bg-green/20 text-green",
  "bg-red/20 text-red",
  "bg-amber-500/20 text-amber-400",
  "bg-cyan-500/20 text-cyan-400",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md";
}

export function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  const letter = (name?.[0] ?? "?").toUpperCase();
  const color = colorFor(name ?? "");
  const sizeClass = size === "sm" ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-sm";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${sizeClass} ${color}`}
      aria-label={name}
    >
      {letter}
    </span>
  );
}
