import type { User } from "@supabase/supabase-js";

export type SiteNavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
  /** Lien console admin (style vert / forêt) */
  variant?: "admin";
};

function item(
  href: string,
  label: string,
  isActive: (pathname: string) => boolean,
  variant?: "admin",
): SiteNavItem {
  return variant ? { href, label, isActive, variant } : { href, label, isActive };
}

export function buildSiteNavItems(
  user: User | null,
  role: string | null,
): SiteNavItem[] {
  const offers = item(
    "/marketplace",
    "Les offres",
    (p) => p.startsWith("/marketplace") || p.startsWith("/product/"),
  );
  const account = item("/dashboard", "Mon compte", (p) =>
    p.startsWith("/dashboard"),
  );
  const contact = item("/contact", "Contact", (p) =>
    p.startsWith("/contact"),
  );
  const seller = item("/seller", "Espace vendeur", (p) =>
    p.startsWith("/seller"),
  );
  const admin = item(
    "/admin",
    "Console admin",
    (p) => p.startsWith("/admin"),
    "admin",
  );

  if (!user) {
    return [offers, account, contact];
  }

  if (role === "vendor") {
    return [offers, seller, account, contact];
  }

  if (role === "admin") {
    return [offers, account, contact, admin];
  }

  return [offers, account, contact];
}

export type BurgerNavSection = {
  id: string;
  title: string;
  items: SiteNavItem[];
};

/**
 * Menu burger structuré selon l’état de session et le rôle (invité, client, vendeur, admin).
 * `identityReady` : false tant que la première résolution session / rôle n’est pas terminée.
 */
export function buildBurgerMenuSections(
  user: User | null,
  role: string | null,
  identityReady: boolean,
): BurgerNavSection[] {
  const offers = item(
    "/marketplace",
    "Les offres",
    (p) => p.startsWith("/marketplace") || p.startsWith("/product/"),
  );
  const account = item("/dashboard", "Mon compte", (p) =>
    p.startsWith("/dashboard"),
  );
  const contact = item("/contact", "Contact", (p) =>
    p.startsWith("/contact"),
  );
  const seller = item("/seller", "Espace vendeur", (p) =>
    p.startsWith("/seller"),
  );
  const admin = item(
    "/admin",
    "Console admin",
    (p) => p.startsWith("/admin"),
    "admin",
  );
  const cart = item("/cart", "Récap panier", (p) => p.startsWith("/cart"));
  const checkout = item("/checkout", "Checkout", (p) =>
    p.startsWith("/checkout"),
  );
  const login = item("/auth/login", "Connexion", (p) =>
    p.startsWith("/auth/login"),
  );
  const register = item("/auth/register", "Inscription", (p) =>
    p.startsWith("/auth/register"),
  );
  const vendorSignup = item("/auth/vendor", "Devenir commerçant", (p) =>
    p.startsWith("/auth/vendor"),
  );

  const sellerOrders = item("/seller/orders", "Mes commandes", (p) =>
    p.startsWith("/seller/orders"),
  );
  const sellerProducts = item("/seller/products", "Mes produits", (p) =>
    p.startsWith("/seller/products") && !p.startsWith("/seller/products/new"),
  );
  const sellerNew = item("/seller/products/new", "Nouvelle offre", (p) =>
    p.startsWith("/seller/products/new"),
  );
  const sellerMessages = item("/seller/messages", "Messages BOMA TCHOP", (p) =>
    p.startsWith("/seller/messages"),
  );
  const sellerParametres = item("/seller/parametres", "Paramètres", (p) =>
    p.startsWith("/seller/parametres"),
  );
  const sellerAccount = item("/seller/account", "Compte commerçant", (p) =>
    p.startsWith("/seller/account"),
  );

  if (!identityReady) {
    return [
      {
        id: "loading",
        title: "Chargement…",
        items: [offers, contact],
      },
    ];
  }

  if (!user) {
    return [
      {
        id: "explore",
        title: "Découvrir",
        items: [offers],
      },
      {
        id: "auth",
        title: "Compte & accès",
        items: [login, register, vendorSignup, account],
      },
      {
        id: "sell",
        title: "Vendre sur BOMA TCHOP",
        items: [seller],
      },
      {
        id: "cart",
        title: "Panier & commande",
        items: [cart, checkout],
      },
      {
        id: "help",
        title: "Aide",
        items: [contact],
      },
    ];
  }

  if (role === "vendor") {
    return [
      {
        id: "vendor",
        title: "Console vendeur",
        items: [
          seller,
          sellerOrders,
          sellerProducts,
          sellerNew,
          sellerMessages,
          sellerParametres,
          sellerAccount,
        ],
      },
      {
        id: "explore",
        title: "Marché",
        items: [offers],
      },
      {
        id: "account",
        title: "Mon compte client",
        items: [account],
      },
      {
        id: "cart",
        title: "Panier & commande",
        items: [cart, checkout],
      },
      {
        id: "help",
        title: "Aide",
        items: [contact],
      },
    ];
  }

  if (role === "admin") {
    return [
      {
        id: "admin",
        title: "Administration",
        items: [admin],
      },
      {
        id: "explore",
        title: "Marché",
        items: [offers],
      },
      {
        id: "sell",
        title: "Espace commerçant",
        items: [seller],
      },
      {
        id: "account",
        title: "Compte",
        items: [account],
      },
      {
        id: "cart",
        title: "Panier & commande",
        items: [cart, checkout],
      },
      {
        id: "help",
        title: "Aide",
        items: [contact],
      },
    ];
  }

  // Client connecté (ou rôle générique)
  return [
    {
      id: "explore",
      title: "Découvrir",
      items: [offers],
    },
    {
      id: "sell",
      title: "Vendre sur BOMA TCHOP",
      items: [seller],
    },
    {
      id: "account",
      title: "Mon compte",
      items: [account],
    },
    {
      id: "cart",
      title: "Panier & commande",
      items: [cart, checkout],
    },
    {
      id: "help",
      title: "Aide",
      items: [contact],
    },
  ];
}
