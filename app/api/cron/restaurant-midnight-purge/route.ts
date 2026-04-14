import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

/**
 * Purge des plats restaurant (RPC `purge_restaurant_products_midnight`).
 *
 * Ce endpoint ne tourne pas tout seul à minuit sur votre PC : il doit être appelé par
 * un planificateur (Vercel Cron en prod, ou pg_cron sur Supabase — voir migration
 * `20260416120000_pg_cron_restaurant_midnight_purge.sql`).
 *
 * En local : `npm run purge:restaurant` (avec service_role dans .env.local).
 *
 * Sécurité : header `Authorization: Bearer <CRON_SECRET>`.
 * Minuit UTC+1 (ex. Libreville) ≈ 23:00 UTC → Vercel `vercel.json` utilise `0 23 * * *`.
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
    affectedCount: blockedCount,
    blockedCount,
    message:
      "Purge BOMA minuit : plats restaurant retirés du marché (suppression s’ils n’ont jamais été commandés, sinon statut bloqué pour conserver l’historique des commandes).",
  });
}
