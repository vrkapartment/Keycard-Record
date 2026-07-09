export default function HomeLoading() {
  return (
    <div className="space-y-8">
      <div className="h-[132px] animate-pulse rounded-xl border border-border-strong bg-paper" />

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-xl border border-border-strong bg-paper"
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-sunken" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[68px] animate-pulse rounded-lg border border-border bg-paper"
          />
        ))}
      </div>
    </div>
  );
}
