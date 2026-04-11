"use client";

import { useId, useRef, useState } from "react";

type FileUploadFieldProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
};

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 4v9m0 0l-3-3m3 3 3-3M4 18h16"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Masque le widget fichier natif du navigateur : zone cliquable premium + nom du fichier choisi.
 */
export function FileUploadField({
  name,
  label,
  hint,
  required = true,
}: FileUploadFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function pickFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    setFileName(file.name);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {hint ? (
        <p className="text-xs text-muted leading-relaxed">{hint}</p>
      ) : null}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        required={required}
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      <label
        htmlFor={id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pickFile(e.dataTransfer.files[0]);
        }}
        className="group cursor-pointer rounded-2xl bg-gradient-to-br from-boma-spectrum-green/[0.06] via-card to-boma-spectrum-yellow/[0.06] p-4 transition-all hover:shadow-[0_0_32px_-6px_var(--boma-glow-blue),0_0_48px_-12px_var(--boma-glow-gold)] focus-within:shadow-[0_0_28px_-4px_var(--boma-glow-blue)] active:shadow-[0_0_24px_-2px_var(--boma-glow-blue)] dark:from-boma-spectrum-green/10 dark:to-boma-spectrum-yellow/10"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-boma-forest/12 text-boma-forest dark:bg-boma-spectrum-yellow/15 dark:text-boma-spectrum-yellow">
            <UploadIcon className="opacity-90" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {fileName ? (
                <span className="text-boma-blue">{fileName}</span>
              ) : (
                <span className="text-muted group-hover:text-foreground">
                  Glissez-déposez ou choisissez une image
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              JPG, PNG, WebP — document lisible, bien cadré
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-boma-blue px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform group-active:scale-[0.98]">
            Parcourir
          </span>
        </div>
      </label>
    </div>
  );
}
