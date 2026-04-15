"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/context/toast-context";

const KEY_HINT = "boma-tchop-pwa-install-hint-shown";
const KEY_INSTALLED = "boma-tchop-pwa-installed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallNudge() {
  const { showToast } = useToast();
  const deferredRef = useRef<BeforeInstallPromptEventLike | null>(null);
  const chromeToastShownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (readFlag(KEY_INSTALLED)) return;
    if (readFlag(KEY_HINT)) return;

    const onInstalled = () => {
      writeFlag(KEY_INSTALLED);
      deferredRef.current = null;
    };
    window.addEventListener("appinstalled", onInstalled);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEventLike;
      if (chromeToastShownRef.current) return;
      if (readFlag(KEY_HINT) || readFlag(KEY_INSTALLED)) return;
      chromeToastShownRef.current = true;
      writeFlag(KEY_HINT);

      showToast(
        "Installez l’app BOMA TCHOP pour un accès rapide depuis l’écran d’accueil, comme une application.",
        "info",
        {
          durationMs: 22_000,
          action: {
            label: "Installer",
            onClick: async () => {
              const ev = deferredRef.current;
              if (!ev) return;
              deferredRef.current = null;
              await ev.prompt();
              await ev.userChoice.catch(() => {});
            },
          },
        },
      );
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const ua = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1);

    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS) {
      iosTimer = setTimeout(() => {
        if (readFlag(KEY_HINT) || readFlag(KEY_INSTALLED)) return;
        if (deferredRef.current) return;
        writeFlag(KEY_HINT);
        showToast(
          "Pour installer BOMA TCHOP : touchez Partager puis « Sur l’écran d’accueil ».",
          "info",
          {
            durationMs: 16_000,
            action: {
              label: "Compris",
              onClick: async () => {},
            },
          },
        );
      }, 4500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer !== undefined) clearTimeout(iosTimer);
    };
  }, [showToast]);

  return null;
}
