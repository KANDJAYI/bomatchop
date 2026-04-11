"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminSendVendorMessageAction } from "@/app/auth/actions";

export function AdminVendorMessageForm({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("vendor_id", vendorId);
    start(async () => {
      setErr(null);
      setMsg(null);
      const r = await adminSendVendorMessageAction(fd);
      if ("error" in r && r.error) {
        setErr(r.error);
        return;
      }
      setMsg("Message envoyé — visible dans l’espace vendeur.");
      form.reset();
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Message à l’espace vendeur
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Le commerçant le lit dans{" "}
        <span className="font-medium text-slate-800 dark:text-slate-200">BOMA Pro → Messages</span>.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Objet
          <input
            name="title"
            placeholder="Ex. Consigne importante"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0e1218]"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Message
          <textarea
            name="body"
            required
            rows={4}
            placeholder="Votre texte…"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0e1218]"
          />
        </label>
        {err ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{err}</p>
        ) : null}
        {msg ? (
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{msg}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Envoyer au vendeur"}
        </button>
      </form>
    </div>
  );
}
