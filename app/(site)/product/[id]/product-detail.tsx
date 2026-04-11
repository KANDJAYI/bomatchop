"use client";

import Image from "next/image";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { labelVendorType } from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";
import type { Product } from "@/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const { add } = useCart();
  const { showToast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  const discountPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (1 - product.pricePromo / product.priceOriginal) * 100,
      ),
    ),
  );

  return (
    <div className="mx-auto grid max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-start">
      <div className="boma-panel boma-panel--glow relative aspect-square overflow-hidden rounded-[2rem] bg-card shadow-xl">
        <Image
          src={product.image}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
        <span
          className="absolute left-4 top-4 rounded-full bg-boma-blue px-3 py-1.5 text-sm font-bold text-white shadow-lg"
          title="Réduction"
        >
          {discountPct} %
        </span>
      </div>
      <div className="flex flex-col gap-6 animate-fade-up">
        <div>
          <div className="flex items-center gap-3">
            {product.vendorAvatarUrl ? (
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-foreground/5 shadow-sm">
                <Image
                  src={product.vendorAvatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </span>
            ) : (
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-boma-blue/12 text-lg font-bold text-boma-blue"
                aria-hidden
              >
                {product.vendorName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <p className="text-sm font-medium text-boma-blue">{product.vendorName}</p>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 inline-flex rounded-full bg-boma-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-boma-forest dark:text-emerald-300">
            {labelVendorType(product.vendorType)}
          </p>
        </div>
        <p className="text-muted leading-relaxed">{product.description}</p>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-boma-blue">
            {formatXAF(product.pricePromo)}
          </span>
          <span className="text-lg text-muted line-through">
            {formatXAF(product.priceOriginal)}
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="primary"
            className={justAdded ? "ring-2 ring-boma-blue ring-offset-2" : ""}
            onClick={() => {
              add(product, 1);
              showToast("Ajouté au panier", "success");
              setJustAdded(true);
              window.setTimeout(() => setJustAdded(false), 600);
            }}
          >
            Ajouter au panier
          </Button>
          <ButtonLink href="/marketplace" variant="secondary">
            Continuer les courses
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
