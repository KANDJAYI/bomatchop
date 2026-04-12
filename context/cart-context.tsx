"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { CartLine, Product } from "@/lib/types";

type CartContextValue = {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  total: number;
  itemCount: number;
  bumpKey: number;
  sidebarOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [bumpKey, setBumpKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openCart = useCallback(() => setSidebarOpen(true), []);
  const closeCart = useCallback(() => setSidebarOpen(false), []);

  const add = useCallback((product: Product, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.product.id === product.id);
      if (i === -1) return [...prev, { product, quantity: qty }];
      const next = [...prev];
      next[i] = {
        ...next[i],
        quantity: next[i].quantity + qty,
      };
      return next;
    });
    setBumpKey((k) => k + 1);
    setSidebarOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.product.id !== productId));
      return;
    }
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === productId ? { ...l, quantity } : l,
      ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { total, itemCount } = useMemo(() => {
    const total = lines.reduce(
      (s, l) => s + l.product.pricePromo * l.quantity,
      0,
    );
    const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
    return { total, itemCount };
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      add,
      setQuantity,
      remove,
      clear,
      total,
      itemCount,
      bumpKey,
      sidebarOpen,
      openCart,
      closeCart,
    }),
    [
      lines,
      add,
      setQuantity,
      remove,
      clear,
      total,
      itemCount,
      bumpKey,
      sidebarOpen,
      openCart,
      closeCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
