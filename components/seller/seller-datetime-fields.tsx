"use client";

import { useEffect, useState } from "react";

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

function addHours(d: Date, hours: number) {
  const x = new Date(d);
  x.setTime(x.getTime() + hours * 3600000);
  return x;
}

function mergeLocalDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return "";
  const t = timeStr?.length >= 4 ? timeStr : "12:00";
  const timePart = t.length === 5 ? `${t}:00` : t;
  return `${dateStr}T${timePart}`;
}

type ResetProps = {
  resetVersion: number;
  /** Édition : ISO timestamptz depuis la base */
  initialExpiresAt?: string | null;
};

/** DLC supermarché / boutique : date + heure + raccourcis +14 / +30 / +60 jours */
export function SellerDlcFields({
  resetVersion,
  initialExpiresAt,
}: ResetProps) {
  const [date, setDate] = useState(() =>
    toDateInputValue(addDays(new Date(), 30)),
  );
  const [time, setTime] = useState("23:59");

  const minDlc = addDays(new Date(), 14);
  const minStr = toDateInputValue(minDlc);

  useEffect(() => {
    const parts = localPartsFromIso(initialExpiresAt);
    if (parts) {
      setDate(parts.date);
      setTime(parts.time);
      return;
    }
    setDate(toDateInputValue(addDays(new Date(), 30)));
    setTime("23:59");
  }, [resetVersion, initialExpiresAt]);

  function applyPreset(daysFromNow: number) {
    const d = addDays(new Date(), daysFromNow);
    setDate(toDateInputValue(d));
    setTime("23:59");
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">Date limite de consommation (DLC)</span>
      <p className="text-xs text-muted leading-relaxed">
        Minimum <strong>14 jours</strong> après aujourd’hui pour être accepté. Heure
        souvent fixée en fin de journée (ex. 23:59).
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

type RestaurantResetProps = ResetProps & {
  initialPreparedAt?: string | null;
  initialConsumeBy?: string | null;
};

/** Restaurant : heure de préparation + heure d’expiration (toutes deux obligatoires) */
export function SellerRestaurantTimeFields({
  resetVersion,
  initialPreparedAt,
  initialConsumeBy,
}: RestaurantResetProps) {
  const [prepDate, setPrepDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [prepTime, setPrepTime] = useState(() => toTimeInputValue(new Date()));
  const [consumeDate, setConsumeDate] = useState(() =>
    toDateInputValue(addHours(new Date(), 6)),
  );
  const [consumeTime, setConsumeTime] = useState(() =>
    toTimeInputValue(addHours(new Date(), 6)),
  );

  useEffect(() => {
    const prep = localPartsFromIso(initialPreparedAt);
    const cons = localPartsFromIso(initialConsumeBy);
    if (prep && cons) {
      setPrepDate(prep.date);
      setPrepTime(prep.time);
      setConsumeDate(cons.date);
      setConsumeTime(cons.time);
      return;
    }
    const n = new Date();
    const c = addHours(n, 6);
    setPrepDate(toDateInputValue(n));
    setPrepTime(toTimeInputValue(n));
    setConsumeDate(toDateInputValue(c));
    setConsumeTime(toTimeInputValue(c));
  }, [resetVersion, initialPreparedAt, initialConsumeBy]);

  function setConsumeFromHoursAhead(h: number) {
    const c = addHours(new Date(), h);
    setConsumeDate(toDateInputValue(c));
    setConsumeTime(toTimeInputValue(c));
  }

  function setConsumeTonightAt(hour: number, minute = 0) {
    const c = new Date();
    c.setHours(hour, minute, 0, 0);
    if (c.getTime() <= Date.now()) {
      c.setDate(c.getDate() + 1);
    }
    setConsumeDate(toDateInputValue(c));
    setConsumeTime(toTimeInputValue(c));
  }

  function setTomorrowAt(hour: number, minute = 0) {
    const c = addDays(new Date(), 1);
    c.setHours(hour, minute, 0, 0);
    setConsumeDate(toDateInputValue(c));
    setConsumeTime(toTimeInputValue(c));
  }

  function setPrepNow() {
    const n = new Date();
    setPrepDate(toDateInputValue(n));
    setPrepTime(toTimeInputValue(n));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-boma-blue/[0.06] px-4 py-3 text-xs leading-relaxed text-muted dark:bg-boma-blue/10">
        <strong className="text-foreground">Règles restaurant (BOMA)</strong>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <strong>Prix au moment de la publication</strong> (heure du marché, fuseau Libreville
            par défaut) : avant 22 h, réduction <strong>25 %</strong> (prix affiché = 75 % du prix
            catalogue) ; à partir de 22 h, réduction <strong>50 %</strong> (prix affiché = 50 %).
          </li>
          <li>
            Chaque <strong>minuit</strong>, les plats encore en ligne sont retirés du marché ; vous
            pourrez les republier le jour suivant.
          </li>
        </ul>
      </div>
      <div className="space-y-3">
        <span className="text-sm font-medium">Heure de préparation</span>
        <p className="text-xs text-muted leading-relaxed">
          <strong>Obligatoire.</strong> Date et heure auxquelles le plat a été (ou sera)
          prêt. Les clients voient cette information pour organiser le retrait.
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

      <div className="space-y-3 pt-5">
        <span className="text-sm font-medium">Heure d’expiration</span>
        <p className="text-xs text-muted leading-relaxed">
          <strong>Obligatoire.</strong> Date et heure limite pour consommer le plat. Doit
          être <strong>après</strong> la préparation, avec <strong>au moins 2 h</strong> et{" "}
          <strong>au plus 24 h</strong> entre les deux. L’expiration doit aussi être entre
          2 h et 24 h <strong>à partir de maintenant</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          <PresetChip label="Dans 3 h" onClick={() => setConsumeFromHoursAhead(3)} />
          <PresetChip label="Dans 6 h" onClick={() => setConsumeFromHoursAhead(6)} />
          <PresetChip label="Ce soir 20h" onClick={() => setConsumeTonightAt(20, 0)} />
          <PresetChip label="Demain midi" onClick={() => setTomorrowAt(12, 0)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Jour
            </span>
            <input
              type="date"
              required
              value={consumeDate}
              onChange={(e) => setConsumeDate(e.target.value)}
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
              value={consumeTime}
              onChange={(e) => setConsumeTime(e.target.value)}
              className="boma-field min-h-12 rounded-2xl bg-background px-3 py-3 text-base"
            />
          </label>
        </div>
        <HiddenMerged name="consume_by" date={consumeDate} time={consumeTime} />
      </div>
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
