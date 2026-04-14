/**
 * Lance la purge SQL des plats restaurant (minuit marché).
 * Usage : npm run purge:restaurant
 * Nécessite NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) {
  console.error(
    "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (voir .env.example).",
  );
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.rpc("purge_restaurant_products_midnight");
if (error) {
  console.error("Erreur RPC purge_restaurant_products_midnight :", error.message);
  process.exit(1);
}

console.log("Purge terminée. Lignes traitées (suppression + blocage) :", data);
