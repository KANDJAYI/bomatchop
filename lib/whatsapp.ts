/** Chiffres uniquement, format attendu par wa.me (indicatif pays inclus, sans +). */
export function toWhatsAppDigits(phoneRaw: string): string | null {
  const digits = phoneRaw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function buildWhatsAppChatUrl(phoneRaw: string, message?: string): string | null {
  const digits = toWhatsAppDigits(phoneRaw);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}
