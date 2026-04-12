"use client";

import {
  faCartShopping,
  faHouse,
  faStore,
  faTags,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const navBtnClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-boma-blue/40";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, bumpKey, openCart } = useCart();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      queueMicrotask(() => setUser(null));
      return;
    }
    const client = createClient();
    if (!client) return;
    const db: SupabaseClient = client;
    let cancelled = false;

    async function load(u: User | null) {
      if (cancelled) return;
      setUser(u);
    }

    void db.auth.getUser().then(({ data }) => {
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

  const accountHref =
    isSupabaseConfigured() && user ? "/dashboard" : "/auth/login";
  const accountActive =
    pathname.startsWith("/dashboard") || pathname.startsWith("/auth/login");

  const homeActive = pathname === "/";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-foreground/[0.08] bg-background/92 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
      aria-label="Navigation mobile"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-0.5">
        <Link
          href="/"
          className={`${navBtnClass} ${
            homeActive
              ? "text-boma-blue"
              : "text-muted hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faHouse} className="h-5 w-5 shrink-0" aria-hidden />
          <span>Accueil</span>
        </Link>
        <Link
          href="/marketplace"
          className={`${navBtnClass} ${
            pathname.startsWith("/marketplace") || pathname.startsWith("/product/")
              ? "text-boma-blue"
              : "text-muted hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faStore} className="h-5 w-5 shrink-0" aria-hidden />
          <span>Marché</span>
        </Link>
        <Link
          href="/promotions"
          className={`${navBtnClass} ${
            pathname.startsWith("/promotions")
              ? "text-boma-blue"
              : "text-muted hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faTags} className="h-5 w-5 shrink-0" aria-hidden />
          <span>Promos</span>
        </Link>
        <Link
          href={accountHref}
          className={`${navBtnClass} ${
            accountActive ? "text-boma-blue" : "text-muted hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faUser} className="h-5 w-5 shrink-0" aria-hidden />
          <span>{user ? "Compte" : "Connexion"}</span>
        </Link>
        <button
          type="button"
          onClick={openCart}
          className={`${navBtnClass} text-muted hover:text-foreground`}
          aria-haspopup="dialog"
          aria-label={
            itemCount > 0
              ? `Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`
              : "Ouvrir le panier"
          }
        >
          <span key={bumpKey} className="relative inline-flex">
            <FontAwesomeIcon
              icon={faCartShopping}
              className="h-5 w-5 shrink-0"
              aria-hidden
            />
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-boma-blue px-0.5 text-[9px] font-bold text-white tabular-nums">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            ) : null}
          </span>
          <span>Panier</span>
        </button>
      </div>
    </nav>
  );
}
