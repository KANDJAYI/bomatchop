"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CartVendorGroup } from "@/lib/cart-vendor-groups";
import { Button } from "@/components/ui/button";

type LatLng = { lat: number; lng: number };

function googleMapsDirectionsUrl(
  destination: string,
  origin?: LatLng | null,
): string {
  const base = "https://www.google.com/maps/dir/?api=1";
  const dest = `&destination=${encodeURIComponent(destination)}`;
  if (origin) {
    return `${base}&origin=${origin.lat},${origin.lng}${dest}&travelmode=driving`;
  }
  return `${base}${dest}&travelmode=driving`;
}

async function geocodeAddress(address: string): Promise<LatLng | null> {
  const res = await fetch(
    `/api/geocode?q=${encodeURIComponent(address)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const j = (await res.json()) as { lat?: number; lon?: number };
  if (
    typeof j.lat !== "number" ||
    typeof j.lon !== "number" ||
    !Number.isFinite(j.lat) ||
    !Number.isFinite(j.lon)
  ) {
    return null;
  }
  return { lat: j.lat, lng: j.lon };
}

type OsrmRouteResult = {
  path: [number, number][];
  durationSec: number;
  distanceM: number;
};

function formatDriveEta(durationSec: number, distanceM: number): string {
  const minutes = Math.max(1, Math.round(durationSec / 60));
  const dist =
    distanceM >= 1000
      ? `${(distanceM / 1000).toFixed(1).replace(".", ",")} km`
      : `${Math.round(distanceM)} m`;
  if (durationSec < 90) return `≈ moins de 2 min · ${dist}`;
  if (minutes < 60) return `≈ ${minutes} min · ${dist}`;
  const h = Math.floor(minutes / 60);
  const minRem = minutes % 60;
  return `≈ ${h} h ${minRem} min · ${dist}`;
}

async function fetchOsrmRoute(
  from: LatLng,
  to: LatLng,
): Promise<OsrmRouteResult | null> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const j = (await res.json()) as {
      routes?: Array<{
        geometry?: { coordinates?: [number, number][] };
        duration?: number;
        distance?: number;
      }>;
    };
    const route = j.routes?.[0];
    if (!route) return null;
    const coords = route.geometry?.coordinates;
    if (!coords?.length) return null;
    const path = coords.map(([lon, lat]) => [lat, lon] as [number, number]);
    const durationSec =
      typeof route.duration === "number" && Number.isFinite(route.duration)
        ? route.duration
        : 0;
    const distanceM =
      typeof route.distance === "number" && Number.isFinite(route.distance)
        ? route.distance
        : 0;
    return { path, durationSec, distanceM };
  } catch {
    return null;
  }
}

function getCurrentPositionAsync(
  options: PositionOptions,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function geolocationErrorMessage(e: GeolocationPositionError): string {
  if (e.code === e.PERMISSION_DENIED) {
    return "Autorisez la géolocalisation dans le navigateur pour afficher l’itinéraire jusqu’à vous.";
  }
  if (e.code === e.POSITION_UNAVAILABLE) {
    return "Position indisponible (GPS ou réseau). Réessayez près d’une fenêtre ou activez le Wi‑Fi.";
  }
  if (e.code === e.TIMEOUT) {
    return "La position met trop longtemps à arriver. Réessayez : on a d’abord utilisé le réseau, puis le GPS. Vous pouvez aussi vérifier le Wi‑Fi / les données mobiles.";
  }
  return "Impossible d’obtenir votre position.";
}

function useUserGeolocation(): {
  position: LatLng | null;
  pending: boolean;
  error: string | null;
  retry: () => void;
} {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setPosition(null);
    setPending(true);
    setAttemptId((a) => a + 1);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const t = window.setTimeout(() => {
        setError("La géolocalisation n’est pas disponible sur cet appareil.");
        setPending(false);
      }, 0);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;

    const finishSuccess = (p: GeolocationPosition) => {
      if (cancelled) return;
      setPosition({
        lat: p.coords.latitude,
        lng: p.coords.longitude,
      });
      setError(null);
      setPending(false);
    };

    const finishError = (e: GeolocationPositionError) => {
      if (cancelled) return;
      setError(geolocationErrorMessage(e));
      setPending(false);
    };

    void (async () => {
      const networkFirst: PositionOptions = {
        enableHighAccuracy: false,
        timeout: 50_000,
        maximumAge: 300_000,
      };
      const gpsFallback: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 45_000,
        maximumAge: 0,
      };

      try {
        const p = await getCurrentPositionAsync(networkFirst);
        finishSuccess(p);
      } catch (first) {
        const e = first as GeolocationPositionError;
        if (e.code === e.PERMISSION_DENIED) {
          finishError(e);
          return;
        }
        try {
          const p = await getCurrentPositionAsync(gpsFallback);
          finishSuccess(p);
        } catch (second) {
          finishError(second as GeolocationPositionError);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  return { position, pending, error, retry };
}

function VendorLeafletMap({
  vendorName,
  vendorPos,
  userPos,
  routeLatLngs,
}: {
  vendorName: string;
  vendorPos: LatLng;
  userPos: LatLng | null;
  routeLatLngs: [number, number][] | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let alive = true;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const disposeMapIfCurrent = (m: import("leaflet").Map) => {
      try {
        m.remove();
      } catch {
        /* déjà détruite */
      }
      if (mapRef.current === m) mapRef.current = null;
    };

    const safeInvalidate = () => {
      if (!alive) return;
      const map = mapRef.current;
      if (!map) return;
      try {
        map.invalidateSize();
      } catch {
        /* carte déjà détruite ou conteneur hors DOM */
      }
    };

    void (async () => {
      await import("leaflet/dist/leaflet.css");
      const L = (await import("leaflet")).default;
      if (!alive || !containerRef.current) return;

      const storeIcon = L.divIcon({
        className: "checkout-map-marker-root",
        html: '<span class="checkout-map-pin checkout-map-pin--store" aria-hidden="true">🏪</span>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      const userIcon = L.divIcon({
        className: "checkout-map-marker-root",
        html: '<span class="checkout-map-pin checkout-map-pin--user" aria-hidden="true">📍</span>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const m = L.map(el, { scrollWheelZoom: false }).setView(
        [vendorPos.lat, vendorPos.lng],
        13,
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

      const vMarker = L.marker([vendorPos.lat, vendorPos.lng], {
        icon: storeIcon,
      }).addTo(m);
      const popupV = document.createElement("div");
      popupV.textContent = vendorName;
      vMarker.bindPopup(popupV);

      if (userPos) {
        const uMarker = L.marker([userPos.lat, userPos.lng], {
          icon: userIcon,
        }).addTo(m);
        const popupU = document.createElement("div");
        popupU.textContent = "Vous";
        uMarker.bindPopup(popupU);
      }

      const line =
        routeLatLngs && routeLatLngs.length >= 2
          ? routeLatLngs.map(([lat, lng]) => L.latLng(lat, lng))
          : userPos
            ? [
                L.latLng(userPos.lat, userPos.lng),
                L.latLng(vendorPos.lat, vendorPos.lng),
              ]
            : null;

      if (!alive) {
        disposeMapIfCurrent(m);
        return;
      }

      try {
        if (line && line.length >= 2) {
          L.polyline(line, {
            color: "#007bff",
            weight: 4,
            opacity: 0.88,
          }).addTo(m);
          m.fitBounds(L.latLngBounds(line), { padding: [28, 28] });
        } else {
          m.setView([vendorPos.lat, vendorPos.lng], 14);
        }
      } catch {
        try {
          m.setView([vendorPos.lat, vendorPos.lng], 14);
        } catch {
          /* ignore */
        }
      }

      if (!alive) {
        disposeMapIfCurrent(m);
        return;
      }
      requestAnimationFrame(safeInvalidate);
      resizeTimer = setTimeout(safeInvalidate, 200);
    })();

    return () => {
      alive = false;
      if (resizeTimer) clearTimeout(resizeTimer);
      const map = mapRef.current;
      if (map) {
        try {
          map.remove();
        } catch {
          /* ignore */
        }
        mapRef.current = null;
      }
    };
  }, [vendorPos.lat, vendorPos.lng, userPos, vendorName, routeLatLngs]);

  return (
    <div
      ref={containerRef}
      className="z-0 h-56 w-full rounded-2xl border border-foreground/10 sm:h-64"
      aria-label={`Carte : ${vendorName}`}
    />
  );
}

function VendorRouteCard({
  group,
  index,
  userPos,
  geoPending,
  geoFailed,
}: {
  group: CartVendorGroup;
  index: number;
  userPos: LatLng | null;
  geoPending: boolean;
  /** true quand la géolocalisation a échoué (message affiché dans la bannière du bloc checkout). */
  geoFailed: boolean;
}) {
  const firstProduct = group.lines[0]?.product;

  const exactShopPos = useMemo((): LatLng | null => {
    const la = firstProduct?.vendorLatitude;
    const lo = firstProduct?.vendorLongitude;
    if (
      typeof la === "number" &&
      typeof lo === "number" &&
      Number.isFinite(la) &&
      Number.isFinite(lo) &&
      la >= -90 &&
      la <= 90 &&
      lo >= -180 &&
      lo <= 180
    ) {
      return { lat: la, lng: lo };
    }
    return null;
  }, [firstProduct?.vendorLatitude, firstProduct?.vendorLongitude]);

  const hasExactShopPoint = exactShopPos !== null;

  const address = useMemo(() => {
    const raw = firstProduct?.vendorLocation?.trim() ?? "";
    return raw.length > 0 ? raw : "";
  }, [firstProduct?.vendorLocation]);

  const [geocodedPos, setGeocodedPos] = useState<LatLng | null>(null);
  const [geocodePending, setGeocodePending] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][] | null>(null);
  const [routeMeta, setRouteMeta] = useState<{
    durationSec: number;
    distanceM: number;
  } | null>(null);

  const resolvedVendorPos = exactShopPos ?? geocodedPos;

  useEffect(() => {
    if (hasExactShopPoint) return;
    if (!address) return;

    let cancelled = false;
    const staggerMs = index * 1200;
    const startId = window.setTimeout(() => {
      if (cancelled) return;
      setGeocodePending(true);
      setGeocodeError(null);
      void (async () => {
        await new Promise((r) => setTimeout(r, staggerMs));
        if (cancelled) return;
        const pos = await geocodeAddress(address);
        if (cancelled) return;
        if (!pos) {
          setGeocodeError(
            "Nous n’avons pas pu situer ce commerce à partir de l’adresse indiquée.",
          );
          setGeocodedPos(null);
        } else {
          setGeocodedPos(pos);
        }
        setGeocodePending(false);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(startId);
    };
  }, [address, index, hasExactShopPoint]);

  useEffect(() => {
    if (!resolvedVendorPos || !userPos) return;

    let cancelled = false;
    void (async () => {
      const osrm = await fetchOsrmRoute(userPos, resolvedVendorPos);
      if (cancelled) return;
      if (osrm && osrm.path.length >= 2) {
        setRoutePath(osrm.path);
        if (osrm.durationSec > 0 && osrm.distanceM > 0) {
          setRouteMeta({
            durationSec: osrm.durationSec,
            distanceM: osrm.distanceM,
          });
        } else {
          setRouteMeta(null);
        }
      } else {
        setRoutePath([
          [userPos.lat, userPos.lng],
          [resolvedVendorPos.lat, resolvedVendorPos.lng],
        ]);
        setRouteMeta(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedVendorPos, userPos]);

  const routeForMap = useMemo((): [number, number][] | null => {
    if (!resolvedVendorPos || !userPos) return null;
    if (routePath && routePath.length >= 2) return routePath;
    return [
      [userPos.lat, userPos.lng],
      [resolvedVendorPos.lat, resolvedVendorPos.lng],
    ];
  }, [resolvedVendorPos, userPos, routePath]);

  const destForMaps =
    address.length > 0
      ? address
      : resolvedVendorPos
        ? `${resolvedVendorPos.lat},${resolvedVendorPos.lng}`
        : null;
  const mapsLink = destForMaps
    ? googleMapsDirectionsUrl(destForMaps, userPos)
    : null;

  if (!address && !hasExactShopPoint) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/15 bg-foreground/[0.02] p-4 text-sm text-muted">
        <p className="font-medium text-foreground">{group.vendorName}</p>
        <p className="mt-1">
          Nous n’avons ni adresse ni emplacement précis pour ce commerce, donc nous ne
          pouvons pas tracer le trajet. Le vendeur peut indiquer où retirer la commande
          depuis son espace vendeur.
        </p>
      </div>
    );
  }

  const geocodePendingUi = hasExactShopPoint ? false : geocodePending;

  return (
    <div className="space-y-2 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{group.vendorName}</p>
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-boma-blue underline-offset-2 hover:underline"
          >
            Ouvrir dans Google Maps
          </a>
        )}
      </div>
      {hasExactShopPoint ? (
        <p className="text-xs font-medium leading-relaxed text-emerald-800 dark:text-emerald-300/95">
          Ce commerce a indiqué un endroit précis pour le retrait : le trajet et la durée
          affichés partent de ce point.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/85">
          Nous positionnons le commerce à partir de son adresse. Pour un trajet plus
          juste, le vendeur peut préciser l’endroit exact sur la carte dans son espace
          vendeur.
        </p>
      )}
      {address ? (
        <p className="text-xs leading-relaxed text-muted">{address}</p>
      ) : null}
      {geocodePendingUi && (
        <p className="text-xs text-muted">Repérage du commerce sur la carte…</p>
      )}
      {geocodeError && (
        <p className="text-xs text-amber-700 dark:text-amber-400">{geocodeError}</p>
      )}
      {geoPending && !geoFailed && (
        <p className="text-xs text-muted">Localisation de votre position…</p>
      )}
      {!geoPending && !userPos && !geoFailed && (
        <p className="text-xs text-muted">
          Nous n’avons pas votre position : la carte montre seulement le commerce.
          Autorisez la localisation dans votre navigateur pour voir le trajet jusqu’à
          vous.
        </p>
      )}
      {resolvedVendorPos && (
        <>
          <VendorLeafletMap
            vendorName={group.vendorName}
            vendorPos={resolvedVendorPos}
            userPos={userPos}
            routeLatLngs={routeForMap}
          />
          {userPos &&
            routeMeta &&
            (routeMeta.durationSec > 0 || routeMeta.distanceM > 0) && (
            <p className="text-xs font-medium text-foreground">
              Durée et distance indicatives en voiture :{" "}
              {formatDriveEta(routeMeta.durationSec, routeMeta.distanceM)}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function CheckoutRouteMaps({
  vendorGroups,
}: {
  vendorGroups: CartVendorGroup[];
}) {
  const { position, pending, error, retry } = useUserGeolocation();

  if (vendorGroups.length === 0) return null;

  return (
    <section
      className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4"
      aria-label="Trajets vers les commerces"
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Trajet commerce → vous
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          La carte montre le chemin entre vous et le lieu de retrait du commerce. Quand
          le vendeur a placé son point de retrait sur la carte, nous nous appuyons sur
          ce marqueur ; sinon nous utilisons son adresse, ce qui peut être un peu moins
          précis. En pratique, le livreur peut emprunter un autre itinéraire.
        </p>
      </div>
      {error && !pending && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-foreground">{error}</p>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 self-start px-4 py-2 text-xs sm:self-auto"
            onClick={retry}
          >
            Réessayer la localisation
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {vendorGroups.map((g, i) => (
          <VendorRouteCard
            key={g.vendorId}
            group={g}
            index={i}
            userPos={position}
            geoPending={pending}
            geoFailed={Boolean(error && !pending)}
          />
        ))}
      </div>
    </section>
  );
}
