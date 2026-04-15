"use client";

import { PwaInstallNudge } from "@/components/pwa-install-nudge";
import { PwaRegister } from "@/components/pwa-register";
import { PlatformPresenceProvider } from "@/context/platform-presence-context";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PlatformPresenceProvider>
          <PwaRegister />
          <PwaInstallNudge />
          {children}
        </PlatformPresenceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
