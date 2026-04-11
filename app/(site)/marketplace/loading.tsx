import { ProductGridSkeleton } from "@/components/product-grid-skeleton";

export default function MarketplaceLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-10 h-10 max-w-md animate-pulse rounded-2xl bg-foreground/10" />
      <ProductGridSkeleton count={6} />
    </div>
  );
}
