export default function RoomsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 animate-pulse rounded bg-surface-sunken" />
        <div className="h-8 w-24 animate-pulse rounded-md bg-surface-sunken" />
      </div>

      <div className="h-[42px] animate-pulse rounded-md bg-surface-sunken" />

      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[64px] animate-pulse rounded-lg border border-border bg-paper"
          />
        ))}
      </div>
    </div>
  );
}
