"use client";

import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";

const titles: { prefix: string; title: string }[] = [
  { prefix: "/admin/vendors", title: "Vendeurs" },
  { prefix: "/admin/products", title: "Produits" },
  { prefix: "/admin/orders", title: "Commandes" },
  { prefix: "/admin/clients", title: "Clients" },
];

function titleForPath(pathname: string) {
  const hit = titles.find((t) => pathname.startsWith(t.prefix));
  if (hit) return hit.title;
  return "Tableau de bord";
}

type AdminTopbarProps = {
  onOpenSidebar: () => void;
  userEmail: string;
  displayName: string | null;
};

export function AdminTopbar({
  onOpenSidebar,
  userEmail,
  displayName,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const title = titleForPath(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/90 bg-white/85 px-4 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a0d12]/90 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 text-slate-600 transition hover:bg-slate-50 lg:hidden dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          aria-label="Ouvrir le menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
            Espace réservé — actions sensibles journalisées côté Supabase
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {displayName || "Administrateur"}
          </p>
          <p className="max-w-[200px] truncate text-xs text-slate-500 dark:text-slate-400">
            {userEmail}
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-xl border border-slate-200/90 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  );
}
