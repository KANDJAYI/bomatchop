"use client";

import {
  faHouse,
  faStore,
  faTags,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const navBtnClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-2 py-3.5 text-xs font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-boma-blue/40";

const navIconClass = "h-14 w-14 shrink-0";

export function MobileBottomNav() {
  const pathname = usePathname();
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
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-2 pt-0.5">
        <Link
          href="/"
          className={`${navBtnClass} ${
            homeActive
              ? "text-boma-blue"
              : "text-muted hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faHouse} className={navIconClass} aria-hidden />
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
          <FontAwesomeIcon icon={faStore} className={navIconClass} aria-hidden />
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
          <FontAwesomeIcon icon={faTags} className={navIconClass} aria-hidden />
          <span>Promos</span>
        </Link>
        <Link
          href={accountHref}
          className={`${navBtnClass} ${
            accountActive ? "text-boma-blue" : "text-muted hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faUser} className={navIconClass} aria-hidden />
          <span>{user ? "Compte" : "Connexion"}</span>
        </Link>
      </div>
    </nav>
  );
}
