"use client";

import {
  LineChart,
  Line,
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
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Marketplace activity</h3>
        <EmptyState
          title="No activity yet"
          description="Activity trends appear after your listings get views and sales."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Marketplace activity</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="dateLabel" stroke="#737373" tickLine={false} axisLine={false} />
            <YAxis hide domain={[0, "dataMax + 2"]} />
            <Tooltip
              contentStyle={{
                background: "rgba(36,36,36,1)",
                border: "1px solid rgba(46,46,46,1)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#4ade80"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#4ade80" }}
              activeDot={{ r: 5, fill: "#86efac" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
