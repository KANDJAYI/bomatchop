"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction } from "@/app/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? "Création…" : "Créer mon compte"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, null);

  if (state?.message && !state.error) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted">{state.message}</p>
        <ButtonLink href="/auth/login" variant="secondary" className="w-full">
          Aller à la connexion
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Nom affiché
        <input
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        E-mail
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
        <Link href="/auth/login" className="font-semibold text-boma-blue hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
