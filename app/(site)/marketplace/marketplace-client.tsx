"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import type { Product, VendorType } from "@/lib/types";

type Props = {
  products: Product[];
};

export function MarketplaceClient({ products }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | VendorType>("all");
  const [maxPrice, setMaxPrice] = useState(50_000);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (type !== "all" && p.vendorType !== type) return false;
      if (p.pricePromo > maxPrice) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q)
      );
    });
  }, [products, query, type, maxPrice]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Offres du moment
        </h1>
        <p className="text-muted">
          Filtrez par type de commerce et par budget — scroll fluide, chargement
          optimisé.
        </p>
      </div>

      <div className="boma-panel boma-panel--glow mb-8 flex flex-col gap-4 rounded-3xl bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-medium">
          Recherche
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Plat, commerce…"
            className="boma-field w-full rounded-2xl px-4 py-3 text-foreground"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-2 text-sm font-medium">
          Type
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "all" | VendorType)
            }
            className="boma-field w-full rounded-2xl px-4 py-3 text-foreground"
          >
            <option value="all">Tous</option>
            <option value="restaurant">Restaurant</option>
            <option value="supermarche">Supermarché</option>
          </select>
        </label>
        <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-medium">
          Prix max (FCFA) : {maxPrice.toLocaleString("fr-FR")}
          <input
            type="range"
            min={1000}
            max={20000}
            step={500}
            value={Math.min(maxPrice, 20000)}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="accent-boma-blue"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setLoadingDemo(true);
            window.setTimeout(() => setLoadingDemo(false), 900);
          }}
          className="pressable rounded-2xl bg-boma-blue/[0.08] px-4 py-3 text-sm font-semibold text-boma-blue hover:bg-boma-blue/15"
        >
          Simuler le chargement
        </button>
      </div>

      {loadingDemo ? (
        <ProductGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <p className="boma-panel rounded-3xl bg-card py-16 text-center text-muted">
          Aucune offre ne correspond à vos critères. Essayez d’élargir la
          recherche.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
