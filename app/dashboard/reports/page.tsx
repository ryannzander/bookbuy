"use client";

import { api } from "@/lib/trpc/client";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

export default function ReportsPage() {
  const { data, isLoading, error } = api.report.mine.useQuery();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading reports...</p>;
  if (error) return <ErrorState title="Failed to load reports" description={error.message} />;

  const reports = data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>
      {reports.length === 0 ? (
        <EmptyState
          title="No reports filed"
          description="If you report a listing or seller, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <p className="font-medium text-foreground">{r.reason}</p>
              <p className="text-sm text-muted-foreground mt-1">{r.details ?? "No extra details provided."}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Status: {r.status} · Filed {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
