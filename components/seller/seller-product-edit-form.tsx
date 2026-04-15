"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateProductAction } from "@/app/auth/actions";
import { FileUploadField } from "@/components/file-upload-field";
import {
  RestaurantPublishClosedBanner,
  useRestaurantPublishWindowOpen,
} from "@/components/seller/restaurant-publish-window-client";
import {
  SellerDlcFields,
  SellerRestaurantTimeFields,
} from "@/components/seller/seller-datetime-fields";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { labelProductStatus } from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";
import type { BusinessType } from "@/lib/types";

export type EditableProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_original: number;
  price_promo: number;
  stock: number;
  status: string;
  expires_at: string | null;
  prepared_at: string | null;
  consume_by: string | null;
};

type Props = {
  product: EditableProduct;
  businessType: BusinessType;
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80";

export function SellerProductEditForm({ product, businessType }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [err, setErr] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [pending, start] = useTransition();
  const bt = businessType;
  const [visibility, setVisibility] = useState<"draft" | "active">(
    product.status === "draft" ? "draft" : "active",
  );
  const restaurantPublishOpen = useRestaurantPublishWindowOpen();
  const restaurantActiveBlocked =
    bt === "restaurant" &&
    visibility === "active" &&
    !restaurantPublishOpen;

  useEffect(() => {
    setVisibility(product.status === "draft" ? "draft" : "active");
  }, [product.id, product.status]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("product_id", product.id);

    start(async () => {
      setErr(null);
      const r = await updateProductAction(fd);
      if (r.error) {
        setErr(r.error);
        showToast(r.error, "error");
        return;
      }
      showToast("Offre mise à jour", "success");
      setFormKey((k) => k + 1);
      router.refresh();
    });
  }

  const blocked = product.status === "blocked";

  return (
    <div className="boma-panel boma-panel--glow rounded-3xl bg-card p-6 shadow-sm sm:p-8">
      <div className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Modifier l’offre</h2>
            <p className="mt-1 text-sm text-muted">
              Photo facultative : laissez vide pour conserver l’image actuelle. Le prix promo
              est recalculé selon les règles BOMA TCHOP.
            </p>
          </div>
          <span className="rounded-full bg-boma-forest/15 px-3 py-1 text-xs font-semibold text-boma-forest dark:text-emerald-300">
            {labelProductStatus(product.status)}
          </span>
        </div>
        {blocked ? (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
            Cette offre a été <strong>bloquée</strong> (ex. fin de journée restaurant ou
            modération). Vous pouvez la remettre <strong>active</strong> ci-dessous pour la
            republier si les règles le permettent.
          </p>
        ) : null}
      </div>

      <div className="relative mt-6 aspect-video w-full max-w-md overflow-hidden rounded-2xl bg-foreground/5">
        <Image
          src={product.image_url || PLACEHOLDER}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 28rem"
        />
      </div>

      <form key={formKey} className="mt-6 space-y-5" onSubmit={onSubmit}>
        <input type="hidden" name="product_id" value={product.id} />

        <FileUploadField
          name="image"
          label="Nouvelle photo (optionnel)"
          hint="Laisser vide pour garder l’image actuelle. JPG / PNG, max. 5 Mo."
        />

        <label className="flex flex-col gap-2 text-sm font-medium">
          Nom de l’offre
          <input
            name="name"
            required
            defaultValue={product.name}
            className="boma-field rounded-2xl bg-background px-4 py-3"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description ?? ""}
            className="boma-field rounded-2xl bg-background px-4 py-3"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Prix catalogue (FCFA)
            <input
              name="price_original"
              type="number"
              min={1}
              required
              defaultValue={Number(product.price_original)}
              className="boma-field rounded-2xl bg-background px-4 py-3"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Stock disponible
            <input
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={Number(product.stock)}
              className="boma-field rounded-2xl bg-background px-4 py-3"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Visibilité
          <select
            name="status"
            defaultValue={product.status === "draft" ? "draft" : "active"}
            onChange={(e) =>
              setVisibility(e.target.value === "draft" ? "draft" : "active")
            }
            className="boma-field rounded-2xl bg-background px-4 py-3"
          >
            <option value="active">Actif — visible sur le marché</option>
            <option value="draft">Brouillon — masqué des clients</option>
          </select>
        </label>

        {bt === "restaurant" ? (
          <div>
            <RestaurantPublishClosedBanner />
          </div>
        ) : null}

        {bt === "supermarket" && (
          <SellerDlcFields
            key={`dlc-${formKey}-${product.expires_at ?? ""}`}
            initialExpiresAt={product.expires_at}
          />
        )}

        {bt === "restaurant" && (
          <SellerRestaurantTimeFields
            key={`rt-${formKey}-${product.prepared_at ?? ""}`}
            initialPreparedAt={product.prepared_at}
          />
        )}

        <p className="text-xs text-muted">
          Prix promo actuel (recalculé à l’enregistrement) :{" "}
          <strong className="text-foreground">
            {formatXAF(Number(product.price_promo))}
          </strong>
        </p>

        {err ? (
          <p className="text-sm font-medium text-red-500" role="alert">
            {err}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="forest" disabled={pending || restaurantActiveBlocked}>
            {pending ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
          <ButtonLink href="/seller/products" variant="secondary">
            Annuler
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
