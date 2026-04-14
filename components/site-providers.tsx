"use client";

import { CartSidebar } from "@/components/cart-sidebar";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";

/**
 * Panier + favoris pour le périmètre (site) uniquement.
 * Évite les erreurs « useCart hors CartProvider » liées aux frontières client/RSC du layout racine.
 */
export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CartSidebar />
      <FavoritesProvider>{children}</FavoritesProvider>
    </CartProvider>
  );
}
