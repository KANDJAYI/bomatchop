"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminUpdateUserFromForm } from "@/app/(admin)/admin/users/actions";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "client" | "vendor" | "admin";
};

export function AdminUserEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await adminUpdateUserFromForm(fd);
      if (r && "error" in r && r.error) {
        setError(r.error);
        return;
      }
      setOk(true);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-card dark:ring-white/10"
    >
      <input type="hidden" name="id" value={profile.id} />
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        Modifier
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {ok ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
          Modifications enregistrées.
        </p>
      ) : null}
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        Nom affiché
      </label>
      <input
        name="full_name"
        defaultValue={profile.full_name ?? ""}
        className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        required
        minLength={2}
      />
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        Téléphone
      </label>
      <input
        name="phone"
        defaultValue={profile.phone ?? ""}
        className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
      />
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        Rôle
      </label>
      <select
        name="role"
        defaultValue={profile.role}
        className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
      >
        <option value="client">Client</option>
        <option value="vendor">Vendeur</option>
        <option value="admin">Administrateur</option>
      </select>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Changer le rôle ne crée pas un dossier vendeur : utilisez le parcours vendeur si besoin.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
