"use client";

import { ToastProvider } from "@/components/Toast";
import { RouteProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RouteProvider>
      <ToastProvider>{children}</ToastProvider>
    </RouteProvider>
  );
}
