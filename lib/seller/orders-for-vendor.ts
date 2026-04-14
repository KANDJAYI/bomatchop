import type { SupabaseClient } from "@supabase/supabase-js";

export type SellerOrderLine = {
  product_id: string;
  name: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
};

export type SellerOrderView = {
  id: string;
  created_at: string;
  status: string;
  payment_method: string;
  /** Total en base (commande entière — peut inclure d’autres commerces) */
  total_amount: number;
  /** Sous-total des lignes visibles pour ce vendeur */
  vendor_subtotal: number;
  vendor_count: number;
  /** false si order_distinct_vendor_count a échoué — ne pas traiter comme multi-commerces. */
  vendor_count_reliable: boolean;
  customer: {
    full_name: string | null;
    phone: string | null;
    email: string | null;
  };
  /** Adresse / consignes saisies au checkout (livraison à domicile). */
  delivery_address: string | null;
  /** home_delivery ou pickup (retrait au commerce). */
  fulfillment: string;
  lines: SellerOrderLine[];
};

type RawRow = {
  quantity: number;
  unit_price: number;
  orders: {
    id: string;
    created_at: string;
    status: string;
    payment_method: string;
    total_amount: number;
    delivery_address: string | null;
    fulfillment: string;
    profiles: {
      full_name: string | null;
      phone: string | null;
      email: string | null;
    } | null;
  };
  products: {
    id: string;
    name: string;
    image_url: string | null;
    vendor_id: string;
  };
};

export type FetchVendorOrdersResult = {
  orders: SellerOrderView[];
  error: string | null;
};

export async function fetchOrdersForVendor(
  supabase: SupabaseClient,
  vendorId: string,
): Promise<FetchVendorOrdersResult> {
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      quantity,
      unit_price,
      orders!inner (
        id,
        created_at,
        status,
        payment_method,
        total_amount,
        delivery_address,
        fulfillment,
        profiles!orders_customer_id_fkey ( full_name, phone, email )
      ),
      products!inner ( id, name, image_url, vendor_id )
    `,
    )
    .eq("products.vendor_id", vendorId);

  if (error) {
    return { orders: [], error: error.message };
  }
  if (!data?.length) {
    return { orders: [], error: null };
  }

  const byOrder = new Map<string, SellerOrderView>();

  for (const row of data as unknown as RawRow[]) {
    const o = row.orders;
    const p = row.products;
    const line: SellerOrderLine = {
      product_id: p.id,
      name: p.name,
      image_url: p.image_url,
      quantity: row.quantity,
      unit_price: Number(row.unit_price),
    };
    const prof = o.profiles;
    const existing = byOrder.get(o.id);
    if (existing) {
      existing.lines.push(line);
      existing.vendor_subtotal += line.quantity * line.unit_price;
    } else {
      byOrder.set(o.id, {
        id: o.id,
        created_at: o.created_at,
        status: o.status,
        payment_method: o.payment_method,
        total_amount: Number(o.total_amount),
        vendor_subtotal: line.quantity * line.unit_price,
        vendor_count: 1,
        vendor_count_reliable: true,
        customer: {
          full_name: prof?.full_name ?? null,
          phone: prof?.phone ?? null,
          email: prof?.email ?? null,
        },
        delivery_address: o.delivery_address?.trim() || null,
        fulfillment: o.fulfillment ?? "home_delivery",
        lines: [line],
      });
    }
  }

  const orders = [...byOrder.values()];

  const counts = await Promise.all(
    orders.map(async (ord) => {
      const { data: n, error: e } = await supabase.rpc(
        "order_distinct_vendor_count",
        { p_order_id: ord.id },
      );
      if (e || n == null) {
        return { id: ord.id, count: 1, reliable: false as const };
      }
      const c = typeof n === "number" ? n : Number(n);
      const count = Number.isFinite(c) && c > 0 ? c : 1;
      return { id: ord.id, count, reliable: true as const };
    }),
  );
  const countMap = new Map(counts.map((c) => [c.id, c]));
  for (const ord of orders) {
    const hit = countMap.get(ord.id);
    ord.vendor_count = hit?.count ?? 1;
    ord.vendor_count_reliable = hit?.reliable ?? false;
  }

  orders.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { orders, error: null };
}
