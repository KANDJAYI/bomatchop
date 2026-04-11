import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminConsoleShell } from "@/components/admin/admin-console-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Tableau de bord",
    template: "%s · Administration BOMA",
  },
  description:
    "Espace d’administration BOMA : vendeurs, produits, commandes et clients.",
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

  return (
    <AdminConsoleShell
      userEmail={user.email}
      displayName={profile?.full_name ?? null}
    >
      {children}
    </AdminConsoleShell>
  );
}
