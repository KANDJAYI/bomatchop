"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product, VendorType } from "@/lib/types";

type Props = {
  products: Product[];
  initialType?: "all" | VendorType;
  initialQuery?: string;
};

export function MarketplaceClient({
  products,
  initialType = "all",
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<"all" | VendorType>(initialType);
  const [maxPrice, setMaxPrice] = useState(50_000);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Offres du moment
        </h1>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          Filtrez par type de commerce et par budget. Les prix affichés sont en
          FCFA.
        </p>
      </div>

      <div className="boma-panel boma-panel--glow mb-8 flex flex-col gap-5 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/[0.05] sm:flex-row sm:flex-wrap sm:items-end dark:ring-white/[0.06]">
        <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-medium text-foreground/90">
          Recherche
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Plat, commerce…"
            className="boma-field w-full rounded-2xl px-4 py-3 text-foreground"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-2 text-sm font-medium text-foreground/90">
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
            <option value="boutique">Boutique</option>
          </select>
        </label>
        <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-medium text-foreground/90">
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
      </div>

      {filtered.length === 0 ? (
        <p className="boma-panel rounded-3xl bg-card px-6 py-16 text-center text-sm leading-relaxed text-muted ring-1 ring-foreground/[0.05] dark:ring-white/[0.06]">
          Aucune offre ne correspond à vos critères. Essayez d’élargir la
          recherche ou le plafond de prix.
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
