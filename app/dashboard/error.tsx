"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <ErrorState
      title="Dashboard failed to load"
      description={error.message || "Please refresh and try again."}
    />
  );
}
