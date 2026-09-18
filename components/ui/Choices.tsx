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
    <div className="flex flex-wrap gap-px border border-border bg-border">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-10 flex-1 px-3 text-[13px] transition-colors",
              active ? "bg-primary text-surface" : "bg-surface text-secondary hover:text-primary",
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
              "border px-3 py-2.5 text-left transition-colors",
              on ? "border-primary bg-surface" : "border-border bg-transparent hover:border-primary/40",
            )}
          >
            <div className="text-[13.5px] text-primary">{opt.label}</div>
            {opt.hint ? <div className="mt-0.5 text-[12px] text-tertiary">{opt.hint}</div> : null}
          </button>
        );
      })}
    </div>
  );
}
