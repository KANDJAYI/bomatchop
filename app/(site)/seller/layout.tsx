import { redirect } from "next/navigation";
import { SellerProShell } from "@/components/seller/seller-pro-shell";
import {
  countUnreadVendorMessages,
  fetchSellerVendorForLayout,
} from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <SellerProShell vendor={null} userEmail="—" unreadMessages={0}>
        {children}
      </SellerProShell>
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return (
      <SellerProShell vendor={null} userEmail="—" unreadMessages={0}>
        {children}
      </SellerProShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/auth/login?next=/seller");
  }

  const { vendor } = await fetchSellerVendorForLayout(supabase, user.id);

  let unread = 0;
  if (vendor?.status === "approved") {
    unread = await countUnreadVendorMessages(supabase, vendor.id);
  }

  return (
    <SellerProShell
      vendor={
        vendor
          ? {
              id: vendor.id,
              business_name: vendor.business_name,
              business_type: vendor.business_type,
              status: vendor.status,
            }
          : null
      }
      userEmail={user.email}
      unreadMessages={unread}
    >
      {children}
    </SellerProShell>
  );
}
