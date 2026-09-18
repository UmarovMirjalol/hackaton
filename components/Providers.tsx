"use client";

import { RouteProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <RouteProvider>{children}</RouteProvider>;
}
