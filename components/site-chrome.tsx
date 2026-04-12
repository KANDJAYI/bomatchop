"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sellerWorkspace = pathname.startsWith("/seller");

  useEffect(() => {
    if (!sellerWorkspace) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, [sellerWorkspace]);

  return (
    <>
      {sellerWorkspace ? null : (
        <a
          href="#contenu-principal"
          className="fixed left-4 top-4 z-[100] -translate-y-[220%] rounded-full bg-boma-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform duration-200 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/75 focus:ring-offset-2 focus:ring-offset-background"
        >
          Aller au contenu
        </a>
      )}
      {sellerWorkspace ? null : <Header />}
      <main
        id="contenu-principal"
        className={
          sellerWorkspace
            ? "flex h-[100dvh] max-h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden overscroll-none"
            : "flex min-h-0 flex-1 flex-col pb-[max(5.5rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] md:pb-0"
        }
        tabIndex={-1}
      >
        {children}
      </main>
      {sellerWorkspace ? null : <Footer />}
      {sellerWorkspace ? null : <MobileBottomNav />}
    </>
  );
}
