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
    <div className="rounded-2xl bg-card border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">This week</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const isToday = d.getDate() === today;
          return (
            <div
              key={d.toISOString()}
              className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium ${
                isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
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
