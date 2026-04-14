"use client";

import Image from "next/image";
import Link from "next/link";
import { IconHeart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { useToast } from "@/context/toast-context";
import { SupermarketDlcBlock } from "@/components/supermarket-dlc-block";
import { labelVendorType } from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart();
  const { showToast } = useToast();
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
    <article className="group relative min-w-0">
      <div className="boma-panel boma-panel--glow overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-foreground/[0.05] transition-all duration-300 hover:-translate-y-0.5 dark:ring-white/[0.07]">
        <Link
          href={`/product/${product.id}`}
          className="block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-boma-blue/45"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
            <Image
              src={product.image}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:639px) 100vw, (max-width:1024px) 50vw, 33vw"
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
          <div className="min-w-0 space-y-1.5 p-3 sm:space-y-2 sm:p-4">
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
            {product.vendorType === "supermarche" && product.expiresAt ? (
              <SupermarketDlcBlock
                expiresAtIso={product.expiresAt}
                createdAtIso={product.createdAt}
                size="md"
                className="mt-1"
              />
            ) : null}
          </div>
        </Link>
        <div className="border-t border-foreground/[0.06] px-3 pb-3 pt-2 sm:px-4">
          <Button
            type="button"
            variant="primary"
            className="w-full py-2.5 text-xs sm:text-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              add(product, 1);
              showToast("Ajouté au panier", "success");
            }}
          >
            Ajouter au panier
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
        }}
        className="pressable absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-black/40 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105 hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <IconHeart filled={favorite} className="h-[1.05rem] w-[1.05rem]" />
      </button>
    </article>
  );
}
