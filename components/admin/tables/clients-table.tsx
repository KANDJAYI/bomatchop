export type ClientProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export function AdminClientsTable({ clients }: { clients: ClientProfileRow[] }) {
  if (!clients.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300/80 py-12 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        Aucun client enregistré.
      </p>
    );
  }

  return (
    <div className="admin-panel overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#12161c]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Nom</th>
              <th className="px-5 py-3.5">E-mail</th>
              <th className="px-5 py-3.5">Téléphone</th>
              <th className="px-5 py-3.5">Inscription</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {clients.map((p) => (
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
                <td className="px-5 py-4 text-xs text-slate-500">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
