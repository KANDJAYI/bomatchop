import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

/**
 * Purge des publications supermarché dont la durée est écoulée (RPC `purge_supermarket_publications_expired`).
 *
 * Ce endpoint doit être appelé par un planificateur (Vercel Cron en prod, ou pg_cron sur Supabase
 * — voir migration `20260416151000_pg_cron_supermarket_publication_purge.sql`).
 *
 * Sécurité : header `Authorization: Bearer <CRON_SECRET>`.
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

  const { data, error } = await admin.rpc("purge_supermarket_publications_expired");

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("purge_supermarket_publications_expired") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return NextResponse.json(
        {
          error:
            "Fonction SQL absente : appliquez les migrations Supabase (purge_supermarket_publications_expired).",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const affectedCount = typeof data === "number" ? data : 0;

  revalidatePath("/marketplace");
  revalidatePath("/seller");

  return NextResponse.json({
    ok: true,
    affectedCount,
    message:
      "Purge BOMA TCHOP : publications supermarché retirées du marché à la fin de leur durée (suppression si jamais commandées, sinon blocage pour conserver l’historique).",
  });
}

