"use client";

import { useEffect, useRef, useState } from "react";
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
  const [results, setResults] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    // Recherche purement asynchrone (debounce + annulation).
    setError(null);
    setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = window.setTimeout(async () => {
      try {
        const sp = new URLSearchParams();
        if (query.trim()) sp.set("q", query.trim());
        if (type !== "all") sp.set("type", type);
        sp.set("maxPrice", String(maxPrice));

        const res = await fetch(`/api/marketplace/search?${sp.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("SEARCH_FAILED");
        const data = (await res.json()) as { results: Product[] };
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (e) {
        // Abort = changement rapide de filtre / unmount.
        if (controller.signal.aborted) return;
        setError("Impossible de charger les résultats. Réessayez.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [query, type, maxPrice]);

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

      {error ? (
        <p className="boma-panel rounded-3xl bg-card px-6 py-10 text-center text-sm leading-relaxed text-muted ring-1 ring-foreground/[0.05] dark:ring-white/[0.06]">
          {error}
        </p>
      ) : results.length === 0 ? (
        <p className="boma-panel rounded-3xl bg-card px-6 py-16 text-center text-sm leading-relaxed text-muted ring-1 ring-foreground/[0.05] dark:ring-white/[0.06]">
          Aucune offre ne correspond à vos critères. Essayez d’élargir la
          recherche ou le plafond de prix.
        </p>
      ) : (
        <>
          {loading ? (
            <p className="mb-4 text-sm text-muted">Recherche en cours…</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
