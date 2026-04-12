"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type ParallaxSectionBgProps = {
  children: React.ReactNode;
  /** URL d’une image large (paysage de préférence), ex. Unsplash w=3840 */
  imageSrc: string;
  /**
   * Intensité du décalage parallaxe (0 = désactivé hors reduced-motion).
   * ~0.1–0.2 = léger et professionnel.
   */
  intensity?: number;
  className?: string;
  /** Classes sur le conteneur du contenu (au-dessus du fond + overlay) */
  contentClassName?: string;
  /** Voile personnalisé (remplace le dégradé par défaut si renseigné) */
  overlayClassName?: string;
  /** Précharge l’image (première section parallaxe au-dessus de la ligne de flottaison) */
  priority?: boolean;
};

/**
 * Section avec grande image de fond (cover, centrée), parallaxe léger au scroll,
 * et contenu au premier plan. Overlay pour la lisibilité ; respecte `prefers-reduced-motion`.
 */
export function ParallaxSectionBg({
  children,
  imageSrc,
  intensity = 0.15,
  className = "",
  contentClassName = "",
  overlayClassName,
  priority = false,
}: ParallaxSectionBgProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    let rafId = 0;
    const mq =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const update = () => {
      if (mq?.matches) {
        bg.style.transform = "translate3d(0, 0, 0)";
        return;
      }
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const sectionCenterY = rect.top + rect.height / 2;
      const viewportCenterY = vh / 2;
      const offsetFromCenter = sectionCenterY - viewportCenterY;
      const y = offsetFromCenter * intensity;
      bg.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };

    const onMq = () => update();
    mq?.addEventListener("change", onMq);
    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      mq?.removeEventListener("change", onMq);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [intensity]);

  return (
    <section
      ref={sectionRef}
      className={["relative overflow-hidden", className].filter(Boolean).join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          ref={bgRef}
          className="absolute left-1/2 top-1/2 h-[130%] min-h-[125%] w-[120%] min-w-[115%] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            priority={priority}
            quality={95}
            sizes="100vw"
            draggable={false}
            className="object-cover object-center contrast-[1.05] saturate-[1.04]"
          />
        </div>
      </div>
      {/* Lisibilité : voile léger (sans flou pour garder la photo nette) */}
      <div
        className={[
          "pointer-events-none absolute inset-0 z-[1]",
          overlayClassName?.trim() ??
            "bg-gradient-to-br from-background/30 via-background/12 to-transparent dark:from-background/38 dark:via-background/14 dark:to-transparent",
        ].join(" ")}
        aria-hidden
      />
      <div className={["relative z-10", contentClassName].filter(Boolean).join(" ")}>
        {children}
      </div>
    </section>
  );
}
