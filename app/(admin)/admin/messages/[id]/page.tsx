import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { adminUpdateContactMessage } from "../actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Message",
  description: "Détail d’un message de contact.",
};

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "open" | "answered" | "closed";
  admin_reply: string | null;
  created_at: string;
  replied_at: string | null;
};

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return notFound();

  const { data } = await supabase
    .from("contact_messages")
    .select(
      "id,name,email,phone,subject,message,status,admin_reply,created_at,replied_at",
    )
    .eq("id", id)
    .maybeSingle();

  const m = data as Row | null;
  if (!m) return notFound();

  async function action(formData: FormData) {
    "use server";
    const status = String(formData.get("status") ?? "");
    const adminReply = String(formData.get("adminReply") ?? "");
    await adminUpdateContactMessage({
      id,
      status: status as any,
      adminReply,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Message contact
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {m.subject}
          </h1>
        </div>
        <Link
          href="/admin/messages"
          className="rounded-xl bg-black/5 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
        >
          ← Tous les messages
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-card dark:ring-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Détails
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nom
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-50">
                  {m.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 text-sm">
                  <a
                    href={`mailto:${m.email}`}
                    className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    {m.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Téléphone
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-50">
                  {m.phone ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Reçu
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-50">
                  {new Date(m.created_at).toLocaleString("fr-FR")}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Message
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-slate-50">
                {m.message}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <form
            action={action}
            className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-card dark:ring-white/10"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Gestion
            </p>
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Statut
              </label>
              <select
                name="status"
                defaultValue={m.status}
                className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none ring-0 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10"
              >
                <option value="new">Nouveau</option>
                <option value="open">En cours</option>
                <option value="answered">Répondu</option>
                <option value="closed">Clos</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Réponse admin (interne pour l’instant)
              </label>
              <textarea
                name="adminReply"
                defaultValue={m.admin_reply ?? ""}
                className="mt-2 min-h-[140px] w-full resize-y rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10"
                placeholder="Rédigez une réponse…"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {m.replied_at
                  ? `Dernière réponse enregistrée le ${new Date(m.replied_at).toLocaleString("fr-FR")}.`
                  : "Aucune réponse enregistrée."}
              </p>
            </div>

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition hover:shadow-blue-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40"
            >
              Enregistrer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

