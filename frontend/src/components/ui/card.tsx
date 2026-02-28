interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`bg-bg-secondary border border-border rounded-xl p-4 ${onClick ? "cursor-pointer hover:border-text-muted transition" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
