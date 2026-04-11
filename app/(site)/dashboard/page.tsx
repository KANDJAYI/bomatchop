import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { labelAppRole, labelOrderStatus } from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";
import type { OrderSummary } from "@/lib/types";

const MOCK_ORDERS: OrderSummary[] = [
  {
    id: "BO-2401",
    date: "2026-04-02",
    total: 12_400,
    itemCount: 3,
    status: "completed",
  },
  {
    id: "BO-2398",
    date: "2026-03-28",
    total: 8_900,
    itemCount: 1,
    status: "preparing",
  },
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardBody
        name="Utilisateur démo"
        email="—"
        orders={MOCK_ORDERS}
        demo
      />
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return (
      <DashboardBody
        name="—"
        email="—"
        orders={[]}
        demo
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: orderRows } = await supabase
    .from("orders")
    .select("id, created_at, total_amount, status, order_items ( id )")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const orders: OrderSummary[] = (orderRows ?? []).map((o) => {
    const items = o.order_items as { id: string }[] | null;
    return {
      id: String(o.id),
      date: o.created_at as string,
      total: Number(o.total_amount),
      itemCount: Array.isArray(items) ? items.length : 0,
      status: String(o.status ?? "pending"),
    };
  });

  return (
    <DashboardBody
      name={profile?.full_name ?? user.email ?? "—"}
      email={profile?.email ?? user.email ?? "—"}
      orders={orders}
      role={profile?.role}
      demo={false}
    />
  );
}

function DashboardBody({
  name,
  email,
  orders,
  role,
  demo,
}: {
  name: string;
  email: string;
  orders: OrderSummary[];
  role?: string;
  demo?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Mon compte</h1>
      <p className="mt-1 text-muted">
        Profil, rôle et historique des commandes Supabase.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="boma-panel boma-panel--glow rounded-3xl bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold">Profil</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Nom</dt>
              <dd className="font-medium">{name}</dd>
            </div>
            <div>
              <dt className="text-muted">E-mail</dt>
              <dd className="font-medium">{email}</dd>
            </div>
            {role && (
              <div>
                <dt className="text-muted">Rôle</dt>
                <dd className="font-medium">{labelAppRole(role)}</dd>
              </div>
            )}
          </dl>
          <ButtonLink href="/marketplace" variant="secondary" className="mt-6 w-full">
            Continuer mes achats
          </ButtonLink>
          {role === "admin" && (
            <ButtonLink href="/admin" variant="primary" className="mt-3 w-full">
              Console admin
            </ButtonLink>
          )}
        </section>
        <section className="boma-panel boma-panel--glow rounded-3xl bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold">Historique des commandes</h2>
          {orders.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Aucune commande pour l’instant.</p>
          ) : (
            <ul className="mt-6 divide-y divide-card-border">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-4 first:pt-0"
                >
                  <div>
                    <p className="font-semibold">
                      {o.id.length > 12 ? `${o.id.slice(0, 8)}…` : o.id}
                    </p>
                    <p className="text-sm text-muted">
                      {new Date(o.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="mb-1 inline-block rounded-full bg-boma-blue/10 px-2.5 py-0.5 text-[11px] font-semibold text-boma-blue">
                      {labelOrderStatus(o.status)}
                    </span>
                    <p className="font-bold text-boma-blue">{formatXAF(o.total)}</p>
                    <p className="text-xs text-muted">
                      {o.itemCount} article{o.itemCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {demo && (
            <p className="mt-4 text-sm text-muted">
              Données fictives sans Supabase.{" "}
              <Link href="/marketplace" className="text-boma-blue hover:underline">
                Voir les offres
              </Link>
              .
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
