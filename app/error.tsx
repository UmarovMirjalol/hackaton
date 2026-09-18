"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-24">
      <p className="label">Something broke</p>
      <h1 className="page-title mt-3 text-[36px]">The route could not be rendered.</h1>
      <p className="mt-3 text-[14px] text-secondary">{error.message}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="secondary">
          Start over
        </Button>
      </div>
    </div>
  );
}
