import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "forest" | "cta";

const glowHover =
  "hover:shadow-[0_0_32px_-6px_var(--boma-glow-blue),0_0_52px_-14px_var(--boma-glow-gold)]";
const glowActive =
  "active:shadow-[0_0_28px_-2px_var(--boma-glow-blue),0_0_40px_-8px_var(--boma-glow-gold)]";

/** CTA fort : checkout, confirmation unique — relief, lumière, dark mode calibré. */
const ctaVariant =
  "relative isolate !rounded-2xl !px-8 !py-3.5 text-[15px] font-semibold tracking-tight text-white " +
  "border border-white/25 bg-gradient-to-b from-white/[0.18] via-[#0d84f5] to-[#0058c4] " +
  "shadow-[0_1px_0_0_rgba(255,255,255,0.28)_inset,0_10px_32px_-10px_rgba(0,123,255,0.55),0_4px_14px_-6px_rgba(0,0,0,0.2)] " +
  "transition-[transform,box-shadow,filter] duration-200 ease-out " +
  "hover:scale-[1.015] hover:from-white/[0.22] hover:via-[#1a8fff] hover:to-[#0060c7] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.32)_inset,0_16px_40px_-8px_rgba(0,123,255,0.58),0_6px_18px_-6px_rgba(0,0,0,0.22)] hover:brightness-[1.02] " +
  "active:scale-[0.985] active:brightness-[0.97] " +
  "dark:border-sky-200/20 dark:from-white/[0.1] dark:via-sky-500 dark:to-[#003d85] " +
  "dark:shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_12px_36px_-10px_rgba(56,189,248,0.38),0_4px_16px_-8px_rgba(0,0,0,0.45)] " +
  "dark:hover:via-[#38bdf8] dark:hover:to-[#004a9e] dark:hover:shadow-[0_1px_0_0_rgba(255,255,255,0.16)_inset,0_18px_44px_-8px_rgba(56,189,248,0.45)]";

const variants: Record<Variant, string> = {
  primary: `bg-boma-blue text-white shadow-sm ${glowHover} ${glowActive} hover:scale-[1.02] active:scale-[0.98]`,
  secondary: `border border-transparent bg-card text-foreground shadow-sm ${glowHover} ${glowActive} hover:bg-foreground/5 hover:scale-[1.02] active:scale-[0.98]`,
  ghost: `border border-transparent text-foreground/80 ${glowHover} ${glowActive} hover:bg-foreground/5 hover:text-foreground active:scale-[0.98]`,
  forest: `bg-boma-forest text-white shadow-sm ${glowHover} ${glowActive} hover:scale-[1.02] active:scale-[0.98]`,
  cta: ctaVariant,
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  className?: string;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none";
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  className?: string;
};

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
