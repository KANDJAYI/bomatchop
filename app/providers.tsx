"use client";

import { PwaRegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PwaRegister />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
