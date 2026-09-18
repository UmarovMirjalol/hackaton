"use client";

import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const field =
  "w-full rounded-[var(--radius-md)] border border-border bg-[color-mix(in_srgb,var(--surface)_94%,white)] px-3 text-[13.5px] text-primary outline-none transition-[border-color,box-shadow,background-color,transform] duration-[var(--duration)] ease-[var(--ease-out)] placeholder:text-tertiary hover:border-border-strong focus:border-[var(--signal)] focus:bg-surface focus:shadow-[var(--shadow-focus)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(field, "h-10", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(field, "h-10 appearance-none bg-[length:12px] pr-8", props.className)}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(field, "min-h-24 py-2.5", props.className)} />;
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-primary">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] leading-5 text-error">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12px] leading-5 text-tertiary">{hint}</span>
      ) : null}
    </label>
  );
}
