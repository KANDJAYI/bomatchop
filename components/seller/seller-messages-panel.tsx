"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markVendorMessageReadAction } from "@/app/auth/actions";

export type VendorMessageRow = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export function SellerMessagesPanel({ messages }: { messages: VendorMessageRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function markRead(id: string) {
    start(async () => {
      const r = await markVendorMessageReadAction(id);
      if (!("error" in r && r.error)) router.refresh();
    });
  }

  if (!messages.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-950/40 sm:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
          <IconEnvelope className="h-7 w-7" />
        </div>
        <p className="mt-5 text-base font-semibold text-foreground">Boîte de réception vide</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          L’équipe BOMA peut vous écrire ici. Les messages importants apparaîtront dans cette
          liste.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {messages.map((m) => {
        const unread = !m.read_at;
        return (
          <li
            key={m.id}
            className={`rounded-2xl border p-5 transition-shadow ${
              unread
                ? "border-boma-blue/20 bg-boma-blue/[0.04] shadow-[0_0_28px_-10px_var(--boma-glow-blue)] dark:border-boma-blue/25 dark:bg-boma-blue/[0.08]"
                : "border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900/40"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{m.title}</h3>
                <p className="mt-1 text-xs text-muted">
                  {new Date(m.created_at).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              {unread ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => markRead(m.id)}
                  className="rounded-full bg-boma-blue/10 px-3 py-1 text-xs font-semibold text-boma-blue transition hover:bg-boma-blue/20"
                >
                  Marquer comme lu
                </button>
              ) : (
                <span className="text-xs font-medium text-muted">Lu</span>
              )}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {m.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function IconEnvelope({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
