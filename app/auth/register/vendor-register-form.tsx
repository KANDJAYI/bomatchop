"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { registerVendorAction } from "@/app/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BusinessType } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="forest" className="w-full" disabled={pending}>
      {pending ? "Création…" : "Créer mon espace commerçant"}
    </Button>
  );
}

function VendorSessionRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const client = createClient();
    if (!client) return;
    let cancelled = false;
    void client.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) router.replace("/auth/vendor");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);
  return null;
}

const BUSINESS_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "supermarket", label: "Supermarché" },
];

export function VendorRegisterForm() {
  const [state, formAction] = useActionState(registerVendorAction, null);

  if (state?.message && !state.error) {
    return (
      <div className="space-y-4 text-center">
        <VendorSessionRedirect />
        <p className="text-sm text-muted">{state.message}</p>
        <div className="space-y-3 pt-2 text-left">
          <p className="text-center text-sm text-muted leading-relaxed">
            Déposez ensuite votre dossier (identité, façade du commerce, portrait) pour
            validation par l’équipe BOMA.
          </p>
          <ButtonLink
            href="/auth/login?next=/auth/vendor"
            variant="primary"
            className="w-full"
          >
            Connexion pour déposer mon dossier
          </ButtonLink>
          <ButtonLink href="/auth/vendor" variant="secondary" className="w-full">
            J’ai déjà une session — dossier vendeur
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <p className="rounded-2xl border border-boma-forest/20 bg-boma-forest/8 px-4 py-3 text-sm text-muted leading-relaxed dark:border-emerald-500/25 dark:bg-boma-forest/20">
        Inscription <strong className="text-foreground">réservée aux commerçants</strong>{" "}
        : identifiants de connexion + informations sur votre activité. Le dossier légal
        et les photos seront demandés à l’étape suivante.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Prénom (représentant)
          <input
            name="first_name"
            type="text"
            required
            autoComplete="given-name"
            className="boma-field rounded-2xl bg-background px-4 py-3"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Nom (représentant)
          <input
            name="last_name"
            type="text"
            required
            autoComplete="family-name"
            className="boma-field rounded-2xl bg-background px-4 py-3"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Nom de l’activité / enseigne
        <input
          name="business_name"
          type="text"
          required
          autoComplete="organization"
          placeholder="Ex. Boulangerie du Centre"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Type d’activité
        <select
          name="business_type"
          required
          className="boma-field rounded-2xl bg-background px-4 py-3"
        >
          {BUSINESS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Localisation
        <input
          name="location"
          type="text"
          required
          autoComplete="address-level2"
          placeholder="Quartier, ville…"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Téléphone professionnel
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        E-mail de connexion
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>

      {state?.error && (
        <p className="text-sm font-medium text-red-500" role="alert">
          {state.error}
        </p>
      )}

      <Submit />

      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link
          href="/auth/login?next=/auth/vendor"
          className="font-semibold text-boma-blue hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
