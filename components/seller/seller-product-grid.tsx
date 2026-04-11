"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProductAction } from "@/app/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { labelProductStatus } from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80";

export type SellerCatalogProduct = {
  id: string;
  name: string;
  price_original: number;
  price_promo: number;
  stock: number;
  status: string;
  image_url: string | null;
  created_at: string;
};

type Props = {
  products: SellerCatalogProduct[];
  /** `compact` : texte court sur le tableau de bord */
  variant?: "full" | "compact";
};

export function SellerProductGrid({ products, variant = "full" }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, start] = useTransition();

  function onDelete(id: string) {
    if (!confirm("Retirer cette offre du marché ? La photo sera aussi supprimée.")) {
      return;
    }
    start(async () => {
      const r = await deleteProductAction(id);
      if (r.error) showToast(r.error, "error");
      else {
        showToast("Offre retirée", "info");
        router.refresh();
      }
    });
  }

  return (
    <div className="boma-panel rounded-3xl bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Catalogue en ligne</h2>
          <p className="mt-1 text-sm text-muted">
            Aperçu tel qu’affiché côté clients — prix promo après règles BOMA.
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {products.length} réf.{products.length > 1 ? "s" : ""}
        </p>
      </div>

      {!products.length ? (
        <div className="mt-10 rounded-2xl bg-background/50 py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            {variant === "compact" ? "Aucune offre pour l’instant" : "Aucune offre publiée"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            {variant === "compact" ? (
              <>
                Créez une offre depuis{" "}
                <Link href="/seller/products/new" className="text-boma-blue hover:underline">
                  Nouvelle offre
                </Link>
                .
              </>
            ) : (
              <>
                Publiez votre première offre avec une photo : elle apparaîtra ici et sur le
                marché.
              </>
            )}
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
          {products.map((p) => (
            <li
              key={p.id}
              className="boma-panel boma-panel--glow flex flex-col overflow-hidden rounded-2xl bg-card"
            >
              <div className="relative aspect-[4/3] w-full bg-foreground/5">
                <Image
                  src={p.image_url || PLACEHOLDER}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 50vw, 50vw"
                />
                <span className="absolute left-3 top-3 rounded-full bg-boma-forest/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {labelProductStatus(p.status)}
                </span>
                {p.stock <= 3 && p.stock > 0 ? (
                  <span className="absolute right-3 top-3 rounded-full bg-boma-spectrum-red/90 px-2 py-1 text-[10px] font-bold text-white">
                    Stock faible
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
                <div>
                  <h3 className="font-semibold leading-snug text-foreground line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-muted">
                    Ajouté le{" "}
                    {new Date(p.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                  <div>
                    <p className="text-lg font-bold text-boma-blue">
                      {formatXAF(Number(p.price_promo))}
                    </p>
                    <p className="text-xs text-muted line-through">
                      {formatXAF(Number(p.price_original))}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted">
                      Stock : {p.stock}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink
                      href={`/seller/products/${p.id}/edit`}
                      variant="secondary"
                      className="px-3 py-2 text-xs"
                    >
                      Modifier
                    </ButtonLink>
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3 py-2 text-xs text-red-600"
                      disabled={pending}
                      onClick={() => onDelete(p.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
