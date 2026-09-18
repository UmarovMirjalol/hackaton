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
        "inline-flex h-11 items-center justify-center px-5 text-[13.5px] font-medium transition-[background-color,color,border-color,opacity,transform] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-35 active:scale-[0.99]",
        variant === "primary" &&
          "bg-[var(--ink,#0b0d12)] text-white hover:bg-[#2a2f3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)]",
        variant === "ghost" &&
          "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)]",
        variant === "text" &&
          "h-auto px-0 text-[13px] text-[var(--text-secondary)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--text-primary)]",
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
      <span className="mb-2 block text-[12px] font-medium tracking-[0.01em] text-[var(--text-secondary)]">
        {label}
      </span>
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
  "w-full border-0 border-b border-[var(--border)] bg-transparent px-0 py-3 text-[16px] text-[var(--text-primary)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal)] focus:shadow-[0_1px_0_0_var(--signal)]";

export function ObInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function ObTextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(inputBase, "min-h-[7.5rem] resize-y leading-relaxed", props.className)}
    />
  );
}

/** Compact year / scale / yes-no control */
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
              "h-10 min-w-[3.25rem] px-3.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)]",
              active
                ? "bg-[var(--ink,#0b0d12)] text-white"
                : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Full-width option rows — testing, aid decisions */
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
    <div role="radiogroup" className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
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
              "grid w-full grid-cols-[1.25rem_1fr] gap-3 py-4 text-left transition-colors duration-150 hover:bg-[var(--surface-muted)]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--signal)]",
              on && "bg-[var(--signal-subtle)]",
            )}
          >
            <span
              className={cn(
                "mt-1 h-3.5 w-3.5 rounded-full border transition-colors",
                on ? "border-[var(--signal)] bg-[var(--signal)]" : "border-[var(--border-strong)] bg-transparent",
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

/** Subject / interest selectable list */
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
    <div className="space-y-1">
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
              "group flex w-full items-baseline justify-between gap-4 border-b px-1 py-3.5 text-left transition-[border-color,color,background-color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)]",
              on
                ? "border-[var(--border-strong)]"
                : "border-[var(--border)] hover:border-[var(--border-strong)]",
            )}
          >
            <span>
              <span
                className={cn(
                  "block text-[16px] tracking-tight transition-colors",
                  on
                    ? "font-medium text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]",
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
                "shrink-0 font-mono text-[11px] tracking-[0.04em] tabular-nums uppercase transition-opacity duration-150",
                on ? "text-[var(--signal)] opacity-100" : "opacity-0",
              )}
            >
              Selected
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Country multi-select — editorial destination list */
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
    <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-10">
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
              "group flex w-full items-center justify-between gap-3 border-b border-[var(--border)] py-3.5 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)]",
              on ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            <span className={cn("text-[15px] tracking-tight", on && "font-medium")}>{opt.label}</span>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-150",
                on
                  ? "border-[var(--ink,#0b0d12)] bg-[var(--ink,#0b0d12)] text-white"
                  : "border-[var(--border-strong)] bg-transparent text-transparent group-hover:border-[var(--text-tertiary)]",
              )}
              aria-hidden
            >
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 3.5L3.8 6.3L9 1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
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
    <div className="pt-2">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <span className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono text-[18px] tabular-nums tracking-tight text-[var(--text-primary)]">
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
