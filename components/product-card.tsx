"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/context/favorites-context";
import { labelVendorType } from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { has, toggle } = useFavorites();
  const discountPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (1 - product.pricePromo / product.priceOriginal) * 100,
      ),
    ),
  );
  const favorite = has(product.id);

  return (
    <article className="group relative">
      <Link
        href={`/product/${product.id}`}
        className="boma-panel boma-panel--glow block overflow-hidden rounded-3xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
          <Image
            src={product.image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:1024px) 50vw, 33vw"
          />
          <span
            className="absolute left-3 top-3 rounded-full bg-boma-blue px-2.5 py-1 text-xs font-bold text-white shadow-md"
            title="Réduction"
          >
            {discountPct} %
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-boma-forest/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {labelVendorType(product.vendorType)}
          </span>
        </div>
        <div className="space-y-1.5 p-3 sm:space-y-2 sm:p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight sm:text-base">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {product.vendorAvatarUrl ? (
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-foreground/5">
                <Image
                  src={product.vendorAvatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </span>
            ) : (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-boma-blue/12 text-[11px] font-bold text-boma-blue"
                aria-hidden
              >
                {product.vendorName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <p className="min-w-0 flex-1 truncate text-xs text-muted">{product.vendorName}</p>
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-base font-bold text-boma-blue sm:text-lg">
              {formatXAF(product.pricePromo)}
            </span>
            <span className="text-sm text-muted line-through">
              {formatXAF(product.priceOriginal)}
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
        }}
        className="pressable absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/35 text-lg text-white backdrop-blur-md transition-transform hover:scale-110"
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {favorite ? "♥" : "♡"}
      </button>
    </article>
  );
}
