interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl p-5 shadow-sm ${onClick ? "cursor-pointer hover:border-blue/30 hover:shadow-md transition-all duration-200" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
