"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminDeleteUser } from "@/app/(admin)/admin/users/actions";

export function AdminUserDeleteButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    if (
      !window.confirm(
        "Supprimer définitivement ce compte (Auth + profil) ? Cette action est irréversible.",
      )
    ) {
      return;
    }
    setError(null);
    start(async () => {
      const r = await adminDeleteUser(userId);
      if (r.error) {
        setError(r.error);
        return;
      }
      router.push("/admin/users");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="w-full rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-500/15 disabled:opacity-50 dark:text-red-200"
      >
        {pending ? "Suppression…" : "Supprimer le compte"}
      </button>
    </div>
  );
}
