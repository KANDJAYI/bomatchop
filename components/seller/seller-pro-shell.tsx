"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { IconMoon, IconSun } from "@/components/icons";
import { useTheme } from "@/context/theme-context";
import { labelVendorStatus } from "@/lib/labels-fr";
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

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = { title: string; items: NavItem[] };

function buildNavSections(approved: boolean): NavSection[] {
  const dashboard: NavItem = {
    href: "/seller",
    label: "Tableau de bord",
    icon: IconLayout,
  };
  const orders: NavItem = {
    href: "/seller/orders",
    label: "Commandes",
    icon: IconCart,
  };
  const products: NavItem = {
    href: "/seller/products",
    label: "Mes produits",
    icon: IconBox,
  };
  const newOffer: NavItem = {
    href: "/seller/products/new",
    label: "Nouvelle offre",
    icon: IconPlus,
  };
  const messages: NavItem = {
    href: "/seller/messages",
    label: "Messages BOMA",
    icon: IconMail,
  };
  const account: NavItem = {
    href: "/seller/account",
    label: "Mon compte",
    icon: IconUser,
  };

  const sections: NavSection[] = [
    { title: "Vue d’ensemble", items: [dashboard] },
    ...(approved
      ? [
          {
            title: "Ventes & catalogue",
            items: [orders, products, newOffer],
          } as NavSection,
          { title: "Plateforme", items: [messages] } as NavSection,
        ]
      : []),
    { title: "Compte", items: [account] },
  ];
  return sections.filter((s) => s.items.length > 0);
}

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

function userInitials(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "?";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

function VendorStatusChip({ vendor }: { vendor: SellerShellVendor }) {
  if (!vendor) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-800/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        Aucun dossier
      </span>
    );
  }
  if (vendor.status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
        Compte actif
      </span>
    );
  }
  if (vendor.status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        En validation
      </span>
    );
  }
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-zinc-600/80 bg-zinc-800/80 px-2.5 py-1 text-[10px] font-semibold text-zinc-300">
      {labelVendorStatus(vendor.status)}
    </span>
  );
}

export function SellerProShell({
  children,
  vendor,
  userEmail,
  unreadMessages,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const approved = vendor?.status === "approved";
  const sections = useMemo(() => buildNavSections(approved), [approved]);
  const pageTitle = titleForPath(pathname);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function closePointer(e: MouseEvent) {
      if (
        accountMenuRef.current &&
        e.target instanceof Node &&
        !accountMenuRef.current.contains(e.target)
      ) {
        setAccountMenuOpen(false);
      }
    }
    function closeKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAccountMenuOpen(false);
    }
    document.addEventListener("mousedown", closePointer);
    document.addEventListener("keydown", closeKey);
    return () => {
      document.removeEventListener("mousedown", closePointer);
      document.removeEventListener("keydown", closeKey);
    };
  }, [accountMenuOpen]);

  return (
    <div
      data-seller-pro
      className="seller-pro isolate flex h-full min-h-0 w-full min-w-0 flex-1 flex-row items-stretch overflow-hidden bg-zinc-950 text-foreground"
    >
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(100%-2.5rem,18rem)] min-h-0 flex-col overflow-hidden border-r border-zinc-800/90 bg-zinc-950 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out lg:static lg:z-0 lg:h-full lg:max-h-full lg:w-[17.5rem] lg:shrink-0 lg:self-stretch lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-800/90 px-4 pb-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-boma-blue via-boma-blue to-teal-700 text-sm font-bold tracking-tight text-white shadow-lg shadow-boma-blue/20">
              B
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Console vendeur
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white">
                {vendor?.business_name ?? "BOMA Pro"}
              </p>
            </div>
          </div>
          <VendorStatusChip vendor={vendor} />
        </div>

        <nav
          className="min-h-0 flex-1 basis-0 space-y-5 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-5 [scrollbar-gutter:stable]"
          aria-label="Navigation espace vendeur"
        >
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/seller"
                      ? pathname === "/seller"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const showBadge =
                    item.href === "/seller/messages" && unreadMessages > 0 && approved;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                            : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            active
                              ? "bg-boma-blue/20 text-boma-blue"
                              : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="h-[17px] w-[17px]" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {showBadge ? (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-boma-blue px-1.5 text-[10px] font-bold text-white">
                            {unreadMessages > 9 ? "9+" : unreadMessages}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-zinc-800/90 p-3">
          <Link
            href="/marketplace"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
          >
            <IconExternal className="h-[17px] w-[17px] shrink-0 opacity-80" />
            Marché public
          </Link>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 max-h-full flex-1 basis-0 flex-col overflow-hidden bg-zinc-50 dark:bg-[#070a0d]">
        <header className="relative z-30 flex h-14 shrink-0 items-center border-b border-zinc-200/90 bg-white px-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 lg:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              aria-label="Ouvrir le menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <Link
              href="/seller"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-boma-blue to-teal-700 text-xs font-bold text-white shadow-sm lg:hidden"
              aria-label="Console vendeur — accueil"
            >
              B
            </Link>
            <Link
              href="/seller"
              className="hidden shrink-0 items-center gap-2 rounded-lg py-1 pr-2 lg:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-boma-blue to-teal-700 text-xs font-bold text-white shadow-sm">
                B
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                BOMA Pro
              </span>
            </Link>
            <span
              className="hidden h-6 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700 lg:block"
              aria-hidden
            />
            <nav
              className="flex min-w-0 items-center gap-1.5 text-sm"
              aria-label="Fil d’Ariane"
            >
              <Link
                href="/seller"
                className="shrink-0 text-muted transition-colors hover:text-foreground"
              >
                Console
              </Link>
              <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate font-semibold text-foreground">{pageTitle}</span>
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-muted transition-colors hover:bg-zinc-100 hover:text-foreground sm:px-2.5 dark:hover:bg-zinc-800"
            >
              <IconExternal className="h-3.5 w-3.5 opacity-70" />
              Marché
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              aria-label={
                theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
              }
            >
              {theme === "dark" ? (
                <IconSun className="h-[1.1rem] w-[1.1rem]" />
              ) : (
                <IconMoon className="h-[1.1rem] w-[1.1rem]" />
              )}
            </button>
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-2 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:pr-2.5"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-label="Menu compte"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-boma-blue to-boma-forest text-[10px] font-bold text-white">
                  {userInitials(userEmail)}
                </span>
                <IconChevronDown
                  className={`h-3.5 w-3.5 text-muted ${accountMenuOpen ? "rotate-180" : ""} transition-transform`}
                />
              </button>
              {accountMenuOpen ? (
                <div
                  className="absolute right-0 top-[calc(100%+0.375rem)] z-50 w-[min(100vw-1.5rem,16rem)] rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                  role="menu"
                >
                  <p className="truncate px-3 py-2 text-xs text-muted">{userEmail}</p>
                  <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  <Link
                    href="/seller/account"
                    role="menuitem"
                    className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    Mon compte
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Déconnexion
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div
          role="main"
          aria-label="Contenu console vendeur"
          className="seller-pro-main-surface min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-6 [scrollbar-gutter:stable] lg:px-8 lg:py-8"
        >
          {children}
        </div>
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

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
