import type { TradePreviewResponse } from "@/lib/types";
import { formatPrice, formatPercent } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  preview: TradePreviewResponse | undefined;
  isLoading: boolean;
  side: "YES" | "NO";
}

export function TradePreview({ preview, isLoading, side }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!preview) return null;

  const priceAfter =
    side === "YES"
      ? preview.estimated_price_after_yes
      : preview.estimated_price_after_no;

  return (
    <div className="bg-bg-tertiary rounded-lg p-3 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-text-muted">Est. Shares</span>
        <span className="font-mono">
          {parseFloat(preview.estimated_shares).toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-muted">Price Impact</span>
        <span className="font-mono">
          {formatPercent(preview.price_impact)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-muted">New {side} Price</span>
        <span className="font-mono">{formatPrice(priceAfter)}</span>
      </div>
    </div>
  );
}
