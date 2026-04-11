"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminBlockProduct } from "@/app/auth/actions";
import { labelProductStatus } from "@/lib/labels-fr";

const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80";

export type ProductAdminRow = {
  id: string;
  name: string;
  status: string;
  price_promo: number;
  image_url: string | null;
  vendors: { business_name: string } | { business_name: string }[] | null;
};

export function AdminProductsTable({ products }: { products: ProductAdminRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function block(id: string) {
    start(async () => {
      const r = await adminBlockProduct(id);
      if (r.error) alert(r.error);
      router.refresh();
    });
  }

  if (!products.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300/80 py-12 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        Aucun produit.
      </p>
    );
  }

  return (
    <div className="admin-panel overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#12161c]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Photo</th>
              <th className="px-5 py-3.5">Produit</th>
              <th className="px-5 py-3.5">Commerce</th>
              <th className="px-5 py-3.5">Prix promo</th>
              <th className="px-5 py-3.5">Statut</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {products.map((p) => {
              const v = Array.isArray(p.vendors) ? p.vendors[0] : p.vendors;
              return (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                >
                  <td className="w-20 px-5 py-3 align-middle">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                      <Image
                        src={p.image_url?.trim() || IMAGE_PLACEHOLDER}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {p.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {v?.business_name ?? "—"}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {Number(p.price_promo).toLocaleString("fr-FR")} FCFA
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {labelProductStatus(p.status)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {p.status !== "blocked" && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => block(p.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                      >
                        Bloquer
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
