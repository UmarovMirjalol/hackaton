"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UniversitiesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/results");
  }, [router]);
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="meta">Opening results…</p>
    </div>
  );
}
