"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    [],
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
            {t.message}
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
