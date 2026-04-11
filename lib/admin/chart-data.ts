import { createClient } from "@/lib/supabase/server";
import { labelAppRole, labelOrderStatus, labelVendorStatus } from "@/lib/labels-fr";

export type NamedValue = { name: string; value: number };

export type AdminChartsData = {
  ordersByStatus: NamedValue[];
  vendorsByStatus: NamedValue[];
  usersByRole: NamedValue[];
  /** 14 derniers jours, date courte FR */
  ordersPerDay: { day: string; commandes: number; ca: number }[];
};

function countBy(
  rows: { [k: string]: string | null }[],
  key: string,
  labelFn: (s: string) => string,
): NamedValue[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const raw = String(r[key] ?? "").trim();
    const k = raw.length > 0 ? raw : "__empty__";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([k, value]) => ({
    name: k === "__empty__" ? "Autre" : labelFn(k),
    value,
  }));
}

export async function getAdminChartsData(): Promise<AdminChartsData | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const since14 = new Date();
  since14.setDate(since14.getDate() - 14);
  const sinceIso = since14.toISOString();

  const [ordersRes, ordersSeriesRes, vendorsRes, profilesRes] = await Promise.all([
    supabase.from("orders").select("status").limit(8000),
    supabase
      .from("orders")
      .select("created_at, total_amount")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .limit(8000),
    supabase.from("vendors").select("status").limit(8000),
    supabase.from("profiles").select("role").limit(8000),
  ]);

  const orderRows = (ordersRes.data ?? []) as { status: string }[];
  const seriesRows = (ordersSeriesRes.data ?? []) as {
    created_at: string;
    total_amount: number;
  }[];
  const vendorRows = (vendorsRes.data ?? []) as { status: string }[];
  const profileRows = (profilesRes.data ?? []) as { role: string }[];

  const ordersByStatus = countBy(orderRows, "status", labelOrderStatus);

  const dayMap = new Map<string, { commandes: number; ca: number }>();
  for (const row of seriesRows) {
    const iso = new Date(row.created_at).toISOString().slice(0, 10);
    const cur = dayMap.get(iso) ?? { commandes: 0, ca: 0 };
    cur.commandes += 1;
    cur.ca += Number(row.total_amount) || 0;
    dayMap.set(iso, cur);
  }

  const sortedDays = [...dayMap.keys()].sort();
  const ordersPerDay = sortedDays.map((iso) => {
    const v = dayMap.get(iso)!;
    return {
      day: new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      commandes: v.commandes,
      ca: Math.round(v.ca),
    };
  });

  const vendorsByStatus = countBy(vendorRows, "status", labelVendorStatus);
  const usersByRole = countBy(profileRows, "role", labelAppRole);

  return {
    ordersByStatus,
    vendorsByStatus,
    usersByRole,
    ordersPerDay,
  };
}
