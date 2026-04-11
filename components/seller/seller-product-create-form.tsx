"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProductAction } from "@/app/auth/actions";
import { FileUploadField } from "@/components/file-upload-field";
import {
  SellerDlcFields,
  SellerRestaurantTimeFields,
} from "@/components/seller/seller-datetime-fields";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import type { BusinessType } from "@/lib/types";

type Props = {
  businessType: BusinessType;
  /** Sans photo de profil commerçant, la publication est bloquée. */
  disabled?: boolean;
};

export function SellerProductCreateForm({
  businessType,
  disabled = false,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [err, setErr] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [pending, start] = useTransition();
  const bt = businessType;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const imageInput = form.querySelector<HTMLInputElement>('input[name="image"]');
    const file = imageInput?.files?.[0];
    if (!file?.size) {
      setErr("Ajoutez une photo du produit.");
      showToast("Photo obligatoire pour publier.", "error");
      return;
    }

    start(async () => {
      setErr(null);
      const r = await createProductAction(fd);
      if (r.error) {
        setErr(r.error);
        showToast(r.error, "error");
        return;
      }
      showToast("Offre publiée sur le marché", "success");
      form.reset();
      setFormKey((k) => k + 1);
      router.refresh();
    });
  }

  return (
    <div className="boma-panel boma-panel--glow rounded-3xl bg-card p-6 shadow-sm sm:p-8">
      <div className="pb-4">
        <h2 className="text-lg font-semibold tracking-tight">Nouvelle offre</h2>
        <p className="mt-1 text-sm text-muted">
          Photo obligatoire — la réduction est calculée automatiquement selon la date
          d’expiration ou de consommation.
        </p>
        {disabled ? (
          <p className="mt-3 rounded-xl border border-boma-blue/20 bg-boma-blue/5 px-3 py-2 text-sm text-muted">
            Enregistrez d’abord votre photo de profil commerçant (bloc ci-dessus) pour activer
            la publication.
          </p>
        ) : null}
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <fieldset
          disabled={disabled}
          className="min-w-0 space-y-5 border-0 p-0 disabled:pointer-events-none disabled:opacity-50"
        >
        <FileUploadField
          key={formKey}
          name="image"
          label="Photo du produit"
          hint="Image affichée sur le marché — produit net, bon cadrage (max. 5 Mo)."
          required
        />

        <label className="flex flex-col gap-2 text-sm font-medium">
          Nom de l’offre
          <input
            name="name"
            required
            placeholder="Ex. Panier fruits & légumes"
            className="boma-field rounded-2xl bg-background px-4 py-3"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Description
          <textarea
            name="description"
            rows={3}
            placeholder="Ingrédients, quantité, conditions de retrait…"
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
              className="boma-field rounded-2xl bg-background px-4 py-3"
            />
            <span className="text-xs font-normal text-muted">
              Base avant réduction BOMA
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Stock disponible
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={1}
              required
              className="boma-field rounded-2xl bg-background px-4 py-3"
            />
          </label>
        </div>

        {(bt === "supermarket" || bt === "boutique") && (
          <SellerDlcFields key={formKey} />
        )}

        {bt === "restaurant" && <SellerRestaurantTimeFields key={formKey} />}

        {err ? (
          <p className="text-sm font-medium text-red-500" role="alert">
            {err}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="forest"
          className="w-full"
          disabled={pending || disabled}
        >
          {pending ? "Publication en cours…" : "Publier sur le marché"}
        </Button>
        </fieldset>
      </form>
    </div>
  );
}
