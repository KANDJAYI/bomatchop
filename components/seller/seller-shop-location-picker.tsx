"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateVendorShopCoordinatesAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";

type LatLng = { lat: number; lng: number };

const DEFAULT_LIBREVILLE: LatLng = { lat: 0.3901, lng: 9.4673 };

function pickInitial(
  lat: number | null,
  lng: number | null,
): { point: LatLng; hasSaved: boolean } {
  if (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    return { point: { lat, lng }, hasSaved: true };
  }
  return { point: DEFAULT_LIBREVILLE, hasSaved: false };
}

type Props = {
  initialLatitude: number | null;
  initialLongitude: number | null;
  canEdit: boolean;
};

export function SellerShopLocationPicker({
  initialLatitude,
  initialLongitude,
  canEdit,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const { point: seed } = pickInitial(initialLatitude, initialLongitude);
  const [draft, setDraft] = useState<LatLng>(seed);

  useEffect(() => {
    const { point } = pickInitial(initialLatitude, initialLongitude);
    setDraft(point);
  }, [initialLatitude, initialLongitude]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!canEdit) return;
    const el = containerRef.current;
    if (!el) return;

    let alive = true;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const safeInvalidate = () => {
      if (!alive) return;
      const map = mapRef.current;
      if (!map) return;
      try {
        map.invalidateSize();
      } catch {
        /* carte déjà détruite */
      }
    };

    void (async () => {
      await import("leaflet/dist/leaflet.css");
      const L = (await import("leaflet")).default;
      if (!alive || !containerRef.current) return;

      const { point: start } = pickInitial(initialLatitude, initialLongitude);

      const icon = L.divIcon({
        className: "checkout-map-marker-root",
        html: '<span class="checkout-map-pin checkout-map-pin--store" aria-hidden="true">🏪</span>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const m = L.map(el, { scrollWheelZoom: true }).setView(
        [start.lat, start.lng],
        start.lat === DEFAULT_LIBREVILLE.lat ? 12 : 16,
      );
      if (!alive) {
        m.remove();
        return;
      }
      mapRef.current = m;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);

      const mk = L.marker([start.lat, start.lng], {
        draggable: true,
        icon,
      }).addTo(m);
      mk.on("dragend", () => {
        if (!alive) return;
        const ll = mk.getLatLng();
        setDraft({ lat: ll.lat, lng: ll.lng });
      });

      m.on("click", (ev) => {
        if (!alive) return;
        const { lat, lng } = ev.latlng;
        mk.setLatLng([lat, lng]);
        setDraft({ lat, lng });
      });

      resizeTimer = setTimeout(safeInvalidate, 200);
      requestAnimationFrame(safeInvalidate);
    })();

    return () => {
      alive = false;
      if (resizeTimer) clearTimeout(resizeTimer);
      try {
        mapRef.current?.remove();
      } catch {
        /* ignore */
      }
      mapRef.current = null;
    };
  }, [canEdit, initialLatitude, initialLongitude]);

  function save() {
    setErr(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("latitude", String(draft.lat));
      fd.set("longitude", String(draft.lng));
      const r = await updateVendorShopCoordinatesAction(fd);
      if ("error" in r && r.error) {
        setErr(r.error);
        showToast(r.error, "error");
        return;
      }
      showToast("Position exacte enregistrée — les clients verront ce point au checkout.", "success");
      router.refresh();
    });
  }

  function clearSaved() {
    setErr(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("clear", "1");
      const r = await updateVendorShopCoordinatesAction(fd);
      if ("error" in r && r.error) {
        setErr(r.error);
        showToast(r.error, "error");
        return;
      }
      showToast("Point précis effacé — le trajet client repassera sur l’adresse textuelle.", "success");
      router.refresh();
    });
  }

  const { hasSaved } = pickInitial(initialLatitude, initialLongitude);

  if (!canEdit) {
    return (
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 text-sm text-muted dark:border-zinc-800 dark:bg-zinc-900/50">
        <p>
          La modification du point sur la carte n’est pas disponible pour votre
          statut actuel. Contactez le support BOMA si besoin.
        </p>
        {hasSaved && (
          <p className="mt-2 font-medium text-foreground">
            Point enregistré : {initialLatitude?.toFixed(6)}, {initialLongitude?.toFixed(6)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Placez le marqueur sur l’entrée ou le point de retrait exact. Les clients
        verront l’itinéraire routier et le temps estimé jusqu’à ce point lors du
        paiement.
      </p>
      <div
        ref={containerRef}
        className="z-0 h-80 w-full overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800"
        aria-label="Carte : position du commerce"
      />
      <p className="text-xs text-muted">
        Clic sur la carte ou glisser-déposer le marqueur. Coordonnées actuelles :{" "}
        <span className="font-mono text-foreground">
          {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
        </span>
      </p>
      {err ? (
        <p className="text-sm font-medium text-red-500" role="alert">
          {err}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="primary" disabled={pending} onClick={save}>
          {pending ? "Enregistrement…" : "Enregistrer ce point"}
        </Button>
        {hasSaved ? (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={clearSaved}
          >
            Effacer le point précis
          </Button>
        ) : null}
      </div>
    </div>
  );
}
