"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";
import type { BusinessType } from "@/lib/types";

export type SellerShellVendor = {
  id: string;
  business_name: string;
  business_type: BusinessType;
  status: string;
} | null;

type Props = {
  children: React.ReactNode;
  vendor: SellerShellVendor;
  userEmail: string;
  unreadMessages: number;
};

const nav = (approved: boolean) =>
  [
    { href: "/seller", label: "Tableau de bord", icon: IconLayout, show: true },
    { href: "/seller/orders", label: "Commandes", icon: IconCart, show: approved },
    { href: "/seller/products", label: "Mes produits", icon: IconBox, show: approved },
    { href: "/seller/products/new", label: "Nouvelle offre", icon: IconPlus, show: approved },
    { href: "/seller/messages", label: "Messages BOMA", icon: IconMail, show: approved },
    { href: "/seller/account", label: "Mon compte", icon: IconUser, show: approved },
  ].filter((i) => i.show);

function titleForPath(pathname: string): string {
  if (pathname === "/seller") return "Tableau de bord";
  if (pathname === "/seller/products/new") return "Nouvelle offre";
  if (pathname.startsWith("/seller/products/") && pathname.endsWith("/edit")) {
    return "Modifier l’offre";
  }
  if (pathname === "/seller/products") return "Mes produits";
  if (pathname === "/seller/orders") return "Commandes";
  if (pathname === "/seller/messages") return "Messages";
  if (pathname === "/seller/account") return "Mon compte";
  return "Espace vendeur";
}

export function SellerProShell({
  children,
  vendor,
  userEmail,
  unreadMessages,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const approved = vendor?.status === "approved";
  const items = nav(approved);

  // Viewport − header site (4rem) : boîte à hauteur fixe pour que <main> puisse défiler en overflow-y-auto.
  const shellH = "h-[calc(100dvh-4rem)] min-h-[calc(100dvh-4rem)]";

  return (
    <div
      data-seller-pro
      className={`seller-pro isolate flex w-full shrink-0 ${shellH} bg-[color-mix(in_srgb,var(--background)_96%,var(--boma-forest)_4%)] text-foreground dark:bg-[#070a0c]`}
    >
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed bottom-0 left-0 top-[4rem] z-50 flex w-[min(100%-2.5rem,17rem)] flex-col overflow-hidden bg-card shadow-2xl transition-transform duration-300 ease-out lg:static lg:top-0 lg:z-0 lg:h-full lg:min-h-0 lg:w-64 lg:shrink-0 lg:self-stretch lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-[4.5rem] shrink-0 items-center gap-3 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-boma-blue to-boma-forest text-sm font-bold text-white shadow-lg shadow-boma-blue/25">
            B
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">BOMA Pro</p>
            <p className="truncate text-[11px] text-muted">
              {vendor?.business_name ?? "Espace commerçant"}
            </p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3">
          {items.map((item) => {
            const active =
              item.href === "/seller"
                ? pathname === "/seller"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const showBadge =
              item.href === "/seller/messages" && unreadMessages > 0 && approved;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-boma-blue/12 text-boma-blue"
                    : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
                <span className="flex-1">{item.label}</span>
                {showBadge ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-boma-blue px-1.5 text-[10px] font-bold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-1 p-3">
          <Link
            href="/marketplace"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-muted transition hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <IconExternal className="h-[18px] w-[18px]" />
            Voir le marché public
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-muted transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              <IconLogout className="h-[18px] w-[18px]" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 bg-background/90 px-4 backdrop-blur-md lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {titleForPath(pathname)}
            </h1>
          </div>
          <p className="hidden max-w-[14rem] truncate text-xs text-muted sm:block">
            {userEmail}
          </p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function IconLayout({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function IconBox({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function IconExternal({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
