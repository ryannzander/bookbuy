"use client";

import { api } from "@/lib/trpc/client";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Flag } from "lucide-react";

export default function ReportsPage() {
  const { data, isLoading, error } = api.report.mine.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState title="Failed to load reports" description={error.message} />
    );
  }

  const reports = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reports
        </h1>
        <p className="mt-2 text-muted-foreground">
          View reports you have filed
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports filed"
          description="If you report a listing or seller, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-card p-6 hover:border-muted-foreground/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  <Flag className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{r.reason}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {r.details ?? "No extra details provided."}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span
                      className={`rounded-full px-3 py-1 font-medium ${
                        r.status === "RESOLVED"
                          ? "bg-success/20 text-success"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span>
                      Filed {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
