"use client";

import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/States";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="route-frame py-24">
      <div className="mx-auto max-w-lg">
        <p className="label">Something broke</p>
        <h1 className="page-title mt-3 text-h1">The route could not be rendered.</h1>
        <Alert tone="error" className="mt-5" title="Error">
          {error.message}
        </Alert>
        <div className="mt-6 flex gap-3">
          <Button onClick={reset} variant="signal">
            Try again
          </Button>
          <Button href="/" variant="secondary">
            Start over
          </Button>
        </div>
      </div>
    </div>
  );
}
