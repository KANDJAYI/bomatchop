"use client";

import {
  faArrowRightToBracket,
  faBars,
  faBasketShopping,
  faBox,
  faBriefcase,
  faCartShopping,
  faChevronRight,
  faClipboardList,
  faComments,
  faCreditCard,
  faEnvelope,
  faHandshake,
  faHouse,
  faIdCard,
  faMagnifyingGlass,
  faPlus,
  faGear,
  faShieldHalved,
  faStore,
  faUser,
  faUserPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/auth/actions";
import { IconMoon, IconSun } from "@/components/icons";
import { Logo } from "@/components/logo";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { buildBurgerMenuSections, buildSiteNavItems } from "@/lib/site-nav";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseClient, User } from "@supabase/supabase-js";

function burgerIconForHref(href: string, variant?: string) {
  if (variant === "admin") return faShieldHalved;
  if (href === "/seller/products/new") return faPlus;
  if (href === "/seller/parametres") return faGear;
  if (href === "/seller/orders") return faClipboardList;
  if (href === "/seller/messages") return faComments;
  if (href === "/seller/account") return faIdCard;
  if (href === "/seller/products") return faBox;
  switch (href) {
    case "/marketplace":
      return faStore;
    case "/dashboard":
      return faUser;
    case "/contact":
      return faEnvelope;
    case "/seller":
      return faBriefcase;
    case "/auth/login":
      return faArrowRightToBracket;
    case "/auth/register":
      return faUserPlus;
    case "/auth/vendor":
      return faHandshake;
    case "/cart":
      return faBasketShopping;
    case "/checkout":
      return faCreditCard;
    default:
      return faChevronRight;
  }
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, bumpKey, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  /** false jusqu’à la 1re résolution getUser (+ rôle profil si connecté) */
  const [identityReady, setIdentityReady] = useState(() => !isSupabaseConfigured());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    function closeOnDesktop() {
      if (mq.matches) setBurgerOpen(false);
    }
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!burgerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setBurgerOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [burgerOpen]);

  useEffect(() => {
    setBurgerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      queueMicrotask(() => {
        setUser(null);
        setRole(null);
        setIdentityReady(true);
      });
      return;
    }
    const client = createClient();
    if (!client) return;
    const db: SupabaseClient = client;

    let cancelled = false;

    async function load(u: User | null) {
      if (cancelled) return;
      if (!u) {
        setUser(null);
        setRole(null);
        setIdentityReady(true);
        return;
      }
      setIdentityReady(false);
      setUser(u);
      const { data } = await db
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .maybeSingle();
      if (!cancelled) {
        setRole(data?.role ?? null);
        setIdentityReady(true);
      }
    }

    db.auth.getUser().then(({ data }) => {
      void load(data.user ?? null);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      void load(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const navUser = isSupabaseConfigured() ? user : null;
  const navRole = isSupabaseConfigured() ? role : null;
  const navItems = buildSiteNavItems(
    navUser,
    navUser && !identityReady ? null : navRole,
  );
  const burgerSections = useMemo(
    () => buildBurgerMenuSections(navUser, navRole, identityReady),
    [navUser, navRole, identityReady],
  );

  function closeBurger() {
    setBurgerOpen(false);
  }

  function toggleSearch() {
    setSearchOpen((prev) => {
      const next = !prev;
      if (!next) setSearchDraft("");
      return next;
    });
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchDraft.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `/marketplace?${qs}` : "/marketplace");
    setSearchOpen(false);
    setSearchDraft("");
    closeBurger();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/[0.06] bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <Logo />
        </div>
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navigation principale"
        >
          <button
            type="button"
            onClick={toggleSearch}
            className={`pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              searchOpen
                ? "bg-boma-blue/[0.12] text-boma-blue"
                : "bg-foreground/[0.04] text-muted hover:bg-foreground/[0.08] hover:text-foreground"
            }`}
            aria-expanded={searchOpen}
            aria-controls="header-recherche"
            aria-label={searchOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="h-[1.05rem] w-[1.05rem]"
              aria-hidden
            />
          </button>
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            const isAdminLink = item.variant === "admin";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isAdminLink
                    ? `hover:text-foreground focus-visible:ring-boma-forest/40 dark:focus-visible:ring-emerald-400/35 ${
                        active
                          ? "bg-boma-forest/18 text-boma-forest dark:text-emerald-300"
                          : "text-muted"
                      }`
                    : `hover:text-foreground focus-visible:ring-boma-blue/40 ${
                        active
                          ? "bg-boma-blue/[0.12] text-boma-blue"
                          : "text-muted"
                      }`
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              toggleSearch();
              closeBurger();
            }}
            className={`pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden ${
              searchOpen
                ? "bg-boma-blue/[0.12] text-boma-blue"
                : "bg-foreground/[0.04] text-muted hover:bg-foreground/[0.08] hover:text-foreground"
            }`}
            aria-expanded={searchOpen}
            aria-controls="header-recherche"
            aria-label={searchOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="h-[1.05rem] w-[1.05rem]"
              aria-hidden
            />
          </button>
          {isSupabaseConfigured() &&
            (user ? (
              <form action={signOut} className="hidden md:block">
                <button
                  type="submit"
                  className="pressable rounded-full bg-foreground/[0.04] px-3 py-2 text-xs font-semibold text-muted transition-colors hover:bg-foreground/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Déconnexion
                </button>
              </form>
            ) : (
              <Link
                href="/auth/login"
                className="pressable hidden rounded-full bg-boma-blue px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-boma-blue/20 transition-shadow hover:shadow-md hover:shadow-boma-blue/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex sm:px-4"
              >
                Connexion
              </Link>
            ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground transition-colors hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={
              theme === "dark"
                ? "Passer en mode clair"
                : "Passer en mode sombre"
            }
          >
            {theme === "dark" ? (
              <IconSun className="h-[1.15rem] w-[1.15rem]" />
            ) : (
              <IconMoon className="h-[1.15rem] w-[1.15rem]" />
            )}
          </button>
          <button
            type="button"
            onClick={openCart}
            className="pressable relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground transition-colors hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={
              itemCount > 0
                ? `Ouvrir le panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`
                : "Ouvrir le panier"
            }
            aria-haspopup="dialog"
          >
            <span key={bumpKey} className="animate-cart-bump inline-flex">
              <FontAwesomeIcon
                icon={faCartShopping}
                className="h-[1.15rem] w-[1.15rem]"
                aria-hidden
              />
            </span>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-boma-blue px-1 text-[10px] font-bold text-white tabular-nums">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setBurgerOpen((v) => !v);
              setSearchOpen(false);
            }}
            className={`pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden ${
              burgerOpen
                ? "bg-boma-blue/[0.12] text-boma-blue"
                : "bg-foreground/[0.04] text-muted hover:bg-foreground/[0.08] hover:text-foreground"
            }`}
            aria-expanded={burgerOpen}
            aria-controls="menu-mobile-drawer"
            aria-label={burgerOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <FontAwesomeIcon
              icon={burgerOpen ? faXmark : faBars}
              className="h-[1.15rem] w-[1.15rem]"
              aria-hidden
            />
          </button>
        </div>
      </div>
      {searchOpen ? (
        <div
          id="header-recherche"
          className="border-b border-foreground/[0.06] bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6"
        >
          <form
            onSubmit={submitSearch}
            className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          >
            <label className="sr-only" htmlFor="header-search-input">
              Recherche sur le marché
            </label>
            <input
              ref={searchInputRef}
              id="header-search-input"
              type="search"
              name="q"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Plat, commerce…"
              className="boma-field min-h-0 flex-1 rounded-2xl px-4 py-2.5 text-sm"
              autoComplete="off"
            />
            <div className="flex shrink-0 gap-2">
              <button
                type="submit"
                className="pressable rounded-full bg-boma-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-boma-blue/20 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Rechercher
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchDraft("");
                }}
                className="pressable rounded-full bg-foreground/[0.06] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Fermer
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {mounted && burgerOpen
        ? createPortal(
            <div className="md:hidden" role="presentation">
              <button
                type="button"
                className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[2px]"
                aria-label="Fermer le menu"
                onClick={closeBurger}
              />
              <div
                id="menu-mobile-drawer"
                className="fixed inset-y-0 right-0 z-[56] flex h-[100dvh] max-h-[100dvh] w-[min(100%,20rem)] flex-col border-l border-foreground/[0.08] bg-background pb-[env(safe-area-inset-bottom,0px)] shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="menu-mobile-title"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-foreground/[0.06] px-4 py-3">
                  <p
                    id="menu-mobile-title"
                    className="text-sm font-semibold tracking-tight text-foreground"
                  >
                    Menu
                  </p>
                  <button
                    type="button"
                    onClick={closeBurger}
                    className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.06] text-muted transition-colors hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Fermer le menu"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <nav
                  className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3"
                  aria-label="Liens du menu"
                >
                  <Link
                    href="/"
                    onClick={closeBurger}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-boma-blue/35 ${
                      pathname === "/"
                        ? "bg-boma-blue/[0.12] text-boma-blue"
                        : "text-foreground/90 hover:bg-foreground/[0.06] hover:text-foreground"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06] text-foreground/90">
                      <FontAwesomeIcon icon={faHouse} className="h-4 w-4" aria-hidden />
                    </span>
                    <span>Accueil</span>
                  </Link>
                  {burgerSections.map((section, sectionIdx) => (
                    <div
                      key={section.id}
                      className={sectionIdx === 0 ? "pt-2" : "pt-3"}
                    >
                      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        {section.title}
                      </p>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const active = item.isActive(pathname);
                          const isAdminLink = item.variant === "admin";
                          const icon = burgerIconForHref(item.href, item.variant);
                          return (
                            <Link
                              key={`${section.id}-${item.href}-${item.label}`}
                              href={item.href}
                              onClick={closeBurger}
                              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                                isAdminLink
                                  ? `focus-visible:ring-boma-forest/35 ${
                                      active
                                        ? "bg-boma-forest/18 text-boma-forest"
                                        : "text-foreground/90 hover:bg-foreground/[0.06] hover:text-foreground"
                                    }`
                                  : `focus-visible:ring-boma-blue/35 ${
                                      active
                                        ? "bg-boma-blue/[0.12] text-boma-blue"
                                        : "text-foreground/90 hover:bg-foreground/[0.06] hover:text-foreground"
                                    }`
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                  isAdminLink
                                    ? "bg-boma-forest/15 text-boma-forest dark:text-emerald-300"
                                    : "bg-foreground/[0.06] text-foreground/90"
                                }`}
                              >
                                <FontAwesomeIcon icon={icon} className="h-4 w-4" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      closeBurger();
                      openCart();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-foreground/90 transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-boma-blue/35"
                  >
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06] text-foreground/90">
                      <span key={bumpKey} className="inline-flex">
                        <FontAwesomeIcon icon={faCartShopping} className="h-4 w-4" aria-hidden />
                      </span>
                      {itemCount > 0 ? (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-boma-blue px-1 text-[9px] font-bold text-white tabular-nums">
                          {itemCount > 9 ? "9+" : itemCount}
                        </span>
                      ) : null}
                    </span>
                    <span>Panier</span>
                  </button>
                </nav>
                <div className="shrink-0 border-t border-foreground/[0.06] p-3">
                  {isSupabaseConfigured() && user ? (
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-foreground/[0.06] px-3 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-foreground/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-boma-blue/35"
                      >
                        Déconnexion
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      <div className="boma-spectrum-strip" aria-hidden />
    </header>
  );
}
