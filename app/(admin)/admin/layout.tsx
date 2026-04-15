import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminConsoleShell } from "@/components/admin/admin-console-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Tableau de bord",
    template: "%s · Administration BOMA TCHOP",
  },
  description:
    "Espace d’administration BOMA TCHOP : vendeurs, produits, commandes et clients.",
  robots: { index: false, follow: false },
};

export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/auth/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const horizon = new Date();
  horizon.setUTCDate(horizon.getUTCDate() + 14);

  let subscriptionAlerts: {
    id: string;
    business_name: string;
    subscription_next_due_at: string;
  }[] = [];

  const subRes = await supabase
    .from("vendors")
    .select("id, business_name, subscription_next_due_at")
    .eq("status", "approved")
    .not("subscription_next_due_at", "is", null)
    .lte("subscription_next_due_at", horizon.toISOString())
    .order("subscription_next_due_at", { ascending: true })
    .limit(40);

  if (!subRes.error && subRes.data) {
    subscriptionAlerts = subRes.data as typeof subscriptionAlerts;
  }

  return (
    <AdminConsoleShell
      userEmail={user.email}
      displayName={profile?.full_name ?? null}
      subscriptionAlerts={subscriptionAlerts}
    >
      {children}
    </AdminConsoleShell>
  );
}
