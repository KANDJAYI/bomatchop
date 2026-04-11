type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  accent?: "blue" | "emerald" | "amber" | "violet" | "slate";
};

const orb: Record<NonNullable<StatCardProps["accent"]>, string> = {
  blue: "bg-blue-500/20 dark:bg-blue-500/25",
  emerald: "bg-emerald-500/20 dark:bg-emerald-500/20",
  amber: "bg-amber-500/20 dark:bg-amber-500/20",
  violet: "bg-violet-500/20 dark:bg-violet-500/20",
  slate: "bg-slate-400/20 dark:bg-slate-500/20",
};

export function StatCard({ label, value, hint, accent = "slate" }: StatCardProps) {
  return (
    <div className="admin-panel relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm dark:bg-[#12161c]">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl ${orb[accent]}`}
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
