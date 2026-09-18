"use client";

import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const field =
  "w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-[13.5px] text-primary outline-none transition-colors placeholder:text-tertiary focus:border-primary";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(field, "h-9", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(field, "h-9 appearance-none bg-[length:12px] pr-8", props.className)}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(field, "min-h-24 py-2", props.className)} />;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-primary">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-[12px] leading-5 text-tertiary">{hint}</span> : null}
    </label>
  );
}
