import type { User } from "@supabase/supabase-js";

export type SiteNavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
  /** Lien console admin (style vert / forêt) */
  variant?: "admin";
};

export function buildSiteNavItems(
  user: User | null,
  role: string | null,
): SiteNavItem[] {
  const offers: SiteNavItem = {
    href: "/marketplace",
    label: "Les offres",
    isActive: (p) =>
      p.startsWith("/marketplace") || p.startsWith("/product/"),
  };
  const promotions: SiteNavItem = {
    href: "/promotions",
    label: "Promotions",
    isActive: (p) => p.startsWith("/promotions"),
  };
  const account: SiteNavItem = {
    href: "/dashboard",
    label: "Mon compte",
    isActive: (p) => p.startsWith("/dashboard"),
  };
  const contact: SiteNavItem = {
    href: "/contact",
    label: "Contact",
    isActive: (p) => p.startsWith("/contact"),
  };
  const seller: SiteNavItem = {
    href: "/seller",
    label: "Espace vendeur",
    isActive: (p) => p.startsWith("/seller"),
  };
  const admin: SiteNavItem = {
    href: "/admin",
    label: "Console admin",
    isActive: (p) => p.startsWith("/admin"),
    variant: "admin",
  };

  if (!user) {
    return [offers, promotions, account, contact];
  }

  if (role === "vendor") {
    return [offers, promotions, seller, account, contact];
  }

  if (role === "admin") {
    return [offers, promotions, account, contact, admin];
  }

  return [offers, promotions, account, contact];
}
