import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
};

/** Marque BOMA : silhouette Gabon + motif masque stylisé + texte avec glow (cahier). */
export function Logo({ className = "", href = "/" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-boma-forest shadow-inner ring-1 ring-white/15"
        aria-hidden
      >
        <svg
          viewBox="0 0 40 40"
          className="h-8 w-8 text-boma-blue"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 4c-4 2-6 6-6 11 0 5 2 9 6 11 4-2 6-6 6-11 0-5-2-9-6-11z"
            fill="currentColor"
            opacity="0.35"
          />
          <path
            d="M12 28c2-6 8-10 16-10v8c-4 0-8 2-10 6l-6-4z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="20" cy="16" r="3" fill="#fff" opacity="0.9" />
          <path
            d="M16 22h8M18 26h4"
            stroke="#0b3d2e"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className="font-semibold tracking-tight text-xl text-boma-forest dark:text-white"
        style={{
          textShadow:
            "0 0 20px rgba(0, 123, 255, 0.45), 0 0 40px rgba(0, 123, 255, 0.2)",
        }}
      >
        BOMA
      </span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }
  return content;
}
