"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAdminAccountAction } from "@/app/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending || disabled}>
      {pending ? "Création…" : "Créer le compte administrateur"}
    </Button>
  );
}

export function CreateAdminForm({ secretConfigured }: { secretConfigured: boolean }) {
  const [state, formAction] = useActionState(createAdminAccountAction, null);

  if (state?.message && !state.error) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted">{state.message}</p>
        <ButtonLink href="/auth/login" variant="secondary" className="w-full">
          Aller à la connexion
        </ButtonLink>
        <p className="text-xs text-muted">
          Retirez <code className="rounded bg-black/10 px-1">CREATE_ADMIN_SECRET</code> ou
          changez-le après usage, et ne laissez pas cette URL publique en production.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Clé de configuration
        <input
          name="setup_secret"
          type="password"
          required
          autoComplete="off"
          disabled={!secretConfigured}
          placeholder="La même valeur que CREATE_ADMIN_SECRET dans .env.local"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
        <span className="text-xs font-normal text-muted">
          Ne confondez pas avec la clé service role : c’est un secret que vous choisissez dans
          .env.local (<code className="rounded bg-black/10 px-1">CREATE_ADMIN_SECRET=…</code>
          ).
        </span>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Nom affiché
        <input
          name="full_name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          disabled={!secretConfigured}
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        E-mail (connexion)
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={!secretConfigured}
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={!secretConfigured}
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      {state?.error && (
        <p className="text-sm font-medium text-red-500" role="alert">
          {state.error}
        </p>
      )}
      <Submit disabled={!secretConfigured} />
      <p className="text-center text-xs text-muted">
        <Link href="/" className="text-[#007bff] hover:underline">
          Retour à l’accueil
        </Link>
      </p>
    </form>
  );
}
