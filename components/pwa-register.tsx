"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker `/sw.js` (requis pour l’invite d’installation
 * Chrome/Android ; manifest + icônes gèrent Safari « Sur l’écran d’accueil »).
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const { protocol, hostname } = window.location;
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
    if (protocol !== "https:" && !isLocalhost) {
      return;
    }

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {});
    };

    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
