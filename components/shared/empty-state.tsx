import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
    </div>
  );
}
