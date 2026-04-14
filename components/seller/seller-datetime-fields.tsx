"use client";

import { useState } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** YYYY-MM-DD */
export function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** HH:mm pour <input type="time"> */
export function toTimeInputValue(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Pour édition : découpe une date ISO en champs date/heure locaux. */
export function localPartsFromIso(iso: string | null | undefined): {
  date: string;
  time: string;
} | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return { date: toDateInputValue(d), time: toTimeInputValue(d) };
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function mergeLocalDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return "";
  const t = timeStr?.length >= 4 ? timeStr : "12:00";
  const timePart = t.length === 5 ? `${t}:00` : t;
  return `${dateStr}T${timePart}`;
}

type DlcProps = {
  /** Édition : ISO timestamptz depuis la base. Remonter le composant avec une `key` pour réinitialiser (ex. après reset formulaire). */
  initialExpiresAt?: string | null;
};

function dlcInitialState(initialExpiresAt?: string | null) {
  const parts = localPartsFromIso(initialExpiresAt);
  if (parts) return parts;
  return { date: toDateInputValue(addDays(new Date(), 30)), time: "23:59" };
}

/** DLC supermarché : date + heure + raccourcis +14 / +30 / +60 jours */
export function SellerDlcFields({ initialExpiresAt }: DlcProps) {
  const init = dlcInitialState(initialExpiresAt);
  const [date, setDate] = useState(init.date);
  const [time, setTime] = useState(init.time);

  const minDlc = addDays(new Date(), 14);
  const minStr = toDateInputValue(minDlc);

  function applyPreset(daysFromNow: number) {
    const d = addDays(new Date(), daysFromNow);
    setDate(toDateInputValue(d));
    setTime("23:59");
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">Date limite de consommation (DLC)</span>
      <p className="text-xs text-muted leading-relaxed">
        Minimum <strong>14 jours</strong> après aujourd’hui pour être accepté. La réduction
        sur le prix normal dépend de l’écart jusqu’à la DLC au moment de la publication :{" "}
        <strong>−20 %</strong> à partir de 2 mois, <strong>−30 %</strong> entre 1 et 2 mois,{" "}
        <strong>−50 %</strong> entre 2 semaines et 1 mois. Heure souvent en fin de journée
        (ex. 23:59).
      </p>
      <div className="flex flex-wrap gap-2">
        <PresetChip label="+14 jours (min.)" onClick={() => applyPreset(14)} />
        <PresetChip label="+30 jours" onClick={() => applyPreset(30)} />
        <PresetChip label="+60 jours" onClick={() => applyPreset(60)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Jour
          </span>
          <input
            type="date"
            required
            min={minStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="boma-field min-h-12 rounded-2xl bg-background px-3 py-3 text-base"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Heure
          </span>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="boma-field min-h-12 rounded-2xl bg-background px-3 py-3 text-base"
          />
        </label>
      </div>
      <HiddenMerged name="expires_at" date={date} time={time} />
    </div>
  );
}

type RestaurantProps = {
  /** Remonter avec une `key` pour réinitialiser (ex. `formKey`). */
  initialPreparedAt?: string | null;
};

function restaurantPrepInitialState(initialPreparedAt?: string | null) {
  const prep = localPartsFromIso(initialPreparedAt);
  if (prep) return { prepDate: prep.date, prepTime: prep.time };
  const n = new Date();
  return { prepDate: toDateInputValue(n), prepTime: toTimeInputValue(n) };
}

/** Restaurant : heure de préparation uniquement (fin de journée / limite imposée côté serveur). */
export function SellerRestaurantTimeFields({ initialPreparedAt }: RestaurantProps) {
  const init = restaurantPrepInitialState(initialPreparedAt);
  const [prepDate, setPrepDate] = useState(init.prepDate);
  const [prepTime, setPrepTime] = useState(init.prepTime);

  function setPrepNow() {
    const n = new Date();
    setPrepDate(toDateInputValue(n));
    setPrepTime(toTimeInputValue(n));
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">Heure de préparation</span>
      <p className="text-xs text-muted leading-relaxed">
        <strong>Obligatoire.</strong> Indiquez quand le plat est (ou sera) prêt. Les clients
        s’en servent pour organiser le retrait.
      </p>
      <div className="flex flex-wrap gap-2">
        <PresetChip label="Maintenant" onClick={setPrepNow} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Jour
          </span>
          <input
            type="date"
            required
            value={prepDate}
            onChange={(e) => setPrepDate(e.target.value)}
            className="boma-field min-h-12 rounded-2xl bg-background px-3 py-3 text-base"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Heure
          </span>
          <input
            type="time"
            required
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            className="boma-field min-h-12 rounded-2xl bg-background px-3 py-3 text-base"
          />
        </label>
      </div>
      <HiddenMerged name="prepared_at" date={prepDate} time={prepTime} />
    </div>
  );
}

/** Champ caché pour le serveur (createProductAction lit expires_at, etc.) */
function HiddenMerged({
  name,
  date,
  time,
}: {
  name: string;
  date: string;
  time: string;
}) {
  const v = mergeLocalDateTime(date, time);
  return <input type="hidden" name={name} value={v} />;
}

function PresetChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-boma-blue/10 hover:shadow-[0_0_16px_-4px_var(--boma-glow-blue)] active:scale-[0.98]"
    >
      {label}
    </button>
  );
}
