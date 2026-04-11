"use client";

import type { AdminChartsData } from "@/lib/admin/chart-data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = [
  "#007bff",
  "#0b3d2e",
  "#e4b82a",
  "#d92d3c",
  "#64748b",
  "#22c55e",
  "#a855f7",
  "#0ea5e9",
];

const tickMuted = { fill: "#64748b", fontSize: 11 };
const gridStroke = "#e2e8f0";

function formatFcfa(n: number) {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

type Props = { data: AdminChartsData };

export function AdminAnalyticsCharts({ data }: Props) {
  const ordersTotal = data.ordersByStatus.reduce((s, d) => s + d.value, 0);
  const emptyOrders =
    data.ordersByStatus.length === 0 || ordersTotal === 0;
  const vendorsTotal = data.vendorsByStatus.reduce((s, d) => s + d.value, 0);
  const emptyVendors =
    data.vendorsByStatus.length === 0 || vendorsTotal === 0;
  const usersTotal = data.usersByRole.reduce((s, d) => s + d.value, 0);
  const emptyUsers =
    data.usersByRole.length === 0 || usersTotal === 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-panel rounded-2xl bg-white p-5 shadow-sm dark:bg-[#12161c]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Commandes par statut
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Répartition (échantillon récent, max. 8 000 lignes)
          </p>
          <div className="mt-4 h-[280px] w-full min-h-[240px]">
            {emptyOrders ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                Pas encore de données.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ordersByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {data.ordersByStatus.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Commandes"]}
                    contentStyle={{
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="admin-panel rounded-2xl bg-white p-5 shadow-sm dark:bg-[#12161c]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Vendeurs par statut
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Dossiers commerçants
          </p>
          <div className="mt-4 h-[280px] w-full">
            {emptyVendors ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                Aucun vendeur en base.
              </p>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.vendorsByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={96}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.vendorsByStatus.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "Vendeurs"]}
                  contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-panel rounded-2xl bg-white p-5 shadow-sm dark:bg-[#12161c] lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Activité des 14 derniers jours
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Nombre de commandes et chiffre d’affaires (montants enregistrés)
          </p>
          <div className="mt-4 h-[300px] w-full">
            {data.ordersPerDay.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                Aucune commande sur les 14 derniers jours.
              </p>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.ordersPerDay} margin={{ left: 4, right: 8 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={tickMuted} />
                <YAxis
                  yAxisId="left"
                  tick={tickMuted}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={tickMuted}
                  tickFormatter={(v) =>
                    `${Math.round(Number(v) / 1000)}k`
                  }
                />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "ca"
                      ? [formatFcfa(value), "CA"]
                      : [value, "Commandes"]
                  }
                  contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="commandes"
                  name="Commandes"
                  stroke="#007bff"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ca"
                  name="CA (FCFA)"
                  stroke="#0b3d2e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="admin-panel rounded-2xl bg-white p-5 shadow-sm dark:bg-[#12161c] lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Utilisateurs par rôle
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Profils en base
          </p>
          <div className="mt-4 h-[260px] w-full">
            {emptyUsers ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                Aucun profil utilisateur.
              </p>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usersByRole} margin={{ left: 4, right: 8 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={tickMuted} />
                <YAxis tick={tickMuted} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [value, "Comptes"]}
                  contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                />
                <Bar dataKey="value" name="Utilisateurs" radius={[6, 6, 0, 0]}>
                  {data.usersByRole.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
