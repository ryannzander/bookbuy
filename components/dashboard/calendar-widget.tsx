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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, index) => {
          const isToday = d.getDate() === today;
          return (
            <div key={d.toISOString()} className="text-center">
              <p className="text-[10px] font-medium text-muted-foreground mb-2">
                {dayNames[index]}
              </p>
              <div
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                  isToday
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
