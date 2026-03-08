import type { Meetup } from "@/types/entities";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar } from "lucide-react";

export function ActivityWidget({ meetups }: { meetups: Meetup[] }) {
  if (meetups.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Upcoming Exchanges
        </h3>
        <EmptyState
          title="No exchanges scheduled"
          description="When you confirm meetup times, they will appear here."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Upcoming Exchanges
      </h3>
      <ul className="space-y-3">
        {meetups.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
              {item.buyerName[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {item.listingTitle}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.startTime).toLocaleString()}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
