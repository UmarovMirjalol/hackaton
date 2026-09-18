"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="meta">Opening profile builder…</p>
    </div>
  );
}
