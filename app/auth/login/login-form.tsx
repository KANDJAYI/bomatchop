"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? "Connexion…" : label}
    </Button>
  );
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />
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
          autoComplete="current-password"
          className="boma-field rounded-2xl bg-background px-4 py-3"
        />
      </label>
      {state?.error && (
        <p className="text-sm font-medium text-red-500" role="alert">
          {state.error}
        </p>
      )}
      <Submit label="Se connecter" />
      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/auth/register" className="font-semibold text-boma-blue hover:underline">
          S’inscrire
        </Link>
      </p>
    </form>
  );
}
