import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Géocodage serveur (Nominatim) pour le checkout — évite d’exposer le navigateur
 * et permet un User-Agent conforme à la politique d’usage.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return NextResponse.json({ error: "Adresse trop courte." }, { status: 400 });
  }
  if (q.length > 280) {
    return NextResponse.json({ error: "Adresse trop longue." }, { status: 400 });
  }

  const nominatim = new URL("https://nominatim.openstreetmap.org/search");
  nominatim.searchParams.set("q", q);
  nominatim.searchParams.set("format", "json");
  nominatim.searchParams.set("limit", "1");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://localhost";
  const ua =
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    `BOMA/1.0 (+${appUrl}; checkout geocoder)`;

  const res = await fetch(nominatim.toString(), {
    headers: {
      "User-Agent": ua,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Service de géocodage indisponible." },
      { status: 502 },
    );
  }

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name?: string;
  }>;
  const hit = data[0];
  if (!hit) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Coordonnées invalides." }, { status: 502 });
  }

  return NextResponse.json({
    lat,
    lon,
    display_name: hit.display_name,
  });
}
