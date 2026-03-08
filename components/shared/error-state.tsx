import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-200">{title}</p>
          <p className="text-sm text-red-300/80 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
