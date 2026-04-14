import { createClient } from "@/lib/supabase/server";

type Payload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function isEmailLike(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { error: "Service indisponible." },
      { status: 503 },
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = asString(body.name);
  const email = asString(body.email);
  const phone = asString(body.phone);
  const subject = asString(body.subject);
  const message = asString(body.message);

  if (name.length < 2) {
    return Response.json({ error: "Nom trop court." }, { status: 400 });
  }
  if (!isEmailLike(email)) {
    return Response.json({ error: "Email invalide." }, { status: 400 });
  }
  if (subject.length < 3) {
    return Response.json({ error: "Objet trop court." }, { status: 400 });
  }
  if (message.length < 10) {
    return Response.json({ error: "Message trop court." }, { status: 400 });
  }

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone: phone || null,
    subject,
    message,
  });

  if (error) {
    return Response.json(
      { error: "Impossible d’envoyer le message." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}

