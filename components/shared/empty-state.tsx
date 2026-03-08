import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#2e2e2e] bg-[#242424]/50 p-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a]">
        <Inbox className="h-5 w-5 text-[#a3a3a3]" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-[#a3a3a3]">{description}</p>
    </div>
  );
}
