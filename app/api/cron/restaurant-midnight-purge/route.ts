import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

/**
 * À appeler chaque minuit (heure du marché), ex. cron Vercel.
 * Sécurité : header Authorization: Bearer <CRON_SECRET>
 *
 * Fuseau par défaut Libreville (UTC+1) : minuit local = 23:00 UTC → schedule `0 23 * * *`.
 * Ajustez si BOMA_MARKET_TIMEZONE change.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET non défini dans l’environnement." },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY ou URL Supabase manquant — impossible d’exécuter la purge.",
      },
      { status: 503 },
    );
  }

  const { data, error } = await admin.rpc("purge_restaurant_products_midnight");

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("purge_restaurant_products_midnight") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return NextResponse.json(
        {
          error:
            "Fonction SQL absente : appliquez les migrations Supabase (purge_restaurant_products_midnight).",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const blockedCount = typeof data === "number" ? data : 0;

  revalidatePath("/marketplace");
  revalidatePath("/seller");

  return NextResponse.json({
    ok: true,
    blockedCount,
    message:
      "Plats restaurant actifs passés en statut bloqué (hors marché). Les commerçants peuvent republier.",
  });
}
