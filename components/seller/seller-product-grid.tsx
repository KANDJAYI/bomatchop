"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProductAction } from "@/app/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { SupermarketDlcBlock } from "@/components/supermarket-dlc-block";
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
  /** DLC supermarché (timestamptz ISO), null pour restaurant ou ancienne ligne. */
  expires_at?: string | null;
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
    <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
      <div className="flex flex-col gap-2 border-b border-zinc-100 px-6 pb-5 pt-6 dark:border-zinc-800/80 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pt-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Catalogue en ligne
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Aperçu côté clients — prix promo conforme aux règles BOMA TCHOP.
          </p>
        </div>
        <p className="shrink-0 rounded-full border border-zinc-200/90 bg-zinc-50 px-3 py-1 text-xs font-semibold tabular-nums text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
          {products.length} réf.{products.length > 1 ? "s" : ""}
        </p>
      </div>

      {!products.length ? (
        <div className="mx-6 mb-6 mt-8 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/40 sm:mx-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
            <IconEmptyCatalog className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {variant === "compact" ? "Aucune offre pour l’instant" : "Aucune offre publiée"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
      ) : variant === "full" ? (
        <div className="overflow-x-auto px-0 pb-6 pt-2 sm:px-0 sm:pb-8 sm:pt-4">
          <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/95 text-xs font-semibold uppercase tracking-wide text-muted dark:border-zinc-800 dark:bg-zinc-900/90">
                <th className="whitespace-nowrap px-4 py-3 pl-6 sm:pl-8" scope="col">
                  Visuel
                </th>
                <th className="whitespace-nowrap px-4 py-3" scope="col">
                  Offre
                </th>
                <th className="min-w-[12rem] px-4 py-3" scope="col">
                  Expiration (DLC)
                </th>
                <th className="whitespace-nowrap px-4 py-3" scope="col">
                  Statut
                </th>
                <th className="whitespace-nowrap px-4 py-3 tabular-nums" scope="col">
                  Prix promo
                </th>
                <th className="whitespace-nowrap px-4 py-3 tabular-nums" scope="col">
                  Prix catalogue
                </th>
                <th className="whitespace-nowrap px-4 py-3 tabular-nums" scope="col">
                  Stock
                </th>
                <th className="whitespace-nowrap px-4 py-3" scope="col">
                  Créé le
                </th>
                <th className="whitespace-nowrap px-4 py-3 pr-6 text-right sm:pr-8" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/90">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="bg-white transition-colors hover:bg-zinc-50/80 dark:bg-zinc-950/40 dark:hover:bg-zinc-900/60"
                >
                  <td className="whitespace-nowrap px-4 py-3 pl-6 align-middle sm:pl-8">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-foreground/5 ring-1 ring-zinc-200/80 dark:ring-zinc-700">
                      <Image
                        src={p.image_url || PLACEHOLDER}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="min-w-[10rem] max-w-[20rem] whitespace-nowrap px-4 py-3 align-middle">
                    <p
                      className="truncate font-semibold text-zinc-900 dark:text-zinc-50"
                      title={p.name}
                    >
                      {p.name}
                    </p>
                  </td>
                  <td className="max-w-[20rem] whitespace-normal px-4 py-3 align-top">
                    {p.expires_at ? (
                      <SupermarketDlcBlock
                        expiresAtIso={p.expires_at}
                        createdAtIso={p.created_at}
                        size="sm"
                      />
                    ) : (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle">
                    <div className="flex max-w-[20rem] flex-nowrap items-center gap-2">
                      <span className="shrink-0 rounded-full bg-boma-forest/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-boma-forest dark:bg-emerald-500/15 dark:text-emerald-300">
                        {labelProductStatus(p.status)}
                      </span>
                      {p.stock <= 3 && p.stock > 0 ? (
                        <span className="shrink-0 rounded-full bg-red-500/12 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-300">
                          Stock faible
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle font-semibold tabular-nums text-boma-blue">
                    {formatXAF(Number(p.price_promo))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle tabular-nums text-zinc-500 line-through dark:text-zinc-500">
                    {formatXAF(Number(p.price_original))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                    {p.stock}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-zinc-600 dark:text-zinc-400">
                    {new Date(p.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 pr-6 text-right align-middle sm:pr-8">
                    <div className="inline-flex flex-nowrap items-center justify-end gap-2">
                      <ButtonLink
                        href={`/seller/products/${p.id}/edit`}
                        variant="secondary"
                        className="shrink-0 px-3 py-1.5 text-xs whitespace-nowrap"
                      >
                        Modifier
                      </ButtonLink>
                      <Button
                        type="button"
                        variant="secondary"
                        className="shrink-0 px-3 py-1.5 text-xs whitespace-nowrap text-red-600 dark:text-red-400"
                        disabled={pending}
                        onClick={() => onDelete(p.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 px-6 pb-6 pt-6 sm:gap-5 sm:px-8 sm:pb-8 sm:pt-8">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white text-zinc-900 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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
                  <h3 className="line-clamp-2 font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                    {p.name}
                  </h3>
                  {p.expires_at ? (
                    <SupermarketDlcBlock
                      expiresAtIso={p.expires_at}
                      createdAtIso={p.created_at}
                      size="sm"
                      className="mt-2"
                    />
                  ) : null}
                  <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
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
                    <p className="text-xs text-zinc-500 line-through dark:text-zinc-500">
                      {formatXAF(Number(p.price_original))}
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
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

function IconEmptyCatalog({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}
