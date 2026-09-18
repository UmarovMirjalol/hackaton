import { Button } from "@/components/ui/Button";

export function NextUp({
  label,
  title,
  detail,
  href,
  cta,
}: {
  label?: string;
  title: string;
  detail?: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="border-t border-border bg-surface-muted/50 px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label">{label ?? "Next up"}</p>
          <p className="text-[15px] font-medium tracking-tight">{title}</p>
          {detail ? <p className="caption mt-0.5">{detail}</p> : null}
        </div>
        <Button href={href}>{cta}</Button>
      </div>
    </div>
  );
}