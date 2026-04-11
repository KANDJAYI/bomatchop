export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="boma-panel overflow-hidden rounded-3xl bg-card"
        >
          <div className="aspect-[4/3] animate-pulse bg-foreground/10" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-foreground/10" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
