import { createClient } from "@/lib/supabase/server";

export type AdminDashboardStats = {
  pendingVendors: number;
  approvedVendors: number;
  activeProducts: number;
  blockedProducts: number;
  totalOrders: number;
  ordersLast7Days: number;
  clientProfiles: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const [
    pendingV,
    approvedV,
    activeP,
    blockedP,
    ordersAll,
    orders7,
    clients,
  ] = await Promise.all([
    supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "blocked"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sinceIso),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client"),
  ]);

  return {
    pendingVendors: pendingV.count ?? 0,
    approvedVendors: approvedV.count ?? 0,
    activeProducts: activeP.count ?? 0,
    blockedProducts: blockedP.count ?? 0,
    totalOrders: ordersAll.count ?? 0,
    ordersLast7Days: orders7.count ?? 0,
    clientProfiles: clients.count ?? 0,
  };
}
