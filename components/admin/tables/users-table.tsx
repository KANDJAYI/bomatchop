import Link from "next/link";

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "client" | "vendor" | "admin";
  created_at: string;
};

const ROLE_LABEL: Record<AdminUserRow["role"], string> = {
  client: "Client",
  vendor: "Vendeur",
  admin: "Admin",
};

const ROLE_BADGE: Record<AdminUserRow["role"], string> = {
  client:
    "bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/15 dark:text-slate-200",
  vendor:
    "bg-blue-500/10 text-blue-800 ring-1 ring-blue-500/20 dark:text-blue-200",
  admin:
    "bg-emerald-500/10 text-emerald-900 ring-1 ring-emerald-500/20 dark:text-emerald-200",
};

type Props = {
  users: AdminUserRow[];
  roleFilter: "all" | AdminUserRow["role"];
};

export function AdminUsersTable({ users, roleFilter }: Props) {
  if (!users.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300/80 py-12 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        Aucun utilisateur pour ce filtre.
      </p>
    );
  }

  return (
    <div className="admin-panel overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#12161c]">
      <div className="flex flex-wrap gap-2 border-b border-slate-200/90 px-5 py-3 dark:border-white/[0.06]">
        {(
          [
            ["all", "Tous"],
            ["client", "Clients"],
            ["vendor", "Vendeurs"],
            ["admin", "Admins"],
          ] as const
        ).map(([value, label]) => {
          const active = roleFilter === value;
          return (
            <Link
              key={value}
              href={value === "all" ? "/admin/users" : `/admin/users?role=${value}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Nom</th>
              <th className="px-5 py-3.5">E-mail</th>
              <th className="px-5 py-3.5">Téléphone</th>
              <th className="px-5 py-3.5">Rôle</th>
              <th className="px-5 py-3.5">Inscription</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {users.map((p) => (
              <tr
                key={p.id}
                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                  {p.full_name ?? "—"}
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                  {p.email ?? "—"}
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                  {p.phone ?? "—"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_BADGE[p.role]}`}
                  >
                    {ROLE_LABEL[p.role]}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/users/${p.id}`}
                    className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
