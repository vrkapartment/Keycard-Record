export default function CardsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-sunken" />
        <div className="h-8 w-24 animate-pulse rounded-md bg-surface-sunken" />
      </div>

      <div className="h-[132px] animate-pulse rounded-lg border border-border bg-paper" />

      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[68px] animate-pulse rounded-lg border border-border bg-paper"
          />
        ))}
      </div>
    </div>
  );
}
