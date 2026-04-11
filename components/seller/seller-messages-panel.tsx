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
      <div className="boma-panel rounded-3xl bg-card/60 p-12 text-center">
        <p className="text-sm font-medium text-foreground">Aucun message pour l’instant</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          L’équipe BOMA peut vous écrire ici (validation, consignes, alertes). Vous serez
          notifié dès qu’un message arrive.
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
            className={`boma-panel rounded-2xl p-5 transition-all ${
              unread
                ? "bg-boma-blue/[0.06] shadow-[0_0_24px_-8px_var(--boma-glow-blue)]"
                : ""
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
