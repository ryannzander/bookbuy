"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityPoint } from "@/types/dashboard";
import { EmptyState } from "@/components/shared/empty-state";

export function StatsChart({ data }: { data: ActivityPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Marketplace Activity
        </h3>
        <EmptyState
          title="No activity yet"
          description="Activity trends appear after your listings get views and sales."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Marketplace Activity
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dateLabel"
              stroke="#a1a1a1"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              dy={10}
            />
            <YAxis
              hide
              domain={[0, "dataMax + 2"]}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #262626",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "14px",
                padding: "12px 16px",
              }}
              labelStyle={{ color: "#a1a1a1", marginBottom: "4px" }}
              itemStyle={{ color: "#ffffff" }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#viewsGradient)"
              dot={{ r: 4, fill: "#000000", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#ffffff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
