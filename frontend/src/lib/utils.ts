export function formatPrice(price: string | number): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `${Math.round(n * 100)}¢`;
}

export function formatCurrency(amount: string | number): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatPercent(price: string | number): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `${(n * 100).toFixed(1)}%`;
}

export function formatMultiplier(price: string | number): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (n <= 0) return "—";
  return `${(1 / n).toFixed(2)}x`;
}
