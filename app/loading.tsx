import { LoadingBlock } from "@/components/ui/States";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingBlock label="Loading Route…" />
    </div>
  );
}
