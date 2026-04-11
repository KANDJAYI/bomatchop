import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "forest";

const glowHover =
  "hover:shadow-[0_0_32px_-6px_var(--boma-glow-blue),0_0_52px_-14px_var(--boma-glow-gold)]";
const glowActive =
  "active:shadow-[0_0_28px_-2px_var(--boma-glow-blue),0_0_40px_-8px_var(--boma-glow-gold)]";

const variants: Record<Variant, string> = {
  primary: `bg-boma-blue text-white shadow-sm ${glowHover} ${glowActive} hover:scale-[1.02] active:scale-[0.98]`,
  secondary: `border border-transparent bg-card text-foreground shadow-sm ${glowHover} ${glowActive} hover:bg-foreground/5 hover:scale-[1.02] active:scale-[0.98]`,
  ghost: `border border-transparent text-foreground/80 ${glowHover} ${glowActive} hover:bg-foreground/5 hover:text-foreground active:scale-[0.98]`,
  forest: `bg-boma-forest text-white shadow-sm ${glowHover} ${glowActive} hover:scale-[1.02] active:scale-[0.98]`,
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
    "inline-flex items-center justify-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-45";
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
    "inline-flex items-center justify-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-200";
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
