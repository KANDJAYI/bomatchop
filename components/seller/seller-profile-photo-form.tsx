"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateVendorProfilePhotoAction } from "@/app/auth/actions";
import { FileUploadField } from "@/components/file-upload-field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";

type Props = {
  mode: "required" | "update";
  currentPhotoUrl?: string | null;
};

export function SellerProfilePhotoForm({ mode, currentPhotoUrl }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [err, setErr] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [pending, start] = useTransition();

  const required = mode === "required";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const input = form.querySelector<HTMLInputElement>(
      'input[name="profile_photo"]',
    );
    const file = input?.files?.[0];
    if (!file?.size) {
      setErr("Choisissez une image.");
      showToast("Photo obligatoire.", "error");
      return;
    }

    start(async () => {
      setErr(null);
      const r = await updateVendorProfilePhotoAction(fd);
      if (r.error) {
        setErr(r.error);
        showToast(r.error, "error");
        return;
      }
      showToast(
        required ? "Photo enregistrée — vous pouvez publier vos offres." : "Photo mise à jour.",
        "success",
      );
      form.reset();
      setFormKey((k) => k + 1);
      router.refresh();
    });
  }

  return (
    <div
      className={
        required
          ? "boma-panel boma-panel--glow rounded-3xl bg-card p-6 sm:p-8"
          : "boma-panel rounded-3xl bg-card/80 p-5"
      }
    >
      {required ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-boma-blue">
            Étape obligatoire
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            Photo de profil commerçant
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Pour que les clients vous reconnaissent sur chaque annonce, ajoutez un portrait
            clair (visage visible). Sans cette photo, vous ne pouvez pas publier de produits
            sur le marché.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-base font-semibold tracking-tight">
            Photo affichée sur vos annonces
          </h2>
          <p className="mt-1 text-sm text-muted">
            Vous pouvez la remplacer à tout moment.
          </p>
        </>
      )}

      {currentPhotoUrl && !required ? (
        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-foreground/5">
            <Image
              src={currentPhotoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        </div>
      ) : null}

      <form key={formKey} onSubmit={onSubmit} className="mt-5 space-y-4">
        <FileUploadField
          name="profile_photo"
          label={required ? "Votre portrait" : "Nouvelle photo"}
          hint="JPG ou PNG, max. 5 Mo — évitez les photos de groupe ou floues."
        />
        {err ? (
          <p className="text-sm font-medium text-red-500" role="alert">
            {err}
          </p>
        ) : null}
        <Button type="submit" variant={required ? "primary" : "secondary"} disabled={pending}>
          {pending ? "Enregistrement…" : required ? "Enregistrer et continuer" : "Mettre à jour"}
        </Button>
      </form>
    </div>
  );
}
