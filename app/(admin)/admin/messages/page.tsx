import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Messages",
  description: "Messages reçus via le formulaire Contact.",
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: "new" | "open" | "answered" | "closed";
  created_at: string;
};

function badge(status: ContactMessage["status"]): string {
  switch (status) {
    case "new":
      return "bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-200";
    case "open":
      return "bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200";
    case "answered":
      return "bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200";
    case "closed":
      return "bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-200";
  }
}

function label(status: ContactMessage["status"]): string {
  switch (status) {
    case "new":
      return "Nouveau";
    case "open":
      return "En cours";
    case "answered":
      return "Répondu";
    case "closed":
      return "Clos";
  }
}

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-card">
        Supabase non configuré.
      </div>
    );
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id,name,email,subject,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const messages = (data ?? []) as ContactMessage[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Messages reçus via le formulaire Contact.
          </p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {messages.length} message{messages.length > 1 ? "s" : ""}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-card">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Impossible de charger les messages : {error.message}
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-black/5 dark:bg-card">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Aucun message pour le moment.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-card">
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {messages.map((m) => (
              <Link
                key={m.id}
                href={`/admin/messages/${m.id}`}
                className="block px-5 py-4 transition hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40 dark:hover:bg-white/[0.03]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {m.subject}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
                      {m.name} · {m.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge(
                        m.status,
                      )}`}
                    >
                      {label(m.status)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(m.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

