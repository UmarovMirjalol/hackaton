import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24">
      <p className="label">Missing page</p>
      <h1 className="page-title mt-3 text-[36px]">This step is not on the route.</h1>
      <p className="mt-3 text-[15px] text-secondary">
        Go back to the start, or continue a saved profile if you already have one.
      </p>
      <Button href="/" className="mt-6">
        Back to Route
      </Button>
    </div>
  );
}
