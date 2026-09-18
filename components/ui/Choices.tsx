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
              "min-h-9 flex-1 rounded-[calc(var(--radius-md)-1px)] px-2.5 text-[12.5px] font-medium transition-colors duration-150",
              active
                ? "bg-surface text-primary"
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
  value: T | T[];
  onChange: (v: T | T[]) => void;
  options: { value: T; label: string; hint?: string }[];
  multiple?: boolean;
}) {
  const selected = Array.isArray(value) ? value : [value];
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
              "border px-3.5 py-3 text-left transition-[background-color,border-color] duration-150 rounded-[var(--radius-md)]",
              on
                ? "border-primary bg-surface shadow-[inset_3px_0_0_0_var(--signal)]"
                : "border-border bg-surface hover:border-border-strong",
            )}
          >
            <div className="text-[13.5px] font-medium text-primary">{opt.label}</div>
            {opt.hint ? <div className="mt-0.5 text-[12px] text-tertiary">{opt.hint}</div> : null}
          </button>
        );
      })}
    </div>
  );
}
