"use client";

import { useState } from "react";
import {
  AdminSubscriptionAlerts,
  type AdminSubscriptionAlert,
} from "@/components/admin/admin-subscription-alerts";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminConsoleShellProps = {
  children: React.ReactNode;
  userEmail: string;
  displayName: string | null;
  subscriptionAlerts?: AdminSubscriptionAlert[];
};

export function AdminConsoleShell({
  children,
  userEmail,
  displayName,
  subscriptionAlerts = [],
}: AdminConsoleShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      data-admin-console
      className="admin-console isolate flex h-[100dvh] min-h-0 overflow-hidden bg-[#eef1f6] text-slate-900 dark:bg-[#050608] dark:text-slate-100"
    >
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-0">
        <AdminTopbar
          onOpenSidebar={() => setSidebarOpen(true)}
          userEmail={userEmail}
          displayName={displayName}
        />
        <AdminSubscriptionAlerts alerts={subscriptionAlerts} />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
