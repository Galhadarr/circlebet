type BadgeVariant = "green" | "red" | "blue" | "gray";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  green: "bg-green-dim text-green",
  red: "bg-red-dim text-red",
  blue: "bg-blue-dim text-blue",
  gray: "bg-bg-tertiary text-text-secondary",
};

export function Badge({ variant = "gray", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
