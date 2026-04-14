import {
  getSupermarketDlcDisplay,
  getSupermarketPublicationProgress,
} from "@/lib/format-supermarket-dlc";

function DlcCalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3.25" y="5.25" width="17.5" height="15.5" rx="2.25" />
      <path d="M8 3.25v4M16 3.25v4M3.25 10.25h17.5" />
      <path d="M12 14v2.25l1.25 1" />
    </svg>
  );
}

export type SupermarketDlcBlockSize = "sm" | "md" | "lg";

type Props = {
  expiresAtIso: string;
  /** Date de création (ISO) : sert à la barre de durée de publication. */
  createdAtIso?: string | null;
  /** sm = panier / checkout / tableau ; md = carte produit ; lg = fiche détail */
  size?: SupermarketDlcBlockSize;
  className?: string;
};

/**
 * Bloc visuel unifié pour la DLC supermarché (lisibilité + couleurs BOMA-compatibles).
 */
export function SupermarketDlcBlock({
  expiresAtIso,
  createdAtIso = null,
  size = "md",
  className = "",
}: Props) {
  const d = getSupermarketDlcDisplay(expiresAtIso);
  if (!d) return null;

  const expired = d.remaining.startsWith("DLC dépass");
  const pub = createdAtIso
    ? getSupermarketPublicationProgress(createdAtIso, expiresAtIso)
    : null;

  const shell =
    expired
      ? [
          "border-red-300/60 bg-gradient-to-br from-red-50/95 via-white to-orange-50/50 shadow-sm ring-1 ring-red-500/10",
          "dark:border-red-500/35 dark:from-red-950/50 dark:via-card dark:to-orange-950/20 dark:ring-red-500/15",
        ].join(" ")
      : [
          "border-teal-300/55 bg-gradient-to-br from-teal-50/95 via-white to-cyan-50/55 shadow-sm ring-1 ring-teal-500/[0.08]",
          "dark:border-teal-500/30 dark:from-teal-950/55 dark:via-card dark:to-cyan-950/25 dark:ring-teal-400/10",
        ].join(" ");

  const iconWrap =
    expired
      ? "bg-red-500/15 text-red-700 dark:bg-red-500/25 dark:text-red-200"
      : "bg-teal-500/[0.18] text-teal-800 dark:bg-teal-400/20 dark:text-teal-100";

  const titleC =
    expired
      ? "text-red-800/95 dark:text-red-100"
      : "text-teal-950 dark:text-teal-50";

  const subC =
    expired
      ? "text-red-800/85 dark:text-red-200/90"
      : "text-teal-900/88 dark:text-teal-100/88";

  const labelC =
    expired
      ? "text-red-700/90 dark:text-red-300/95"
      : "text-teal-800/90 dark:text-teal-200/95";

  if (size === "lg") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl ${shell} ${expired ? "border-l-[4px] border-l-red-500" : "border-l-[4px] border-l-teal-500"} px-5 py-4 sm:px-6 sm:py-5 ${className}`}
        role="region"
        aria-label="Date limite de consommation"
      >
        <div
          className={`pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full ${expired ? "bg-red-400/10" : "bg-teal-400/10"} blur-2xl dark:opacity-70`}
        />
        <div className="relative flex gap-4 sm:gap-5">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${iconWrap}`}
          >
            <DlcCalendarIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p
              className={`text-[11px] font-bold uppercase tracking-[0.16em] ${labelC}`}
            >
              Date limite de consommation
            </p>
            <p className={`text-lg font-semibold leading-snug tracking-tight sm:text-xl ${titleC}`}>
              {d.remaining}
            </p>
            <p className={`text-sm leading-relaxed ${subC}`}>
              À consommer avant le{" "}
              <span className={`font-semibold ${titleC}`}>{d.deadlineShort}</span>
            </p>
            {pub ? (
              <div className="pt-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className={`min-w-0 flex-1 break-words text-[11px] font-semibold ${labelC}`}>
                    {pub.label}
                  </span>
                  <span className={`shrink-0 whitespace-nowrap text-[11px] font-bold ${titleC}`}>
                    {pub.remainingDays === 0
                      ? "Suppression imminente"
                      : `${pub.remainingDays} j restants`}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/5 ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
                  <div
                    className={`h-full rounded-full ${expired ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-400"}`}
                    style={{ width: `${Math.round(pub.ratio * 100)}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (size === "sm") {
    return (
      <div
        className={`flex min-w-0 w-full items-start gap-2 rounded-lg border px-2.5 py-2 ${shell} ${className}`}
        role="note"
      >
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconWrap}`}
        >
          <DlcCalendarIcon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5 overflow-hidden">
          <p className={`break-words text-[11px] font-semibold leading-snug ${titleC}`}>
            {d.remaining}
          </p>
          <p className={`break-words text-[10px] font-medium leading-snug ${subC}`}>
            Avant le <span className={titleC}>{d.deadlineShort}</span>
          </p>
          {pub ? (
            <div className="pt-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[10px] font-semibold">
                <span className={`min-w-0 flex-1 break-words ${labelC}`}>{pub.label}</span>
                <span className={`shrink-0 whitespace-nowrap ${titleC}`}>{pub.remainingDays} j</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className={`${expired ? "bg-red-500" : "bg-teal-500"} h-full rounded-full`}
                  style={{ width: `${Math.round(pub.ratio * 100)}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  /* md — cartes catalogue */
  return (
    <div
      className={`flex min-w-0 w-full max-w-full gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 ${shell} ${className}`}
      role="note"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconWrap}`}
      >
        <DlcCalendarIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5 overflow-hidden">
        <p
          className={`break-words text-[13px] font-semibold leading-tight tracking-tight ${titleC}`}
        >
          {d.remaining}
        </p>
        <p className={`break-words text-[11px] font-medium leading-snug ${subC}`}>
          À consommer avant le <span className={`font-semibold ${titleC}`}>{d.deadlineShort}</span>
        </p>
        {pub ? (
          <div className="pt-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11px] font-semibold">
              <span className={`min-w-0 flex-1 break-words ${labelC}`}>{pub.label}</span>
              <span className={`shrink-0 whitespace-nowrap ${titleC}`}>{pub.remainingDays} j</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div
                className={`${expired ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-teal-500 to-sky-400"} h-full rounded-full`}
                style={{ width: `${Math.round(pub.ratio * 100)}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
