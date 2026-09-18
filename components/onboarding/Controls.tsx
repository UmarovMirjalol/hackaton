"use client";

/** Onboarding-only range control — uses foundation tokens */
export function ProfileRange({
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
    <div className="border border-border bg-surface px-4 py-4 rounded-[var(--radius-md)]">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium text-primary">{label}</span>
        <span className="font-mono text-[18px] tabular-nums tracking-tight">{display}</span>
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
