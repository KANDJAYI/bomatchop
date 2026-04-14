"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateVendorWhatsAppAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { toWhatsAppDigits } from "@/lib/whatsapp";

type Props = {
  initialValue: string | null;
  /** Colonne SQL absente : afficher l’aide migration. */
  columnMissing?: boolean;
};

export function SellerVendorWhatsAppForm({
  initialValue,
  columnMissing = false,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [value, setValue] = useState(initialValue ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (columnMissing) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
        Colonne <code className="rounded bg-black/10 px-1">whatsapp_phone</code> absente :
        appliquez la migration{" "}
        <code className="rounded bg-black/10 px-1">
          supabase/migrations/20260416200000_vendors_whatsapp_phone.sql
        </code>{" "}
        sur Supabase.
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length > 0 && !toWhatsAppDigits(trimmed)) {
      const msg =
        "Numéro invalide : utilisez l’indicatif pays (ex. 241… pour le Gabon), 8 à 15 chiffres au total.";
      setErr(msg);
      showToast(msg, "error");
      return;
    }

    start(async () => {
      setErr(null);
      const fd = new FormData();
      fd.set("whatsapp_phone", trimmed);
      const r = await updateVendorWhatsAppAction(fd);
      if (r.error) {
        setErr(r.error);
        showToast(r.error, "error");
        return;
      }
      showToast(
        trimmed ? "Numéro WhatsApp enregistré." : "Numéro WhatsApp effacé.",
        "success",
      );
      router.refresh();
    });
  }

  return (
    <div className="boma-panel rounded-3xl bg-card/80 p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight">WhatsApp (retrait sur place)</h2>
      <p className="mt-1 text-sm text-muted leading-relaxed">
        Ce numéro sert au bouton <strong className="text-foreground">WhatsApp</strong> du
        checkout lorsque le client choisit le <strong className="text-foreground">retrait sur place</strong>. S’il est vide, le numéro principal du dossier vendeur est utilisé s’il est renseigné.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Numéro WhatsApp
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex. +241 77 12 34 56"
            className="boma-field rounded-2xl bg-background px-4 py-3"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        {err ? (
          <p className="text-sm font-medium text-red-500" role="alert">
            {err}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {initialValue?.trim() ? (
            <Button
              type="button"
              variant="ghost"
              className="text-muted"
              disabled={pending}
              onClick={() => {
                setValue("");
                setErr(null);
              }}
            >
              Effacer le champ
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
