import type { Meetup } from "@/types/entities";
import { EmptyState } from "@/components/shared/empty-state";

export function ActivityWidget({ meetups }: { meetups: Meetup[] }) {
  if (meetups.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming exchanges</h3>
        <EmptyState
          title="No upcoming exchanges scheduled"
          description="When you confirm meetup times, they will appear here."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming exchanges</h3>
      <ul className="space-y-3">
        {meetups.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-primary">
              {item.buyerName[0] ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{item.listingTitle}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.startTime).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
