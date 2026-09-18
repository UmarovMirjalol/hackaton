"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
};

export function Button({
  className,
  href,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 border font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ease-[var(--ease)] disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px",
    size === "md" ? "h-9 px-3.5 text-[13px]" : "h-8 px-2.5 text-[12px]",
    "rounded-[var(--radius-md)]",
    variant === "primary" &&
      "border-accent bg-accent text-white shadow-[var(--shadow-sm)] hover:bg-accent-hover hover:border-accent-hover",
    variant === "secondary" &&
      "border-border bg-surface text-primary hover:border-border-strong hover:bg-surface-muted",
    variant === "ghost" &&
      "border-transparent bg-transparent text-secondary hover:bg-surface-muted hover:text-primary",
    variant === "danger" &&
      "border-error/25 bg-transparent text-error hover:bg-error hover:text-white",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles} onClick={props.onClick as never}>
        {props.children}
      </Link>
    );
  }

  return <button className={styles} {...props} />;
}
