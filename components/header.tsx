"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const nav = [
  { href: "/marketplace", label: "Explorer" },
  { href: "/dashboard", label: "Mon compte" },
  { href: "/seller", label: "Vendeur" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, bumpKey } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      queueMicrotask(() => {
        setUser(null);
        setRole(null);
      });
      return;
    }
    const client = createClient();
    if (!client) return;
    const db: SupabaseClient = client;

    let cancelled = false;

    async function load(u: User | null) {
      if (cancelled) return;
      setUser(u);
      if (!u) {
        setRole(null);
        return;
      }
      const { data } = await db
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .maybeSingle();
      if (!cancelled) setRole(data?.role ?? null);
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

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] ${
                  active
                    ? "bg-boma-blue/15 text-boma-blue"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {role === "admin" && (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] ${
                pathname.startsWith("/admin")
                  ? "bg-boma-forest/20 text-boma-forest dark:text-emerald-300"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Console admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isSupabaseConfigured() &&
            (user ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="pressable hidden rounded-full bg-card px-3 py-2 text-xs font-semibold text-muted transition-all hover:text-foreground sm:inline"
                >
                  Déconnexion
                </button>
              </form>
            ) : (
              <Link
                href="/auth/login"
                className="pressable hidden rounded-full bg-boma-blue px-4 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md sm:inline"
              >
                Connexion
              </Link>
            ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm"
            aria-label={
              theme === "dark"
                ? "Passer en mode clair"
                : "Passer en mode sombre"
            }
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <Link
            href="/cart"
            className="pressable relative flex h-10 items-center justify-center rounded-full bg-card px-4 text-sm font-semibold hover:scale-[1.02]"
          >
            <span key={bumpKey} className="animate-cart-bump">
              Panier
            </span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-boma-blue px-1 text-[10px] font-bold text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <nav className="flex px-2 py-2 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-xl py-2 text-center text-xs font-medium ${
              pathname === item.href
                ? "bg-boma-blue/15 text-boma-blue"
                : "text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
        {role === "admin" && (
          <Link
            href="/admin"
            className={`flex-1 rounded-xl py-2 text-center text-xs font-medium ${
              pathname.startsWith("/admin")
                ? "bg-boma-forest/20 text-boma-forest"
                : "text-muted"
            }`}
          >
            Console
          </Link>
        )}
        {isSupabaseConfigured() &&
          (user ? (
            <form action={signOut} className="flex-1">
              <button
                type="submit"
                className="w-full rounded-xl py-2 text-center text-xs font-medium text-muted"
              >
                Déco
              </button>
            </form>
          ) : (
            <Link
              href="/auth/login"
              className="flex-1 rounded-xl py-2 text-center text-xs font-medium text-boma-blue"
            >
              Connexion
            </Link>
          ))}
      </nav>
      <div className="boma-spectrum-strip" aria-hidden />
    </header>
  );
}
