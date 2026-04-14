"use client";

import { useEffect, useState } from "react";
import { applyVendorApplication } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { FileUploadField } from "@/components/file-upload-field";
import { createClient } from "@/lib/supabase/client";
import type { BusinessType } from "@/lib/types";

function normalizeBusinessType(raw: string | undefined): BusinessType {
  if (raw === "restaurant" || raw === "supermarket") {
    return raw;
  }
  if (raw === "boutique") {
    return "supermarket";
  }
  return "supermarket";
}

export function VendorApplicationForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<Record<string, string> | null>(null);
  const [metaReady, setMetaReady] = useState(false);

  useEffect(() => {
    const s = createClient();
    if (!s) {
      setMetaReady(true);
      return;
    }
    void s.auth.getUser().then(({ data }) => {
      const m = data.user?.user_metadata;
      if (m && typeof m === "object") {
        setMeta(
          Object.fromEntries(
            Object.entries(m).map(([k, v]) => [k, v == null ? "" : String(v)]),
          ),
        );
      }
      setMetaReady(true);
    });
  }, []);

  if (!metaReady) {
    return (
      <div className="animate-pulse space-y-4 py-4">
        <div className="h-10 rounded-2xl bg-foreground/10" />
        <div className="h-10 rounded-2xl bg-foreground/10" />
        <div className="h-24 rounded-2xl bg-foreground/10" />
      </div>
    );
  }

  const defaultBusiness = normalizeBusinessType(meta?.business_type);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* Capturer le <form> et FormData avant tout await : sinon React remet currentTarget à null. */
    const form = e.currentTarget;
    const fd = new FormData(form);
    const idInput = form.querySelector<HTMLInputElement>('input[name="id_file"]');
    const storeInput = form.querySelector<HTMLInputElement>('input[name="store_file"]');
    const profileInput = form.querySelector<HTMLInputElement>(
      'input[name="profile_file"]',
    );
    const idFile = idInput?.files?.[0];
    const storeFile = storeInput?.files?.[0];
    const profileFile = profileInput?.files?.[0];
    if (!idFile?.size || !storeFile?.size || !profileFile?.size) {
      setError(
        "Joignez la pièce d’identité, la photo de votre commerce et votre photo de profil (portrait).",
      );
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase non configuré.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expirée. Reconnectez-vous.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const idPath = `${user.id}/piece-identite`;
    const storePath = `${user.id}/devanture`;
    const profileExt =
      profileFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(profileExt)
      ? profileExt === "jpg"
        ? "jpeg"
        : profileExt
      : "jpeg";
    const profilePath = `${user.id}/${crypto.randomUUID()}.${safeExt}`;

    const { error: up1 } = await supabase.storage
      .from("vendor-documents")
      .upload(idPath, idFile, { upsert: true });
    if (up1) {
      setError(up1.message);
      setLoading(false);
      return;
    }
    const { error: up2 } = await supabase.storage
      .from("vendor-documents")
      .upload(storePath, storeFile, { upsert: true });
    if (up2) {
      setError(up2.message);
      setLoading(false);
      return;
    }

    if (!profileFile.type.startsWith("image/")) {
      setError("La photo de profil doit être une image (JPG, PNG, WebP…).");
      setLoading(false);
      return;
    }
    const { error: upProfile } = await supabase.storage
      .from("product-images")
      .upload(profilePath, profileFile, {
        contentType: profileFile.type || "image/jpeg",
        upsert: false,
      });
    if (upProfile) {
      setError(upProfile.message);
      setLoading(false);
      return;
    }
    const { data: profilePublic } = supabase.storage
      .from("product-images")
      .getPublicUrl(profilePath);

    const r = await applyVendorApplication({
      firstName: String(fd.get("first_name") ?? ""),
      lastName: String(fd.get("last_name") ?? ""),
      businessName: String(fd.get("business_name") ?? ""),
      businessType: String(fd.get("business_type") ?? "supermarket") as BusinessType,
      location: String(fd.get("location") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      idDocumentPath: idPath,
      storefrontPhotoPath: storePath,
      profilePhotoPublicUrl: profilePublic.publicUrl,
    });

    setLoading(false);
    if ("error" in r && r.error) setError(r.error);
    else setMessage("Demande envoyée. Statut : en attente de validation admin.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
      key={meta ? `prefill-${meta.email ?? "u"}` : "no-prefill"}
    >
      {meta &&
        (meta.first_name || meta.business_name) && (
          <p className="rounded-2xl border border-boma-blue/25 bg-boma-blue/8 px-4 py-3 text-sm text-muted">
            Certaines informations ont été reprises de votre inscription. Vérifiez-les
            avant d’envoyer votre dossier.
          </p>
        )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Prénom
          <input
            name="first_name"
            required
            defaultValue={meta?.first_name ?? ""}
            className="boma-field rounded-2xl bg-background px-4 py-3"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Nom
          <input
            name="last_name"
            required
            defaultValue={meta?.last_name ?? ""}
            className="boma-field rounded-2xl bg-background px-4 py-3"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Nom de l’activité
        <input
          name="business_name"
          required
          defaultValue={meta?.business_name ?? ""}
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Type
        <select
          name="business_type"
          required
          defaultValue={defaultBusiness}
          className="boma-field rounded-2xl bg-background px-4 py-3"
        >
          <option value="restaurant">Restaurant</option>
          <option value="supermarket">Supermarché</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Localisation
        <input
          name="location"
          required
          placeholder="Quartier, ville…"
          defaultValue={meta?.location ?? ""}
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Téléphone
        <input
          name="phone"
          required
          inputMode="tel"
          defaultValue={meta?.phone ?? ""}
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      <FileUploadField
        name="id_file"
        label="Pièce d’identité"
        hint="Recto lisible (CNI, passeport…). Ce document reste confidentiel."
      />
      <FileUploadField
        name="store_file"
        label="Photo de votre commerce"
        hint="Façade, comptoir ou lieu de retrait — aide l’équipe à valider votre activité."
      />
      <FileUploadField
        name="profile_file"
        label="Photo de profil commerçant (obligatoire)"
        hint="Portrait net, visage visible : elle apparaîtra sur vos annonces pour que les clients vous reconnaissent."
      />
      {error && (
        <p className="text-sm font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
          {message}
        </p>
      )}
      <Button type="submit" variant="forest" className="w-full" disabled={loading}>
        {loading ? "Envoi…" : "Soumettre la demande"}
      </Button>
    </form>
  );
}
