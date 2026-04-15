"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};

export type ToastOptions = {
  durationMs?: number;
  action?: ToastAction;
};

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
};

type ToastContextValue = {
  showToast: (
    message: string,
    variant?: ToastVariant,
    options?: ToastOptions,
  ) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  /** DOM timers are numeric handles; avoid NodeJS.Timeout from merged typings. */
  const timersRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    const t = timersRef.current.get(id);
    if (t !== undefined) {
      window.clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info",
      options?: ToastOptions,
    ) => {
      const id = ++idRef.current;
      const durationMs =
        options?.durationMs ?? (options?.action ? 20_000 : 3200);
      setToasts((prev) => [
        ...prev,
        { id, message, variant, action: options?.action },
      ]);
      const timer = window.setTimeout(() => removeToast(id), durationMs);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed left-1/2 top-[max(1.25rem,env(safe-area-inset-top,0px))] z-[100] flex w-[min(100%-2rem,24rem)] -translate-x-1/2 flex-col-reverse gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-fade-in rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md transition-all ${
              t.variant === "success"
                ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-50 dark:bg-emerald-950/80"
                : t.variant === "error"
                  ? "border-red-500/30 bg-red-950/90 text-red-50 dark:bg-red-950/80"
                  : "border-boma-blue/30 bg-boma-ink/90 text-white dark:bg-card dark:text-foreground"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
              {t.action ? (
                <button
                  type="button"
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    t.variant === "success"
                      ? "bg-emerald-400/20 text-emerald-50 hover:bg-emerald-400/30 focus-visible:outline-emerald-200"
                      : t.variant === "error"
                        ? "bg-red-400/20 text-red-50 hover:bg-red-400/30 focus-visible:outline-red-200"
                        : "bg-white/15 text-white hover:bg-white/25 focus-visible:outline-white/70 dark:bg-foreground/10 dark:text-foreground dark:hover:bg-foreground/15 dark:focus-visible:outline-boma-blue/50"
                  }`}
                  onClick={async () => {
                    try {
                      await t.action?.onClick();
                    } finally {
                      removeToast(t.id);
                    }
                  }}
                >
                  {t.action.label}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
