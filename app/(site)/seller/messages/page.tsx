import { redirect } from "next/navigation";
import {
  SellerMessagesPanel,
  type VendorMessageRow,
} from "@/components/seller/seller-messages-panel";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function SellerMessagesPage() {
  if (!isSupabaseConfigured()) redirect("/seller");

  const supabase = await createClient();
  if (!supabase) redirect("/seller");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/seller/messages");

  const { vendor } = await fetchSellerVendorForLayout(supabase, user.id);
  if (!vendor || vendor.status !== "approved") {
    redirect("/seller");
  }

  const { data: rows, error } = await supabase
    .from("vendor_messages")
    .select("id, title, body, read_at, created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const messages: VendorMessageRow[] = error
    ? []
    : ((rows ?? []) as VendorMessageRow[]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Communications officielles de l’équipe BOMA TCHOP (validation, consignes, alertes).
        Conservez-les comme référence pour votre activité.
      </p>
      {error ? (
        <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Impossible de charger les messages. Si la table n’existe pas encore, exécutez la
          migration{" "}
          <code className="rounded bg-black/10 px-1">
            20260411200000_vendor_messages.sql
          </code>{" "}
          sur Supabase.
        </p>
      ) : null}
      <SellerMessagesPanel messages={messages} />
    </div>
  );
}
