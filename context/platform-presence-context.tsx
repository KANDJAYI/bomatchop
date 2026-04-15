"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Canal Realtime Presence partagé (comptage côté serveur Realtime, diffusé en direct).
 * Clé de présence :
 * - utilisateur connecté : `user:<uuid>` → tous ses onglets = **1 personne** ;
 * - invité : `anon:<id stable par onglet>` → **1 personne par session navigateur** (onglet).
 */
const PRESENCE_CHANNEL = "boma_platform_online_v1";
const TAB_STORAGE_KEY = "boma_presence_tab";

export type PlatformPresenceConnection =
  | "unconfigured"
  | "connecting"
  | "live"
  | "error";

type PlatformPresenceValue = {
  onlineCount: number | null;
  connection: PlatformPresenceConnection;
};

const PlatformPresenceContext = createContext<PlatformPresenceValue | null>(
  null,
);

function presenceTabKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.sessionStorage.getItem(TAB_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(TAB_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function presenceKeyFromSession(session: Session | null): string {
  const uid = session?.user?.id?.trim();
  if (uid) return `user:${uid}`;
  return `anon:${presenceTabKey()}`;
}

/** Nombre de présences distinctes = personnes (comptes fusionnés + invités par session). */
function countPresencePeople(state: ReturnType<RealtimeChannel["presenceState"]>): number {
  return Object.keys(state).length;
}

export function PlatformPresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [connection, setConnection] =
    useState<PlatformPresenceConnection>("connecting");
  /** `undefined` = session auth pas encore résolue ; sinon clé stable pour ce client. */
  const [presenceKey, setPresenceKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setPresenceKey(undefined);
      setConnection("unconfigured");
      setOnlineCount(null);
      return;
    }

    const apply = (session: Session | null) => {
      const next = presenceKeyFromSession(session);
      setPresenceKey((prev) => (prev === next ? prev : next));
    };

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) console.warn("[platform-presence] getSession", error);
        apply(data.session ?? null);
      })
      .catch(() => {
        apply(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const syncFromChannel = useCallback((ch: RealtimeChannel) => {
    setOnlineCount(countPresencePeople(ch.presenceState()));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    if (presenceKey === undefined) return;

    setConnection("connecting");

    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: { key: presenceKey },
      },
    });

    const bump = () => syncFromChannel(channel);

    channel
      .on("presence", { event: "sync" }, bump)
      .on("presence", { event: "join" }, bump)
      .on("presence", { event: "leave" }, bump);

    channel.subscribe(async (status, err) => {
      if (status === "SUBSCRIBED") {
        try {
          await channel.track({ online_at: Date.now() });
        } catch {
          setConnection("error");
          setOnlineCount(null);
          return;
        }
        setConnection("live");
        bump();
        return;
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        if (err) console.warn("[platform-presence]", status, err);
        setConnection("error");
        setOnlineCount(null);
      }
    });

    const onPageHide = () => {
      void channel.untrack();
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      void supabase.removeChannel(channel);
    };
  }, [presenceKey, syncFromChannel]);

  const value = useMemo<PlatformPresenceValue>(
    () => ({ onlineCount, connection }),
    [onlineCount, connection],
  );

  return (
    <PlatformPresenceContext.Provider value={value}>
      {children}
    </PlatformPresenceContext.Provider>
  );
}

export function usePlatformPresence(): PlatformPresenceValue {
  const ctx = useContext(PlatformPresenceContext);
  if (!ctx) {
    return { onlineCount: null, connection: "unconfigured" };
  }
  return ctx;
}
