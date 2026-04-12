"use client";

import { CartSidebar } from "@/components/cart-sidebar";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <CartSidebar />
          <FavoritesProvider>{children}</FavoritesProvider>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
