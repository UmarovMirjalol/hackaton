"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastCtx = { toast: (msg: string) => void };

const C = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <C.Provider value={value}>
      {children}
      {msg ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-[var(--radius-md)] border border-border bg-primary px-4 py-2 text-[13px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] md:bottom-6"
        >
          {msg}
        </div>
      ) : null}
    </C.Provider>
  );
}

export function useToast() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useToast requires ToastProvider");
  return ctx;
}
