export default function ProductLoading() {
  return (
    <div className="mx-auto grid max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-[2rem] bg-foreground/10" />
      <div className="space-y-4">
        <div className="h-10 w-3/4 animate-pulse rounded-xl bg-foreground/10" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-foreground/10" />
        <div className="h-12 w-40 animate-pulse rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}
