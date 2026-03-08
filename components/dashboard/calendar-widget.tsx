export function CalendarWidget({ referenceDate }: { referenceDate?: Date }) {
  const todayRef = referenceDate ?? new Date();
  const today = todayRef.getDate();
  const weekStart = new Date(todayRef);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  return (
    <div className="rounded-2xl bg-[#242424] border border-[#2e2e2e] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">This week</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const isToday = d.getDate() === today;
          return (
            <div
              key={d.toISOString()}
              className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium ${
                isToday ? "bg-[#4ade80] text-[#1a1a1a]" : "text-[#a3a3a3]"
              }`}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
