"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ButtonLink } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { groupCartLinesByVendor } from "@/lib/cart-vendor-groups";
import { SupermarketDlcBlock } from "@/components/supermarket-dlc-block";
import { formatXAF } from "@/lib/mock-products";

export function CartSidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    lines,
    setQuantity,
    remove,
    total,
    itemCount,
    sidebarOpen,
    closeCart,
  } = useCart();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, closeCart]);

  useEffect(() => {
    if (sidebarOpen) closeBtnRef.current?.focus();
  }, [sidebarOpen]);

  if (!mounted) return null;

  const vendorGroups = groupCartLinesByVendor(lines);

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex justify-end transition-[visibility] duration-300 ${
        sidebarOpen ? "visible" : "invisible pointer-events-none delay-300"
      }`}
      aria-hidden={!sidebarOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 motion-reduce:transition-none ${
          sidebarOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
        aria-label="Fermer le panier"
      />
      <aside
        className={`relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl ring-1 ring-foreground/10 transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-card dark:ring-white/10 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
          <h2 id="cart-sidebar-title" className="text-lg font-semibold tracking-tight">
            Panier
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted">
                ({itemCount} article{itemCount > 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeCart}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.06] text-lg text-muted transition-colors hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-muted text-sm leading-relaxed">
                Votre panier est vide. Ajoutez des offres depuis le marché ou une fiche
                produit.
              </p>
              <ButtonLink href="/marketplace" variant="primary" onClick={closeCart}>
                Explorer les offres
              </ButtonLink>
            </div>
          ) : (
            <div className="space-y-6">
              {vendorGroups.length > 1 && (
                <p className="rounded-xl bg-boma-blue/[0.08] px-3 py-2 text-xs leading-relaxed text-muted">
                  Plusieurs commerces dans le panier : à la commande,{" "}
                  <strong className="text-foreground">une commande séparée</strong> sera
                  créée pour chaque vendeur.
                </p>
              )}
              {vendorGroups.map((g) => (
                <div key={g.vendorId}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-boma-forest dark:text-emerald-300">
                    {g.vendorName}
                  </p>
                  <ul className="space-y-3">
                    {g.lines.map(({ product, quantity }) => (
                      <li
                        key={product.id}
                        className="flex gap-3 rounded-2xl border border-foreground/[0.08] bg-card/80 p-3 dark:border-white/[0.08]"
                      >
                        <Link
                          href={`/product/${product.id}`}
                          onClick={closeCart}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                        >
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${product.id}`}
                            onClick={closeCart}
                            className="line-clamp-2 text-sm font-semibold leading-snug hover:text-boma-blue"
                          >
                            {product.name}
                          </Link>
                          {product.vendorType === "supermarche" && product.expiresAt ? (
                            <SupermarketDlcBlock
                              expiresAtIso={product.expiresAt}
                              createdAtIso={product.createdAt}
                              size="sm"
                              className="mt-2"
                            />
                          ) : null}
                          <p className="mt-1 text-sm font-bold text-boma-blue">
                            {formatXAF(product.pricePromo)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <div className="flex items-center rounded-full bg-foreground/[0.08] text-sm">
                              <button
                                type="button"
                                className="pressable px-2.5 py-1 font-medium"
                                onClick={() => setQuantity(product.id, quantity - 1)}
                                aria-label="Diminuer la quantité"
                              >
                                −
                              </button>
                              <span className="min-w-7 text-center text-xs font-semibold tabular-nums">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                className="pressable px-2.5 py-1 font-medium"
                                onClick={() => setQuantity(product.id, quantity + 1)}
                                aria-label="Augmenter la quantité"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              className="text-xs font-medium text-red-500 hover:underline"
                              onClick={() => remove(product.id)}
                            >
                              Retirer
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-right text-xs font-medium text-muted">
                    Sous-total {formatXAF(g.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-foreground/10 bg-boma-forest/[0.04] px-5 py-4 dark:bg-boma-forest/15">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-boma-blue">{formatXAF(total)}</span>
            </div>
            <ButtonLink
              href="/checkout"
              variant="primary"
              className="mt-4 w-full"
              onClick={closeCart}
            >
              Passer commande
            </ButtonLink>
            <Link
              href="/cart"
              onClick={closeCart}
              className="mt-3 block text-center text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Voir le panier en pleine page
            </Link>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
