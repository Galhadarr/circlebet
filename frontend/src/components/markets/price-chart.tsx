"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TradeHistoryEntry } from "@/lib/types";

interface Props {
  trades: TradeHistoryEntry[];
  currentPriceYes: string;
}

export function PriceChart({ trades, currentPriceYes }: Props) {
  // Build chart data from trade history (chronological)
  const sorted = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const data = sorted.map((t) => ({
    time: new Date(t.timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    price: Math.round(parseFloat(t.price_at_trade) * 100),
  }));

  // Add current price as last point
  if (data.length > 0) {
    data.push({
      time: "Now",
      price: Math.round(parseFloat(currentPriceYes) * 100),
    });
  }

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-text-muted text-sm">
        No trade history yet
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2979ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2979ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b6b7b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b6b7b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}¢`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#1e1e24",
              border: "1px solid #2e2e38",
              borderRadius: 8,
              color: "#f0f0f2",
              fontSize: 12,
            }}
            formatter={(value: number | undefined) => [`${value ?? 0}¢`, "YES Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#2979ff"
            strokeWidth={2}
            fill="url(#priceGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
