import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
