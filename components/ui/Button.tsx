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
    "inline-flex items-center justify-center gap-2 border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
    size === "md" ? "h-10 px-4 text-[14px]" : "h-8 px-3 text-[13px]",
    variant === "primary" &&
      "border-accent bg-accent text-surface hover:bg-accent-hover hover:border-accent-hover",
    variant === "secondary" &&
      "border-border bg-transparent text-primary hover:bg-surface-muted",
    variant === "ghost" &&
      "border-transparent bg-transparent text-secondary hover:text-primary",
    variant === "danger" &&
      "border-error bg-transparent text-error hover:bg-error hover:text-surface",
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
