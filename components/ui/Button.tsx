"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "signal" | "danger";
  size?: "md" | "sm" | "lg";
  loading?: boolean;
};

export function Button({
  className,
  href,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: Props) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 border font-medium transition-[background-color,border-color,color,opacity,transform] duration-[var(--duration)] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.99]",
    size === "lg" && "h-11 px-5 text-[14px] rounded-[var(--radius-md)]",
    size === "md" && "h-10 px-4 text-[13px] rounded-[var(--radius-md)]",
    size === "sm" && "h-8 px-3 text-[12px] rounded-[var(--radius-sm)]",
    variant === "primary" &&
      "border-accent bg-accent text-white hover:bg-accent-hover hover:border-accent-hover",
    variant === "signal" &&
      "border-[var(--signal)] bg-[var(--signal)] text-white hover:bg-[var(--signal-hover)] hover:border-[var(--signal-hover)]",
    variant === "secondary" &&
      "border-border bg-surface text-primary hover:border-border-strong hover:bg-surface-muted",
    variant === "ghost" &&
      "border-transparent bg-transparent text-secondary hover:bg-surface-muted hover:text-primary",
    variant === "danger" &&
      "border-error/25 bg-transparent text-error hover:bg-error hover:text-white",
    loading && "pointer-events-none opacity-70",
    className,
  );

  const content = (
    <>
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={styles}
        aria-disabled={disabled || loading}
        onClick={props.onClick as never}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={styles} disabled={disabled || loading} aria-busy={loading} {...props}>
      {content}
    </button>
  );
}
