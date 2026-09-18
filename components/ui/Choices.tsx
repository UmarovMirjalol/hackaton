"use client";

import { cn } from "@/lib/cn";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      role="group"
      className="inline-flex max-w-full flex-wrap gap-px rounded-[var(--radius-md)] border border-border bg-border p-px"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-10 flex-1 rounded-[calc(var(--radius-md)-1px)] px-3 text-[13px] font-medium transition-[background-color,color,transform] duration-[var(--duration)] active:scale-[0.99]",
              active
                ? "bg-surface text-primary shadow-[inset_0_0_0_1px_var(--border-strong)]"
                : "bg-surface-muted/80 text-secondary hover:bg-surface hover:text-primary",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChoiceGrid<T extends string>({
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
    <div className="grid gap-2 sm:grid-cols-2">
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
              "flex items-start gap-3 border px-3.5 py-3 text-left transition-[background-color,border-color,transform] duration-[var(--duration)] rounded-[var(--radius-md)] active:scale-[0.995]",
              on
                ? "border-[var(--signal)] bg-[var(--signal-subtle)]"
                : "border-border bg-surface hover:border-border-strong",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] transition-colors",
                multiple ? "rounded-[3px]" : "rounded-full",
                on
                  ? "border-[var(--signal)] bg-[var(--signal)] text-white"
                  : "border-border-strong bg-surface text-transparent",
              )}
              aria-hidden
            >
              ✓
            </span>
            <span className="min-w-0">
              <span className={cn("block text-[14px]", on ? "font-medium text-primary" : "text-secondary")}>
                {opt.label}
              </span>
              {opt.hint ? <span className="mt-0.5 block text-[12px] text-tertiary">{opt.hint}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Full-width decision rows — aid, SAT status */
export function OptionRows<T extends string>({
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
              "grid w-full grid-cols-[1rem_1fr] gap-3 border px-3.5 py-3.5 text-left transition-[background-color,border-color,transform] duration-[var(--duration)] rounded-[var(--radius-md)] active:scale-[0.995]",
              on
                ? "border-[var(--signal)] bg-[var(--signal-subtle)]"
                : "border-border bg-surface hover:border-border-strong",
            )}
          >
            <span
              className={cn(
                "mt-1 h-3.5 w-3.5 rounded-full border-2 transition-colors",
                on ? "border-[var(--signal)] bg-[var(--signal)]" : "border-border-strong",
              )}
              aria-hidden
            />
            <span>
              <span className="block text-[14.5px] font-medium text-primary">{opt.label}</span>
              {opt.hint ? (
                <span className="mt-0.5 block text-[12.5px] leading-5 text-tertiary">{opt.hint}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
