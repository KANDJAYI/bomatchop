import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function CheckoutPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        redirect("/auth/login?next=/checkout");
      }
    }
  }
  return <CheckoutClient />;
}
