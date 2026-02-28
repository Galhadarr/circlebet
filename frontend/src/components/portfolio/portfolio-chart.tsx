"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { HoldingResponse } from "@/lib/types";

interface Props {
  holdings: HoldingResponse[];
}

export function PortfolioChart({ holdings }: Props) {
  // Simple bar-like visualization of holdings by current value
  const data = holdings
    .filter((h) => parseFloat(h.current_value) > 0)
    .map((h) => ({
      name: h.market_title.slice(0, 20),
      value: parseFloat(h.current_value),
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-text-muted text-sm">
        No positions to chart
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c853" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00c853" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b6b7b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b6b7b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: "#1e1e24",
              border: "1px solid #2e2e38",
              borderRadius: 8,
              color: "#f0f0f2",
              fontSize: 12,
            }}
            formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, "Value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00c853"
            strokeWidth={2}
            fill="url(#portfolioGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
