"use client";

import { useMemo, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const canSend = useMemo(() => {
    if (status === "sending") return false;
    if (name.trim().length < 2) return false;
    if (!validateEmail(email)) return false;
    if (subject.trim().length < 3) return false;
    if (message.trim().length < 10) return false;
    return true;
  }, [email, message, name, status, subject]);

  async function submit() {
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
        }),
      });
      const data = (await res.json()) as { ok?: true; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "SEND_FAILED");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Impossible d’envoyer le message.",
      );
    }
  }

  return (
    <div className="boma-panel boma-panel--glow rounded-3xl bg-card p-6 shadow-sm ring-1 ring-foreground/[0.05] dark:ring-white/[0.06] sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground/90">
          Écrivez-nous
        </p>
        <p className="text-sm text-muted">
          Support, partenariat, compte vendeur… on vous répond rapidement.
        </p>
      </div>

      {status === "sent" ? (
        <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
          Message envoyé. Merci, on revient vers vous au plus vite.
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground/90">
          Nom
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="boma-field rounded-2xl px-4 py-3 text-foreground"
            placeholder="Votre nom"
            autoComplete="name"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground/90">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="boma-field rounded-2xl px-4 py-3 text-foreground"
            placeholder="vous@exemple.com"
            autoComplete="email"
            inputMode="email"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground/90">
          Téléphone (optionnel)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="boma-field rounded-2xl px-4 py-3 text-foreground"
            placeholder="+241 …"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground/90">
          Objet
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="boma-field rounded-2xl px-4 py-3 text-foreground"
            placeholder="Ex. Partenariat / Problème de commande"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-foreground/90">
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="boma-field min-h-[140px] resize-y rounded-2xl px-4 py-3 text-foreground"
          placeholder="Dites-nous ce dont vous avez besoin…"
        />
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          En envoyant, vous acceptez d’être recontacté par l’équipe BOMA.
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className="pressable inline-flex items-center justify-center rounded-full bg-boma-blue px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-boma-blue/20 transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {status === "sending" ? "Envoi…" : "Envoyer le message"}
        </button>
      </div>
    </div>
  );
}

