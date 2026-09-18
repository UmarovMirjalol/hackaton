"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function ObButton({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "text";
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 items-center justify-center px-6 text-[14px] font-medium transition-[background-color,color,border-color,opacity,transform] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-35 active:scale-[0.985]",
        variant === "primary" &&
          "bg-[var(--signal)] text-white hover:bg-[var(--signal-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]",
        variant === "ghost" &&
          "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--ink)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)]",
        variant === "text" &&
          "h-auto px-0 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

export function ObField({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2.5 block text-[12px] font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
      {error ? (
        <span className="mt-2 block text-[12px] leading-5 text-[var(--error)]">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-[12px] leading-5 text-[var(--text-tertiary)]">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-[15px] text-[var(--text-primary)] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--signal)] focus:shadow-[0_0_0_3px_var(--signal-subtle)]";

export function ObInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function ObTextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(inputBase, "min-h-[8rem] resize-y leading-relaxed", props.className)}
    />
  );
}

export function ObSegmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div role="group" className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-11 min-w-[3.5rem] rounded-[var(--radius-md)] px-4 text-[13.5px] font-medium transition-[background-color,color,border-color,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)] active:scale-[0.98]",
              active
                ? "border border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ObOptionRows<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div role="radiogroup" className="grid gap-2">
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(opt.value)}
            className={cn(
              "grid w-full grid-cols-[1.15rem_1fr] gap-3.5 rounded-[var(--radius-md)] border px-4 py-3.5 text-left transition-[background-color,border-color,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)] active:scale-[0.995]",
              on
                ? "border-[var(--signal)] bg-[var(--signal-subtle)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
            )}
          >
            <span
              className={cn(
                "mt-1 h-3.5 w-3.5 rounded-full border-2 transition-colors",
                on ? "border-[var(--signal)] bg-[var(--signal)]" : "border-[var(--border-strong)]",
              )}
              aria-hidden
            />
            <span>
              <span className="block text-[15px] font-medium text-[var(--text-primary)]">{opt.label}</span>
              {opt.hint ? (
                <span className="mt-0.5 block text-[13px] leading-5 text-[var(--text-tertiary)]">
                  {opt.hint}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ObSelectList<T extends string>({
  value,
  onChange,
  options,
  multiple,
}: {
  value: T | T[] | "";
  onChange: (v: T | T[]) => void;
  options: { value: T; label: string; hint?: string }[];
  multiple?: boolean;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div className="grid gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (!multiple) {
                onChange(opt.value);
                return;
              }
              const next = on
                ? selected.filter((x) => x !== opt.value)
                : [...selected, opt.value];
              onChange(next as T[]);
            }}
            className={cn(
              "flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3.5 text-left transition-[background-color,border-color,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)] active:scale-[0.995]",
              on
                ? "border-[var(--signal)] bg-[var(--signal-subtle)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
            )}
          >
            <span>
              <span
                className={cn(
                  "block text-[15px] tracking-tight",
                  on ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                )}
              >
                {opt.label}
              </span>
              {opt.hint ? (
                <span className="mt-0.5 block text-[12.5px] text-[var(--text-tertiary)]">{opt.hint}</span>
              ) : null}
            </span>
            <span
              className={cn(
                "shrink-0 font-mono text-[10px] tracking-[0.08em] uppercase transition-opacity duration-150",
                on ? "text-[var(--signal)] opacity-100" : "opacity-0",
              )}
            >
              In profile
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ObCountryGrid<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const on = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={on}
            onClick={() => {
              const next = on
                ? value.filter((x) => x !== opt.value)
                : [...value, opt.value];
              onChange(next);
            }}
            className={cn(
              "flex h-12 items-center justify-between gap-3 rounded-[var(--radius-md)] border px-4 text-left text-[14px] transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)] active:scale-[0.99]",
              on
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
            )}
          >
            <span className={cn(on && "font-medium")}>{opt.label}</span>
            <span
              className={cn(
                "font-mono text-[10px] tracking-[0.06em] uppercase",
                on ? "opacity-80" : "opacity-0",
              )}
            >
              Added
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ObRange({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <span className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono text-[20px] tabular-nums tracking-tight text-[var(--text-primary)]">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ob-range w-full"
      />
    </div>
  );
}
