"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSellerProfileAction } from "@/app/auth/actions";
import { SellerProfilePhotoForm } from "@/components/seller/seller-profile-photo-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import {
  labelBusinessType,
  labelVendorStatus,
} from "@/lib/labels-fr";
import type { BusinessType } from "@/lib/types";

type Props = {
  email: string;
  fullName: string;
  phone: string;
  vendor: {
    business_name: string;
    business_type: BusinessType;
    status: string;
    first_name: string;
    last_name: string;
    location: string;
    phone: string;
    profile_photo_url?: string | null;
  };
  hasProfilePhoto: boolean;
  profilePhotoColumnMissing: boolean;
};

export function SellerAccountPanel({
  email,
  fullName,
  phone,
  vendor,
  hasProfilePhoto,
  profilePhotoColumnMissing,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      setErr(null);
      const r = await updateSellerProfileAction(fd);
      if (r.error) {
        setErr(r.error);
        showToast(r.error, "error");
        return;
      }
      showToast("Profil enregistré", "success");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2 lg:items-start">
      <section className="boma-panel boma-panel--glow rounded-3xl bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Profil compte</h2>
        <p className="mt-1 text-sm text-muted">
          Nom et téléphone affichés sur vos interactions clients (commandes, support).
        </p>
        <form onSubmit={onProfileSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nom complet
            <input
              name="full_name"
              required
              defaultValue={fullName}
              className="boma-field rounded-2xl bg-background px-4 py-3"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Téléphone
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={phone}
              className="boma-field rounded-2xl bg-background px-4 py-3"
            />
          </label>
          <div>
            <p className="text-xs font-medium text-muted">E-mail (connexion)</p>
            <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
            <p className="mt-1 text-xs text-muted">
              Pour changer l’e-mail, contactez le support BOMA.
            </p>
          </div>
          {err ? (
            <p className="text-sm font-medium text-red-500" role="alert">
              {err}
            </p>
          ) : null}
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer le profil"}
          </Button>
        </form>
      </section>

      <div className="space-y-8">
        <section className="boma-panel rounded-3xl bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight">Fiche commerce</h2>
          <p className="mt-1 text-sm text-muted">
            Informations dossier vendeur — modification via l’administration en cas
            d’erreur.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Raison sociale</dt>
              <dd className="font-medium">{vendor.business_name}</dd>
            </div>
            <div>
              <dt className="text-muted">Type</dt>
              <dd className="font-medium">{labelBusinessType(vendor.business_type)}</dd>
            </div>
            <div>
              <dt className="text-muted">Statut</dt>
              <dd className="font-medium">{labelVendorStatus(vendor.status)}</dd>
            </div>
            <div>
              <dt className="text-muted">Représentant</dt>
              <dd className="font-medium">
                {vendor.first_name} {vendor.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Localisation</dt>
              <dd className="font-medium">{vendor.location}</dd>
            </div>
            <div>
              <dt className="text-muted">Téléphone dossier</dt>
              <dd className="font-medium">{vendor.phone}</dd>
            </div>
          </dl>
        </section>

        {!profilePhotoColumnMissing ? (
          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">
              Photo sur les annonces
            </h2>
            {!hasProfilePhoto ? (
              <SellerProfilePhotoForm mode="required" />
            ) : (
              <SellerProfilePhotoForm
                mode="update"
                currentPhotoUrl={vendor.profile_photo_url}
              />
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            Migration portrait vendeur non appliquée — voir{" "}
            <code className="rounded bg-black/10 px-1">20260410120000_vendor_profile_photo.sql</code>
          </p>
        )}
      </div>
    </div>
  );
}
