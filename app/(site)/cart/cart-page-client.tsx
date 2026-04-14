"use client";

import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { groupCartLinesByVendor } from "@/lib/cart-vendor-groups";
import { SupermarketDlcBlock } from "@/components/supermarket-dlc-block";
import { formatXAF } from "@/lib/mock-products";

export function CartPageClient() {
  const { lines, setQuantity, remove, total, itemCount } = useCart();
  const vendorGroups = groupCartLinesByVendor(lines);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <p className="text-5xl" aria-hidden>
          🧺
        </p>
        <h1 className="text-2xl font-semibold">Votre panier est vide</h1>
        <p className="text-muted">
          Parcourez le marché et ajoutez des offres à prix réduit.
        </p>
        <ButtonLink href="/marketplace">Explorer les offres</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Panier</h1>
      <p className="mt-1 text-sm text-muted">
        {itemCount} article{itemCount > 1 ? "s" : ""} · Mise à jour instantanée
      </p>
      {vendorGroups.length > 1 && (
        <p className="mt-6 rounded-2xl bg-boma-blue/[0.08] px-4 py-3 text-sm leading-relaxed text-muted">
          Panier multi-commerces : au paiement,{" "}
          <strong className="text-foreground">une commande sera créée par vendeur</strong>{" "}
          pour que chaque commerce reçoive uniquement ses articles.
        </p>
      )}
      <ul className="mt-10 space-y-6">
        {vendorGroups.map((g) => (
          <li key={g.vendorId} className="list-none">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-boma-forest dark:text-emerald-300">
              {g.vendorName}
            </p>
            <ul className="space-y-4">
              {g.lines.map(({ product, quantity }) => (
          <li
            key={product.id}
            className="boma-panel boma-panel--glow flex gap-4 rounded-3xl bg-card p-4 shadow-sm"
          >
            <Link
              href={`/product/${product.id}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl"
            >
              <Image
                src={product.image}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${product.id}`}
                className="font-semibold hover:text-boma-blue"
              >
                {product.name}
              </Link>
              <p className="text-xs text-muted">{product.vendorName}</p>
              {product.vendorType === "supermarche" && product.expiresAt ? (
                <SupermarketDlcBlock
                  expiresAtIso={product.expiresAt}
                  createdAtIso={product.createdAt}
                  size="sm"
                  className="mt-2"
                />
              ) : null}
              <p className="mt-2 font-bold text-boma-blue">
                {formatXAF(product.pricePromo)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full bg-foreground/[0.06]">
                  <button
                    type="button"
                    className="pressable px-3 py-1.5 text-lg font-medium"
                    onClick={() =>
                      setQuantity(product.id, quantity - 1)
                    }
                    aria-label="Diminuer"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="pressable px-3 py-1.5 text-lg font-medium"
                    onClick={() =>
                      setQuantity(product.id, quantity + 1)
                    }
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-red-500 hover:underline"
                  onClick={() => remove(product.id)}
                >
                  Retirer
                </button>
              </div>
            </div>
          </li>
              ))}
            </ul>
            <p className="mt-2 text-right text-sm font-medium text-muted">
              Sous-total {g.vendorName} :{" "}
              <span className="text-foreground">{formatXAF(g.subtotal)}</span>
            </p>
          </li>
        ))}
      </ul>
      <div className="boma-panel boma-panel--glow mt-10 rounded-3xl bg-boma-forest/5 p-6 dark:bg-boma-forest/15">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Montant total</span>
          <span className="text-boma-blue">{formatXAF(total)}</span>
        </div>
        <p className="mt-4 text-xs font-medium text-muted">
          Paiement à la livraison (espèces au retrait) :
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="relative inline-block h-10 w-[120px] overflow-hidden rounded-md opacity-90">
            <Image
              src="/payments/cash-delivery.webp"
              alt="Paiement à la livraison"
              width={240}
              height={52}
              className="h-10 w-auto object-contain object-left"
              unoptimized
            />
          </span>
        </div>
        <ButtonLink href="/checkout" variant="primary" className="mt-6 w-full">
          Passer commande
        </ButtonLink>
      </div>
    </div>
  );
}
